import * as cheerio from 'cheerio';

import { InvalidResponseError } from './error';
import { Context } from './context';

/**
 * LoginToken is a class that represents the login token.
 * @class LoginToken
 * @param element - The element that contains the login token.
 * @property captcha - The captcha, needed for login.
 * @property lt - The lt, from `input[name="lt"]`.
 * @property cllt - The cllt, use `userNameLogin` to simulate login.
 * @property dllt - The dllt, from `input[name="dllt"]`.
 * @property execution - The execution, from `input[name="execution"]`.
 * @property _eventId - The _eventId, from `input[name="eventId"]`.
 */
class LoginToken {
  public captcha: string;
  public lt: string;
  public cllt: string;
  public dllt: string;
  public execution: string;
  public _eventId: string;

  constructor(cherrioAPI: cheerio.CheerioAPI) {
    this.captcha = '';
    this.lt = cherrioAPI('input[name="lt"]').attr('value') as string;
    this.cllt = 'userNameLogin';
    this.dllt = cherrioAPI('input[name="dllt"]').attr('value') as string;
    this.execution = cherrioAPI('input[name="execution"]').attr('value') as string;
    this._eventId = cherrioAPI('input[name="_eventId"]').attr('value') as string;
  }
}

/**
 * LoginSession is an interface that represents the login session.
 * @interface LoginSession
 * @param url - The login url.
 * @param token - The login token.
 * @param key - The key used to encrypt password.
 * @param cookie - The cookie.
 */
export interface Credential {
  token: LoginToken;
  key: string;
  context: Context;
}

/**
 * createCredential is a function that creates a credential.
 * @param url - The login url.
 * @returns The login session.
 */
export async function createCredential(url: string): Promise<Credential> {
  const context = new Context();
  const response = await context.get(url);
  try {
    const cheerioAPI = cheerio.load(response.data as string);
    const key = cheerioAPI('input[id="pwdEncryptSalt"]').attr('value') as string;
    const token = new LoginToken(cheerioAPI);
    return { token, key, context };
  } catch (_error) {
    throw InvalidResponseError;
  }
}
