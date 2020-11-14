import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TokenStorageService} from '../../../services/token/token-storage.service';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MenuService} from '../../../services/menu/menu.service';
import {SendNotificationDialogData} from '../send-notification-dialog/send-notification-dialog.component';
import {MenuItem} from '../../menu/menu-registry.component';
import {DialogService} from '../../../services/dialog/dialog.service';
import {ArticleEditingDialogComponent} from '../article-edtiting-dialog/article-editing-dialog.component';
import {ComponentType} from '@angular/cdk/overlay';
import {DialogMode} from '../DialogMode';

export interface MenuEditingData {
  mode: DialogMode;
  item?: MenuItem;
  dicts: any;
}

@Component({
  selector: 'app-menu-editing-component',
  templateUrl: './menu-editing.component.html'
})
export class MenuEditingComponent implements OnInit{

  articleDialog: ComponentType<ArticleEditingDialogComponent> = ArticleEditingDialogComponent;

  currentMode: DialogMode;

  mode = DialogMode;

  form: FormGroup;

  dicts: any;

  item: MenuItem;

  currentArticle: string;

  get type(): string {
    return this.get('type').value;
  }

  constructor(
    private dialogRef: MatDialogRef<MenuEditingComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: MenuEditingData,
    protected snackBar: MatSnackBar,
    private menuService: MenuService,
    private dialogService: DialogService
  ) {
    this.currentMode = data.mode;
    this.dicts = data.dicts;
    if (data.item) {
      this.item = data.item;
      this.currentArticle = data.item.articleId;
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('name', new FormControl('', Validators.required));
    this.form.addControl('type', new FormControl('', Validators.required));
    this.form.addControl('url', new FormControl('', null));
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
    if (this.currentArticle && menuInfo.type === 'ARTICLE') {
      menuInfo.articleId = this.currentArticle;
    }
    this.dialogRef.close(menuInfo);
  }

  createArticle(): void {
    this.dialogService.show(this.articleDialog, {
      mode: DialogMode.CREATE,
      dicts: this.dicts
    }, '1000px').afterClosed().subscribe((it) => {
      if (it) {
        this.currentArticle = it;
      }
    });
  }

  chooseArticle(): void {

  }

  // Сбрасываем URL и ID статьи при смене типа пункта меню
  changeType(): void {
    this.currentArticle = null;
    this.form.patchValue({url: null});
  }
}
