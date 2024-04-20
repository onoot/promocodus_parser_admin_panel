import { DataTypes, Model, Sequelize } from 'sequelize';

interface PromocodeAttributes {
    id: number;
    coupon_id: string;
    coupon_link: string;
    store_url: string;
    name: string;
    species: string;
    promocode: string;
    store_name: string;
    date_end: string;
    new: boolean;
    deleted: boolean;
    description: string;
    status_code: number;
}

interface PromocodeCreationAttributes extends PromocodeAttributes {}

class Promocode extends Model<PromocodeAttributes, PromocodeCreationAttributes> implements PromocodeAttributes {
    public id!: number;
    public coupon_id!: string;
    public coupon_link!: string;
    public store_url!: string;
    public name!: string;
    public species!: string;
    public promocode!: string;
    public store_name!: string;
    public date_end!: string;
    public new!: boolean;
    public deleted!: boolean;
    public description!: string;
    public status_code!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const promocodeModel = (sequelize: Sequelize) => {
    return Promocode.init(
        {
            id: {
                primaryKey: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
            },
            coupon_id: DataTypes.TEXT,
            coupon_link: DataTypes.TEXT,
            store_url: DataTypes.TEXT,
            name: DataTypes.TEXT,
            species: DataTypes.TEXT,
            promocode: DataTypes.TEXT,
            store_name: DataTypes.TEXT,
            date_end: DataTypes.TEXT,
            new: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            description: DataTypes.TEXT,
            status_code: DataTypes.INTEGER,
        },
        {
            tableName: 'promocodes',
            sequelize,
        }
    );
};

export default promocodeModel;
