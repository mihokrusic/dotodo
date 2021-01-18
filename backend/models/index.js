const { Sequelize } = require('sequelize');
const Tasks = require('./Tasks');
const RecurringTasks = require('./RecurringTasks');

function connectToDb(fileName, log) {
    log.info(`Trying to open db at ${fileName}`);

    const context = new Sequelize({ dialect: 'sqlite', storage: fileName, logging: false });
    context.sync({ force: false });

    Tasks(context);
    RecurringTasks(context);

    log.info('Connected to db. All models are synchronized successfully.');

    return context;
}

module.exports = {
    connectToDb,
};
