import {Component, HostListener, Inject} from "@angular/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DocumentService} from "../../../services/document/document.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DialogMode} from "../dialog-mode";
import {StudyGroupService} from "../../../services/studyGroup/study-group.service";
import {TdLoadingService} from "@covalent/core/loading";
import {UserService} from "../../../services/user/user.service";
import {ErrorService} from "../../../services/error/error.service";
import {DialogService} from "../../../services/dialog/dialog.service";

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html'
})
export class UserDialogComponent {

  form: FormGroup;

  dict: any;

  genders = [{id: 'Male', name: 'Мужской'}, {id: 'Female', name: 'Женский'}];

  currentMode: DialogMode;

  mode = DialogMode;

  currentUser: any;

  loaderName = 'loader';

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private docService: DocumentService,
    @Inject(MAT_DIALOG_DATA) data: any,
    protected snackBar: MatSnackBar,
    private loadingService: TdLoadingService,
    private studyGroupService: StudyGroupService,
    private userService: UserService,
    private errorService: ErrorService,
    private dialogService: DialogService
  ) {
    this.loadingService.register(this.loaderName);
    this.dict = data.dict;
    if(data.currentUser) {
      this.currentUser = data.currentUser;
      this.currentMode = DialogMode.EDIT;
    } else {
      this.currentMode = DialogMode.CREATE;
    }
    studyGroupService.getTable().subscribe(it => {
      if(it) {
        this.dict['groups'] = it;
      }
    });
    if(this.currentUser) {
      userService.getByEmail(this.currentUser.email).subscribe(it => {
        if(it) {
          this.pathToForm(it);
          this.loadingService.resolve(this.loaderName);
        }
      });
    } else {
      this.loadingService.resolve(this.loaderName);
    }
  }

  private pathToForm(user: any) {
    this.form.patchValue(user);
    if(user.groupName) {
      const group = this.dict.groups.find(it => it.name === user.groupName);
      if(group) {
        this.form.patchValue({group: group.id});
      }
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('firstName', new FormControl(null, Validators.required));
    this.form.addControl('lastName', new FormControl(null));
    this.form.addControl('middleName', new FormControl(null));
    this.form.addControl('gender', new FormControl(null));
    this.form.addControl('email', new FormControl(null, [Validators.required, Validators.email]));
    this.form.addControl('group', new FormControl(null));
    this.form.addControl('languageId', new FormControl(null, Validators.required));
    this.form.addControl('phoneNumber', new FormControl(null, Validators.pattern('^[+]\\d+$')));
    if(this.currentMode === DialogMode.CREATE) {
      this.form.addControl(
        'password', new FormControl(null,
          [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!&^%$#@_|\\/\\\\]{8,}$')]
        ));
    }
    if (this.currentMode == DialogMode.CREATE) {
      this.form.markAllAsTouched();
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
      if(error.pattern) {
        if (name === 'phoneNumber') {
          return 'Номер телефона должен содержать лишь цифры (минимум 1) и начинаться с +';
        } else {
          return 'Пароль должен содержать минимум 8 символов. Минимум одна заглавная буква, минимум одна цифра. Разрешенные символы: ! & ^ % $ # @ _ | \\ /';
        }
      }
      if(error.email) {
        return 'Неверный формат электронной почты';
      }
      if(error.server) {
        return error.server;
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  accept(): void {
    const userInfo = this.form.getRawValue();
    if(userInfo.group) {
      const groupName = this.dict.groups.find(it => it.id === userInfo.group).name;
      if(groupName) {
        userInfo['groupName'] = groupName;
        delete userInfo.group;
      }
    }
    if(this.currentMode == DialogMode.CREATE) {
      this.userService.create(userInfo).subscribe(() => {
        this.snackBar.open('Пользователь успешно создан', 'Закрыть', {duration: 3000});
        this.dialogRef.close(true);
      }, error => this.errorService.handleFormError(error, this.form));
    } else {
      this.userService.edit(userInfo, this.currentUser.id).subscribe(() => {
        this.snackBar.open('Пользователь изменен', 'Закрыть', {duration: 3000});
        this.dialogRef.close(true);
      }, error => this.errorService.handleFormError(error, this.form));
    }
  }

  delete(): void {
    this.dialogService.showConfirmDialog({
        title: 'Удаление пользователя',
        message: 'Вы уверены, что хотите удалить пользователя?',
        acceptButton: 'Удалить',
        cancelButton: 'Отмена'
      }
    ).afterClosed().subscribe(it => {
      if (it) {
        this.userService.delete(this.currentUser.id).subscribe(() => {
          this.snackBar.open(
            'Пользователь ' + (this.currentUser.lastName ? this.currentUser.lastName + ' ' : '') +
            this.currentUser.firstName + ' удален',
            'Закрыть',
            {duration: 3000}
          );
          this.dialogRef.close(true);
        }, error => this.errorService.handleServiceError(error));
      }
    });
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}
