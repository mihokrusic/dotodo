import { Table, Column, Model, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { TaskRepeat } from './TaskRepeat';

@Table
export class Task extends Model {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    })
    id: number;

    @Column({
        type: DataTypes.DATEONLY,
        allowNull: false,
    })
    date: Date;

    @Column({
        type: DataTypes.SMALLINT,
        allowNull: false,
    })
    type: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    text: string;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    })
    done: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    })
    deleted: boolean;

    @ForeignKey(() => TaskRepeat)
    @Column
    taskRepeatId: number;

    @BelongsTo(() => TaskRepeat)
    taskRepeat: TaskRepeat;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
