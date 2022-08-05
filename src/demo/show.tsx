import React from 'react';
import styles from './demo.module.less';
import { Show, ShowController } from '../show';
// import './animate.min.css';
import { CreateRoot } from '../show/react';

export default () => {
  const Title = (props: { text: string }) => <h2 style={{ color: '#666' }}>{props.text}</h2>;
  const style: any = {
    padding: '30px 50px',
    textAlign: 'center',
    borderRadius: 10,
  };
  const test1 = () => {
    Show({
      style: {
        background: 'red',
        overflow: 'initial',
      },
      content: () => '2内容',
    });
  };
  const test3 = (direction: 'center' | 'left' | 'right' | 'top' | 'bottom') => {
    Show({
      direction,
      content: <div style={style}>内容</div>,
    });
  };
  const test2 = () => {
    Show({
      content: () => {
        return (
          <div style={style}>
            <Title text="追加弹窗" />
            <br />
            <br />
            <input type="text" />
            <br />
            <br />
            <button
              className={styles.button}
              onClick={() => [
                Show({
                  content: (
                    <div style={style}>
                      <Title text="弹窗二" />
                    </div>
                  ),
                }),
              ]}
            >
              直接调用
            </button>
          </div>
        );
      },
    });
  };
  const test4 = () => {
    const confirm = () => {
      const controller = new ShowController(CreateRoot(), { destory: true });
      Show(
        {
          direction: 'bottom',
          content: <div style={style}>1111</div>,
          zIndex: 10001,
        },
        {
          controller,
          keep: false,
        },
      );
    };
    Show({
      direction: 'center',
      content: (
        <div style={style}>
          <button onClick={confirm}>打开一个新的弹窗</button>
        </div>
      ),
    });
  };
  return (
    <div>
      <Title text="简单形式" />
      <div>
        <button className={styles.button} onClick={test1}>
          直接调用
        </button>
        <button className={styles.button} onClick={() => test3('left')}>
          左侧菜单
        </button>
        <button className={styles.button} onClick={() => test3('right')}>
          右侧菜单
        </button>
        <button className={styles.button} onClick={() => test3('top')}>
          上侧菜单
        </button>
        <button className={styles.button} onClick={() => test3('bottom')}>
          下侧菜单
        </button>
        <button className={styles.button} onClick={test2}>
          追加弹窗
        </button>
        <button className={styles.button} onClick={test4}>
          弹窗上在覆盖弹窗
        </button>
      </div>
    </div>
  );
};
