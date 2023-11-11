/**
 * @file Entrypoint to the database initialiser.
 *
 * The database initialiser creates the necessary entities in the database.
 */
import DatabaseClientConfig from '../../configs/database_client_config';
import DatabaseClient from '../../services/database_client';
import PostgresDatabaseClient from '../../services/postgres_database_client';
import DatabaseInitialiserConfig from './database_initialiser_config';

const databaseClientConfig: DatabaseClientConfig = new DatabaseClientConfig();
const databaseInitialiserConfig: DatabaseInitialiserConfig =
  new DatabaseInitialiserConfig();

const databaseClient: DatabaseClient = new PostgresDatabaseClient(
  databaseClientConfig,
);

async function initialise(): Promise<void> {
  await databaseClient.initialise();

  if (await databaseClient.doEntitiesExist()) {
    console.log('One or more entities to be created already exist.');

    if (!databaseInitialiserConfig.shouldForceInitialisation) {
      console.log('Initialisation aborted!');
      await databaseClient.disconnect();
      return;
    }

    await deleteExistingEntities();
  }

  await createEntities();
  await databaseClient.disconnect();
}

async function deleteExistingEntities(): Promise<void> {
  console.log('Deleting existing entities ...');
  await databaseClient.deleteEntities();
  console.log('Deleted existing entities!');
}

async function createEntities(): Promise<void> {
  console.log('Creating entities ...');
  await databaseClient.synchronise();
  console.log('Created entities!');
}

initialise();
