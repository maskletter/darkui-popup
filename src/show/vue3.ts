import { h, reactive, Teleport, onBeforeMount, defineComponent, mergeProps } from 'vue'
import { Instance, ShowPopupProps } from '../type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CreateRoot = (_: ShowPopupProps) => {
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
      const props: any = mergeProps(_props, _ as any);
      const { controller } = props;
      const data = reactive({
        content: null as any,
        visibility: false,
        instance: null as unknown as Instance,
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
          data.instance = null as any;
          data.visibility = false;
        });
      });
      const onCancel = () => {
        if (!data.instance) {
          return;
        }
        if (data.instance?.props?.onCancel) {
          data.instance?.props?.onCancel(data.instance);
        } else {
          data.instance?.close();
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
        console.log(Com)
        return h(
          Teleport,
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
            (data.content as any)?.children,
          ),
        );
      };
    },
  };
  return Component;
};
