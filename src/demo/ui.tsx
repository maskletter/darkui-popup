import React from 'react';
import styles from './demo.module.less';
import { toast, dialog, actionSheet } from '../ui'

export default () => {

    const Title = (props: { text: string }) => <h2 style={{ color: '#666' }}>{props.text}</h2>;
    const test1 = async () => {
        toast(new Date().toString());
    }
    const test2 = () => {
        dialog({
            title: '提示',
            content: '确认要关闭弹窗吗',
        })
            .then(() => {
                alert('点击了确定');
            })
            .catch(() => {
                alert('点击了取消');
            });
    }
    const test3 = () => {
        dialog({
            title: '警告',
            content: '确认要关闭弹窗吗',
            confirmText: (loading) => loading ? '加载中' : '确定',
            cancelText: (loading) => loading ? '加载中' : '取消',
            allowLoadingCancel: true,
            onConfirm: async () => {
                await new Promise(resolve => {
                    setTimeout(() => resolve(undefined), 2000);
                })
            },
            onCancel: callback => {
                setTimeout(() => callback(), 1400);
            }
        })
            .then(() => {
                alert('点击了确定');
            })
            .catch(() => {
                alert('点击了取消');
            });
    }
    const test4 = () => {
        actionSheet({
            list: [
                { text: 'aaaaa' },
                { text: (ld) => !ld ? 'bbbbb(带loading)' : 'bbbbb-加载中', onClick(c) { setTimeout(() => c(), 2000) } },
                { text: 'ccccc' },
                { text: 'ddddd' },
            ],
        }).then(res => {
            console.log(res)
        })
    }
    return <div>
        <Title text="简单形式" />
        <div>
            <button className={styles.button} onClick={test1}>
                toast组件
        </button>
            <button className={styles.button} onClick={test2}>
                dialog组件
        </button>
            <button className={styles.button} onClick={test3}>
                dialog组件,loading状态
        </button>
            <button className={styles.button} onClick={test4}>
                actionSheet
        </button>
        </div>
    </div>
}