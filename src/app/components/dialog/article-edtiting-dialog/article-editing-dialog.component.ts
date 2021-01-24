import {Component, HostListener, Inject, OnInit} from '@angular/core';
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
import {CkEditorImageUploadComponent} from '../../common/ckeditor/ckeditor-image-upload.component';
import {TdLoadingService} from '@covalent/core/loading';
import {transformResultTextToHtml} from "../../common/ckeditor/utils-function";
import {MatStepper} from "@angular/material/stepper";

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

  generalInfoForm: FormGroup;

  textControl: FormControl;

  currentMode: DialogMode;

  dicts: any;

  mode = DialogMode;

  currentArticleId: string;

  loaderName = 'loader';

  public Editor = ClassicEditor;

  ckConfig = {};

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
    if(data.articleId) {
      this.articleService.getArticleById(data.articleId).subscribe(it => {
        if(it) {
          this.generalInfoForm.patchValue(it);
          this.textControl.patchValue(it.text)
          this.loadingService.resolve(this.loaderName);
        }
      });
    } else {
      this.loadingService.resolve(this.loaderName);
    }
  }

  ngOnInit(): void {
    this.generalInfoForm = new FormGroup({}, null, null);
    this.generalInfoForm.addControl('name', new FormControl('', Validators.required));
    this.generalInfoForm.addControl('topic', new FormControl('', Validators.required));
    this.generalInfoForm.addControl('briefText', new FormControl('', null));
    this.generalInfoForm.addControl('language', new FormControl('', Validators.required));
    this.textControl= new FormControl(null, Validators.required);
  }

  isInvalid(name: string): boolean {
    const control = this.get(name);
    return control.touched && control.invalid;
  }

  get(name: string): AbstractControl {
    return this.generalInfoForm.get(name);
  }

  getError(name: string): string {
    const error = this.generalInfoForm.get(name).errors;
    if(error) {
      if(error.required) {
        return 'Обязательно для заполнения';
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  accept(): void {
    const htmlText = transformResultTextToHtml(this.textControl.value);
    const articleInfo: Article = {
      name: this.get('name').value,
      topic: this.get('topic').value,
      briefText: this.get('briefText').value,
      text: htmlText,
      language: this.get('language').value
    };
    if(this.currentMode === this.mode.CREATE) {
      this.articleService.create(articleInfo).subscribe(() => {
        this.dialogRef.close(true);
      }, error => this.errorService.handleServiceError(error));
    } else {
      this.articleService.update(articleInfo, this.currentArticleId).subscribe(
        () => this.dialogRef.close(true),
        error => this.errorService.handleServiceError(error)
      );
    }

  }

  onReady(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CkEditorImageUploadComponent(loader, this.imageService, this.appConfig);
    }
  }

  delete() {
    this.articleService.delete(this.currentArticleId).subscribe(() => {
      this.snackBar.open('Статья удалена', 'Закрыть', {duration: 3000});
      this.dialogRef.close(true);
    }, error => this.errorService.handleServiceError(error))
  }

  nextStep(stepper: MatStepper) {
    stepper.next();
  }

  prevStep(stepper: MatStepper) {
    stepper.previous();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }
}
