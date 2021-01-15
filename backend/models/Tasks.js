const { DataTypes, Model } = require('sequelize');

class Task extends Model {}

module.exports = (sequelize) => {
    Task.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            date: { type: DataTypes.DATEONLY, allowNull: false },
            type: { type: DataTypes.SMALLINT, allowNull: false },
            text: { type: DataTypes.STRING },
            done: { type: DataTypes.BOOLEAN, defaultValue: false },
            deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        {
            sequelize,
        }
    );
};
