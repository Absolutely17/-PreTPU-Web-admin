import {Component, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../services/user/user.service';
import {TdLoadingService} from '@covalent/core/loading';
import {AutocompleteSelectComponent} from '../../common/autocomplete-select/autocomplete-select.component';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CkEditorImageUploadComponent} from "../../common/ckeditor/ckeditor-image-upload.component";
import {ImageService} from "../../../services/image/image.service";
import {AppConfig} from "../../../app.config";
import * as ClassicEditor from 'ckeditor-custom/packages/ckeditor5-build-classic';
import {transformResultTextToHtml} from "../../common/ckeditor/utils-function";
import {MatStepper} from "@angular/material/stepper";
import {DialogService} from "../../../services/dialog/dialog.service";
import {UserChooseDialogComponent} from "../user-choose-dialog/user-choose-dialog.component";

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

  generalInfoForm: FormGroup;

  detailedMessageControl: FormControl;

  public Editor = ClassicEditor;

  loaderName = 'calendarEventLoader';

  picker: any;

  selectedUsers: string[] = [];

  groups: any[];

  constructor(
    private dialogRef: MatDialogRef<CalendarCreateEventDialogComponent>,
    private userService: UserService,
    private loadingService: TdLoadingService,
    private errorService: ErrorService,
    private snackbar: MatSnackBar,
    private imageService: ImageService,
    private appConfig: AppConfig,
    private diagService: DialogService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
  }

  ngOnInit(): void {
    this.loadingService.register(this.loaderName);
    this.generalInfoForm = new FormGroup({}, null, null);
    this.generalInfoForm.addControl('name', new FormControl('', Validators.required));
    this.generalInfoForm.addControl('description', new FormControl('', null));
    this.generalInfoForm.addControl('date', new FormControl('', Validators.required));
    this.generalInfoForm.addControl('groupTarget', new FormControl(null, Validators.required));
    this.generalInfoForm.addControl('sendNotification', new FormControl(false, null));
    this.generalInfoForm.addControl("onlineMeetingLink", new FormControl(null, null));
    this.userService.getGroups().subscribe(it => {
      if(it) {
        this.groups = it;
        this.loadingService.resolve(this.loaderName);
      }
    });
    this.detailedMessageControl = new FormControl(null, null);
  }

  onReady(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CkEditorImageUploadComponent(loader, this.imageService, this.appConfig);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  get(name: string) {
    return this.generalInfoForm.get(name);
  }

  selectUsers() {
    this.diagService.show(UserChooseDialogComponent, {
      selectedUsers: this.selectedUsers
    }, '', '', true).afterClosed().subscribe(it => {
      if (it) {
        this.selectedUsers = it;
      }
    })
  }

  acceptDisabled(): boolean {
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
    if (this.detailedMessageControl.value) {
      resultDetailedMessageText = transformResultTextToHtml(this.detailedMessageControl.value);
    }
    const createEventRequest = {
      title: this.get('name').value,
      description: description,
      groupTarget: this.get('groupTarget').value,
      date: this.get('date').value.unix(),
      groups: group,
      onlineMeetingLink: this.get('onlineMeetingLink').value,
      selectedUsers: selectedUsersVal,
      sendNotification: this.get('sendNotification').value,
      detailedMessage: resultDetailedMessageText
    };
    this.userService.createCalendarEvent(createEventRequest).subscribe(
      () => {
        this.snackbar.open('Событие создано', 'Закрыть', {duration: 3000});
        this.dialogRef.close();
        this.loadingService.resolve(this.loaderName);
      },
      error => {
        this.errorService.handleServiceError(error);
        this.dialogRef.close();
        this.loadingService.resolve(this.loaderName);
      }
    );
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
