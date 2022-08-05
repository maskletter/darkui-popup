/**
 * 继承
 * @param d1
 * @param d2
 * @returns
 */
export const extend = (d1: any, d2: any) => {
    const data = Object.assign({}, d1);
    for (const key in d2) {
      if (key in d2 && d2[key] !== undefined) {
        data[key] = d2[key];
      }
    }
    return data;
  };
  
  /**
   * 生成随机key
   * @returns
   */
  export const randomKey = () => {
    return `${Math.random() + new Date().getTime()}`;
  };
  
  const StyleParseInt = ['width', 'height', 'font-size', 'line-height'];
  /**
   * 用于获取元素css样式
   * @param element
   * @param key
   * @returns
   */
  export const getStyle = (element: HTMLElement, key: any) => {
    const value = getComputedStyle(element)[key];
    if (StyleParseInt.indexOf(key) !== -1) {
      return +value.replace('px', '');
    }
    return value;
  };
  

  export class EventBtns<T> {
    #events: Function[] = [];
  
    on(fn: (data?: T) => void) {
      this.#events.push(fn);
    }
    emit(data?: T) {
      this.#events.forEach((fn) => {
        fn(data);
      });
    }
  
    remove(fn?: (data?: any) => void) {
      if (!fn) {
        this.#events = [];
      } else {
        this.#events = this.#events.filter((v) => v != fn);
      }
    }
  }
  