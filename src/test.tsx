import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './popup'
import ShowDemo from './demo/show'
import UiDemo from './demo/ui'

const A = () => {

    const [visibility, setVisibility] = useState(false);

    return <div >
        dawdawd<br />
        <button onClick={() => {
            setVisibility(true)
        }}>测试打开弹窗</button>
        <ShowDemo />
        <UiDemo />
        <Popup visibility={visibility} onCancel={() => {
            setVisibility(false)
        }}>
            内容内容内容内容内容内容
        </Popup>
    </div>

}


export const run = () => {
    const root = createRoot(document.getElementById('root') as any);
    root.render(<A />);
}

run();