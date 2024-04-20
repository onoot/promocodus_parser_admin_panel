import { DataTypes, Model, Sequelize } from 'sequelize';

interface TasksAttributes {
    id: number;
    template: string,
    lastRun: Date;
    run: boolean;
    completed: number;
}

interface TasksCreationAttributes extends TasksAttributes {}

class TaShop extends Model<TasksAttributes, TasksCreationAttributes> implements TasksAttributes {
    public id!: number;
    public template!: string;
    public lastRun!: Date;
    public run!: boolean;
    public completed!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const tasksopModel = (sequelize: Sequelize) => {
    return TaShop.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            template: DataTypes.TEXT,
            lastRun: DataTypes.DATE,
            run: DataTypes.BOOLEAN,
            completed: DataTypes.INTEGER,
        },
        {
            tableName: 'tasksop',
            sequelize,
        }
    );
};

export default tasksopModel;
