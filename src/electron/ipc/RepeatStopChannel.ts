import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from './../interfaces/IPCChannelInterface';
import { getTaskRepeatService, TaskRepeatService } from '../services/tasks-repeat.service';

interface Props {
    taskRepeatId: number;
    endDate: Date;
}

export class RepeatStopChannel implements IpcChannelInterfaceWithType<Props> {
    private repeatTaskService: TaskRepeatService;

    constructor() {
        this.repeatTaskService = getTaskRepeatService();
    }

    getName(): string {
        return 'repeat:stop';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { taskRepeatId, endDate } = args;

        try {
            const data = await this.repeatTaskService.stopRepeatingTask(taskRepeatId, endDate);
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
