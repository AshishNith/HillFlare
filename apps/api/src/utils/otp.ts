import * as crypto from 'crypto';

export const generateOtp = (): string => {
  return String(crypto.randomInt(100000, 999999));
};
