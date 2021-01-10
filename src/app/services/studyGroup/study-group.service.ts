import {Injectable} from "@angular/core";
import {AppConfig} from "../../app.config";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";


@Injectable()
export class StudyGroupService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  create(group: any): Observable<any> {
    return this.http.post(this.appConfig.webServiceApi('/studyGroup/admin/create'), group);
  }

  edit(group: any, id: string): Observable<any> {
    return this.http.put<any>(this.appConfig.webServiceApi(`/studyGroup/${id}`), group);
  }

  getTable(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/studyGroup'));
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi(`/studyGroup/${id}`));
  }

}
