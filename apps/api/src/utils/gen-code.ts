import { customAlphabet } from 'nanoid';
import { CODE_LENGTH } from 'shared';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const genCode = (length = CODE_LENGTH) => {
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const code = customAlphabet(alphabet, length)();

  return code;
};
