import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SystemParameter} from '../../components/system-config/system-config.component';

@Injectable()
export class SystemConfigService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  getTable(): Observable<SystemParameter[]> {
    return this.http.get<SystemParameter[]>(this.appConfig.webServiceApi('/systemConfig/table'));
  }

  editConfig(data: any): Observable<any> {
    return this.http.put<any>(this.appConfig.webServiceApi('/systemConfig'), data);
  }
}
