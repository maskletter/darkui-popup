import React, { useEffect, useMemo, useState } from 'react';
import { ShowController } from '../show';
import styles from './style.module.less';

let controller: ShowController;
interface DialogProps {
    title?: string,
    content: string,
    cancelText?: string | ((loading: boolean) => JSX.Element | string),
    confirmText?: string | ((loading: boolean) => JSX.Element | string),
    showCancel?: boolean,
    className?: string,
    /**元素点击事件，可以设置async/callback来进入loading状态 */
    onConfirm?: (callback: Function) => void,
    /**元素点击事件，可以设置async/callback来进入loading状态 */
    onCancel?: (callback: Function) => void,
    /**获取当前控制器，用于关闭 */
    getController?: (callback: () => ShowController) => void
    /**是否允许loading过程中关闭 */
    allowLoadingCancel?: boolean
}
interface DialogComponentProps extends DialogProps {
    onEmit: (type: 'success' | 'error') => void
    onEmitLoading: (loading: boolean) => void
}
const DialogComponent = (props: DialogComponentProps) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    useEffect(() => {
        props.onEmitLoading(cancelLoading || confirmLoading || false);
    }, [cancelLoading, confirmLoading]);
    const commonEvent = async (eventName: 'onConfirm' | 'onCancel', setState: Function, type: 'success' | 'error') => {
        const onEvent: DialogProps['onConfirm'] = props[eventName];
        if (onEvent && onEvent.length) {
            setState(true);
            onEvent(() => {
                props.onEmit(type);
            })
        } else if (onEvent) {
            try {
                setState(true);
                await onEvent(() => { });
                props.onEmit(type);
            } catch (error) {
                console.error(error);
                setState(false);
            }
        } else {
            props.onEmit(type);
        }
    }
    const confirm = async () => {
        commonEvent('onConfirm', setConfirmLoading, 'success')
    }
    const cancel = async () => {
        commonEvent('onCancel', setCancelLoading, 'error')
    }
    const ConfirmButton = useMemo(() => {
        const type = typeof props.confirmText;
        if (type === 'string') {
            return props.confirmText
        } else if (type === 'function') {
            return (props as any).confirmText(confirmLoading)
        } else {
            return '确定';
        }
    }, [confirmLoading, props.confirmText])
    const CanelButton = useMemo(() => {
        const type = typeof props.cancelText;
        if (type === 'string') {
            return props.cancelText
        } else if (type === 'function') {
            return (props as any).cancelText(cancelLoading)
        } else {
            return '取消';
        }
    }, [cancelLoading, props.cancelText])
    return <div className='dialog-body'>
        <div className='title' >
            {props.title}
        </div>
        <div className='content' >
            {props.content}
        </div>
        <div style={{ textAlign: 'center' }}>
            {props.showCancel !== false ? <button className='cancel' onClick={cancel}>{CanelButton}</button> : null}
            <button className='confirm' onClick={confirm}>{ConfirmButton}</button>
        </div>
    </div>;
}

export const dialog = (props: DialogProps) => {
    if (!controller) {
        controller = new ShowController();
    }
    let resolve: Function;
    let reject: Function;
    let isLoading: boolean = false;
    const onCancel = () => {
        if (!isLoading) {
            emit('error');
        } 
    }

    controller.append({
        borderRadius: '10px',
        replace: true,
        zIndex: 9999,
        onCancel: onCancel,
        className: styles.dialog,
        content: () => <DialogComponent {...props} onEmit={emit} onEmitLoading={(loading) => {
            if (props.allowLoadingCancel !== true) {
                isLoading = loading;
            }
        }} />,
    });

    props.getController && props.getController(() => controller);

    return new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    function emit(type: 'success' | 'error') {
        if (type === 'success') {
            resolve();
        } else {
            reject();
        }
        controller.closeAll();
    }

}

