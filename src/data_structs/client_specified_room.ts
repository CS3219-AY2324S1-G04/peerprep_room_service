import QuestionId from './question_id';
import QuestionLangSlug from './question_lang_slug';
import UserId from './user_id';

export default interface ClientSpecifiedRoom {
  readonly userIds: UserId[];
  readonly questionId: QuestionId;
  readonly questionLangSlug: QuestionLangSlug;
}
