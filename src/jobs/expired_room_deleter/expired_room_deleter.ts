import DatabaseClientConfig from '../../configs/database_client_config';
import MqClientConfig from '../../configs/mq_client_config';
import Room from '../../data_structs/room';
import AmqpMqClient from '../../services/amqp_mq_client';
import DatabaseClient from '../../services/database_client';
import MqClient from '../../services/mq_client';
import PostgresDatabaseClient from '../../services/postgres_database_client';
import ExpiredRoomDeleterConfig from './expired_room_deleter_config';

const databaseClientConfig: DatabaseClientConfig = new DatabaseClientConfig();
const mqClientConfig: MqClientConfig = new MqClientConfig();
const expiredRoomDeleterConfig: ExpiredRoomDeleterConfig =
  new ExpiredRoomDeleterConfig();

const databaseClient: DatabaseClient = new PostgresDatabaseClient(
  databaseClientConfig,
);
const mqClient: MqClient = new AmqpMqClient(mqClientConfig);

async function periodicallyDeleteRooms(): Promise<void> {
  await databaseClient.initialise();
  await mqClient.initialise();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rooms: Room[] = await deleteExpiredRoomsFromDatabase();
    await publishDeleteRoomEvents(rooms);

    await new Promise(() =>
      setTimeout(() => {}, expiredRoomDeleterConfig.roomDeletionIntervalMillis),
    );
  }
}

async function deleteExpiredRoomsFromDatabase(): Promise<Room[]> {
  const rooms: Room[] = await databaseClient.fetchExpiredRooms();

  if (rooms.length === 0) {
    return rooms;
  }

  if (!(await databaseClient.deleteRooms(rooms.map((room) => room.roomId)))) {
    console.log('WTF');
  }
  for (const room of rooms) {
    console.log(`Deleted room from database: Room ID = ${room.roomId}`);
  }

  return rooms;
}

async function publishDeleteRoomEvents(rooms: Room[]) {
  for (const room of rooms) {
    await mqClient.publishDeleteRoomEvent(room);
    console.log(`Published delete room event to MQ: Room ID = ${room.roomId}`);
  }
}

periodicallyDeleteRooms();
