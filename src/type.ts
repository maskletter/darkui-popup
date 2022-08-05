import { ReactElement } from 'react';
import { ShowController } from './show';
import { ShowControllerCore } from './show/core';

export interface ShowPopupProps {
  format?: (props: any) => any;
  controller?: ShowController;
  onDestory?: () => void;
  component?: ReactElement<any, any>;
  cancelEventName?: string;
  destoryEventName?: string;
  visibilityName?: string;
  other?: any;
}
interface Animate {
  animation?: string;
  bgDuration?: number;
}
export interface PopupInterface {
  children?: JSX.Element | JSX.Element[] | undefined | string;
  /** 弹窗方向，默认center */
  direction?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  /** 动画执行时间 */
  duration?: number;
  /**
   * 默认背景色 / 自定义背景元素
   */
  bg?: string | 'transparent' | FnJsxElement;
  zIndex?: number;
  /** 内容块背景色 */
  wrapperBg?: string;
  /** 圆角 */
  borderRadius?: string | number;
  /** 是否点击穿透背景 */
  pointerEvents?: boolean;
  onDestory?: () => void;
  animate?: {
    enter?: Animate;
    leave?: Animate;
  };
  /** 是否显示弹框 */
  visibility: boolean;
  onCancel?: () => void;
  /** 是否禁止body滚动 */
  disabledBodyScroll?: boolean;
  /**
   * 适用于多弹窗，show/queue
   * 用于弹窗的动画效果
   */
  childrenKey?: string;
}

type FnJsxElement = (status: 'enter' | 'leave') => any;
export interface PopupAlterInterface
  extends Omit<PopupInterface, 'onCancel' | 'onConfirm' | 'visibility'> {
  /** 弹窗的内容 */
  content: string | JSX.Element | JSX.Element[] | FnJsxElement;
  onCancel?: (instance: Instance) => void;
  /** 弹窗的class类 */
  className?: string;
  /** 替换当前弹窗 */
  replace?: boolean;
  /**
   * 默认情况下，如果打开多个弹窗，弹窗内容都会在一个容器内运行，如果需要特定多个容器，可以设置此参数，
   *
   * 设置之后，创建的alert都会生成一个新的背景容器
   */
  multiMode?: boolean;
  /** 弹窗的样式 */
  style?: any;
}

export type Instance = ReturnType<typeof ShowControllerCore.prototype.createInstance>;
