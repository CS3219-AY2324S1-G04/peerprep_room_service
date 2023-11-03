import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import Room, { createJsonCompatibleRoom } from '../data_structs/room';
import UserId from '../data_structs/user_id';
import AccessTokenVerifier from '../services/access_token_verifier';
import DatabaseClient from '../services/database_client';
import { UserProfile } from '../services/user_service';
import { accessTokenKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

export default class GetRoomByUserHandler extends Handler {
  private _accessTokenVerifier: AccessTokenVerifier;

  public constructor(accessTokenVerifier: AccessTokenVerifier) {
    super();
    this._accessTokenVerifier = accessTokenVerifier;
  }

  public override get method(): HttpMethod {
    return HttpMethod.get;
  }

  public override get subPath(): string {
    // TODO: Change this to 'room'
    return 'room/user';
  }

  private static _parseCookies(
    accessTokenVerifier: AccessTokenVerifier,
    cookies: {
      [x: string]: string | undefined;
    },
  ): UserId {
    let userProfile: UserProfile;
    try {
      userProfile = accessTokenVerifier.verify(cookies[accessTokenKey] ?? '');
    } catch (e) {
      throw new HttpErrorInfo(401);
    }

    return UserId.parseNumber(userProfile.userId);
  }

  private static async _fetchRoom(
    databaseClient: DatabaseClient,
    userId: UserId,
  ) {
    const room: Room | undefined =
      await databaseClient.fetchRoomFromUserId(userId);

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
    const userId: UserId = GetRoomByUserHandler._parseCookies(
      this._accessTokenVerifier,
      req.cookies,
    );
    const room: Room = await GetRoomByUserHandler._fetchRoom(
      databaseClient,
      userId,
    );

    res.status(200).send(createJsonCompatibleRoom(room));
  }
}
