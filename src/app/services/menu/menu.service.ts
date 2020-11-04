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

  getMenuItems(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/menu?language=AD305703-9EAA-452C-9299-125A545EC811&email=test@test.com'))
  }

}
