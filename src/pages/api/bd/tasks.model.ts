import { DataTypes, Model, Sequelize } from 'sequelize';

interface TasksAttributes {
    id: number;
    name: string,
    lastRun: Date;
    template: number;
    run: boolean;
    completed: number;
}

interface TasksCreationAttributes extends TasksAttributes {}

class Tasks extends Model<TasksAttributes, TasksCreationAttributes> implements TasksAttributes {
    public id!: number;
    public name!: string;
    public lastRun!: Date;
    public template!: number;
    public run!: boolean;
    public completed!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const tasksModel = (sequelize: Sequelize) => {
    return Tasks.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: DataTypes.TEXT,
            lastRun: DataTypes.DATE,
            template: DataTypes.INTEGER,
            run: DataTypes.BOOLEAN,
            completed: DataTypes.INTEGER,
        },
        {
            tableName: 'tasks',
            sequelize,
        }
    );
};

export default tasksModel;
