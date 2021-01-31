import {Component, HostListener} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-menu-registry-reference',
  templateUrl: './menu-registry-reference.component.html',
  styleUrls: ['./menu-registry-reference.component.scss']
})
export class MenuRegistryReferenceComponent {

  constructor(private dialogRef: MatDialogRef<MenuRegistryReferenceComponent>) {
  }


  cancel(): void {
    this.dialogRef.close(false);
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }
}
