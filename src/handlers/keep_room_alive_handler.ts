import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import UserId from '../data_structs/user_id';
import AccessTokenVerifier from '../services/access_token_verifier';
import DatabaseClient from '../services/database_client';
import { UserProfile } from '../services/user_service';
import { accessTokenKey, roomExpiryKey } from '../utils/parameter_keys';
import Handler, { HttpMethod } from './handler';

export default class KeepRoomAliveHandler extends Handler {
  private _accessTokenVerifier: AccessTokenVerifier;
  private _roomExpireMillis: number;

  public constructor(
    accessTokenVerifier: AccessTokenVerifier,
    roomExpireMillis: number,
  ) {
    super();
    this._accessTokenVerifier = accessTokenVerifier;
    this._roomExpireMillis = roomExpireMillis;
  }

  public override get method(): HttpMethod {
    // TODO: Change to HttpMethod.patch;
    return HttpMethod.put;
  }

  public override get subPath(): string {
    // TODO: Change this to 'rooms/:rid'
    return 'room/user/keep-alive';
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

  private static async _delayRoomExpiry(
    databaseClient: DatabaseClient,
    userId: UserId,
    roomExpireMillis: number,
  ): Promise<Date> {
    const newExpiry = new Date(Date.now() + roomExpireMillis);

    if (!(await databaseClient.updateRoomExpiry(userId, newExpiry))) {
      throw new HttpErrorInfo(404);
    }

    return newExpiry;
  }

  public override async handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
  ): Promise<void> {
    const userId: UserId = KeepRoomAliveHandler._parseCookies(
      this._accessTokenVerifier,
      req.cookies,
    );
    const expiry: Date = await KeepRoomAliveHandler._delayRoomExpiry(
      databaseClient,
      userId,
      this._roomExpireMillis,
    );

    res.status(200).send({ [roomExpiryKey]: expiry });
  }
}
