import type { Condition } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface StrictQuerySelector<T> {
  /** @see https://www.mongodb.com/docs/manual/reference/operator/query/and/#op._S_and */
  $and?: Array<StrictFilterQuery<T>>;
  /** @see https://www.mongodb.com/docs/manual/reference/operator/query/nor/#op._S_nor */
  $nor?: Array<StrictFilterQuery<T>>;
  /** @see https://www.mongodb.com/docs/manual/reference/operator/query/or/#op._S_or */
  $or?: Array<StrictFilterQuery<T>>;
  /** @see https://www.mongodb.com/docs/manual/reference/operator/query/text */
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
  /** @see https://www.mongodb.com/docs/manual/reference/operator/query/where/#op._S_where */
  // eslint-disable-next-line @typescript-eslint/ban-types
  $where?: string | Function;
  /** @see https://www.mongodb.com/docs/manual/reference/operator/query/comment/#op._S_comment */
  $comment?: string;
  // we could not find a proper TypeScript generic to support nested queries e.g. 'user.friends.name'
  // this will mark all unrecognized properties as any (including nested queries)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [key: string]: any;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
type _FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & StrictQuerySelector<T>;

/**
 * Filter query to select the documents that match the query and not allow the 'foo.bar' syntax
 */
export type StrictFilterQuery<T> = _FilterQuery<T>;
