import { PopupAlterInterface } from '../type';
import { ShowController } from '../show';
import { CreateRoot } from '../show/react';
import { randomKey } from '../shared';
import { ShowControllerCore } from '../show/core';

// declare module '../popup' {
//   namespace Popup {
//     const queue3: (list: QueueList<PopupQueueOptions>) => Promise<any>;
//   }
// }
type PopupQueueOptions = Omit<PopupAlterInterface, 'content' | 'onConfirm'>;
type RenderFn = PopupAlterInterface['content'] | ((props: any) => JSX.Element);
interface QueueItem<T> {
  /** Popup.alert的所选参数 */
  options?: T & {
    onCancel?: () => void;
  };
  props?: Record<string, any>;
  /**
   * 渲染函数
   */
  render: RenderFn;
}
export type QueueListItem<T> = QueueItem<T> | RenderFn;
export type QueueList<T> = Array<QueueListItem<T>>;

let globalQueueKey: any = null;
const queueInfoList: any = [];
// 包装render/onCancel获取useQueueInfo
function recoveryQueueIndex<T>(currentQueueIndex: string, props: QueueItem<T>) {
  if (typeof props.render !== 'function') {
    return props.render;
  }
  const prevQueueIndex = globalQueueKey;
  globalQueueKey = currentQueueIndex;
  const result = (props.render as any)(props.props);
  globalQueueKey = prevQueueIndex;
  return result;
}

// 格式化queueList
function formatQueue<T>(queueItem: QueueListItem<T>): QueueItem<T> {
  if (typeof queueItem === 'function') {
    return {
      options: {},
      props: {},
      render: queueItem,
    } as any;
  }
  return queueItem as unknown as QueueItem<T>;
}

export class QueueController<T> {
  constructor(public queueList: QueueList<T>, public controller: ShowControllerCore) {
    this.options.queueList = queueList;
    this.#commonMethods = createMethods<T>(controller, this.options);
    if (this.queueList.length) {
      this.run(this.options.index, []);
    }
    this.controller.onDestory.on(() => {
      this.onSuccess && this.onSuccess(this.result);
    });
  }
  options = {
    index: 0,
    queueList: [] as QueueList<T>,
    interrupt: false,
  };
  result: any[] = [];
  #commonMethods: ReturnType<typeof createMethods>;
  run(index: number, prevMessage?: any[]) {
    const item = this.queueList[index];
    if (!item) {
      this.controller.closeAll();
      return;
    }
    const queue = formatQueue<T>(item);
    const key = randomKey();
    const queueInfo: any = { props: queue, ...this.#commonMethods, $key: key };
    queueInfo.resolve = (fn: (done: Function, currentQueueIndex: string) => void) => {
      fn(close, key);
    };
    queueInfo.$close = queueInfo.$close.bind({ $key: key });
    queueInfo.message = prevMessage || [];
    queueInfo.$getCurrentQueue = queueInfo.$getCurrentQueue.bind({ $key: key });
    const props = {
      ...queue.options,
      content: () => recoveryQueueIndex(key, queue),
      onCancel: () => {
        if (queue.options?.onCancel) {
          recoveryQueueIndex(key, { render: queue.options.onCancel } as any);
        } else {
          close({});
        }
      },
    };
    this.controller.replace(props);
    queueInfoList[key] = queueInfo;
    const self = this;
    function close(n: any) {
      self.options.index++;
      if (self.options.interrupt) {
        self.onError && self.onError(self.result, n.result);
        self.controller.closeAll();
        return;
      }
      self.result[self.options.index - 1] = n.result || [];
      self.run(self.options.index, n.result);
    }
  }
  onError!: (result: any[], error: any) => void;
  onSuccess!: (result: any[]) => void;
}
function destory(resolve: Function, _result: any, currentQueueIndex: number) {
  resolve({ result: _result });
  destoryQueueInfo(currentQueueIndex);
}
function destoryQueueInfo(index: number) {
  queueInfoList[index] = undefined;
}
const useCommonQueueInfo: <T>(key?: string) => {
  /** key */
  key: string;
  /** 上一个弹窗发出的信息 */
  message?: any[];
  $controller: ShowController;
} & T = function (key?: string) {
  return queueInfoList[key || globalQueueKey] as any;
};
const getCommonQueueInfo = useCommonQueueInfo;

function createMethods<T>(
  _controller: ShowControllerCore,
  options: { index: number; queueList: QueueList<T>; interrupt: boolean },
) {
  const { queueList } = options;
  const getCurrentQueue = (key: string) => queueInfoList[key];
  return {
    $key: '',
    $controller: _controller,
    $closeAll() {
      queueList.length = 0;
      this.$controller.closeAll();
    },
    $getCurrentQueue() {
      return getCurrentQueue(this.$key);
    },
    $close(...argv: any[]) {
      getCurrentQueue(this.$key).resolve((done: Function, currentQueueIndex: number) => {
        destory(done, argv, currentQueueIndex);
      });
    },
    $jump(index: number, message?: any) {
      options.index = index - 1;
      getCurrentQueue(this.$key).$close(message);
    },
    $stop(result?: any) {
      options.interrupt = true;
      this.$close(result);
    },
    $remove(index: number) {
      queueList.splice(index, 1);
    },
    $append(data: QueueListItem<T>, index?: number) {
      // eslint-disable-next-line no-void
      if (index === void 0) {
        queueList.push(data);
      } else {
        queueList.splice(index, 0, data);
      }
    },
    $replace(data: QueueListItem<T>, index: number) {
      // eslint-disable-next-line no-void
      if (index === void 0) {
        return this.$append(data);
      }
      queueList[index] = data;
    },
  };
}
export function createQueue<T = PopupQueueOptions>(
  Root: any,
  Controller?: typeof ShowController,
  ControllerOptions?: any,
) {
  type Options = T & {
    onCancel?: () => void;
  };
  const globalControllerOptions = ControllerOptions || {};

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const Queue = async (
    _queueList: QueueList<Options>,
    controller?: ShowControllerCore,
    controllerOptions?: any,
  ) => {
    if (!_queueList.length) {
      return;
    }
    if (!controller) {
      // eslint-disable-next-line no-param-reassign
      controller = new (Controller || ShowController)(
        Root,
        controllerOptions || globalControllerOptions,
      );
    }
    const queueController = new QueueController<Options>(_queueList, controller);
    return new Promise((resolve, reject) => {
      queueController.onSuccess = (result: any[]) => {
        resolve(result);
      };
      queueController.onError = (result: any[], error: any) => {
        reject({ result, error });
      };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const useQueueInfo = (key?: string) => useCommonQueueInfo<ReturnType<typeof createMethods>>(key);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const getQueueInfo = useQueueInfo;

  return {
    Queue,
    useQueueInfo,
    getQueueInfo,
    useCommonQueueInfo,
    getCommonQueueInfo,
  };
}
const { Queue, getQueueInfo, useQueueInfo } = createQueue<PopupQueueOptions>(CreateRoot());

export { Queue, useQueueInfo, getQueueInfo };
