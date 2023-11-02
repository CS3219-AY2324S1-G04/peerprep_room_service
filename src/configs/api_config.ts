import assert from 'assert';

import { parseIntStrict } from '../utils/parser_utils';

export default class ApiConfig {
  public static readonly userServiceHostEnvVar: string = 'USER_SERVICE_HOST';
  public static readonly userServicePortEnvVar: string = 'USER_SERVICE_PORT';
  public static readonly roomExpireMillisEnvVar: string = 'ROOM_EXPIRE_MILLIS';
  public static readonly portEnvVar: string = 'PORT';
  public static readonly appModeEnvVar: string = 'NODE_ENV';

  public static readonly defaultRoomExpireMillis: number = 300000;
  public static readonly defaultPort: number = 9003;

  public readonly userServiceHost: string;
  public readonly userServicePort: number;
  public readonly roomExpireMillis: number;
  public readonly port: number;
  public readonly isDevEnv: boolean;

  public constructor(env: NodeJS.ProcessEnv = process.env) {
    assert(
      env[ApiConfig.userServiceHostEnvVar] !== undefined &&
        env[ApiConfig.userServiceHostEnvVar] !== '',
      `User service host was not specified via the environment variable "${ApiConfig.userServiceHostEnvVar}"`,
    );
    assert(
      env[ApiConfig.userServicePortEnvVar] !== undefined &&
        env[ApiConfig.userServicePortEnvVar] !== '',
      `User service port was not specified via the environment variable "${ApiConfig.userServiceHostEnvVar}"`,
    );

    this.userServiceHost = env[ApiConfig.userServiceHostEnvVar]!;
    this.userServicePort = parseIntStrict(
      env[ApiConfig.userServicePortEnvVar],
    )!;
    this.roomExpireMillis =
      parseIntStrict(env[ApiConfig.roomExpireMillisEnvVar]) ??
      ApiConfig.defaultRoomExpireMillis;
    this.port =
      parseIntStrict(env[ApiConfig.portEnvVar]) ?? ApiConfig.defaultPort;
    this.isDevEnv = env[ApiConfig.appModeEnvVar] === 'development';
  }
}
