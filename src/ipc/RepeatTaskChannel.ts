import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { PeriodType } from 'src/interfaces/enums';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import { TaskService, getTaskService } from './../services/tasks.service';

interface Props {
    id: number;
    text: string;
    type: PeriodType;
    startDate: Date;
}

export class RepeatTaskChannel implements IpcChannelInterfaceWithType<Props> {
    private taskService: TaskService;

    constructor() {
        this.taskService = getTaskService();
    }

    getName(): string {
        return 'repeat-task';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { id, text, type, startDate } = args;

        try {
            const data = await this.taskService.repeatTask(id, text, type, startDate);
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
