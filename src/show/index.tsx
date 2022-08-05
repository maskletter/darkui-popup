import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { PopupAlterInterface } from '../type';
import ShowControllerCore from './core';
import { CreateRoot } from './react';
export { CreateRoot as CreateRootVue3 } from './vue3'

// 这种形式会失去编译时候的tree shaking功能，暂时禁用
// declare module '../popup' {
//   // eslint-disable-next-line @typescript-eslint/no-shadow
//   namespace Popup {
//     /**
//      * Popup的快捷弹窗展开
//      * @deprecated 随时删除，建议使用.show
//      */
//     const alert: (props: PopupAlterInterface, options?: Options) => Instance;
//     /**
//      * Popup的快捷弹窗展开
//      */
//     const show: (props: PopupAlterInterface, options?: Options) => Instance;
//     /**
//      * 用于恢复Popup.show的root队列
//      */
//     const recovery2: (controller: ShowController) => void;
//   }
// }

const isReactVersion18 = React.version.substr(0,2) === '18';
class ShowController extends ShowControllerCore {
  unmount() {
    if (isReactVersion18)  {
        this.$other.root.unmount();
    } else {
        unmountComponentAtNode(this.$el);
    }
  }
  createRoot() {
    const Root = this.Root || CreateRoot();
    if (isReactVersion18) {
        const root = createRoot(this.$el);
        root.render(
            <Root
                controller={this}
                onDestory={() => {
                if (this.options.destory !== false) {
                    this.destory();
                }
                }}
            />
        );
        this.$other.root = root;
    } else {
        render(
            <Root
                controller={this}
                onDestory={() => {
                if (this.options.destory !== false) {
                    this.destory();
                }
                }}
            />,
            this.$el,
        );
    }
    
    return this;
  }
}

interface Options {
  controller?: ShowController;
  keep?: boolean;
}

export const DefaultRootConfig = {
  cancelEventName: 'onCancel',
  destoryEventName: 'onDestory',
  visibilityName: 'visibility',
  format: (props: any) => {
    return {
      ...props,
    };
  },
};

/**
 * 创建弹窗Show命令
 * @param Root
 * @param Controller
 * @param ControllerOptions
 * @returns
 */
export function createShow<T = PopupAlterInterface>(
  Root: any,
  Controller?: typeof ShowController,
  ControllerOptions?: ConstructorParameters<typeof ShowController>[1],
) {
  let globalController: ShowController;
  const globalControllerOptions = ControllerOptions || { destory: true };
  return async (
    _props: T & { multiMode?: boolean; onCancel?: any; replace?: boolean; content: any },
    options?: Options,
  ) => {
    let _controller: ShowController;
    // 如果传入了controller，将传入的controller设置为当前允许对象
    if (options && options.controller) {
      if (options.keep) {
        // 如果与keep，将传入controller设置为当前队列全局对象
        globalController = options.controller;
      }
      _controller = options.controller;
    } else if (_props.multiMode) {
      // 如果存在multiMode，表示不关闭当前弹窗，新建一个弹窗
      _controller = new (Controller || ShowController)(Root, globalControllerOptions);
      if (options?.keep) {
        globalController = _controller;
      }
    } else if (!globalController) {
      // 如果没有全局控制器,初始化新控制器并绑定到全局
      _controller = new (Controller || ShowController)(Root, globalControllerOptions);
      globalController = _controller;
    } else {
      // 将全局控制器赋值给当前调用
      _controller = globalController;
    }
    // 因为react 18 版本createRoot异步执行导致初始化时未绑定到控制器事件，所以需要微队列等待
    await Promise.resolve().then();
    return _props.replace ? _controller.replace(_props as any) : _controller.append(_props as any);
  };
}
const Show = createShow(CreateRoot(), undefined, { destory: false });

export { ShowController };
export { Show };
