import {Injectable} from '@angular/core';
import {UserInfo} from '../../models/user/user-info';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  getUsersTable(): Observable<any> {
    return this.http.get<UserInfo[]>(this.appConfig.webServiceApi('/user/admin/table'));
  }

  getDicts(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/user/admin/dicts'));
  }

  getGroups(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/dict/group'));
  }

  createCalendarEvent(request: any): Observable<any> {
    return this.http.post(this.appConfig.webServiceApi('/user/admin/calendarEvent'), request);
  }
}
