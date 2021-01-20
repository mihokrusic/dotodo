import { IpcMainEvent } from 'electron';

export interface IpcChannelInterface {
    getName(): string;

    handle(event: IpcMainEvent, args: any): Promise<any>;
}

export interface IpcChannelInterfaceWithType<T> extends IpcChannelInterface {
    getName(): string;

    handle(event: IpcMainEvent, args: T): Promise<any>;
}
