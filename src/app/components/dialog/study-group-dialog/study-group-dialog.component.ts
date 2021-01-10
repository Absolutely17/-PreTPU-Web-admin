import {Component, Inject} from "@angular/core";
import {DialogMode} from "../dialog-mode";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ErrorService} from "../../../services/error/error.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {StudyGroupService} from "../../../services/studyGroup/study-group.service";
import {TdLoadingService} from "@covalent/core/loading";

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
    protected snackBar: MatSnackBar
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
    this.form.addControl('name', new FormControl('', Validators.required));
    this.form.addControl('internalID', new FormControl('', Validators.required));
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

}
