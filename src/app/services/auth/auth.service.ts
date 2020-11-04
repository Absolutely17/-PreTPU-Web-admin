import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Auth} from '../../models/auth/auth';
import {LoginInfo} from '../../models/auth/login-info';
import {Observable} from 'rxjs';

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
    return this.http.post<Auth>(this.appConfig.webServiceApi('/auth/web-admin/login'), loginInfo);
  }
}
