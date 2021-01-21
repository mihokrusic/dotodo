import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { PeriodType } from 'src/interfaces/enums';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import { getTaskRepeatService, TaskRepeatService } from '../services/tasks-repeat.service';

interface Props {
    id: number;
    text: string;
    type: PeriodType;
    startDate: Date;
}

export class RepeatStartChannel implements IpcChannelInterfaceWithType<Props> {
    private repeatTaskService: TaskRepeatService;

    constructor() {
        this.repeatTaskService = getTaskRepeatService();
    }

    getName(): string {
        return 'repeat:start';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { id, text, type, startDate } = args;

        try {
            const data = await this.repeatTaskService.repeatTask(id, text, type, startDate);
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
