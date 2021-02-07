import {Component, HostListener, Inject, ViewChild} from '@angular/core';
import {ArticleRegistryComponent} from '../../article-registry/article-registry.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {Identifable} from "../../../models/identifable";


@Component({
  selector: 'app-article-choose-dialog',
  templateUrl: './article-choose-dialog.component.html'
})
export class ArticleChooseDialogComponent {

  selectedArticles: Identifable[];

  multiple: boolean;

  constructor(
    private dialogRef: MatDialogRef<ArticleRegistryComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data.selectedArticles) {
      this.selectedArticles = data.selectedArticles.map(s => {
        return {id: s}
      });
    }
    this.multiple = data.multiple;
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
