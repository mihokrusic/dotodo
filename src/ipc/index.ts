import { CheckTaskChannel } from './CheckTaskChannel';
import { CreateTaskChannel } from './CreateTaskChannel';
import { DeleteTaskChannel } from './DeleteTaskChannel';
import { GetTasksChannel } from './GetTasksChannel';
import { UpdateTaskChannel } from './UpdateTaskChannel';

export default function ipcChannelFactory() {
    return [
        new GetTasksChannel(),
        new CreateTaskChannel(),
        new UpdateTaskChannel(),
        new DeleteTaskChannel(),
        new CheckTaskChannel(),
    ];
}
