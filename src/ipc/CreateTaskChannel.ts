import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import taskService from './../services/tasks.service';

interface Props {
    type: number;
    startDate: Date;
    text: string;
}

export class CreateTaskChannel implements IpcChannelInterfaceWithType<Props> {
    constructor() {}
    getName(): string {
        return 'create-task';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const task = await taskService.insertTask(args.type, args.startDate, args.text);
        return task.toJSON();
    }
}
