import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../services/user/user.service';
import {TdLoadingService} from '@covalent/core/loading';
import {AutocompleteSelectComponent} from '../../common/autocomplete-select/autocomplete-select.component';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'calendar-create-event-dialog',
  templateUrl: './calendar-create-event-dialog.component.html'
})
export class CalendarCreateEventDialogComponent implements OnInit {

  @ViewChild(AutocompleteSelectComponent) groupSelect: AutocompleteSelectComponent;

  groupTargets = [
    {id: 'SELECTED_USERS', value: 'Выбранные пользователи'},
    {id: 'STUDY_GROUP', value: 'Учебная группа'},
    {id: 'ALL', value: 'Все'}
  ];

  form: FormGroup;

  loaderName = 'calendarEventLoader';

  picker: any;

  selectedUsers = [];

  groups: any[];

  constructor(
    private dialogRef: MatDialogRef<CalendarCreateEventDialogComponent>,
    private userService: UserService,
    private loadingService: TdLoadingService,
    private errorService: ErrorService,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    if (data && data.selectedUsers) {
      this.selectedUsers = data.selectedUsers;
    }
  }

  ngOnInit(): void {
    this.loadingService.register(this.loaderName);
    this.form = new FormGroup({}, null, null);
    this.form.addControl('name', new FormControl('', Validators.required));
    this.form.addControl('description', new FormControl('', null));
    this.form.addControl('date', new FormControl('', Validators.required));
    this.form.addControl('groupTarget', new FormControl(null, Validators.required));
    this.form.addControl('sendNotification', new FormControl(false, null));
    this.userService.getGroups().subscribe(it => {
      if (it) {
        this.groups = it;
        this.loadingService.resolve(this.loaderName);
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  get(name: string) {
    return this.form.get(name);
  }

  acceptDisabled(): boolean {
    if (this.get('groupTarget').value === 'SELECTED_USERS' && this.selectedUsers.length <= 0) {
      return true;
    }
    if (this.groupSelect && this.groupSelect.control.invalid) {
      return true;
    }
  }

  accept() {
    this.loadingService.register(this.loaderName);
    const description = this.get('description').value ? this.get('description').value : null;
    const group = this.groupSelect && this.groupSelect.control.value ? this.groupSelect.control.value : [];
    const selectedUsersVal = this.get('groupTarget').value === 'SELECTED_USERS' ? this.selectedUsers.map(it => it.id) : [];
    const createEventRequest = {
      title: this.get('name').value,
      description: description,
      groupTarget: this.get('groupTarget').value,
      date: this.get('date').value.unix(),
      groups: group,
      selectedUsers: selectedUsersVal,
      sendNotification: this.get('sendNotification').value
    };
    this.userService.createCalendarEvent(createEventRequest).subscribe(() => {
        this.snackbar.open('Событие создано', 'Закрыть', {duration: 3000});
      },
      error => this.errorService.handleServiceError(error))
      .add(() => {
        this.loadingService.resolve(this.loaderName);
        this.dialogRef.close();
      });
  }

  isInvalid(name: string) {
    const control = this.get(name);
    return control.touched && control.invalid;
  }

  getError(name: string) {
    const error = this.form.get(name).errors;
    if (error) {
      if (error.required) {
        return 'Обязательно для заполнения';
      }
    }
  }
}