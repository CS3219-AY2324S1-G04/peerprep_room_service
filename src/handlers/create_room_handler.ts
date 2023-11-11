/**
 * @file Defines {@link CreateRoomHandler}.
 */
import express from 'express';

import ClientSpecifiedRoom from '../data_structs/client_specified_room';
import DecodedJson, { DecodedJsonObject } from '../data_structs/decoded_json';
import HttpErrorInfo from '../data_structs/http_error_info';
import QuestionId from '../data_structs/question_id';
import QuestionLangSlug from '../data_structs/question_lang_slug';
import Room from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import UserId from '../data_structs/user_id';
import DatabaseClient from '../services/database_client';
import MqClient from '../services/mq_client';
import {
  questionIdKey,
  questionLangSlugKey,
  roomIdKey,
  userIdsKey,
} from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

/** Handles REST API requests for creating rooms. */
export default class CreateRoomHandler extends Handler {
  private _roomExpireMillis: number;

  /**
   * @param roomExpireMillis - Number of milliseconds a room can last for.
   */
  public constructor(roomExpireMillis: number) {
    super();
    this._roomExpireMillis = roomExpireMillis;
  }

  /** @inheritdoc */
  public override get method(): HttpMethod {
    return HttpMethod.post;
  }

  /** @inheritdoc */
  public override get subPath(): string {
    return 'rooms';
  }

  private static _parseBody(data: DecodedJson): ClientSpecifiedRoom {
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpErrorInfo(400, 'Body must be a JSON object.');
    }

    data = data as DecodedJsonObject;

    let userIds: UserId[] | undefined = undefined;
    let questionId: QuestionId | undefined = undefined;
    let questionLangSlug: QuestionLangSlug | undefined = undefined;

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

    try {
      questionLangSlug = QuestionLangSlug.parse(data[questionLangSlugKey]);
    } catch (e) {
      invalidInfo[questionLangSlugKey] = (e as Error).message;
    }

    if (Object.keys(invalidInfo).length > 0) {
      throw new HttpErrorInfo(400, JSON.stringify(invalidInfo));
    }

    return {
      userIds: userIds!,
      questionId: questionId!,
      questionLangSlug: questionLangSlug!,
    };
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
  ): Promise<Room> {
    let completeRoom: Room | undefined;

    let isEntryCreated: boolean = false;
    while (!isEntryCreated) {
      completeRoom = {
        roomId: RoomId.create(),
        userIds: room.userIds,
        questionId: room.questionId,
        questionLangSlug: room.questionLangSlug,
        roomExpiry: new Date(Date.now() + roomExpireMillis),
      };

      try {
        await databaseClient.createRoom(completeRoom);
      } catch (e) {
        if (!databaseClient.isUniqueConstraintViolated(e)) {
          throw e;
        }
      }

      isEntryCreated = true;
    }

    return completeRoom!;
  }

  /**
   * Creates a new room using the details specified in the request. Sends a HTTP
   * 201 response and publishes a "room creation" event in the MQ.
   * @param req - Information about the request.
   * @param res - For creating and sending the response.
   * @param next - Called to let the next handler (if any) handle the request.
   * @param databaseClient - Client for communicating with the database.
   * @param mqClient - Client for communicating with the message queue.
   * @throws {HttpErrorInfo} Error 400 if the body is not a valid JSON object or
   * one or more parameters are invalid. Message contains a JSON string of the
   * reasons for the error.
   * @throws {HttpErrorInfo} Error 500 if an unexpected error occurs.
   */
  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
    mqClient: MqClient,
  ): Promise<void> {
    const room: ClientSpecifiedRoom = CreateRoomHandler._parseBody(req.body);

    await CreateRoomHandler._ensureUsersNotInRoom(databaseClient, room.userIds);
    const completeRoom: Room = await CreateRoomHandler._createRoom(
      databaseClient,
      room,
      this._roomExpireMillis,
    );

    await mqClient.publishCreateRoomEvent(completeRoom);

    res
      .status(201)
      .send(JSON.stringify({ [roomIdKey]: completeRoom.roomId.toString() }));
  }
}
