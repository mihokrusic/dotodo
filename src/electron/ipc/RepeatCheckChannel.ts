import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from './../interfaces/IPCChannelInterface';
import { getTaskRepeatService, TaskRepeatService } from '../services/tasks-repeat.service';

interface Props {
    id: number;
    done: boolean;
    date: Date;
}

export class RepeatCheckChannel implements IpcChannelInterfaceWithType<Props> {
    private repeatTaskService: TaskRepeatService;

    constructor() {
        this.repeatTaskService = getTaskRepeatService();
    }

    getName(): string {
        return 'repeat:check';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { id, done, date } = args;

        try {
            const data = await this.repeatTaskService.checkTaskRepeat(id, done, date);
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
