/**
 * @file Defines {@link MqClientConfig}.
 */
import assert from 'assert';

import { parseIntStrict } from '../utils/parser_utils';

/** Configs for the MQ client. */
export default class MqClientConfig {
  /** Name of the environment variable corresponding to {@link user}. */
  public static readonly userEnvVar: string = 'MQ_USER';
  /**
   * Name of the environment variable corresponding to {@link password}.
   */
  public static readonly passwordEnvVar: string = 'MQ_PASSWORD';
  /** Name of the environment variable corresponding to {@link host}. */
  public static readonly hostEnvVar: string = 'MQ_HOST';
  /** Name of the environment variable corresponding to {@link port}. */
  public static readonly portEnvVar: string = 'MQ_PORT';
  /** Name of the environment variable corresponding to {@link vhost}. */
  public static readonly vhostEnvVar: string = 'MQ_VHOST';
  /** Name of the environment variable corresponding to {@link shouldUseTls}. */
  public static readonly shouldUseTlsEnvVar: string = 'MQ_SHOULD_USE_TLS';
  /** Name of the environment variable corresponding to {@link exchangeName}. */
  public static readonly exchangeNameEnvVar: string = 'MQ_EXCHANGE_NAME';

  /** Default value for {@link user}. */
  public static readonly defaultUser: string = 'user';
  /** Default value for {@link host}. */
  public static readonly defaultHost: string = 'localhost';
  /** Default value for {@link port}. */
  public static readonly defaultPort: number = 5672;
  /** Default value for {@link vhost}. */
  public static readonly defaultVhost: string = '';
  /** Default value for {@link exchangeName}. */
  public static readonly defaultExchangeName: string = 'room-events';

  /** User of the MQ. */
  public readonly user: string;
  /** Password of the MQ. */
  public readonly password: string;
  /** Address of the MQ host. */
  public readonly host: string;
  /** Port of the MQ host that the MQ is listening on. */
  public readonly port: number;
  /** Virtual host of the MQ. */
  public readonly vhost: string;
  /** Should TLS be utilised to secure the connection. */
  public readonly shouldUseTls: boolean;
  /** Name of the exchange. */
  public readonly exchangeName: string;

  /**
   * Constructs a {@link MqClientConfig} and assigns to each field, the value
   * stored in their corresponding environment variable. If an environment
   * variable does not have a valid value, assigns a default value instead.
   *
   * {@link password} has no default value and must be specified in the
   * {@link passwordEnvVar} environment variable.
   * @param env - Environment variables.
   */
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
    this.shouldUseTls = env[MqClientConfig.shouldUseTlsEnvVar] === 'true';
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
