/**
 * @file Defines {@link MongoClient}
 */
import mongoose, { ConnectOptions } from 'mongoose';

import Config from '../dataStructs/config';

/** Represents the connection to a mongo instance. */
export default class mongoClient {
  /** Singleton */
  private connection: mongoose.Mongoose | null;

  /**
   * Connects to a mongodb and instantiates the collection
   */
  public constructor() {
    const config = Config.getInstance();

    let uri: string = 'mongodb://';
    if (config.mongoUser != '' && config.mongoPass != '') {
      uri += `${config.mongoUser}:${config.mongoPass}@`;
    }
    uri += `${config.mongoHost}:${config.mongoPort}/${config.mongoDB}`;

    console.log(`Attempting to connect to ${uri}`);

    this.connection = null;

    this.connect(uri);
  }

  /**
   * Connects to a particular mongo at a particular URI
   * @param uri the
   */
  private async connect(uri: string): Promise<void> {

    try {
      this.connection = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 30000,
      } as ConnectOptions);

      console.log("Successfully connected to mongo!")
    } catch (error) {
      console.error("Unable to reach Mongo Server!");
      console.error(error);
    } 
  }

  // Broadcast Room Delete doesn't work if you scale this up. Imagine 200 room-services monitoring
  // the DB and broadcasting at the same time to MQ for deletion event.
  // In addition this requires using _id as room-id instead of uuid4
  // private async broadcastRoomDelete() {
  //   const changeStream = roomInfoModel.watch();

  //   changeStream.on('change', (changeEvent) => {
  //     if (changeEvent.operationType === 'delete') {
  //       const deletedDocument = changeEvent.documentKey;
  //       // Publish the deletion event to RabbitMQ or handle it as needed
  //       // Example: publishToRabbitMQ(deletedDocument);
  //     }
  //   });
  // }
}
