import { DataTypes, Model, Sequelize } from 'sequelize';

interface TemplateAttributes {
    id: number;
    name: string;
    lastRun: number;
    newAmount: number;
    changedAmount: number;
    oldAmount: number;
    interval: number;
    urls: string;
    parseUrls: boolean;
}

interface TemplateCreationAttributes extends TemplateAttributes {}

class Template extends Model<TemplateAttributes, TemplateCreationAttributes> implements TemplateAttributes {
    public id!: number;
    public name!: string;
    public lastRun!: number;
    public newAmount!: number;
    public changedAmount!: number;
    public oldAmount!: number;
    public interval!: number;
    public urls!: string;
    public parseUrls!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const templateModel = (sequelize: Sequelize) => {
    return Template.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: DataTypes.TEXT,
            lastRun: DataTypes.DATE,
            newAmount: DataTypes.INTEGER,
            changedAmount: DataTypes.INTEGER,
            oldAmount: DataTypes.INTEGER,
            interval: DataTypes.INTEGER,
            urls: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            parseUrls: DataTypes.BOOLEAN,
        },
        {
            tableName: 'templates',
            sequelize,
        }
    );
};

export default templateModel;
