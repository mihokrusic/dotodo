const { Sequelize } = require('sequelize');
const Tasks = require('./Tasks');
const RecurringTasks = require('./RecurringTasks');

module.exports = (fileName) => {
    const context = new Sequelize({ dialect: 'sqlite', storage: fileName, logging: false });

    Tasks(context);
    RecurringTasks(context);

    return context;
};
