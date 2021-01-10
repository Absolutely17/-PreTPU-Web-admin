import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ImageService} from '../../../services/image/image.service';
import {ArticleService} from '../../../services/article/article.service';
import {DialogMode} from '../dialog-mode';
import {Article} from '../../../models/article/article';
import {AppConfig} from '../../../app.config';
import * as ClassicEditor from 'ckeditor-custom/packages/ckeditor5-build-classic';
import {ChangeEvent} from '@ckeditor/ckeditor5-angular';
import {styles} from '../../common/ckeditor/ckeditor-constants';
import * as juice from 'juice';
import {CkEditorImageUploadComponent} from '../../common/ckeditor/ckeditor-image-upload.component';
import {TdLoadingService} from '@covalent/core/loading';

export interface ArticleEditingDialogData {
  articleId: string;
  mode: DialogMode;
  dicts?: any;
}

@Component({
  selector: 'app-article-editing-dialog-component',
  templateUrl: './article-editing-dialog.component.html'
})
export class ArticleEditingDialogComponent implements OnInit {

  form: FormGroup;

  quillEditor: any;

  currentMode: DialogMode;

  dicts: any;

  mode = DialogMode;

  currentArticleId: string;

  topTags = '<!DOCTYPE HTML>\n' +
    '<html>\n' +
    '<head>\n' +
    '  <meta charset=\\"utf-8\\">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<body>';

  bottomTags = '</body></html>';

  loaderName = 'loader';

  public Editor = ClassicEditor;

  ckConfig = {
  };

  constructor(
    private dialogRef: MatDialogRef<ArticleEditingDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: ArticleEditingDialogData,
    protected snackBar: MatSnackBar,
    private imageService: ImageService,
    private articleService: ArticleService,
    private appConfig: AppConfig,
    private loadingService: TdLoadingService
  ) {
    this.loadingService.register(this.loaderName);
    this.currentMode = data.mode;
    this.dicts = data.dicts;
    this.currentArticleId = data.articleId;
    if (data.articleId) {
      this.articleService.getArticleById(data.articleId).subscribe(it => {
        if (it) {
          this.form.patchValue(it);
          this.loadingService.resolve(this.loaderName);
        }
      });
    } else {
      this.loadingService.resolve(this.loaderName);
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('name', new FormControl('', Validators.required));
    this.form.addControl('topic', new FormControl('', Validators.required));
    this.form.addControl('briefText', new FormControl('', null));
    this.form.addControl('text', new FormControl('', null));
    this.form.addControl('language', new FormControl('', Validators.required));
  }

  isInvalid(name: string): boolean {
    const control = this.get(name);
    return control.touched && control.invalid;
  }

  get(name: string): AbstractControl {
    return this.form.get(name);
  }

  getError(name: string): string {
    const error = this.form.get(name).errors;
    if (error) {
      if (error.required) {
        return 'Обязательно для заполнения';
      }
    }
  }

  // Загружаем сначала изображение на сервер
  uploadImage(): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.click();
    input.onchange = () => {
      const file = input.files[0];
      if (/^image\//.test(file.type)) {
        this.saveToServer(file);
      } else {
        this.snackBar.open('Можно загружать только изображения',
          'Закрыть', {duration: 3000});
      }
    };
  }

  // Затем после успешной загрузки вписываем в поле quill редактора
  saveToServer(file: File) {
    this.imageService.upload(file).subscribe(it => {
      if (it) {
        const imageUrl = this.appConfig.webServiceFullUrl + '/media/img/' + it;
        this.quillEditor.insertEmbed(this.quillEditor.getSelection().index, 'image', imageUrl, 'user');
      }
    })
  }

  cancel(): void {
    this.dialogRef.close();
  }

  accept(): void {
    const htmlText = this.addMetaInfoToText();
    const articleInfo: Article = {
      name: this.get('name').value,
      topic: this.get('topic').value,
      briefText: this.get('briefText').value,
      text: htmlText,
      language: this.get('language').value
    };
    if (this.currentMode === this.mode.CREATE) {
      this.articleService.create(articleInfo).subscribe(() => {
      }, error => this.errorService.handleServiceError(error)).add(() => this.dialogRef.close());
    } else {
      this.articleService.update(articleInfo, this.currentArticleId).subscribe(
        it => this.dialogRef.close(),
        error => this.errorService.handleServiceError(error)
      ).add(() => this.dialogRef.close());
    }

  }

  // Добавляем необходимые теги на HTML документа для его правильного отображения
  addMetaInfoToText(): string {
    let htmlText = juice.inlineContent(this.get('text').value, styles);
    return this.topTags + htmlText + this.bottomTags;
  }

  onReady(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CkEditorImageUploadComponent(loader, this.imageService, this.appConfig);
    }
  }
}
