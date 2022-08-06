import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDom from 'react-dom';
import { extend, randomKey } from '../shared';
import styles from '../styles/index.module.less';
import { disabledBodyScroll } from '../scroll';
import { PopupInterface } from '../type';

export declare interface DefaultPopup {
  (_props: PopupInterface): React.ReactPortal;
}

// 生成上下左右以及中间部分动画
const DefaultAnimation = (() => {
  const create = (enter: string) => {
    return {
      enter: { animationName: styles[enter], bgDuration: 300 },
      leave: { animationName: styles[`${enter}-level`], bgDuration: 300 },
    };
  };
  return {
    left: create('layer-left-animate'),
    right: create('layer-right-animate'),
    top: create('layer-top-animate'),
    bottom: create('layer-bottom-animate'),
    center: create('layer-center-animate'),
  };
})();

/**
 * 公共弹窗组件
 *
 */
function Popup(_props: PopupInterface) {
  const props: PopupInterface = extend(
    {
      direction: 'center',
      bg: 'rgba(0, 0, 0, 0.7)',
      wrapperBg: 'white',
      pointerEvents: false,
      animate: {},
    },
    _props,
  );
  const $child = useRef<any>();
  const { duration: durationProps, visibility } = props;
  const [_visiblity, _setVisiblity] = useState(visibility);
  const disabledBodyScrollRef = useRef(() => {});
  const key = useRef(randomKey());
  // 进场离场状态
  const status = useRef<'enter' | 'leave'>('enter');
  const duration = useMemo(() => {
    return formatDuration(durationProps);
  }, [durationProps]);

  useEffect(() => {
    if (visibility) {
      _setVisiblity(visibility);
      // 对body进行滚动锁定
      if (props.disabledBodyScroll) {
        disabledBodyScrollRef.current = disabledBodyScroll();
      } else {
        disabledBodyScrollRef.current();
        disabledBodyScrollRef.current = () => {};
      }
    } else {
      disabledBodyScrollRef.current();
    }
  }, [visibility, props.disabledBodyScroll]);

  const onCancel = () => {
    props.onCancel && props.onCancel();
  };

  const animationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!props.visibility && e.target === $child.current) {
      _setVisiblity(false);
      props.onDestory && props.onDestory();
    }
  };

  // 切换当前元素的进程离场动画状态
  const transitionAnimation = useMemo(() => {
    if (props.visibility) {
      status.current = 'enter';
      return props?.animate?.enter || DefaultAnimation[props.direction as 'center'].enter || {};
    } else {
      status.current = 'leave';
      return props?.animate?.leave || DefaultAnimation[props.direction as 'center'].leave || {};
    }
  }, [props.visibility, props.animate]);

  const bgType = typeof props.bg;
  // 生成内容块元素
  const children = useMemo(() => {
    key.current = randomKey();
    return (
      <div
        key={key.current}
        ref={$child}
        style={{
          background: props.wrapperBg,
          animationFillMode: 'forwards',
          pointerEvents: 'auto',
          borderRadius: props.borderRadius,
          ...(transitionAnimation as any),
        }}
        className={styles['default-animate']}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {props.children}
      </div>
    );
  }, [props.children, props.visibility, transitionAnimation]);

  // 生成背景元素
  const Bg = useMemo(() => {
    if (bgType === 'function') {
      return (
        <div className={`${styles['af-modal-bg']} empty`}>{(props.bg as any)(status.current)}</div>
      );
    }
    return (
      <div
        className={`${styles['af-modal-bg']} ${!props.visibility ? 'leave' : ''}`}
        style={{
          animationDuration: formatDuration(transitionAnimation.bgDuration) || duration,
          background: props.bg as string,
          pointerEvents: props.pointerEvents ? 'none' : 'revert',
        }}
      />
    );
  }, [bgType, duration, transitionAnimation, props.bg, props.pointerEvents, props.visibility]);

  return ReactDom.createPortal(
    _visiblity ? (
      <div
        className={`${styles['af-modal']} ${(styles as any)[`layer-${props.direction}`]}`}
        style={{ pointerEvents: props.pointerEvents ? 'none' : 'revert', zIndex: props.zIndex }}
        onClick={() => onCancel()}
        onAnimationEnd={(e) => animationEnd(e)}
      >
        {Bg}
        {props.children ? children : null}
      </div>
    ) : null,
    document.body,
  ) as any;
}

function formatDuration(duration?: number) {
  if (isNaN(duration as any)) {
    return undefined;
  }
  return `${parseInt(duration as any) / 1000}s`;
}

export { Popup };
