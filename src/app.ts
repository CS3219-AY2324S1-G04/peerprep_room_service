/**
 * @file Defines {@link App}.
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import Handler, { HttpMethod } from './handlers/handler';
import DatabaseClient from './services/database_client';
import MqClient from './services/mq_client';

/** Represents the app. */
export default class App {
  private readonly _app: express.Application;
  private readonly _port: number;
  private readonly _databaseClient: DatabaseClient;
  private readonly _mqClient: MqClient;

  /**
   * Setup the app.
   * @param port - Port to listen on.
   * @param databaseClient - Client for communicating with the database.
   * @param mqClient - Client for communicating with the message queue.
   * @param handlers - Handlers for handling API requests.
   * @param isDevEnv - True if the app is running in a development environment.
   */
  public constructor(
    port: number,
    databaseClient: DatabaseClient,
    mqClient: MqClient,
    handlers: Handler[],
    isDevEnv: boolean,
  ) {
    this._app = express();
    this._port = port;
    this._databaseClient = databaseClient;
    this._mqClient = mqClient;

    this._setupMiddleman(isDevEnv);
    this._setupHandlers(handlers);
  }

  /** Starts the app. */
  public start(): void {
    this._app.listen(this._port, '0.0.0.0', () => {
      console.log(`App is listening on ${this._port}`);
    });
  }

  private _setupMiddleman(isDevEnv: boolean): void {
    this._app.use(cookieParser());
    this._app.use(bodyParser.json());

    if (isDevEnv) {
      this._enableDevFeatures();
    }
  }

  private _enableDevFeatures(): void {
    this._app.use(
      cors({
        origin: new RegExp('http://localhost:[0-9]+'),
        credentials: true,
      }),
    );
  }

  private _setupHandlers(handlers: Handler[]) {
    for (const handler of handlers) {
      switch (handler.method) {
        case HttpMethod.get:
          this._app.get(
            handler.path,
            this._wrapHandle(handler.handle.bind(handler)),
          );
          break;
        case HttpMethod.post:
          this._app.post(
            handler.path,
            this._wrapHandle(handler.handle.bind(handler)),
          );
          break;
        case HttpMethod.put:
          this._app.put(
            handler.path,
            this._wrapHandle(handler.handle.bind(handler)),
          );
          break;
        case HttpMethod.patch:
          this._app.patch(
            handler.path,
            this._wrapHandle(handler.handle.bind(handler)),
          );
          break;
        case HttpMethod.delete:
          this._app.delete(
            handler.path,
            this._wrapHandle(handler.handle.bind(handler)),
          );
          break;
      }
    }
  }

  private _wrapHandle(
    handle: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
      databaseClient: DatabaseClient,
      mqClient: MqClient,
    ) => Promise<void>,
  ): (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => Promise<void> {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      await handle(req, res, next, this._databaseClient, this._mqClient);
    };
  }
}
