import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import { getTaskRepeatService, TaskRepeatService } from '../services/tasks-repeat.service';

interface Props {
    id: number;
    text: string;
}

export class RepeatUpdateChannel implements IpcChannelInterfaceWithType<Props> {
    private repeatTaskService: TaskRepeatService;

    constructor() {
        this.repeatTaskService = getTaskRepeatService();
    }

    getName(): string {
        return 'repeat:update';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        const { id, text } = args;

        try {
            const data = await this.repeatTaskService.updateTaskRepeat(id, text);
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
