import {Injectable} from '@angular/core';
import {Document} from '../../models/document/document';
import {Auth} from '../../models/auth/auth';
import {AppConfig} from '../../app.config';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class DocumentService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  uploadDocument(doc: Document, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('documentInfo', new Blob([JSON.stringify(doc)], {
      type: 'application/json'
    }));
    formData.append('document', file);
    return this.http.post<any>(this.appConfig.webServiceApi('/document/upload'), formData);
  }
}
