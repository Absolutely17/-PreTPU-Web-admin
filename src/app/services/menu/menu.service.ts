import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class MenuService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  getMenuItems(language: string): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi(`/menu?language=${language}&email=test@test.com`))
  }

  getDicts(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/menu/dicts'));
  }

  save(menuInfo: any): Observable<any> {
    return this.http.post<any>(this.appConfig.webServiceApi('/menu/save'), menuInfo);
  }

}
