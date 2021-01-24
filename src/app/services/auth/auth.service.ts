import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Auth} from '../../models/auth/auth';
import {LoginInfo} from '../../models/auth/login-info';
import {Observable} from 'rxjs';
import {ResetPassword} from "../../models/auth/reset-password";

@Injectable()
export class AuthService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  /**
   * Аутентификация пользователя с указанным логином и паролем
   */
  login(loginInfo: LoginInfo): Observable<Auth> {
    return this.http.post<Auth>(this.appConfig.webServiceApi('/auth/admin/login'), loginInfo);
  }

  resetPassword(resetValue: ResetPassword): Observable<any> {
    return this.http.post<any>(this.appConfig.webServiceApi('/auth/password/reset'), resetValue);
  }
}
