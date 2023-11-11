/**
 * @file Defines {@link ClientSpecifiedRoom}.
 */
import QuestionId from './question_id';
import QuestionLangSlug from './question_lang_slug';
import UserId from './user_id';

/** Room information that is specified by the client making a request.. */
export default interface ClientSpecifiedRoom {
  /** User ID of the users in the room. */
  readonly userIds: UserId[];
  /** Question ID of the question assigned to the room. */
  readonly questionId: QuestionId;
  /** Question language slug of the question assigned to the room. */
  readonly questionLangSlug: QuestionLangSlug;
}
