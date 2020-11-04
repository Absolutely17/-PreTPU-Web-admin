import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, TemplateRef, ViewChild} from '@angular/core';
import {TdMessageContainerDirective} from '@covalent/core/message';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


export interface MessageDialogData {
  type: 'error' | 'info' | 'warn';
  message: string;
  confirm?: boolean;
}

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  host: {
    '[class.mat-warn]': 'color === \'warn\'',
    '[class.mat-accent]': 'color === \'accent\'',
    '[class.mat-primary]': 'color === \'primary\'',
    '[class.td-message]': 'true',
  },
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements AfterViewInit, AfterViewChecked {

  public title = '';
  public message: string[];
  public color = 'warn';
  public icon = '';
  public confirm = false;

  @ViewChild(TdMessageContainerDirective) _childElement: TdMessageContainerDirective;
  @ViewChild(TemplateRef) _template: TemplateRef<any>;


  constructor(
    private dialogRef: MatDialogRef<MessageDialogComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: MessageDialogData
  ) {
    this.message = (data.message || '').split('\n');
    this.confirm = !!data.confirm;

    switch (data.type) {
      case 'error': {
        this.title = 'Ошибка';
        this.color = 'warn';
        this.icon = 'error';
        break;
      }
      case 'warn': {
        this.title = 'Предупреждение';
        this.color = 'primary';
        this.icon = 'warning';
        break;
      }
      case 'info': {
        this.title = 'Информация';
        this.color = 'accent';
        this.icon = 'info';
        break;
      }
    }
  }


  ngAfterViewInit(): void {
    this._attach();
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  onClose(): void {
    this.dialogRef.close(!this.confirm);
  }

  onContinue(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Method to attach template to DOM
   */
  private _attach(): void {
    this._childElement.viewContainer.createEmbeddedView(this._template);
    this.cdr.markForCheck();
  }

  /**
   * Method to detach template from DOM
   */
  private _detach(): void {
    this._childElement.viewContainer.clear();
    this.cdr.markForCheck();
  }


}
