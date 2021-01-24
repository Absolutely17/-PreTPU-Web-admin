import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MenuService} from '../../../services/menu/menu.service';
import {MenuItem} from '../../menu/menu-registry.component';
import {DialogService} from '../../../services/dialog/dialog.service';
import {ArticleEditingDialogComponent} from '../article-edtiting-dialog/article-editing-dialog.component';
import {ComponentType} from '@angular/cdk/overlay';
import {DialogMode} from '../dialog-mode';
import {AppConfig} from '../../../app.config';
import {ImageService} from '../../../services/image/image.service';
import {TdLoadingService} from '@covalent/core/loading';
import {ArticleChooseDialogComponent} from '../article-choose-dialog/article-choose-dialog.component';

export interface MenuEditingData {
  mode: DialogMode;
  item?: MenuItem;
  dicts: any;
}

@Component({
  selector: 'app-menu-editing-dialog',
  templateUrl: './menu-editing-dialog.component.html'
})
export class MenuEditingDialogComponent implements OnInit {

  articleDialog: ComponentType<ArticleEditingDialogComponent> = ArticleEditingDialogComponent;

  articleChooseDialog: ComponentType<ArticleChooseDialogComponent> = ArticleChooseDialogComponent;

  currentMode: DialogMode;

  mode = DialogMode;

  form: FormGroup;

  dicts: any;

  item: MenuItem;

  selectedArticles: string[];

  imageId: string;

  loaderName = 'menuEditingLoader';

  get type(): string {
    return this.get('type').value;
  }

  constructor(
    private dialogRef: MatDialogRef<MenuEditingDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: MenuEditingData,
    protected snackBar: MatSnackBar,
    private menuService: MenuService,
    private dialogService: DialogService,
    private appConfig: AppConfig,
    private imageService: ImageService,
    private loadingService: TdLoadingService
  ) {
    this.selectedArticles = [];
    this.currentMode = data.mode;
    this.dicts = data.dicts;
    if (data.item) {
      this.imageId = data.item.image;
      this.item = data.item;
      this.selectedArticles = data.item.linkedArticles;
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('name', new FormControl('', Validators.required));
    this.form.addControl('type', new FormControl('', Validators.required));
    this.form.addControl('url', new FormControl(null, null));
    this.form.addControl('image', new FormControl(null, null));
    if (this.item) {
      this.form.patchValue(this.item);
    }
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

  cancel(): void {
    this.dialogRef.close();
  }

  accept(): void {
    const menuInfo = this.form.getRawValue();
    menuInfo.image = this.imageId;
    if (this.selectedArticles && (menuInfo.type === 'ARTICLE' || menuInfo.type === 'FEED_LIST')) {
      menuInfo.linkedArticles = this.selectedArticles;
    }
    this.dialogRef.close(menuInfo);
  }

  createArticle(): void {
    this.dialogService.show(this.articleDialog, {
      mode: DialogMode.CREATE,
      dicts: this.dicts
    }, '1000px').afterClosed().subscribe((it) => {
      if (it) {
        this.selectedArticles.push(it);
      }
    });
  }

  selectArticle(multiple: boolean = false): void {
    this.dialogService.show(this.articleChooseDialog, {
      selectedArticles: this.selectedArticles,
      multiple: multiple
    }, '1400px').afterClosed().subscribe(it => {
      if (it) {
        this.selectedArticles = it;
      }
    });
  }

  selectMultipleArticle(): void {
    this.selectArticle(true);
  }

  // Сбрасываем URL и ID статьи при смене типа пункта меню
  changeType(): void {
    this.selectedArticles = [];
    this.form.patchValue({url: null});
  }

  selectImage(): void {
    this.loadingService.register(this.loaderName);
    const file = this.get('image').value;
    if (/^image\//.test(file.type)) {
      this.imageService.upload(file).subscribe(it => {
        if (it) {
          this.imageId = it;
          this.loadingService.resolve(this.loaderName);
        }
      });
    } else {
      this.snackBar.open('Можно загружать только изображения',
        'Закрыть', {duration: 3000});
      this.loadingService.resolve(this.loaderName);
    }
  }

  openImage(): void {
    let image = new Image();
    image.src = this.appConfig.webServiceFullUrl + '/media/img/' + this.imageId;
    let win = window.open('');
    win.document.write(image.outerHTML);

  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }
}
