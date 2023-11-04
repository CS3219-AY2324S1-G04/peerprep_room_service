import { parseIntStrict } from '../../utils/parser_utils';

export default class ExpiredRoomDeleterConfig {
  public static readonly roomDeletionIntervalMillisEnvVar: string =
    'ROOM_DELETION_INTERVAL_MILLIS';

  public static readonly defaultRoomDeletionIntervalMillis: number = 30000;

  public readonly roomDeletionIntervalMillis: number;

  public constructor(env: NodeJS.ProcessEnv = process.env) {
    this.roomDeletionIntervalMillis =
      parseIntStrict(
        env[ExpiredRoomDeleterConfig.roomDeletionIntervalMillisEnvVar],
      ) ?? ExpiredRoomDeleterConfig.defaultRoomDeletionIntervalMillis;
  }
}
