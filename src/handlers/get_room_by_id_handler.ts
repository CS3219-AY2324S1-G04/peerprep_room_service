import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import HttpErrorInfo from '../data_structs/http_error_info';
import Room, { createJsonCompatibleRoom } from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import DatabaseClient from '../services/database_client';
import { roomIdKey, roomIdPathKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

export default class GetRoomByIdHandler extends Handler {
  public override get method(): HttpMethod {
    return HttpMethod.get;
  }

  public override get subPath(): string {
    return `rooms/:${roomIdPathKey}`;
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

  private static async _fetchRoom(
    databaseClient: DatabaseClient,
    roomId: RoomId,
  ): Promise<Room> {
    const room: Room | undefined =
      await databaseClient.fetchRoomFromRoomId(roomId);

    if (room === undefined) {
      throw new HttpErrorInfo(404);
    }

    return room;
  }

  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
  ): Promise<void> {
    const roomId: RoomId = GetRoomByIdHandler._parseParams(req.params);
    const room: Room = await GetRoomByIdHandler._fetchRoom(
      databaseClient,
      roomId,
    );

    res.status(200).send(createJsonCompatibleRoom(room));
  }
}
