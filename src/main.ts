/**
 * @file Entry point to the API app.
 */
import App from './app';
import ApiConfig from './configs/api_config';
import DatabaseClientConfig from './configs/database_client_config';
import MqClientConfig from './configs/mq_client_config';
import CreateRoomHandler from './handlers/create_room_handler';
import DeleteRoomHandler from './handlers/delete_room_handler';
import DeleteRoomUserHandler from './handlers/delete_room_user_handler';
import GetRoomByIdHandler from './handlers/get_room_by_id_handler';
import GetRoomByUserHandler from './handlers/get_room_by_user_handler';
import KeepRoomAliveHandler from './handlers/keep_room_alive_handler';
import AccessTokenVerifier from './services/access_token_verifier';
import AmqpMqClient from './services/amqp_mq_client';
import DatabaseClient from './services/database_client';
import MqClient from './services/mq_client';
import PostgresDatabaseClient from './services/postgres_database_client';
import UserService from './services/user_service';

async function run(): Promise<void> {
  const databaseClientConfig: DatabaseClientConfig = new DatabaseClientConfig();
  const mqClientConfig: MqClientConfig = new MqClientConfig();
  const apiConfig: ApiConfig = new ApiConfig();

  const databaseClient: DatabaseClient = new PostgresDatabaseClient(
    databaseClientConfig,
  );
  const mqClient: MqClient = new AmqpMqClient(mqClientConfig);

  const accessTokenVerifier: AccessTokenVerifier = new AccessTokenVerifier(
    await new UserService(
      apiConfig.userServiceHost,
      apiConfig.userServicePort,
    ).fetchAccessTokenPublicKey(),
  );

  const app: App = new App(
    apiConfig.port,
    databaseClient,
    mqClient,
    [
      new CreateRoomHandler(apiConfig.roomExpireMillis),
      new GetRoomByIdHandler(),
      new GetRoomByUserHandler(accessTokenVerifier),
      new KeepRoomAliveHandler(accessTokenVerifier, apiConfig.roomExpireMillis),
      new DeleteRoomUserHandler(accessTokenVerifier),
      ...(apiConfig.isDevEnv ? [new DeleteRoomHandler()] : []),
    ],
    apiConfig.isDevEnv,
  );

  await databaseClient.initialise();
  await mqClient.initialise();
  app.start();
}

run();
