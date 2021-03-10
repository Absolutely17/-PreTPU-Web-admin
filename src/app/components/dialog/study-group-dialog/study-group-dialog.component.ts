import {Component, HostListener, Inject} from "@angular/core";
import {DialogMode} from "../dialog-mode";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ErrorService} from "../../../services/error/error.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {StudyGroupService} from "../../../services/studyGroup/study-group.service";
import {TdLoadingService} from "@covalent/core/loading";
import {DialogService} from "../../../services/dialog/dialog.service";

@Component({
  selector: 'app-study-group-dialog',
  templateUrl: './study-group-dialog.component.html'
})
export class StudyGroupDialogComponent {

  mode: DialogMode;

  dialogMode = DialogMode;

  form: FormGroup;

  loaderName = 'loader';

  currentGroupId: string;

  constructor(
    private dialogRef: MatDialogRef<StudyGroupDialogComponent>,
    private studyGroupService: StudyGroupService,
    @Inject(MAT_DIALOG_DATA) data: any,
    private errorService: ErrorService,
    private loadingService: TdLoadingService,
    protected snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {
    this.loadingService.register(this.loaderName);
    if (data.groupId) {
      this.currentGroupId = data.groupId;
      this.studyGroupService.getById(data.groupId).subscribe(it => {
        if (it) {
          this.loadingService.resolve(this.loaderName);
          this.form.patchValue(it);
        }
      })
    } else {
      this.loadingService.resolve(this.loaderName);
    }
    this.mode = data.mode;
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('name', new FormControl(null, Validators.required));
    this.form.addControl('scheduleUrl', new FormControl(null, null));
    this.form.addControl('academicPlanUrl', new FormControl(null, null));
    this.form.get('scheduleUrl').valueChanges.subscribe((text) => this.changeScheduleUrl(text));
    this.form.get('academicPlanUrl').valueChanges.subscribe((text) => this.changeAcademicPlanUrl(text));
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
      if (error.system) {
        return error.system;
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  accept(): void {
    if (this.mode === this.dialogMode.CREATE) {
      this.studyGroupService.create(this.form.getRawValue()).subscribe(() => {},
          error => this.errorService.handleServiceError(error)).add(() => this.dialogRef.close());
    } else {
      this.studyGroupService.edit(this.form.getRawValue(), this.currentGroupId).subscribe(() => {},
        error => this.errorService.handleServiceError(error)).add(() => this.dialogRef.close());
    }
  }

  delete(): void {
    this.dialogService.showConfirmDialog({
      title: 'Удаление учебной группы',
      message: 'Вы уверены, что хотите удалить учебную группу?',
      acceptButton: 'Удалить',
      cancelButton: 'Отмена'
    }).afterClosed().subscribe(it => {
      if (it) {
        this.studyGroupService.delete(this.currentGroupId).subscribe(() => {
            this.snackBar.open('Учебная группа удалена', 'Закрыть', {duration: 3000});
            this.dialogRef.close();
        },
            error => this.errorService.handleServiceError(error));
      }
    });
  }

  changeScheduleUrl(text: any) {
    const regex = /https:\/\/rasp\.tpu\.ru\/gruppa_\d+\/\d{4}\/\d{1,2}\/view\.html(?:\?is_archive=0)?/
    const regexForCheck = /^https:\/\/rasp\.tpu\.ru\/gruppa_\d+$/;
    const control = this.get('scheduleUrl');
    if (text.match(regex)) {
      const resultRegex = /https:\/\/rasp\.tpu\.ru\/gruppa_\d+/;
      control.setValue(text.match(resultRegex)[0]);
    }
    if (!regexForCheck.test(control.value)) {
      control.setErrors({system: 'Неправильный формат ссылки'})
    }
  }

  changeAcademicPlanUrl(text: any) {
    const resultRegex = /^https:\/\/up\.tpu\.ru\/view\/detali\.html\?id=\d+$/;
    const control = this.get('academicPlanUrl');
    if (!resultRegex.test(control.value)) {
      control.setErrors({system: 'Неправильный формат ссылки'})
    }
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}
