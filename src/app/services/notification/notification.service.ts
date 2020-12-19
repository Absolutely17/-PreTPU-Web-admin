import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SendNotificationData} from '../../models/notification/send-notification-data';
import {Injectable} from '@angular/core';

@Injectable()
export class NotificationService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  sendNotificationOnUsers(data: SendNotificationData): Observable<any> {
    return this.http.post<any>(this.appConfig.webServiceApi('/notification/admin/users'), data);
  }

  sendNotificationOnGroup(data: SendNotificationData): Observable<any> {
    return this.http.post<any>(this.appConfig.webServiceApi('/notification/admin/group'), data);
  }

}
