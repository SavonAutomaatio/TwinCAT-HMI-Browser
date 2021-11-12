import { Injectable } from '@angular/core';
import { IpcRenderer, IpcRendererEvent } from 'electron';

@Injectable()
export class IpcService {
    private _ipc: IpcRenderer | undefined = void 0;

    constructor() {
        if (window.require) {
            try {
                this._ipc = window.require('electron').ipcRenderer;
            } catch (e) {
                throw e;
            }
        } else {
            console.warn('Electron\'s IPC was not loaded');
        }
    }

    public on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void {
        if (!this._ipc) {
            return;
        }
        this._ipc.on(channel, listener);
    }

    public send(channel: string, ...args: any[]): void {
        if (!this._ipc) {
            return;
        }
        this._ipc.send(channel, ...args);
    }

    public invoke(channel: string, ...args: any[]): Promise<any> {
        if (!this._ipc) {
            return new Promise(() => null);
        }
        return this._ipc.invoke(channel, ...args);
    }

}