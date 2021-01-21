import { CheckTaskChannel } from './CheckTaskChannel';
import { CreateTaskChannel } from './CreateTaskChannel';
import { DeleteTaskChannel } from './DeleteTaskChannel';
import { GetTasksChannel } from './GetTasksChannel';
import { RepeatStartChannel } from './RepeatStartChannel';
import { RepeatStopChannel } from './RepeatStopChannel';
import { RepeatUpdateChannel } from './RepeatUpdateChannel';
import { UpdateTaskChannel } from './UpdateTaskChannel';

export default function ipcChannelFactory() {
    return [
        new GetTasksChannel(),
        new CreateTaskChannel(),
        new UpdateTaskChannel(),
        new DeleteTaskChannel(),
        new CheckTaskChannel(),
        new RepeatStartChannel(),
        new RepeatStopChannel(),
        new RepeatUpdateChannel(),
    ];
}
