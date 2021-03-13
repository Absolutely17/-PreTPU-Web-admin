import {Component, HostListener, Inject, Input, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {Identifable} from "../../../models/identifable";


@Component({
  selector: 'app-article-choose-dialog',
  templateUrl: './article-choose-dialog.component.html'
})
export class ArticleChooseDialogComponent {

  allowEdit: boolean = false;

  selectedArticles: Identifable[];

  multiple: boolean;

  loaderName: string = 'selectArticle';

  constructor(
    private dialogRef: MatDialogRef<ArticleChooseDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data) {
      if (data.selectedArticles) {
        if (data.selectedArticles instanceof Array) {
          this.selectedArticles = data.selectedArticles.map(s => {
            return {id: s}
          });
        } else {
          this.selectedArticles = [];
          this.selectedArticles.push({id: data.selectedArticles});
        }
      } else {
        this.selectedArticles = [];
      }
      this.multiple = data.multiple;
      this.allowEdit = data.allowEdit;
      if (data.loaderName) {
        this.loaderName = data.loaderName;
      }
    } else {
      this.selectedArticles = [];
    }
  }

  accept(): void {
    if (this.selectedArticles.length < 1) {
      this.errorService.showErrorDialog('Не выбрана статья. Выберите статью, которую необходимо прикрепить к пункту меню.');
      return;
    }
    const selectedArticles = this.selectedArticles.map(it => it.id);
    this.dialogRef.close(selectedArticles);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}
