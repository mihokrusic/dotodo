import { Sequelize } from 'sequelize-typescript';
import { Task } from './Tasks';
import { RecurringTask } from './RecurringTasks';
import { ElectronLog } from 'electron-log';

export async function connectToDb(fileName: string, log: ElectronLog) {
    log.info(`Trying to open db at ${fileName}`);

    const context = new Sequelize({ dialect: 'sqlite', storage: fileName, logging: false });
    context.addModels([Task, RecurringTask]);

    // TODO: how to handle this on production?
    // await context.sync({ alter: true });

    log.info('Connected to db. All models are synchronized successfully.');

    return context;
}
