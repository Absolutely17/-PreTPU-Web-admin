import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Language} from '../../components/language-registry/language-registry.component';

@Injectable()
export class LanguageService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  getTable(): Observable<Language[]> {
    return this.http.get<Language[]>(this.appConfig.webServiceApi('/language/admin/table'));
  }

  create(request: any): Observable<any> {
    return this.http.post<any>(this.appConfig.webServiceApi('/language/admin/create'), request);
  }

  getAllAvailableForCreate(): Observable<Language[]> {
    return this.http.get<Language[]>(this.appConfig.webServiceApi('/language/admin/allAvailableForCreate'));
  }

}
