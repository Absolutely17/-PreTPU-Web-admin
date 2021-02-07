import {Component, HostListener, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ErrorService} from "../../../services/error/error.service";
import {Identifable} from "../../../models/identifable";

@Component({
  selector: 'app-user-choose-dialog',
  templateUrl: './user-choose-dialog.component.html'
})
export class UserChooseDialogComponent {

  selectedUsers: Identifable[];

  constructor(
    private dialogRef: MatDialogRef<UserChooseDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data && data.selectedUsers) {
      this.selectedUsers = data.selectedUsers.map(s => {
        return {id: s};
      });
    }
  }

  accept(): void {
    const selectedArticles = this.selectedUsers.map(it => it.id);
    this.dialogRef.close(selectedArticles);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }
}
