import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import HttpErrorInfo from '../data_structs/http_error_info';
import Room from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import DatabaseClient from '../services/database_client';
import MqClient from '../services/mq_client';
import { roomIdKey, roomIdPathKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

export default class DeleteRoomHandler extends Handler {
  public override get method(): HttpMethod {
    return HttpMethod.delete;
  }

  public override get subPath(): string {
    // TODO: Change this to 'rooms/:rid'
    return `room/:${roomIdPathKey}`;
  }

  private static _parseParams(pathParams: ParamsDictionary): RoomId {
    try {
      return RoomId.parse(pathParams[roomIdPathKey]);
    } catch (e) {
      throw new HttpErrorInfo(
        400,
        JSON.stringify({ [roomIdKey]: (e as Error).message }),
      );
    }
  }

  private static async _deleteRoom(
    databaseClient: DatabaseClient,
    roomId: RoomId,
  ): Promise<Room> {
    const room: Room | undefined =
      await databaseClient.fetchRoomFromRoomId(roomId);

    if (room === undefined || !(await databaseClient.deleteRoom(roomId))) {
      throw new HttpErrorInfo(404);
    }

    return room;
  }

  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
    mqClient: MqClient,
  ): Promise<void> {
    const roomId: RoomId = DeleteRoomHandler._parseParams(req.params);
    const room: Room = await DeleteRoomHandler._deleteRoom(
      databaseClient,
      roomId,
    );

    await mqClient.publishDeleteRoomEvent(room);

    res.sendStatus(200);
  }
}
