import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DocumentService} from '../../../services/document/document.service';
import {Document} from '../../../models/document/document';
import {TokenStorageService} from '../../../services/token/token-storage.service';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TdLoadingService} from "@covalent/core/loading";
import {UserChooseDialogComponent} from "../user-choose-dialog/user-choose-dialog.component";
import {DialogService} from "../../../services/dialog/dialog.service";


@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './upload-document-dialog.component.html'
})
export class UploadDocumentDialogComponent implements OnInit {

  form: FormGroup;

  loaderName = 'loader';

  selectedUsers: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    private docService: DocumentService,
    private tokenService: TokenStorageService,
    private errorService: ErrorService,
    protected snackBar: MatSnackBar,
    private loadingService: TdLoadingService,
    private diagService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({}, null, null);
    this.form.addControl('documentName', new FormControl(null, Validators.required));
    this.form.addControl('file', new FormControl(null, Validators.required));
    this.form.addControl('sendNotification', new FormControl(false, Validators.required));
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
    const file = this.form.get('file').value;
    const documentData: Document = {
      adminEmail: this.tokenService.getUser().email,
      userIds: this.selectedUsers,
      documentName: this.form.get('documentName').value,
      fileName: file.name
    };
    this.docService.uploadDocument(documentData, file).subscribe(it => {
      this.snackBar.open('Документ успешно прикреплен', 'Закрыть', {duration: 3000});
    }, error => this.errorService.handleServiceError(error))
      .add(() => {
        this.dialogRef.close();
        this.loadingService.resolve(this.loaderName);
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}
