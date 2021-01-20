import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import { TaskService, getTaskService } from './../services/tasks.service';

interface Props {
    id: number;
}

export class DeleteTaskChannel implements IpcChannelInterfaceWithType<Props> {
    private taskService: TaskService;

    constructor() {
        this.taskService = getTaskService();
    }

    getName(): string {
        return 'delete-task';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        try {
            const data = await this.taskService.deleteTask(args.id, true);
            return {
                error: null,
                data,
            };
        } catch (e) {
            log.error(e);
            return {
                error: e.message,
            };
        }
    }
}
