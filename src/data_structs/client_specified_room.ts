import QuestionId from './question_id';
import UserId from './user_id';

export default interface ClientSpecifiedRoom {
  readonly userIds: UserId[];
  readonly questionId: QuestionId;
}
