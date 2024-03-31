import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Photo } from './entities/Photo';

export const dataSource = new DataSource({
    type: 'sqlite',
    database: './main.sqlite',
    entities: [Photo],
    logging: true,
    synchronize: true,
});
