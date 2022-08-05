/**
 * 禁止body的滚动
 * @returns
 */
export const disabledBodyScroll = () => {
    if (isDisabledBodyScroll()) {
      console.warn('已经是禁用body滚动状态,重复禁用不可取🙅‍♂️');
      return () => {};
    }
    const $body = document.body;
    const $html = document.documentElement;
    const { clientHeight } = $html;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
    let $seizeSeat = document.getElementById('seize-seat');
    const original = {
      htmlOverflow: $html.style.overflow || '',
      bodyOverflow: $body.style.overflow || '',
      scrollTop,
    };
    $body.setAttribute('disable-scroll', JSON.stringify(original));
    $body.style.height = `${clientHeight}px`;
    $body.style.overflow = 'hidden';
    // 务必需要设置html的overflow，
    // 具体原理分析：https://stackoverflow.com/questions/41506456/why-body-overflow-not-working/
    $html.style.overflow = 'auto';
    // 部分Android给body设置scrollTop不生效，比如努比亚x android8
    // 因此添加额外元素控制位移
    $seizeSeat = document.createElement('div');
    $seizeSeat.id = 'seize-seat';
    $seizeSeat.style.marginTop = `-${scrollTop}px`;
    document.body.insertBefore($seizeSeat, document.body.children[0]);
    return allowBodyScroll;
  };
  
  export const isDisabledBodyScroll = () => {
    return !!document.body.getAttribute('disable-scroll');
  };
  
  export const allowBodyScroll = () => {
    if (!isDisabledBodyScroll()) return;
    const $seizeSeat = document.getElementById('seize-seat');
    const $body = document.body;
    const $html = document.documentElement;
    let original = { htmlOverflow: '', bodyOverflow: '', scrollTop: 0 };
    try {
      original = JSON.parse(document.body.getAttribute('disable-scroll') as any) as any;
    } catch (error) {
      console.error(error);
    }
    $body.removeAttribute('disable-scroll');
    $body.style.height = '';
    $body.style.overflow = original.bodyOverflow;
    $html.style.overflow = original.htmlOverflow;
    document.body.removeChild($seizeSeat as any);
    document.documentElement.scrollTop = original.scrollTop;
    // 不添加此项，部分Android会不生效，比如努比亚x android8
    document.body.scrollTop = original.scrollTop;
  };
  