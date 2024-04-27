import * as bcrypt from 'bcrypt';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function getRandomCharFromString(str: string) {
  const randomIndex = Math.floor(Math.random() * str.length);

  return str[randomIndex];
}

export const convertStartDate = (time: string) => {
  const d = time ? new Date(time) : new Date();
  d.setUTCHours(0);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  d.setUTCMilliseconds(100);

  return d;
};

export const convertEndDate = (time: string) => {
  const d = time ? new Date(time) : new Date();
  d.setUTCHours(23);
  d.setUTCMinutes(59);
  d.setUTCSeconds(59);
  d.setUTCMilliseconds(999);

  return d;
};

/**
 * generating random password for user
 * @param {number} length
 * @returns {string}
 */
export function generateRandomPassword(length: number): string {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()';

  const allChars = uppercaseLetters + lowercaseLetters + numbers + specialChars;

  const randomUppercase = getRandomCharFromString(uppercaseLetters);
  const randomLowercase = getRandomCharFromString(lowercaseLetters);
  const randomNumber = getRandomCharFromString(numbers);
  const randomSpecialChar = getRandomCharFromString(specialChars);

  let randomPass = '';
  randomPass += randomUppercase;
  randomPass += randomLowercase;
  randomPass += randomNumber;
  randomPass += randomSpecialChar;

  for (let i = 0; i < length - 4; i++) {
    randomPass += getRandomCharFromString(allChars);
  }

  return randomPass;
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
  if (!password || !hash) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, hash);
}

export function getVariableName<TResult>(getVar: () => TResult): string | undefined {
  const m = /\(\)=>(.*)/.exec(getVar.toString().replaceAll(/(\r\n|\n|\r|\s)/gm, ''));

  if (!m) {
    // For rspack build - `return shared_dist_constants__WEBPACK_IMPORTED_MODULE_1_.Status;`
    const otherName = getVar.toString().split('.').pop();

    if (!otherName) {
      throw new Error("The function does not contain a statement matching 'return variableName;'");
    }

    return otherName;
  }

  const fullMemberName = m[1];

  const memberParts = fullMemberName.split('.');

  return memberParts.at(-1);
}

/**
 * random string with specific length
 * @param {number} length
 * @returns {string}
 */
export function randomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;

  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}

export const getMimeType = (headerString: string): string => {
  let type: string;

  switch (headerString) {
    case '89504e47': {
      type = 'image/png';
      break;
    }

    case '47494638': {
      type = 'image/gif';
      break;
    }

    case 'ffd8ffe0':
    case 'ffd8ffe1':

    // eslint-disable-next-line no-fallthrough
    case 'ffd8ffe2': {
      type = 'image/jpeg';
      break;
    }

    case '52494646': {
      type = 'image/webp';
      break;
    }

    default: {
      type = 'unknown';
      break;
    }
  }

  return type;
};
