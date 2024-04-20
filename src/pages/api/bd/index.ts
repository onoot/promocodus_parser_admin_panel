import { Sequelize } from 'sequelize';
import { ModelStatic } from 'sequelize/types';
import pg from 'pg';
import dotenv from 'dotenv';

// Загрузка переменных среды из файла .env
dotenv.config();

pg.defaults.parseInt8 = true;

const password=process.env.DB_PASSWORD
const username=process.env.DB_USER
const port: number = parseInt(process.env.DB_PORT || '5432', 10);
const database=process.env.DB_NAME
const host=process.env.DB_HOST

const Sync: boolean = process.env.DB_SYNC === "true";

const sequelize = new Sequelize({
    dialect: 'postgres',
    dialectModule: pg,
    password,
    username,
    port,
    database,
    host,
    logging: false,
});

interface Db {
    sequelize: Sequelize;
    prmocode: ModelStatic<any>;
    store: ModelStatic<any>;
    template: ModelStatic<any>;
    tasks: ModelStatic<any>;
    shoptask: ModelStatic<any>;
    history: ModelStatic<any>;
}

import prmocodeModel from './promocode.model';
import storeModel from './store.model';
import templateModel from './template.model';
import tasksModel from './tasks.model';
import historyModel from './history.model';
import tasksopModel from "./tasop.model";

const db: Db = {
    sequelize,
    prmocode: prmocodeModel(sequelize),
    store: storeModel(sequelize),
    template: templateModel(sequelize),
    tasks: tasksModel(sequelize),
    shoptask: tasksopModel(sequelize),
    history: historyModel(sequelize),
};

// Создаем таблицы, если в файле конфигурации указан нужный параметр
if (Sync){
    db.sequelize.sync({ force: false})
        .then(() => {
            console.log('Таблицы синхронизированны');
        })
        .catch((error) => {
            console.error('Ошибка синхронизации: ', error);
        });
}


export default db;
