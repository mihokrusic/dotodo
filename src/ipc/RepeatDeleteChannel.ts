import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import { getTaskRepeatService, TaskRepeatService } from '../services/tasks-repeat.service';

interface Props {
    id: number;
    date?: Date;
}

export class RepeatDeleteChannel implements IpcChannelInterfaceWithType<Props> {
    private repeatTaskService: TaskRepeatService;

    constructor() {
        this.repeatTaskService = getTaskRepeatService();
    }

    getName = () => 'repeat:delete';

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { id, date } = args;

        try {
            const data = await this.repeatTaskService.deleteTaskRepeat(id, date, true);
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
