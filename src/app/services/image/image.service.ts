import {Injectable} from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable()
export class ImageService {

  constructor(
    private appConfig: AppConfig,
    private http: HttpClient
  ) {
  }

  upload(image: File): Observable<any> {
    const headers = new HttpHeaders();
    const formData: FormData = new FormData();
    formData.append('image', image);
    return this.http.post(this.appConfig.webServiceApi('/media/admin/img/upload'), formData, {
      headers, responseType: 'text'
    });
  }

}
