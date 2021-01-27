import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from './../interfaces/IPCChannelInterface';
import { TaskService, getTaskService } from './../services/tasks.service';

interface Props {
    id: number;
    text: string;
}

export class UpdateTaskChannel implements IpcChannelInterfaceWithType<Props> {
    private taskService: TaskService;

    constructor() {
        this.taskService = getTaskService();
    }

    getName(): string {
        return 'task:update';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { id, text } = args;

        try {
            const data = await this.taskService.updateTask(id, text);
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
