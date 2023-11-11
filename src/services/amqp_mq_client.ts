/**
 * @file Defines {@link AmqpMqClient}.
 */
import amqp from 'amqplib';

import MqClientConfig from '../configs/mq_client_config';
import Room from '../data_structs/room';
import UserId from '../data_structs/user_id';
import MqClient, {
  EventType,
  RemoveUserRoomEvent,
  RoomEvent,
} from './mq_client';

/** Client for performing MQ operations on an AMQP supported MQ. */
export default class AmqpMqClient implements MqClient {
  private readonly _setupPromise: Promise<void>;
  private readonly _exchangeName: string;

  private _connection: amqp.Connection | undefined;
  private _channel: amqp.Channel | undefined;

  /**
   * @param config - Configs for the MQ client.
   */
  public constructor(config: MqClientConfig) {
    this._exchangeName = config.exchangeName;

    this._setupPromise = (async () => {
      const protocol: string = config.shouldUseTls ? 'amqps' : 'amqp';
      const username: string = encodeURIComponent(config.user);
      const password: string = encodeURIComponent(config.password);
      const url: string = `${protocol}://${username}:${password}@${
        config.host
      }:${config.port}${config.vhost === '' ? '' : `/${config.vhost}`}`;

      this._connection = await amqp.connect(url);
      this._channel = await this._connection.createChannel();

      await this._channel.assertExchange(config.exchangeName, 'fanout', {
        durable: true,
      });
    })();
  }

  /** @inheritdoc */
  public async initialise(): Promise<void> {
    await this._setupPromise;
  }

  /** @inheritdoc */
  public async disconnect(): Promise<void> {
    await this._channel?.close();
    await this._connection?.close();
  }

  /** @inheritdoc */
  public async publishCreateRoomEvent(room: Room): Promise<void> {
    await this._publishEvent(new RoomEvent(EventType.create, room));
  }

  /** @inheritdoc */
  public async publishRemoveUserEvent(
    room: Room,
    removedUserId: UserId,
  ): Promise<void> {
    await this._publishEvent(new RemoveUserRoomEvent(room, removedUserId));
  }

  /** @inheritdoc */
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
