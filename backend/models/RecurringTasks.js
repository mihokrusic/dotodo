const { DataTypes, Model } = require('sequelize');

class RecurringTasks extends Model {}

module.exports = (sequelize) => {
    RecurringTasks.init(
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            type: { type: DataTypes.SMALLINT },
            text: { type: DataTypes.STRING },
        },
        {
            sequelize,
        }
    );
};
