import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { PeriodType } from 'src/interfaces/enums';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import { TaskService, getTaskService } from './../services/tasks.service';

interface Props {
    recurringTaskId: number;
    endDate: Date;
}

export class StopRepeatingTaskChannel implements IpcChannelInterfaceWithType<Props> {
    private taskService: TaskService;

    constructor() {
        this.taskService = getTaskService();
    }

    getName(): string {
        return 'repeat-task-stop';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { recurringTaskId, endDate } = args;

        try {
            const data = await this.taskService.stopRepeatingTask(recurringTaskId, endDate);
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
