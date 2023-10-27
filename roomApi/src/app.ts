/**
 * @file Defines {@link App}
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import cors from 'cors'

import Config from './dataStructs/config';
import room from './routes/room';
import mongoClient from './service/mongo';

/**
 * This is the server which the front end will talk to.
 */
export default class App {
  private readonly app;

  private port: number;

  private mongo;

  constructor() {
    const config = Config.getInstance();

    this.app = express();
    this.port = config.expressPort;

    this.mongo = new mongoClient();

    this.middleMan(config);
    this.routes();

    // Last item
    this.app.use((req: Request, res: Response) => {
      res.status(404);
      res.send('Not found.');
    });
  }

  /**
   * Starts listening and activates ttl.
   */
  public startServer(): void {
    this.app.listen(this.port, () => {
      console.log(`Room Service is running on port ${this.port}`);
    });
  }

  private middleMan(config: Config): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    if (config.isDevEnv) {
      this.enableDevFeatures();
    }
    
  }

  private routes(): void {
    this.app.use('/room-service/room', room);
  }

  private enableDevFeatures(): void {
    this.app.use(
      cors({
        origin: new RegExp('http://localhost:[0-9]+'),
        credentials: true,
      }),
    );
  }

}
