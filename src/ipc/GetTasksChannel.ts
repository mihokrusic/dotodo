import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import taskService from './../services/tasks.service';

interface Props {
    type: number;
    startDate: Date;
    endDate: Date;
}

export class GetTasksChannel implements IpcChannelInterfaceWithType<Props> {
    constructor() {}

    getName(): string {
        return 'get-tasks';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const tasks = await taskService.getTasks(args.type, args.startDate);
        return tasks;
    }
}
