import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import UserId from '../data_structs/user_id';
import AccessTokenVerifier from '../services/access_token_verifier';
import DatabaseClient from '../services/database_client';
import { UserProfile } from '../services/user_service';
import { accessTokenKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

export default class DeleteRoomUserHandler extends Handler {
  private _accessTokenVerifier: AccessTokenVerifier;

  public constructor(accessTokenVerifier: AccessTokenVerifier) {
    super();
    this._accessTokenVerifier = accessTokenVerifier;
  }
  public override get method(): HttpMethod {
    return HttpMethod.delete;
  }

  public override get subPath(): string {
    // TODO: Change this to 'room/user'
    return 'room/leave-room';
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

  private static async _removeRoomUser(
    databaseClient: DatabaseClient,
    userId: UserId,
  ) {
    if (!(await databaseClient.removeRoomUser(userId))) {
      throw new HttpErrorInfo(404);
    }
  }

  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
  ): Promise<void> {
    const userId: UserId = DeleteRoomUserHandler._parseCookies(
      this._accessTokenVerifier,
      req.cookies,
    );
    await DeleteRoomUserHandler._removeRoomUser(databaseClient, userId);

    res.sendStatus(200);
  }
}
