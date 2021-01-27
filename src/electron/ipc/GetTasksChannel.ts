import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from './../interfaces/IPCChannelInterface';
import { TaskService, getTaskService } from './../services/tasks.service';

interface Props {
    type: number;
    startDate: Date;
    endDate: Date;
}

export class GetTasksChannel implements IpcChannelInterfaceWithType<Props> {
    private taskService: TaskService;

    constructor() {
        this.taskService = getTaskService();
    }

    getName(): string {
        return 'task:get';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const tasks = await this.taskService.getTasks(args.type, args.startDate);
        return tasks;
    }
}
