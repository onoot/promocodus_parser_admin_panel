import { DataTypes, Model, Sequelize } from 'sequelize';

interface HistoryAttributes {
    id: number;
    name: string;
    lastRun: string;
    type: string;
    urls: string;
    parseUrls: boolean;
}

interface HistoryCreationAttributes extends HistoryAttributes {}

class History extends Model<HistoryAttributes, HistoryCreationAttributes> implements HistoryAttributes {
    public id!: number;
    public name!: string;
    public lastRun!: string;
    public type!: string;
    public urls!: string;
    public parseUrls!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const historyModel = (sequelize: Sequelize) => {
    return History.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: DataTypes.TEXT,
            type: DataTypes.TEXT,
            lastRun: DataTypes.TEXT,
            urls: DataTypes.TEXT,
            parseUrls: DataTypes.BOOLEAN,
        },
        {
            tableName: 'history',
            sequelize,
        }
    );
};

export default historyModel;
