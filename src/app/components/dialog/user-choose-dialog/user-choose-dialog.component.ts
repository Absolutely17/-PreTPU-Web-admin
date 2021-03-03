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

  multiple: boolean;

  constructor(
    private dialogRef: MatDialogRef<UserChooseDialogComponent>,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data) {
      if (data.selectedUsers) {
        if (data.selectedUsers instanceof Array) {
          this.selectedUsers = data.selectedUsers.map(s => {
            return {id: s};
          });
        } else {
          this.selectedUsers = [];
          this.selectedUsers.push({id: data.selectedUsers});
        }
      } else {
        this.selectedUsers = [];
      }
      this.multiple = data.multiple;
    } else {
      this.selectedUsers = [];
    }
  }

  accept(): void {
    const selected = this.selectedUsers.map(it => it.id);
    this.dialogRef.close(selected);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }
}
