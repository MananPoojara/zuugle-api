var environment = process.env.NODE_ENV || 'development';
import knex from 'knex';
import knexConfig from './knexfile';

export default knex(knexConfig[environment]);
