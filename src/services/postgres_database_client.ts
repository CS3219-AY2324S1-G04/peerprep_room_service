import { ArrayContains, ArrayOverlap, DataSource } from 'typeorm';

import DatabaseClientConfig from '../configs/database_client_config';
import QuestionId from '../data_structs/question_id';
import Room from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import UserId from '../data_structs/user_id';
import RoomEntity from '../entities/room';
import DatabaseClient from './database_client';

export class PostgresDatabaseClient implements DatabaseClient {
  private _dataSource: DataSource;

  /**
   * @param config - Configs for the database client.
   */
  public constructor(config: DatabaseClientConfig) {
    this._dataSource = new DataSource({
      type: 'postgres',
      password: config.password,
      username: config.user,
      host: config.host,
      port: config.port,
      database: config.databaseName,
      entities: [RoomEntity],
      connectTimeoutMS: config.connectionTimeoutMillis,
      poolSize: config.maxClientCount,
      synchronize: false,
    });
  }

  public async initialise(): Promise<void> {
    await this._dataSource.initialize();
  }

  public async synchronise(): Promise<void> {
    await this._dataSource.synchronize();
  }

  public async disconnect(): Promise<void> {
    await this._dataSource.destroy();
  }

  public async doEntitiesExist(): Promise<boolean> {
    return (
      (
        await this._dataSource.query(
          'SELECT 1 FROM information_schema.tables WHERE table_name IN ($1)',
          [this._dataSource.getRepository(RoomEntity).metadata.tableName],
        )
      ).length > 0
    );
  }

  public async deleteEntities(): Promise<void> {
    await this._dataSource.query(
      `DROP TABLE IF EXISTS ${
        this._dataSource.getRepository(RoomEntity).metadata.tableName
      }`,
    );
  }

  public async areAnyUsersInRoom(userIds: UserId[]): Promise<boolean> {
    return (
      ((await this._dataSource.getRepository(RoomEntity).findOne({
        select: { roomId: true },
        where: { userIds: ArrayOverlap(userIds.map((id) => id.toNumber())) },
      })) ?? undefined) !== undefined
    );
  }

  public async fetchRoomFromRoomId(roomId: RoomId): Promise<Room | undefined> {
    const room: RoomEntity | undefined =
      (await this._dataSource.getRepository(RoomEntity).findOne({
        where: { roomId: roomId.toString() },
      })) ?? undefined;

    if (room === undefined) {
      return undefined;
    }

    return {
      roomId: RoomId.parse(room.roomId),
      userIds: UserId.parseMultipleNumbers(room.userIds),
      questionId: QuestionId.parse(room.questionId),
      roomExpiry: room.roomExpiry,
    };
  }

  public async fetchRoomFromUserId(userId: UserId): Promise<Room | undefined> {
    const room: RoomEntity | undefined =
      (await this._dataSource.getRepository(RoomEntity).findOne({
        where: { userIds: ArrayContains([userId.toNumber()]) },
      })) ?? undefined;

    if (room === undefined) {
      return undefined;
    }

    return {
      roomId: RoomId.parse(room.roomId),
      userIds: UserId.parseMultipleNumbers(room.userIds),
      questionId: QuestionId.parse(room.questionId),
      roomExpiry: room.roomExpiry,
    };
  }

  public async createRoom(room: Room): Promise<void> {
    await this._dataSource.getRepository(RoomEntity).insert({
      roomId: room.roomId.toString(),
      userIds: room.userIds.map((id) => id.toNumber()),
      questionId: room.questionId.toString(),
      roomExpiry: room.roomExpiry,
    });
  }

  public async updateRoomExpiry(
    userId: UserId,
    expiry: Date,
  ): Promise<boolean> {
    const roomId: RoomId | undefined = (await this.fetchRoomFromUserId(userId))
      ?.roomId;

    if (roomId === undefined) {
      return false;
    }

    return (
      ((
        await this._dataSource
          .getRepository(RoomEntity)
          .update(roomId.toString(), {
            roomExpiry: expiry,
          })
      ).affected ?? 0) > 0
    );
  }

  public async removeRoomUser(userId: UserId): Promise<boolean> {
    const room: Room | undefined = await this.fetchRoomFromUserId(userId);

    if (room === undefined) {
      return false;
    }

    room.userIds;

    return (
      ((
        await this._dataSource
          .getRepository(RoomEntity)
          .update(room.roomId.toString(), {
            userIds: room.userIds
              .map((id) => id.toNumber())
              .filter((id) => id !== userId.toNumber()),
          })
      ).affected ?? 0) > 0
    );
  }

  public async deleteRoom(roomId: RoomId): Promise<boolean> {
    return (
      ((
        await this._dataSource
          .getRepository(RoomEntity)
          .delete(roomId.toString())
      ).affected ?? 0) > 0
    );
  }

  public isUniqueConstraintViolated(err: unknown): boolean {
    return (
      err instanceof Error &&
      err.message.includes('duplicate key value violates unique constraint')
    );
  }
}
