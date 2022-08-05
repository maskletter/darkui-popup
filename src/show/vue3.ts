import { Instance, ShowPopupProps } from '../type';

declare const Vue: any;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CreateRoot = (_: ShowPopupProps) => {
  const { h, reactive, onBeforeMount, mergeProps } = Vue;
  const Component = {
    props: [
      'controller',
      'format',
      'onDestory',
      'cancelEventName',
      'destoryEventName',
      'visibilityName',
      'component',
    ],
    setup(_props: any) {
      const props = mergeProps(_props, _);
      const { controller } = props;
      const data = reactive({
        content: null,
        visibility: false,
        instance: null,
      });
      const update = (_instance: Instance) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const _props: any = props.format ? props.format(_instance.props) : _instance.props;
        data.content = _props as any;
        data.instance = _instance;
        data.visibility = true;
      };
      onBeforeMount(() => {
        controller.onWatch.on(update);
        controller.onDestory.on(() => {
          data.instance = null;
          data.visibility = false;
        });
      });
      const onCancel = () => {
        if (!data.instance) {
          return;
        }
        if (data.instance.props.onCancel) {
          data.instance.props.onCancel(data.instance);
        } else {
          data.instance.close();
        }
      };
      const events = {
        [props.cancelEventName]: onCancel,
        [props.destoryEventName]: props.onDestory,
      } as any;
      const Com: any = props.component;
      // console.log(props);
      if (!Com) {
        return () => h('h1', {}, ['未加载Component']);
      }
      return () => {
        const ComProps = { ...data.content };
        delete ComProps?.children;
        return h(
          Vue.Teleport,
          {
            to: 'body',
          },
          h(
            Com,
            {
              [props.visibilityName]: data.visibility,
              ...ComProps,
              ...events,
              ...props.other,
            },
            data.content?.children,
          ),
        );
      };
    },
  };
  return Component;
};
