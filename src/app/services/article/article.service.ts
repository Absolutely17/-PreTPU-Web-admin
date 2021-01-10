import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Article} from '../../models/article/article';

@Injectable()
export class ArticleService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  create(article: Article): Observable<any> {
    return this.http.post(this.appConfig.webServiceApi('/article/admin/create'), article, {
      responseType: 'text'
    });
  }

  update(article: Article, articleId: string): Observable<any> {
    return this.http.put<any>(this.appConfig.webServiceApi(`/article/admin/${articleId}`), article);
  }

  getTable(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/article/admin/table'));
  }

  getDicts(): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi('/article/admin/dicts'));
  }

  getArticleById(id: string): Observable<any> {
    return this.http.get<any>(this.appConfig.webServiceApi(`/article/admin/table/${id}`));
  }

}
