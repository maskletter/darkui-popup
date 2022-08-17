import React, { useMemo, useState } from 'react';
import { ShowController } from '../show';
import styles from './style.module.less';

interface ActionSheetProps {
    list: Array<{
        text: string | ((loading: boolean) => JSX.Element | string),
        /**元素点击事件，可以设置async/callback来进入loading状态 */
        onClick?: (callback: Function) => void;
    }>,
    title?: string
    /**获取当前控制器，用于关闭 */
    getController?: (callback: () => ShowController) => void,
    /**是否允许loading过程中关闭 */
    allowLoadingCancel?: boolean
}
interface ActionSheetComponentProps extends ActionSheetProps {
    onEmit: (item?: ActionSheetProps['list'][0]) => void
    onEmitLoading: (loading: boolean) => void
}
const ActionSheetComponent = (props: ActionSheetComponentProps) => {

    const [loading, _setLoading] = useState(() => Array(props.list.length).fill(false))
    const setLoading = (val: boolean, idx: number) => {
        const _loading = [...loading];
        _loading[idx] = val;
        props.onEmitLoading(val)
        _setLoading(_loading);
    }

    const Text = (item: ActionSheetProps['list'][0], index: number) => {
        const type = typeof item.text;
        if (type === 'string') {
            return item.text;
        } else if (type === 'function') {
            return (item as any).text(loading[index]);
        }
    };

    const clickEvent = async (item: ActionSheetProps['list'][0], index: number) => {
        if (item.onClick && item.onClick.length) {
            setLoading(true, index);
            item.onClick(() => {
                setLoading(false, index);
                props.onEmit(item);
            })
        } else if (item.onClick) {
            setLoading(true, index);
            await item.onClick(() => {});
            setLoading(false, index);
            props.onEmit(item);
        } else {
            props.onEmit(item);
        }
    }

    const Content = useMemo(() => {
        return <div className='content'>
            { props.list.map((item, key) => <div onClick={() => clickEvent(item, key)} key={key}>{Text(item, key)}</div>) }
        </div>;
    }, [props.list, loading]);

    props.getController && props.getController(() => controller);

    return <div className='actionSheet-body'>
        <div className="title">{props.title || '请选择'}</div>
        {Content}
        <div className="fotter" onClick={() => props.onEmit()}>取消</div>
    </div>
}

let controller: ShowController;
export const actionSheet = async (props: ActionSheetProps): Promise<ActionSheetProps['list'][0]> => {

    if (!controller) {
        controller = new ShowController();
    }

    let resolve: Function;
    let reject: Function;
    let isLoading: boolean = false;
    const onCancel = () => {
        if (!isLoading) {
            emit();
        } 
    }

    await controller.append({
        className: styles.actionSheet,
        onCancel: onCancel,
        content: () => <ActionSheetComponent {...props} onEmit={(item) => {
            emit(item)
        }} onEmitLoading={(loading) => {
            if (props.allowLoadingCancel !== true) {
                isLoading = loading;
            }
        }} />,
        direction: 'bottom'
    })

    return new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    function emit(item?: any) {
        if (item) {
            resolve(item);
        } else {
            reject();
        }
        controller.closeAll();
    }

}