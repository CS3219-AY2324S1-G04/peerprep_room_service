/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  // Variable names that are found in environment
  private static readonly envVarMongoHost: string = 'RS_MONGO_HOST';
  private static readonly envVarMongoPort: string = 'RS_MONGO_PORT';
  private static readonly envVarMongoUser: string = 'RS_MONGO_USER';
  private static readonly envVarMongoPass: string = 'RS_MONGO_PASS';
  private static readonly envVarMongoDB: string = 'RS_MONGO_DB';

  private static readonly envVarMongoRoomExpiry: string = 'RS_ROOM_EXPIRY';
  private static readonly envVarMongoRoomExtend: string = 'RS_ROOM_EXTEND_BY';

  private static instance: Config | undefined;

  /** Copies from Environment and save into these variable names. */
  public readonly mongoHost: string;
  public readonly mongoPort: number;
  public readonly mongoUser: string;
  public readonly mongoPass: string;
  public readonly mongoDB: string;

  public readonly mongoRoomExpiry: number;
  public readonly mongoRoomExtend: number;

  private readonly defaultMongoHost: string = '127.0.0.1';
  private readonly defaultMongoPort: number = 27017;
  private readonly defaultMongoUser: string = '';
  private readonly defaultMongoPass: string = '';
  private readonly defaultMongoDB: string = 'roomservice';

  private readonly defaultMongoRoomExpiry: number = 5 * 60 * 1000;
  private readonly defaultMongoRoomExtend: number = 1 * 60 * 1000;
  /**
   * Constructs a Config and assigns to each field, the value stored in their
   * corresponding environment variable. If an environment variable does not
   * have a valid value, assigns a default value instead.
   *
   * @param env - Environment variables.
   */
  private constructor(env: NodeJS.ProcessEnv = process.env) {
    // Mongo
    
    this.mongoHost =
      Config._parseString(env[Config.envVarMongoHost]) ?? this.defaultMongoHost;
    this.mongoPort = Config._parseInt(env[Config.envVarMongoPort]) ?? this.defaultMongoPort;
    this.mongoUser = Config._parseString(env[Config.envVarMongoUser]) ?? this.defaultMongoUser;
    this.mongoPass = Config._parseString(env[Config.envVarMongoPass]) ?? this.defaultMongoPass;
    this.mongoDB =
      Config._parseString(env[Config.envVarMongoDB]) ?? this.defaultMongoDB;
    
    this.mongoRoomExpiry =
      Config._parseInt(env[Config.envVarMongoRoomExpiry]) ?? this.defaultMongoRoomExpiry;
    this.mongoRoomExtend =
      Config._parseInt(env[Config.envVarMongoRoomExtend]) ?? this.defaultMongoRoomExtend;

  }

  public static getInstance(): Config {
    if (Config.instance == undefined) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Returns undefined if string is empty or undefined.
   *
   * @param raw - The string to be parsed
   * @returns The string or undefined
   */
  private static _parseString(raw: string | undefined): string | undefined {
    if (raw === undefined || raw === '') {
      return undefined;
    }
    return raw;
  }

  /**
   * Returns undefined if Integer is not a number or undefined.
   *
   * @param raw - The string to be parsed
   * @returns The string or undefined
   */
  private static _parseInt(raw: string | undefined): number | undefined {
    if (raw === undefined) {
      return undefined;
    }

    const val: number = parseFloat(raw);
    if (isNaN(val) || !Number.isInteger(val)) {
      return undefined;
    }

    return val;
  }
}
