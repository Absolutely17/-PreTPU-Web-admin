import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserInfo} from '../../../models/user/user-info';
import {TokenStorageService} from '../../../services/token/token-storage.service';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {SendNotificationData} from '../../../models/notification/send-notification-data';
import {NotificationService} from '../../../services/notification/notification.service';

export enum SendNotificationMode {
  GROUP ,
  USERS
}

export interface SendNotificationDialogData {

  mode: SendNotificationMode;

  users?: UserInfo[];

  dicts?: any;
}

@Component({
  selector: 'app-send-notification-dialog',
  templateUrl: './send-notification-dialog.component.html'
})
export class SendNotificationDialogComponent implements OnInit{

  currentMode: SendNotificationMode;

  mode = SendNotificationMode;

  selectedUsers: UserInfo[];

  form: FormGroup;

  dicts: any;

  constructor(
    private dialogRef: MatDialogRef<SendNotificationDialogComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) data: SendNotificationDialogData,
    private tokenService: TokenStorageService,
    private errorService: ErrorService,
    protected snackBar: MatSnackBar
  ) {
    this.selectedUsers = data.users;
    this.currentMode = data.mode;
    this.dicts = data.dicts;
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('title', new FormControl('', Validators.required));
    this.form.addControl('message', new FormControl('', Validators.required));
    if (this.currentMode === SendNotificationMode.GROUP) {
      this.form.addControl('language', new FormControl('', Validators.required));
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

  accept(): void {
    if (this.currentMode === SendNotificationMode.USERS) {
      const users: string[] = this.selectedUsers.map(it => it.id);
      const sendData: SendNotificationData = {
        title: this.form.get('title').value,
        message: this.form.get('message').value,
        adminEmail: this.tokenService.getUser().email,
        users
      };
      this.notificationService.sendNotificationOnUsers(sendData).subscribe(it => {
        this.snackBar.open(`Уведомление отправлено`,
          'Закрыть', {duration: 3000});
      }, error => this.errorService.handleFormError(error, this.form));
    } else {
      const sendData: SendNotificationData = {
        title: this.form.get('title').value,
        message: this.form.get('message').value,
        adminEmail: this.tokenService.getUser().email,
        language: this.form.get('language').value
      };
      this.notificationService.sendNotificationOnGroup(sendData).subscribe(it => {
        this.snackBar.open(`Уведомление отправлено`,
          'Закрыть', {duration: 3000});
      }, error => this.errorService.handleFormError(error, this.form));
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
