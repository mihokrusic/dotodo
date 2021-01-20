import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IpcChannelInterfaceWithType } from 'src/interfaces/IPCChannelInterface';
import taskService from './../services/tasks.service';

interface Props {
    id: number;
    text: string;
}

export class UpdateTaskChannel implements IpcChannelInterfaceWithType<Props> {
    constructor() {}

    getName(): string {
        return 'update-task';
    }

    async handle(event: IpcMainEvent, args: Props): Promise<any> {
        log.info(this.getName(), JSON.stringify(args));
        try {
            const data = await taskService.updateTask(args.id, args.text);
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