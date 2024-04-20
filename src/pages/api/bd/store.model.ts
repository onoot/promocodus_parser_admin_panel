import { DataTypes, Model, Sequelize } from 'sequelize';

interface StoreAttributes {
    id: number;
    store_url: string;
    store_name: string;
    active: boolean;
    category: string;
    sub_category: string;
    url: string;
    h1: string;
    h2: string;
    promo_prompt: string;
    info: string;
    info_addres: string;
    info_email: string;
    info_phone: string;
    info_vk: string;
    img: string;
    slag: string;
    description: string;
    new: boolean;
    time: string;
    imported: boolean;
    exception: boolean;
}

interface StoreCreationAttributes extends StoreAttributes {}

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
    public id!: number;
    public store_url!: string;
    public store_name!: string;
    public active!: boolean;
    public category!: string;
    public sub_category!: string;
    public url!: string;
    public h1!: string;
    public h2!: string;
    public promo_prompt!: string;
    public info!: string;
    info_addres!: string;
    info_email!: string;
    info_phone!: string;
    info_vk!: string;
    public img!: string;
    public slag!: string;
    public description!: string;
    public new!: boolean;
    public time!: string;
    public imported!: boolean;
    public exception!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const storeModel = (sequelize: Sequelize) => {
    return Store.init(
        {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            store_url: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            store_name: DataTypes.TEXT,
            active: DataTypes.BOOLEAN,
            category: DataTypes.TEXT,
            sub_category: DataTypes.TEXT,
            url: DataTypes.TEXT,
            h1: DataTypes.TEXT,
            h2: DataTypes.TEXT,
            promo_prompt: DataTypes.TEXT,
            info: DataTypes.TEXT,
            info_addres: DataTypes.TEXT,
            info_email: DataTypes.TEXT,
            info_phone: DataTypes.TEXT,
            info_vk: DataTypes.TEXT,
            img: DataTypes.TEXT,
            slag: DataTypes.TEXT,
            description: DataTypes.TEXT,
            new: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            time: DataTypes.TEXT,
            imported: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            exception: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            tableName: 'stores',
            sequelize,
        }
    );
};

export default storeModel;
