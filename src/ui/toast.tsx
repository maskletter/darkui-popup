import React from 'react';
import { ShowController } from '../show';


let controller: ShowController;
let clearToastTimeout: number;
export const toast = async (msg: string, options?: {
    duration?: number,
    className?: string
}) => {

    if (!controller) {
        controller = new ShowController();
    }

    await controller.append({
        bg: 'transparent',
        wrapperBg: 'rgba(0,0,0,0.8)',
        pointerEvents: true,
        borderRadius: '10px',
        replace: true,
        className: options?.className,
        zIndex: 9999,
        content: () => (
            <div style={{ color: 'white', padding: '10px 20px' }}>{msg}</div>
        ),
    })

    clearTimeout(clearToastTimeout);
    clearToastTimeout = window.setTimeout(() => {
        controller.closeAll();
    }, options?.duration || 3000);

    return controller;

}