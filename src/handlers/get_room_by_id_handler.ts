/**
 * @file Defines {@link GetRoomByIdHandler}.
 */
import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import HttpErrorInfo from '../data_structs/http_error_info';
import Room, { createJsonCompatibleRoom } from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import DatabaseClient from '../services/database_client';
import { roomIdKey, roomIdPathKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

/**
 * Handles REST API requests for getting the room whose room ID was specified.
 */
export default class GetRoomByIdHandler extends Handler {
  /** @inheritdoc */
  public override get method(): HttpMethod {
    return HttpMethod.get;
  }

  /** @inheritdoc */
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

  /**
   * Gets the room whose room ID was specified in the request. Sends a HTTP 200
   * response containing information about the room in the response body.
   * @param req - Information about the request.
   * @param res - For creating and sending the response.
   * @param next - Called to let the next handler (if any) handle the request.
   * @param databaseClient - Client for communicating with the database.
   * @throws {HttpErrorInfo} Error 400 if one or more parameters are invalid.
   * Message contains a JSON string of the reasons for the error.
   * @throws {HttpErrorInfo} Error 404 if no room was found that has the
   * specified room ID.
   * @throws {HttpErrorInfo} Error 500 if an unexpected error occurs.
   */
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
