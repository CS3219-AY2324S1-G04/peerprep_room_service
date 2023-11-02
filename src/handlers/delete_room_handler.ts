import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import HttpErrorInfo from '../data_structs/http_error_info';
import RoomId from '../data_structs/room_id';
import DatabaseClient from '../services/database_client';
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

  private static async _deleteRoom(client: DatabaseClient, roomId: RoomId) {
    if (!(await client.deleteRoom(roomId))) {
      throw new HttpErrorInfo(404);
    }
  }

  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    client: DatabaseClient,
  ): Promise<void> {
    const roomId: RoomId = DeleteRoomHandler._parseParams(req.params);
    await DeleteRoomHandler._deleteRoom(client, roomId);

    res.sendStatus(200);
  }
}
