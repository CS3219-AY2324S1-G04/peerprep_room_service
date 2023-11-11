/**
 * @file Defines {@link ExpiredRoomDeleterConfig}.
 */
import { parseIntStrict } from '../../utils/parser_utils';

/** Configs for the expired room deleter. */
export default class ExpiredRoomDeleterConfig {
  /**
   * Name of the environment variables corresponding to
   * {@link roomDeletionIntervalMillis}.
   */
  public static readonly roomDeletionIntervalMillisEnvVar: string =
    'ROOM_DELETION_INTERVAL_MILLIS';

  /** Default value for {@link roomDeletionIntervalMillis}. */
  public static readonly defaultRoomDeletionIntervalMillis: number = 30000;

  /** Number of milliseconds to wait between checks for expired rooms. */
  public readonly roomDeletionIntervalMillis: number;

  /**
   * Constructs a {@link ExpiredRoomDeleterConfig} and assigns to each field,
   * the value stored in their corresponding environment variable.
   * @param env - Environment variables.
   */
  public constructor(env: NodeJS.ProcessEnv = process.env) {
    this.roomDeletionIntervalMillis =
      parseIntStrict(
        env[ExpiredRoomDeleterConfig.roomDeletionIntervalMillisEnvVar],
      ) ?? ExpiredRoomDeleterConfig.defaultRoomDeletionIntervalMillis;
  }
}
