import {ImageService} from '../../../services/image/image.service';
import {AppConfig} from '../../../app.config';

/**
 * Кастомный компонент загрузки изображения в статье
 */
export class CkEditorImageUploadComponent {

  loader: any;

  service: ImageService;

  appConfig: AppConfig;

  constructor(
    loader: any,
    imageService: ImageService,
    appConfig: AppConfig
  ) {
    this.loader = loader;
    this.service = imageService;
    this.appConfig = appConfig;
  }

  upload() {
    console.log('starting upload');
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        this.service.upload(file).subscribe(it => {
          if (it) {
            resolve({
              default: this.appConfig.webServiceFullUrl + '/media/img/' + it
            });
          }
        }, error => reject('Не удалось загрузить изображение на сервер'));
      }));
  }
}
