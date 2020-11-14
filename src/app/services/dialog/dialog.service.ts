import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Injectable, TemplateRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';

@Injectable()
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) {
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
