const { Sequelize } = require('sequelize');
const Tasks = require('./Tasks');
const RecurringTasks = require('./RecurringTasks');

async function connectToDb(fileName, log) {
    log.info(`Trying to open db at ${fileName}`);

    const context = new Sequelize({ dialect: 'sqlite', storage: fileName, logging: false });

    const taskModel = Tasks(context);
    const recurringTaskModel = RecurringTasks(context);

    // TODO: this creates foreign key with TitleCase, change it to lowerCase
    recurringTaskModel.hasMany(taskModel, { foreignKey: 'recurringTaskId' });

    // TODO: how to handle this on production?
    // await context.sync({ force: true });

    log.info('Connected to db. All models are synchronized successfully.');

    return context;
}

module.exports = {
    connectToDb,
};
