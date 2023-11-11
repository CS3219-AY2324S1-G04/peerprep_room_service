/**
 * @file Defines {@link ApiConfig}.
 */
import assert from 'assert';

import { parseIntStrict } from '../utils/parser_utils';

/** Configs for the REST API app. */
export default class ApiConfig {
  /**
   * Name of the environment variable corresponding to {@link userServiceHost}.
   */
  public static readonly userServiceHostEnvVar: string = 'USER_SERVICE_HOST';
  /**
   * Name of the environment variable corresponding to {@link userServicePort}.
   */
  public static readonly userServicePortEnvVar: string = 'USER_SERVICE_PORT';
  /**
   * Name of the environment variable corresponding to {@link roomExpireMillis}.
   */
  public static readonly roomExpireMillisEnvVar: string = 'ROOM_EXPIRE_MILLIS';
  /** Name of the environment variable corresponding to {@link port}. */
  public static readonly portEnvVar: string = 'PORT';
  /**
   * Name of the environment variable which contains the mode the app is running
   * in. This is use for determining {@link isDevEnv}.
   */
  public static readonly appModeEnvVar: string = 'NODE_ENV';

  /** Default value for {@link roomExpireMillis}. */
  public static readonly defaultRoomExpireMillis: number = 300000;
  /** Default value for {@link port}. */
  public static readonly defaultPort: number = 9003;

  /** Address of the User Service port. */
  public readonly userServiceHost: string;
  /** Port the User Service host is listening on. */
  public readonly userServicePort: number;
  /**
   * Number of milliseconds a room can last for.
   *
   * Room lifespan can be extended but will always be at most
   * {@link roomExpireMillis} milliseconds from the current time.
   */
  public readonly roomExpireMillis: number;
  /** Port the app will listen on. */
  public readonly port: number;
  /** Should development features be enabled. */
  public readonly isDevEnv: boolean;

  /**
   * Constructs an {@link ApiConfig} and assigns to each field, the value stored
   * in their corresponding environment variable. If an environment variable
   * does not have a valid value, assigns a default value instead.
   *
   * {@link userServiceHost} and {@link userServicePort} have no default values
   * and must be specified in the {@link userServiceHostEnvVar} and
   * {@link userServicePortEnvVar} environment variables respectively.
   * @param env - Environment variables.
   */
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
