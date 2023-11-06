/**
 * @file Defines {@link QuestionLangSlug}.
 */
/** Question language slug. */
export default class QuestionLangSlug {
  private readonly _questionLangSlug: string;

  private constructor(questionLangSlug: string) {
    this._questionLangSlug = questionLangSlug;
  }

  /**
   * Parses {@link rawQuestionLangSlug} as a question language slug.
   * @param rawQuestionLangSlug - Value to parse.
   * @returns The parsed {@link QuestionLangSlug}.
   * @throws Error if parsing fails.
   */
  public static parse(rawQuestionLangSlug: unknown): QuestionLangSlug {
    if (!QuestionLangSlug._isString(rawQuestionLangSlug)) {
      throw new Error('Question language slug must be a string.');
    }

    if (
      !QuestionLangSlug._isStringSpecified(
        rawQuestionLangSlug as string | undefined,
      )
    ) {
      throw new Error('Question language slug cannot be empty.');
    }

    return new QuestionLangSlug(rawQuestionLangSlug as string);
  }

  private static _isString(rawQuestionLangSlug: unknown): boolean {
    return (
      typeof rawQuestionLangSlug === 'string' ||
      rawQuestionLangSlug === undefined
    );
  }

  private static _isStringSpecified(
    rawQuestionLangSlug: string | undefined,
  ): boolean {
    return rawQuestionLangSlug !== undefined && rawQuestionLangSlug.length > 0;
  }

  public toString(): string {
    return this._questionLangSlug;
  }
}
