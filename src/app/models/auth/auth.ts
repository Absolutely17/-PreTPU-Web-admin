import {UserInfo} from '../user/user-info';

export interface Auth {

  /**
   * Статус
   */
  status: 'AUTHENTICATED' | 'NOT_AUTHENTICATED';

  token: string;

  user: UserInfo;
}
