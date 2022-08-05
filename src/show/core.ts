import { Instance, PopupAlterInterface } from '../type';
import { randomKey, EventBtns } from '../shared';

export interface CreateOptions {
  destory?: boolean;
}
type CreateInstanceReturnType = any;
abstract class ShowControllerCore {
  constructor(public Root?: any, public options: CreateOptions = {}) {
    this.$el = document.createElement('div');
    this.createRoot.bind(this)();
  }
  $other: any = {};
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static info = {
    destory: '控制器已被销毁',
  };
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isDestory = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly lists: Instance[] = [];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly $el!: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  currentInstance: CreateInstanceReturnType;
  log(type: keyof typeof ShowControllerCore.info) {
    const info = (this.constructor as any).info || ShowControllerCore.info;
    console.info(info[type]);
  }
  append(props: PopupAlterInterface) {
    if (this.isDestory) {
      this.log('destory');
    }
    const instance = this.createInstance(props);
    const length = this.lists.push(instance);
    this.onWatch.emit(this.lists[length - 1]);
    console.log('追加')
    return instance;
  }
  replace(props: PopupAlterInterface) {
    if (this.isDestory) {
      this.log('destory');
    }
    const instance = this.createInstance(props);
    const length = this.lists.length === 0 ? 0 : this.lists.length - 1;
    (this.lists as any)[length] = instance;
    this.onWatch.emit(this.lists[length]);
    return instance;
  }
  formatProps(props: PopupAlterInterface) {
    return {
      ...props,
      children: props.content,
      content: undefined,
    } as any;
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  abstract createRoot(): void;
  abstract unmount(): void;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  destory() {
    this.unmount && this.unmount();
    // this.isDestory = true;
    // (this as any).$el = null;
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  closeAll() {
    this.lists.length = 0;
    if (this.isDestory) {
      return this.log('destory');
    }
    this.onDestory.emit();
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  closeTo(key: string) {
    const idx = this.lists.findIndex((ins) => ins.key === key);
    if (idx === -1) {
      // 此弹窗已经被关闭了
      return undefined;
    }
    if (this.lists.length === 1) {
      this.closeAll();
      return undefined;
    }
    if (idx + 1 === this.lists.length) {
      // 为最后一个弹窗
      // 清空弹窗列表
      this.lists.pop();
      // this.onWatch(this.lists[idx - 1]);
      this.onWatch.emit(this.lists[idx - 1]);
      this.currentInstance = this.lists[this.lists.length - 1];
    } else {
      this.currentInstance = this.lists[idx];
      this.lists.splice(idx, 1);
    }
    return undefined;
  }
  onWatch = new EventBtns<Instance>();
  onDestory = new EventBtns();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  createInstance(props: PopupAlterInterface) {
    const key = randomKey();
    const componentProps = this.formatProps(props);
    componentProps.childrenKey = key;
    return (this.currentInstance = {
      key,
      controller: this,
      close: this.closeTo.bind(this, key),
      closeAll: this.closeAll.bind(this),
      closeTo(instanceKey: string) {
        this.controller.closeTo(instanceKey);
      },
      props: componentProps,
    });
  }
}

export { ShowControllerCore };
export default ShowControllerCore;
