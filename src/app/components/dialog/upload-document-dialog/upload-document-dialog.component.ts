import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DocumentService} from '../../../services/document/document.service';
import {Document} from '../../../models/document/document';
import {UserInfo} from '../../../models/user/user-info';
import {TokenStorageService} from '../../../services/token/token-storage.service';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './upload-document-dialog.component.html'
})
export class UploadDocumentDialogComponent implements OnInit{

  user: UserInfo;

  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    private docService: DocumentService,
    @Inject(MAT_DIALOG_DATA) data: UserInfo,
    private tokenService: TokenStorageService,
    private errorService: ErrorService,
    protected snackBar: MatSnackBar,
  ) {
    this.user = data;
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('documentName', new FormControl('', Validators.required));
    this.form.addControl('fileName', new FormControl('', Validators.required));
    this.form.addControl('file', new FormControl(''));
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
      if (error.required && name === 'fileName') {
        return 'Необходимо загрузить документ';
      } else {
        return 'Обязательно для заполнения';
      }
    }
  }

  accept(): void {
    const documentData: Document = {
      adminEmail: this.tokenService.getUser().email,
      userEmail: this.user.email,
      documentName: this.form.get('documentName').value,
      fileName: this.form.get('fileName').value
    };
    this.docService.uploadDocument(documentData, this.form.get('file').value).subscribe(it => {
      this.snackBar.open(`Документ успешно прикреплен к пользователю ${documentData.userEmail}`,
        'Закрыть', {duration: 3000});
    }, error => this.errorService.handleFormError(error, this.form)).add(() => this.dialogRef.close());
  }

  cancel(): void {
    this.dialogRef.close();
  }

  selectFile(file: File): void {
    this.form.get('fileName').setValue(file.name);
  }

}
