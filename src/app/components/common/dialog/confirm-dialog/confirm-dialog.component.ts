import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

export interface ConfirmDialogData extends MatDialogConfig {
  title: string;
  message: string;
  acceptButton: string;
  cancelButton?: string;
  additionalMessage?: string;
  recordsCount?: number;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  private _dialogRef;
  title: string;
  message: string;
  cancelButton?: string;
  acceptButton: string;
  additionalMessage: string;
  recordsCount: number;

  constructor(
    _dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ConfirmDialogData
  ) {
    this._dialogRef = _dialogRef;
    this.title = data.title;
    this.message = data.message;
    this.cancelButton = data.cancelButton;
    this.acceptButton = data.acceptButton;
    this.additionalMessage = data.additionalMessage;
    this.recordsCount = !!data.recordsCount && data.recordsCount > 0 ? data.recordsCount : null;
  }

  cancel(): void {
    this._dialogRef.close(false);
  }

  accept(): void {
    this._dialogRef.close(true);
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}
