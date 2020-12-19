import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ImageService} from '../../../services/image/image.service';
import {ArticleService} from '../../../services/article/article.service';
import {DialogMode} from '../dialog-mode';
import * as QuillNamespace from 'quill';
import {Article} from '../../../models/article/article';
import {AppConfig} from '../../../app.config';
import ImageResize from 'quill-image-resize';

export interface ArticleEditingDialogData {
  articleId: string;
  mode: DialogMode;
  dicts?: any;
}

const Quill: any = QuillNamespace;
const BaseImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = [
  'alt',
  'height',
  'width',
  'style'
];

class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        // @ts-ignore
        this.domNode.setAttribute(name, value);
      } else {
        // @ts-ignore
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

const CodeBlock = Quill.import('formats/code-block');

class InlineCodeBlock extends CodeBlock {
  static create(value) {
    let node = super.create();
    node.setAttribute('style', 'white-space: pre-wrap; word-break: break-word;');
    node.className = '';
    return node;
  }
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

  modules = {};

  constructor(
    private dialogRef: MatDialogRef<ArticleEditingDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: ArticleEditingDialogData,
    protected snackBar: MatSnackBar,
    private imageService: ImageService,
    private articleService: ArticleService,
    private appConfig: AppConfig
  ) {
    this.modules = {
      imageResize: {}
    };
    this.currentMode = data.mode;
    this.dicts = data.dicts;
    this.currentArticleId = data.articleId;
    if (data.articleId) {
      this.articleService.getArticleById(data.articleId).subscribe(it => {
        if (it) {
          this.form.patchValue(it);
        }
      });
    }
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
    const DirectionAttribute = Quill.import('attributors/attribute/direction');
    Quill.register(DirectionAttribute, true);
    const AlignClass = Quill.import('attributors/class/align');
    Quill.register(AlignClass, true);
    const BackgroundClass = Quill.import('attributors/class/background');
    Quill.register(BackgroundClass, true);
    const ColorClass = Quill.import('attributors/class/color');
    Quill.register(ColorClass, true);
    const DirectionClass = Quill.import('attributors/class/direction');
    Quill.register(DirectionClass, true);
    const FontClass = Quill.import('attributors/class/font');
    Quill.register(FontClass, true);
    const SizeClass = Quill.import('attributors/class/size');
    Quill.register(SizeClass, true);
    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);
    const BackgroundStyle = Quill.import('attributors/style/background');
    Quill.register(BackgroundStyle, true);
    const ColorStyle = Quill.import('attributors/style/color');
    Quill.register(ColorStyle, true);
    const DirectionStyle = Quill.import('attributors/style/direction');
    Quill.register(DirectionStyle, true);
    const FontStyle = Quill.import('attributors/style/font');
    Quill.register(FontStyle, true);
    const SizeStyle = Quill.import('attributors/style/size');
    Quill.register(SizeStyle, true);
    Quill.register('modules/imageResize', ImageResize, true);
    Quill.register(ImageFormat, true);
    Quill.register(InlineCodeBlock, true);
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
      this.articleService.create(articleInfo).subscribe(it => {
        if (it) {
          this.dialogRef.close(it);
        } else {
          this.snackBar.open('Не удалось создать статью', 'Закрыть', {duration: 3000});
          this.dialogRef.close();
        }
      });
    } else {
      this.articleService.update(articleInfo, this.currentArticleId).subscribe(it => this.dialogRef.close());
    }

  }

  // Добавляем необходимые теги на HTML документа для его правильного отображения
  addMetaInfoToText(): string {
    let htmlText = this.get('text');
    return this.topTags + htmlText.value + this.bottomTags;
  }

}
