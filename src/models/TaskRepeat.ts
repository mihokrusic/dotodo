import { DataTypes } from 'sequelize';
import { Model, HasMany, Column, CreatedAt, Table, UpdatedAt } from 'sequelize-typescript';
import { Task } from './Tasks';

@Table
export class TaskRepeat extends Model {
    @Column({ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;

    @Column({ type: DataTypes.SMALLINT, allowNull: false })
    type: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    text: string;

    @Column({ type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false })
    deleted: boolean;

    @Column({ type: DataTypes.DATEONLY, allowNull: false })
    startDate: Date;

    @Column({ type: DataTypes.DATEONLY })
    endDate: Date;

    @HasMany(() => Task)
    tasks: Task[];

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
