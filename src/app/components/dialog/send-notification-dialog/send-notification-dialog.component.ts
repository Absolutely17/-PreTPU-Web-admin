import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TokenStorageService} from '../../../services/token/token-storage.service';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {SendNotificationData} from '../../../models/notification/send-notification-data';
import {NotificationService} from '../../../services/notification/notification.service';
import {TdLoadingService} from "@covalent/core/loading";
import {UserChooseDialogComponent} from "../user-choose-dialog/user-choose-dialog.component";
import {DialogService} from "../../../services/dialog/dialog.service";
import {UserService} from "../../../services/user/user.service";

export enum SendNotificationMode {
  GROUP = 'GROUP', USERS = 'USERS'
}

@Component({
  selector: 'app-send-notification-dialog',
  templateUrl: './send-notification-dialog.component.html'
})
export class SendNotificationDialogComponent implements OnInit {

  currentMode: SendNotificationMode;

  mode = SendNotificationMode;

  modes = [
    {
      id: SendNotificationMode.GROUP,
      name: 'Групповое'
    },
    {
      id: SendNotificationMode.USERS,
      name: 'Выборочное'
    }
  ];

  selectedUsers: string[] = [];

  form: FormGroup;

  dicts: any;

  loaderName = "loader";

  constructor(
    private dialogRef: MatDialogRef<SendNotificationDialogComponent>,
    private notificationService: NotificationService,
    private tokenService: TokenStorageService,
    private errorService: ErrorService,
    protected snackBar: MatSnackBar,
    private loadingService: TdLoadingService,
    private diagService: DialogService,
    private userService: UserService
  ) {
    this.loadingService.register(this.loaderName);
    userService.getDicts().subscribe(it => {
      if(it) {
        this.dicts = it;
      }
    }, error => errorService.handleServiceError(error)).add(() => {
      this.loadingService.resolve(this.loaderName);
    })
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('type', new FormControl(null, Validators.required));
    this.form.get('type').valueChanges.subscribe(it => this.typeNotificationChanged(it));
    this.form.addControl('title', new FormControl('', Validators.required));
    this.form.addControl('message', new FormControl('', Validators.required));
    this.form.addControl('language', new FormControl('', Validators.required));
  }

  private typeNotificationChanged(type: any) {
    this.currentMode = type;
    if (this.currentMode === this.mode.USERS) {
      this.form.get('language').clearValidators();
      this.form.get('language').setErrors(null);
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
    if(error) {
      if(error.required) {
        return 'Обязательно для заполнения';
      }
    }
  }

  selectUsers() {
    this.diagService.show(UserChooseDialogComponent, {
      selectedUsers: this.selectedUsers
    }, '', '', true).afterClosed().subscribe(it => {
      if(it) {
        this.selectedUsers = it;
      }
    })
  }

  accept(): void {
    this.loadingService.register(this.loaderName);
    if(this.currentMode === SendNotificationMode.USERS) {
      const users: string[] = this.selectedUsers;
      const sendData: SendNotificationData = {
        title: this.form.get('title').value,
        message: this.form.get('message').value,
        adminEmail: this.tokenService.getUser().email,
        users
      };
      this.notificationService.sendNotificationOnUsers(sendData).subscribe(it => {
        this.snackBar.open(`Уведомление отправлено`,
          'Закрыть', {duration: 3000}
        );
      }, error => this.errorService.handleFormError(error, this.form)).add(() => {
        this.dialogRef.close();
        this.loadingService.resolve(this.loaderName);
      });
    } else {
      const sendData: SendNotificationData = {
        title: this.form.get('title').value,
        message: this.form.get('message').value,
        adminEmail: this.tokenService.getUser().email,
        languageId: this.form.get('language').value
      };
      this.notificationService.sendNotificationOnGroup(sendData).subscribe(it => {
        this.snackBar.open(`Уведомление отправлено`,
          'Закрыть', {duration: 3000}
        );
      }, error => this.errorService.handleFormError(error, this.form)).add(() => {
        this.dialogRef.close();
        this.loadingService.resolve(this.loaderName);
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}
