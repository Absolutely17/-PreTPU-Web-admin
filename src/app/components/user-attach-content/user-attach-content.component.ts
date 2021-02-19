import {Component} from "@angular/core";
import {
  SendNotificationDialogComponent
} from "../dialog/send-notification-dialog/send-notification-dialog.component";
import {DialogService} from "../../services/dialog/dialog.service";
import {UploadDocumentDialogComponent} from "../dialog/upload-document-dialog/upload-document-dialog.component";

@Component({
  selector: 'app-user-attach-content',
  templateUrl: './user-attach-content.component.html'
})
export class UserAttachContentComponent {

  constructor(private dialogService: DialogService) {
  }

  sendNotification() {
    this.dialogService.show(SendNotificationDialogComponent);
  }

  attachDocument() {
    this.dialogService.show(UploadDocumentDialogComponent);
  }

}
