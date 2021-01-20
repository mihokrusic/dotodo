import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import taskService from './../services/tasks.service';

interface Props {
    id: number;
    done: boolean;
}

export class CheckTaskChannel implements IpcChannelInterfaceWithType<Props> {
    constructor() {}

    getName(): string {
        return 'check-task';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        try {
            const { id, done } = args;
            const data = await taskService.markTask(id, done);
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
