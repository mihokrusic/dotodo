import { Table, Column, Model, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

export enum SettingCode {
    WindowSize = 'window:size',
    WindowPosition = 'window:position',
}

@Table({
    tableName: 'Settings',
})
export class Settings extends Model {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    })
    id: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    code: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    value: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
