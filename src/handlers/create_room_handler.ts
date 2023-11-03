import express from 'express';

import ClientSpecifiedRoom from '../data_structs/client_specified_room';
import DecodedJson, { DecodedJsonObject } from '../data_structs/decoded_json';
import HttpErrorInfo from '../data_structs/http_error_info';
import QuestionId from '../data_structs/question_id';
import RoomId from '../data_structs/room_id';
import UserId from '../data_structs/user_id';
import DatabaseClient from '../services/database_client';
import { questionIdKey, roomIdKey, userIdsKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

export default class CreateRoomHandler extends Handler {
  private _roomExpireMillis: number;

  public constructor(roomExpireMillis: number) {
    super();
    this._roomExpireMillis = roomExpireMillis;
  }

  public override get method(): HttpMethod {
    return HttpMethod.post;
  }

  public override get subPath(): string {
    // TODO: Change this to 'rooms'
    return 'create';
  }

  private static _parseBody(data: DecodedJson): ClientSpecifiedRoom {
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpErrorInfo(400, 'Body must be a JSON object.');
    }

    data = data as DecodedJsonObject;

    let userIds: UserId[] | undefined = undefined;
    let questionId: QuestionId | undefined = undefined;

    const invalidInfo: { [key: string]: string } = {};

    try {
      userIds = UserId.parseMultipleNumbers(data[userIdsKey]);
    } catch (e) {
      invalidInfo[userIdsKey] = (e as Error).message;
    }

    try {
      questionId = QuestionId.parse(data[questionIdKey]);
    } catch (e) {
      invalidInfo[questionIdKey] = (e as Error).message;
    }

    if (Object.keys(invalidInfo).length > 0) {
      throw new HttpErrorInfo(400, JSON.stringify(invalidInfo));
    }

    return { userIds: userIds!, questionId: questionId! };
  }

  private static async _ensureUsersNotInRoom(
    databaseClient: DatabaseClient,
    userIds: UserId[],
  ): Promise<void> {
    if (await databaseClient.areAnyUsersInRoom(userIds)) {
      throw new HttpErrorInfo(
        400,
        JSON.stringify({
          [userIdsKey]: 'One or more users specified are already in a room.',
        }),
      );
    }
  }

  private static async _createRoom(
    databaseClient: DatabaseClient,
    room: ClientSpecifiedRoom,
    roomExpireMillis: number,
  ): Promise<RoomId> {
    let roomId: RoomId | undefined;

    let isEntryCreated: boolean = false;
    while (!isEntryCreated) {
      roomId = RoomId.create();

      try {
        await databaseClient.createRoom({
          roomId: roomId,
          userIds: room.userIds,
          questionId: room.questionId,
          roomExpiry: new Date(Date.now() + roomExpireMillis),
        });
      } catch (e) {
        if (!databaseClient.isUniqueConstraintViolated(e)) {
          throw e;
        }
      }

      isEntryCreated = true;
    }

    return roomId!;
  }

  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
  ): Promise<void> {
    const room: ClientSpecifiedRoom = CreateRoomHandler._parseBody(req.body);

    await CreateRoomHandler._ensureUsersNotInRoom(databaseClient, room.userIds);
    const roomId: RoomId = await CreateRoomHandler._createRoom(
      databaseClient,
      room,
      this._roomExpireMillis,
    );

    res.status(201).send(JSON.stringify({ [roomIdKey]: roomId.toString() }));
  }
}
