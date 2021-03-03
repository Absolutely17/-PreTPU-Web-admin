import {Component, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../services/user/user.service';
import {TdLoadingService} from '@covalent/core/loading';
import {AutocompleteSelectComponent} from '../../common/autocomplete-select/autocomplete-select.component';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ImageService} from "../../../services/image/image.service";
import {AppConfig} from "../../../app.config";
import {transformResultTextToHtml} from "../../common/ckeditor/utils-function";
import {MatStepper} from "@angular/material/stepper";
import {DialogService} from "../../../services/dialog/dialog.service";
import {UserChooseDialogComponent} from "../user-choose-dialog/user-choose-dialog.component";
import {CalendarEventService} from "../../../services/calendarEvent/calendar-event.service";
import {DialogMode} from "../dialog-mode";
import * as moment from "moment";

export enum CalendarEventGroupTarget {
  SELECTED_USERS = 'SELECTED_USERS',
  STUDY_GROUP = 'STUDY_GROUP',
  ALL = 'ALL'
}

@Component({
  selector: 'calendar-event-editing-dialog',
  templateUrl: './calendar-event-editing-dialog.component.html'
})
export class CalendarEventEditingDialogComponent implements OnInit {

  @ViewChild(AutocompleteSelectComponent) groupSelect: AutocompleteSelectComponent;

  groupTargets = [
    {id: CalendarEventGroupTarget.SELECTED_USERS, value: 'Выбранные пользователи'},
    {id: CalendarEventGroupTarget.STUDY_GROUP, value: 'Учебная группа'},
    {id: CalendarEventGroupTarget.ALL, value: 'Все'}
  ];

  generalInfoForm: FormGroup;

  detailedMessageControl: FormControl;

  loaderName = 'calendarEventLoader';

  picker: any;

  selectedUsers: string[] = [];

  groups: any[];

  defaultSelectedGroup: any;

  data: any;

  dialogMode = DialogMode;

  currentMode: DialogMode;

  prevSendNotification: boolean;

  constructor(
    private dialogRef: MatDialogRef<CalendarEventEditingDialogComponent>,
    private calendarEventService: CalendarEventService,
    private loadingService: TdLoadingService,
    private errorService: ErrorService,
    private snackbar: MatSnackBar,
    private imageService: ImageService,
    private appConfig: AppConfig,
    private diagService: DialogService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.loadingService.register(this.loaderName);
    if(data) {
      this.data = data;
    }
    this.userService.getGroups().subscribe(it => {
      if(it) {
        this.groups = it;
      }
    });
  }

  ngOnInit(): void {
    this.createForm();
    this.patchInitValue();
  }

  private patchInitValue() {
    this.currentMode = this.data.mode;
    if(this.data.currentEventId) {
      this.calendarEventService.getDetailedEvent(this.data.currentEventId).subscribe(event => {
        if(event) {
          this.generalInfoForm.patchValue({
            title: event.title,
            description: event.description,
            date: moment.unix(event.timestamp),
            groupTarget: event.groupTarget,
            onlineMeetingLink: event.onlineMeetingLink
          });
          this.selectedUsers = event.selectedUsers && event.selectedUsers.length > 0 ? event.selectedUsers : [];
          if(event.selectedGroups && event.selectedGroups.length > 0) {
            this.defaultSelectedGroup = event.selectedGroups;
          }
          this.prevSendNotification = event.sendNotification;
          this.detailedMessageControl.patchValue(event.detailedMessage);
          this.loadingService.resolve(this.loaderName);
        }
      })
    } else {
      if(this.data.selectDate) {
        this.generalInfoForm.patchValue({
          date: moment(this.data.selectDate)
        });
      }
      if (this.data.groupTarget) {
        this.generalInfoForm.patchValue({
          groupTarget: this.data.groupTarget
        });
      }
      if (this.data.selectedUser) {
        this.selectedUsers.push(this.data.selectedUser);
      }
      if (this.data.selectedGroup) {
        this.defaultSelectedGroup = this.data.selectedGroup;
      }
      this.loadingService.resolve(this.loaderName);
    }
  }

  createForm() {
    this.generalInfoForm = new FormGroup({}, null, null);
    this.generalInfoForm.addControl('title', new FormControl('', Validators.required));
    this.generalInfoForm.addControl('description', new FormControl('', null));
    this.generalInfoForm.addControl('date', new FormControl('', Validators.required));
    this.generalInfoForm.addControl('groupTarget', new FormControl(null, Validators.required));
    this.generalInfoForm.addControl('sendNotification', new FormControl(false, null));
    this.generalInfoForm.addControl("onlineMeetingLink", new FormControl(null, null));
    this.detailedMessageControl = new FormControl(null, null);
  }

  cancel() {
    this.dialogRef.close();
  }

  get(name: string) {
    return this.generalInfoForm.get(name);
  }

  selectUsers() {
    this.diagService.show(UserChooseDialogComponent, {
      selectedUsers: this.selectedUsers,
      multiple: true
    }, '', '', true).afterClosed().subscribe(it => {
      if(it) {
        this.selectedUsers = it;
      }
    })
  }

  isAcceptBtnDisabled(): boolean {
    if(this.get('groupTarget').value === 'SELECTED_USERS' && this.selectedUsers.length <= 0) {
      return true;
    }
    if(this.groupSelect && this.groupSelect.control.invalid) {
      return true;
    }
  }

  accept() {
    this.loadingService.register(this.loaderName);
    const description = this.get('description').value ? this.get('description').value : null;
    const group = this.groupSelect && this.groupSelect.control.value ? this.groupSelect.control.value : [];
    const selectedUsersVal = this.get('groupTarget').value === 'SELECTED_USERS' ? this.selectedUsers : [];
    let resultDetailedMessageText;
    if(this.detailedMessageControl.value) {
      resultDetailedMessageText = transformResultTextToHtml(this.detailedMessageControl.value);
    }
    const createEventRequest = {
      title: this.get('title').value,
      description: description,
      groupTarget: this.get('groupTarget').value,
      timestamp: this.get('date').value.unix(),
      groups: group,
      onlineMeetingLink: this.get('onlineMeetingLink').value,
      selectedUsers: selectedUsersVal,
      sendNotification: this.get('sendNotification').value,
      detailedMessage: resultDetailedMessageText
    };
    if(this.currentMode === DialogMode.CREATE) {
      this.calendarEventService.createCalendarEvent(createEventRequest).subscribe(
        () => {
          this.snackbar.open('Событие создано', 'Закрыть', {duration: 3000});
        },
        error => {
          this.errorService.handleServiceError(error);
        }
      ).add(() => {
        this.dialogRef.close(true);
        this.loadingService.resolve(this.loaderName);
      });
    } else {
      this.calendarEventService.editEvent(createEventRequest, this.data.currentEventId).subscribe(() => {
        this.snackbar.open('Событие отредактировано', 'Закрыть', {duration: 3000});
      }, error => this.errorService.handleServiceError(error))
        .add(() => {
          this.dialogRef.close(true);
          this.loadingService.resolve(this.loaderName);
        })

    }

  }

  isInvalid(name: string) {
    const control = this.get(name);
    return control.touched && control.invalid;
  }

  getError(name: string) {
    const error = this.generalInfoForm.get(name).errors;
    if(error) {
      if(error.required) {
        return 'Обязательно для заполнения';
      }
    }
  }

  nextStep(stepper: MatStepper) {
    stepper.next();
  }

  prevStep(stepper: MatStepper) {
    stepper.previous();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }
}
