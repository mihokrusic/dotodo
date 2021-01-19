const { DataTypes, Model } = require('sequelize');

class RecurringTask extends Model {}

module.exports = (sequelize) => {
    return RecurringTask.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            type: { type: DataTypes.SMALLINT, allowNull: false },
            text: { type: DataTypes.STRING, allowNull: false },
            deleted: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
        },
        {
            sequelize,
        }
    );
};
