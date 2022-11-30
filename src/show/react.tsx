import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { Popup } from '../popup';
import { DefaultRootConfig } from './index';
import { Instance, PopupAlterInterface, ShowPopupProps } from '../type';


export function CreateRoot(_: ShowPopupProps = {}) {
  return memo((_props: ShowPopupProps) => {
    const { controller, ...props } = { ...DefaultRootConfig, ..._, ..._props };
    const [content, setContent] = useState<PopupAlterInterface>();
    const [visibility, setVisibility] = useState(false);
    const instance = useRef<Instance | null>();
    const update = (_instance: Instance | undefined) => {
      if (!_instance) {
        return;
      }
      const Render = createComponent(_instance?.props.children);
      _instance.props.children = <Render />;
      const _content: any = props.format ? props.format(_instance.props) : _instance.props;
      setContent(_content as any);
      instance.current = _instance;
      setVisibility(true);
    };
    useLayoutEffect(() => {
      // 监听控制器事件
      if (controller?.lists.length) {
        update(controller?.lists[controller?.lists.length-1])
      }
      controller?.onWatch.on(update); // = update;
      controller?.onDestory.on(() => {
        instance.current = null;
        setVisibility(false);
      });
    }, []);
    const onCancel = () => {
      if (!instance.current) {
        return;
      }
      if (instance.current.props.onCancel) {
        instance.current.props.onCancel(instance.current);
      } else {
        instance.current.close();
      }
    };
    const events = {
      [props.cancelEventName]: onCancel,
      [props.destoryEventName]: props.onDestory,
      [props.visibilityName]: visibility,
    } as any;
    const Component: any = props.component || Popup;
    return <Component {...props.other} {...content} {...events} />;
  });
}

/**
 * 格式化react component
 * @param value
 * @returns
 */
export function createComponent(value: any) {
  if (!value) return () => null;
  if (typeof value === 'function') {
    return value;
  }
  return () => value;
}
