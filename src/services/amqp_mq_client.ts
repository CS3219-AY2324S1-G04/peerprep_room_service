import amqp from 'amqplib';

import MqClientConfig from '../configs/mq_client_config';
import Room from '../data_structs/room';
import UserId from '../data_structs/user_id';
import MqClient, {
  EventType,
  RemoveUserRoomEvent,
  RoomEvent,
} from './mq_client';

export default class AmqpMqClient implements MqClient {
  private readonly _connectionPromise: Promise<amqp.Connection>;
  private readonly _exchangeName: string;

  private _connection: amqp.Connection | undefined;
  private _channel: amqp.Channel | undefined;

  public constructor(config: MqClientConfig) {
    this._connectionPromise = amqp.connect(
      `amqp://${encodeURIComponent(config.user)}:${encodeURIComponent(
        config.password,
      )}@${config.host}:${config.port}`,
    );

    this._exchangeName = config.exchangeName;
  }

  public async initialise(): Promise<void> {
    this._connection = await this._connectionPromise;
    this._channel = await this._connection.createChannel();

    await this._channel.assertExchange(this._exchangeName, 'fanout', {
      durable: true,
    });
  }

  public async disconnect(): Promise<void> {
    await this._channel?.close();
    await this._connection?.close();
  }

  public async publishCreateRoomEvent(room: Room): Promise<void> {
    await this._publishEvent(new RoomEvent(EventType.create, room));
  }

  public async publishRemoveUserEvent(
    room: Room,
    removedUserId: UserId,
  ): Promise<void> {
    await this._publishEvent(new RemoveUserRoomEvent(room, removedUserId));
  }

  public async publishDeleteRoomEvent(room: Room): Promise<void> {
    await this._publishEvent(new RoomEvent(EventType.delete, room));
  }

  private async _publishEvent(event: RoomEvent) {
    const message: Buffer = Buffer.from(
      JSON.stringify(event.toJsonCompatibleObject()),
    );
    this._channel?.publish(this._exchangeName, '', message, {
      persistent: true,
    });
  }
}
