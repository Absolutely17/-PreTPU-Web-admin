import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ImageService} from '../../../services/image/image.service';
import {ArticleService} from '../../../services/article/article.service';
import {DialogMode} from '../DialogMode';
import Quill from 'quill'
import {Article} from '../../../models/article/article';
import {environment} from '../../../../environments/environment';
import {AppConfig} from '../../../app.config';

export interface ArticleEditingDialogData {
  articleId: string;
  mode: DialogMode;
  dicts?: any;
}


@Component({
  selector: 'app-article-editing-dialog-component',
  templateUrl: './article-editing-dialog.component.html'
})
export class ArticleEditingDialogComponent implements OnInit{

  form: FormGroup;

  quillEditor: any;

  currentMode: DialogMode;

  dicts: any;

  mode = DialogMode;

  currentArticleId: string;

  constructor(
    private dialogRef: MatDialogRef<ArticleEditingDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: ArticleEditingDialogData,
    protected snackBar: MatSnackBar,
    private imageService: ImageService,
    private articleService: ArticleService,
    private appConfig: AppConfig
  ) {
    this.currentMode = data.mode;
    this.dicts = data.dicts;
    this.currentArticleId = data.articleId;
  }

  ngOnInit(): void {
    this.inlineStylesQuill();
    this.form = new FormGroup({}, null, null);
    this.form.addControl('name', new FormControl('', Validators.required));
    this.form.addControl('topic', new FormControl('', Validators.required));
    this.form.addControl('briefText', new FormControl('', null));
    this.form.addControl('text', new FormControl('', null));
    this.form.addControl('language', new FormControl('', Validators.required));
  }

  inlineStylesQuill(): void {
    var DirectionAttribute = Quill.import('attributors/attribute/direction');
    Quill.register(DirectionAttribute, true);
    var AlignClass = Quill.import('attributors/class/align');
    Quill.register(AlignClass, true);
    var BackgroundClass = Quill.import('attributors/class/background');
    Quill.register(BackgroundClass, true);
    var ColorClass = Quill.import('attributors/class/color');
    Quill.register(ColorClass, true);
    var DirectionClass = Quill.import('attributors/class/direction');
    Quill.register(DirectionClass, true);
    var FontClass = Quill.import('attributors/class/font');
    Quill.register(FontClass, true);
    var SizeClass = Quill.import('attributors/class/size');
    Quill.register(SizeClass, true);
    var AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);
    var BackgroundStyle = Quill.import('attributors/style/background');
    Quill.register(BackgroundStyle, true);
    var ColorStyle = Quill.import('attributors/style/color');
    Quill.register(ColorStyle, true);
    var DirectionStyle = Quill.import('attributors/style/direction');
    Quill.register(DirectionStyle, true);
    var FontStyle = Quill.import('attributors/style/font');
    Quill.register(FontStyle, true);
    var SizeStyle = Quill.import('attributors/style/size');
    Quill.register(SizeStyle, true);
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

  // Делаем кастомное поведение при загрузке изображения
  getEditorInstance(editorInstance:any) {
    this.quillEditor = editorInstance;
    let toolbar = editorInstance.getModule('toolbar');
    toolbar.addHandler('image', this.uploadImage.bind(this));
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
        this.snackBar.open('You could only upload images.',
          'Закрыть', {duration: 3000});
      }
    };
  }

  // Затем после успешной загрузки вписываем в поле quill редактора
  saveToServer(file: File) {
    this.imageService.upload(file).subscribe(it => {
      if (it) {
        const imageUrl = this.appConfig.webServiceFullUrl + '/media/img' + it;
        this.quillEditor.insertEmbed(1, 'image', imageUrl, 'user');
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
      this.articleService.create(articleInfo).subscribe(it => {
        if (it) {
          this.dialogRef.close(it);
        } else {
          this.snackBar.open('Не удалось создать статью', 'Закрыть', {duration: 3000});
          this.dialogRef.close();
        }
      });
    } else {
      this.articleService.update(articleInfo, this.currentArticleId);
    }

  }

  // Добавляем необходимые теги на HTML документа для его правильного отображения
  addMetaInfoToText(): string {
    const topTags = '<!DOCTYPE HTML>\n' +
      '<html>\n' +
      '<head>\n' +
      '  <meta charset=\\"utf-8\\">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<body>';
    const bottomTags = '</body></html>';
    let htmlText = this.get('text');
    return topTags + htmlText.value + bottomTags;
  }

}
