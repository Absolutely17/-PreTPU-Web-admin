import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Injectable, TemplateRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../components/common/dialog/confirm-dialog/confirm-dialog.component';

@Injectable()
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) {
  }

  /**
   * Показывает диалог подтверждения
   */
  showConfirmDialog(config: ConfirmDialogData): MatDialogRef<ConfirmDialogComponent> {
    return this.dialog.open(ConfirmDialogComponent, {
      data: config,
      width: '500px',
      disableClose: true
    });
  }

  show<T>(dialog: ComponentType<T> | TemplateRef<T>, data?: any, width?: string, maxWidth?: string): MatDialogRef<T> {
    return this.dialog.open(dialog, {
      data,
      width: width || '500px',
      minWidth: width || '500px',
      maxWidth: width || '500px',
      disableClose: true,
      panelClass: 'full-width-dialog'
    });
  }

}
