import {Component} from "@angular/core";
import {
  SendNotificationDialogComponent,
  SendNotificationMode
} from "../dialog/send-notification-dialog/send-notification-dialog.component";
import {DialogService} from "../../services/dialog/dialog.service";

@Component({
  selector: 'app-user-notification',
  templateUrl: './user-notification.component.html'
})
export class UserNotificationComponent {

  constructor(private dialogService: DialogService) {
  }

  sendGroupNotification() {
    this.dialogService.show(SendNotificationDialogComponent, {
      mode: SendNotificationMode.GROUP
    });
  }

  sendUserNotification() {
    this.dialogService.show(SendNotificationDialogComponent, {
      mode: SendNotificationMode.USERS
    });
  }

}
