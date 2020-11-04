import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessageDialogComponent, MessageDialogData} from '../../components/dialog/message-dialog/message-dialog.component';

export type MessageDialogRef = MatDialogRef<MessageDialogComponent, boolean>;

@Injectable()
export class MessageService {

  constructor(
    private dialog: MatDialog) {
  }

  showErrorMessage(message: string): MessageDialogRef {
    return this.showTdMessageDialog({
      type: 'error',
      message
    });
  }

  showWarningConfirmErrorDialog(message: string): MessageDialogRef {
    return this.showTdMessageDialog({
      type: 'warn',
      message,
      confirm: true
    });
  }

  private showTdMessageDialog(data: MessageDialogData): MessageDialogRef {
    return this.dialog.open(MessageDialogComponent, {
      panelClass: 'sur-td-message-dialog',
      data,
      maxWidth: '750px'
    });
  }

}
