import { TaskService } from 'src/services/tasks.service';
import { CheckTaskChannel } from './CheckTaskChannel';
import { CreateTaskChannel } from './CreateTaskChannel';
import { DeleteTaskChannel } from './DeleteTaskChannel';
import { GetTasksChannel } from './GetTasksChannel';
import { UpdateTaskChannel } from './UpdateTaskChannel';

export default function ipcChannelFactory(taskService: TaskService) {
    return [
        new GetTasksChannel(taskService),
        new CreateTaskChannel(taskService),
        new UpdateTaskChannel(taskService),
        new DeleteTaskChannel(taskService),
        new CheckTaskChannel(taskService),
    ];
}
