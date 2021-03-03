import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";


@Component({
  selector: 'app-menu-item-choose',
  templateUrl: './menu-item-choose-dialog.component.html'
})
export class MenuItemChooseDialogComponent {

  loaderName = 'loaderMenuItemChoose';

  selectedItem: any;

  initialSelectedId: string;

  constructor(
    private dialogRef: MatDialogRef<MenuItemChooseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
    ) {
    if (data) {
      this.initialSelectedId = data.selectedMenuItem;
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    this.dialogRef.close(this.selectedItem);
  }
}
