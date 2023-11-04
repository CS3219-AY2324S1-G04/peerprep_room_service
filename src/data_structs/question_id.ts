/**
 * @file Defines {@link QuestionId}.
 */
/** Question ID. */
export default class QuestionId {
  private readonly _questionId: string;

  private constructor(questionId: string) {
    this._questionId = questionId;
  }

  /**
   * Parses {@link rawQuestionId} as a question ID.
   * @param rawQuestionId - Value to parse.
   * @returns The parsed {@link QuestionId}.
   * @throws Error if parsing fails.
   */
  public static parse(rawQuestionId: unknown): QuestionId {
    if (!QuestionId._isString(rawQuestionId)) {
      throw new Error('Question ID must be a string.');
    }

    if (!QuestionId._isStringSpecified(rawQuestionId as string | undefined)) {
      throw new Error('Question ID cannot be empty.');
    }

    return new QuestionId(rawQuestionId as string);
  }

  private static _isString(rawQuestionId: unknown): boolean {
    return typeof rawQuestionId === 'string' || rawQuestionId === undefined;
  }

  private static _isStringSpecified(
    rawQuestionId: string | undefined,
  ): boolean {
    return rawQuestionId !== undefined && rawQuestionId.length > 0;
  }

  public toString(): string {
    return this._questionId;
  }
}
