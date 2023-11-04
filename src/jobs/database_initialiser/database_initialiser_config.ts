/**
 * @file Defines {@link DatabaseInitialiserConfig}.
 */
/** Configs for the database initialiser. */
export default class DatabaseInitialiserConfig {
  /**
   * Name of the environment variable corresponding to
   * {@link shouldForceInitialisation}.
   */
  public static readonly shouldForceInitialisationEnvVar: string =
    'SHOULD_FORCE_INITIALISATION';

  /** Should initialisation be done even if entities exist. */
  public readonly shouldForceInitialisation: boolean;

  /**
   * Constructs a {@link DatabaseInitialiserConfig} and assigns to each field,
   * the value stored in their corresponding environment variable.
   * @param env - Environment variables.
   */
  public constructor(env: NodeJS.ProcessEnv = process.env) {
    this.shouldForceInitialisation =
      env[DatabaseInitialiserConfig.shouldForceInitialisationEnvVar] === 'true';
  }
}
