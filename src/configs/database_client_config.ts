import assert from 'assert';

import { parseIntStrict } from '../utils/parser_utils';

export default class DatabaseClientConfig {
  public static readonly passwordEnvVar: string = 'DATABASE_PASSWORD';
  public static readonly userEnvVar: string = 'DATABASE_USER';
  public static readonly hostEnvVar: string = 'DATABASE_HOST';
  public static readonly portEnvVar: string = 'DATABASE_PORT';
  public static readonly shouldUseTlsEnvVar: string = 'DATABASE_SHOULD_USE_TLS';
  public static readonly databaseNameEnvVar: string = 'DATABASE_NAME';
  public static readonly connectionTimeoutMillisEnvVar: string =
    'DATABASE_CONNECTION_TIMEOUT_MILLIS';
  public static readonly maxClientCountEnvVar: string =
    'DATABASE_MAX_CLIENT_COUNT';

  public static readonly defaultUser: string = 'user';
  public static readonly defaultHost: string = 'localhost';
  public static readonly defaultPort: number = 5432;
  public static readonly defaultName: string = 'room';
  public static readonly defaultConnectionTimeoutMillis: number = 0;
  public static readonly defaultMaxClientCount: number = 20;

  public readonly password: string;
  public readonly user: string;
  public readonly host: string;
  public readonly port: number;
  public readonly shouldUseTls: boolean;
  public readonly databaseName: string;
  public readonly connectionTimeoutMillis: number;
  public readonly maxClientCount: number;

  public constructor(env: NodeJS.ProcessEnv = process.env) {
    assert(
      env[DatabaseClientConfig.passwordEnvVar] !== undefined &&
        env[DatabaseClientConfig.passwordEnvVar] !== '',
      `Database password not specified via the environment variable "${DatabaseClientConfig.passwordEnvVar}".`,
    );

    this.password = DatabaseClientConfig._getNonEmptyString(
      env[DatabaseClientConfig.passwordEnvVar],
    ) as string;
    this.user =
      DatabaseClientConfig._getNonEmptyString(
        env[DatabaseClientConfig.userEnvVar],
      ) ?? DatabaseClientConfig.defaultUser;
    this.host =
      DatabaseClientConfig._getNonEmptyString(
        env[DatabaseClientConfig.hostEnvVar],
      ) ?? DatabaseClientConfig.defaultHost;
    this.port =
      parseIntStrict(env[DatabaseClientConfig.portEnvVar]) ??
      DatabaseClientConfig.defaultPort;
    this.shouldUseTls = env[DatabaseClientConfig.shouldUseTlsEnvVar] === 'true';
    this.databaseName =
      DatabaseClientConfig._getNonEmptyString(
        env[DatabaseClientConfig.databaseNameEnvVar],
      ) ?? DatabaseClientConfig.defaultName;
    this.connectionTimeoutMillis =
      parseIntStrict(env[DatabaseClientConfig.connectionTimeoutMillisEnvVar]) ??
      DatabaseClientConfig.defaultConnectionTimeoutMillis;
    this.maxClientCount =
      parseIntStrict(env[DatabaseClientConfig.maxClientCountEnvVar]) ??
      DatabaseClientConfig.defaultMaxClientCount;
  }

  private static _getNonEmptyString(
    raw: string | undefined,
  ): string | undefined {
    if (raw === undefined || raw === '') {
      return undefined;
    }

    return raw;
  }
}
