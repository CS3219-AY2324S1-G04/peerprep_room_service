/**
 * @file Initialises the database.
 */
import DatabaseClientConfig from '../../configs/database_client_config';
import DatabaseClient from '../../services/database_client';
import { PostgresDatabaseClient } from '../../services/postgres_database_client';
import DatabaseInitialiserConfig from './database_initialiser_config';

const databaseClientConfig: DatabaseClientConfig = new DatabaseClientConfig();
const databaseInitialiserConfig: DatabaseInitialiserConfig =
  new DatabaseInitialiserConfig();

const databaseClient: DatabaseClient = new PostgresDatabaseClient({
  password: databaseClientConfig.password,
  user: databaseClientConfig.user,
  host: databaseClientConfig.host,
  port: databaseClientConfig.port,
  databaseName: databaseClientConfig.databaseName,
  connectionTimeoutMillis: databaseClientConfig.connectionTimeoutMillis,
  maxClientCount: databaseClientConfig.maxClientCount,
});

databaseClient.initialise().then(async () => {
  if (await databaseClient.doEntitiesExist()) {
    console.log('One or more entities to be created already exist.');

    if (databaseInitialiserConfig.shouldForceInitialisation) {
      console.log('Deleting existing entities ...');
      await databaseClient.deleteEntities();
      console.log('Deleted existing entities!');
    } else {
      console.log('Initialisation aborted!');
      await databaseClient.disconnect();
      return;
    }
  }

  console.log('Creating entities ...');
  await databaseClient.synchronise();
  console.log('Created entities!');

  await databaseClient.disconnect();
});
