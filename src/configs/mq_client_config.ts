import assert from 'assert';

import { parseIntStrict } from '../utils/parser_utils';

export default class MqClientConfig {
  public static readonly passwordEnvVar: string = 'MQ_PASSWORD';
  public static readonly userEnvVar: string = 'MQ_USER';
  public static readonly hostEnvVar: string = 'MQ_HOST';
  public static readonly portEnvVar: string = 'MQ_PORT';
  public static readonly vhostEnvVar: string = 'MQ_VHOST';
  public static readonly shouldUseTls: string = 'MQ_SHOULD_USE_TLS';
  public static readonly exchangeNameEnvVar: string = 'MQ_EXCHANGE_NAME';

  public static readonly defaultUser: string = 'user';
  public static readonly defaultHost: string = 'localhost';
  public static readonly defaultPort: number = 5672;
  public static readonly defaultVhost: string = '';
  public static readonly defaultExchangeName: string = 'room-events';

  public readonly password: string;
  public readonly user: string;
  public readonly host: string;
  public readonly port: number;
  public readonly vhost: string;
  public readonly shouldUseTls: boolean;
  public readonly exchangeName: string;

  public constructor(env: NodeJS.ProcessEnv = process.env) {
    assert(
      env[MqClientConfig.passwordEnvVar] !== undefined &&
        env[MqClientConfig.passwordEnvVar] !== '',
      `MQ password not specified via the environment variable "${MqClientConfig.passwordEnvVar}".`,
    );

    this.password = MqClientConfig._getNonEmptyString(
      env[MqClientConfig.passwordEnvVar],
    ) as string;
    this.user =
      MqClientConfig._getNonEmptyString(env[MqClientConfig.userEnvVar]) ??
      MqClientConfig.defaultUser;
    this.host =
      MqClientConfig._getNonEmptyString(env[MqClientConfig.hostEnvVar]) ??
      MqClientConfig.defaultHost;
    this.port =
      parseIntStrict(env[MqClientConfig.portEnvVar]) ??
      MqClientConfig.defaultPort;
    this.vhost =
      MqClientConfig._getNonEmptyString(env[MqClientConfig.vhostEnvVar]) ??
      MqClientConfig.defaultVhost;
    this.shouldUseTls = env[MqClientConfig.shouldUseTls] === 'true';
    this.exchangeName =
      MqClientConfig._getNonEmptyString(
        env[MqClientConfig.exchangeNameEnvVar],
      ) ?? MqClientConfig.defaultExchangeName;
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
