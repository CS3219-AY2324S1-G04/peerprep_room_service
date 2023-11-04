/**
 * @file Defines {@link Handler}.
 */
import express from 'express';

import HttpErrorInfo from '../data_structs/http_error_info';
import DatabaseClient from '../services/database_client';
import MqClient from '../services/mq_client';

/** Handler of a HTTP route. */
export default abstract class Handler {
  public get path(): string {
    return `/room-service/${this.subPath}`;
  }

  /** Gets the HTTP request method to handle. */
  public abstract get method(): HttpMethod;
  /** Gets the request path to handle. */
  public abstract get subPath(): string;

  /**
   * Handles a request that was sent to path {@link path()} with method
   * {@link method()}.
   * @param req - Information about the request.
   * @param res - For creating and sending the response.
   * @param next - Called to let the next handler (if any) handle the request.
   * @param databaseClient - Client for communicating with the database.
   * @param mqClient - Client for communicating with the message queue.
   */
  public async handle(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
    mqClient: MqClient,
  ): Promise<void> {
    try {
      await this.handleLogic(req, res, next, databaseClient, mqClient);
    } catch (e) {
      if (e instanceof HttpErrorInfo) {
        res.status(e.statusCode).send(e.message);
      } else {
        res.sendStatus(500);
      }
    }
  }

  /**
   * Handles a request that was sent to path {@link path()} with method
   * {@link method()}.
   *
   * Child classes should override this method to define the handler's logic.
   * @param req - Information about the request.
   * @param res - For creating and sending the response.
   * @param next - Called to let the next handler (if any) handle the request.
   * @param databaseClient - Client for communicating with the database.
   * @param mqClient - Client for communicating with the message queue.
   * @returns Content to be use as the HTTP response body.
   * @throws {HttpErrorInfo} Error encountered that requires a HTTP error
   * response to be sent.
   */
  protected abstract handleLogic(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    databaseClient: DatabaseClient,
    mqClient: MqClient,
  ): Promise<void>;
}

/** Represents a HTTP method. */
export enum HttpMethod {
  get,
  post,
  put,
  patch,
  delete,
}
