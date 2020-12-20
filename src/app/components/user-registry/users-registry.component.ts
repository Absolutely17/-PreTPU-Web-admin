import {TdDataTableService} from '@covalent/core/data-table';
import {Component} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {DialogService} from '../../services/dialog/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {UploadDocumentDialogComponent} from '../dialog/upload-document-dialog/upload-document-dialog.component';
import {SendNotificationDialogComponent, SendNotificationMode} from '../dialog/send-notification-dialog/send-notification-dialog.component';
import {TdLoadingService} from '@covalent/core/loading';
import {ISbDataTableColumn} from '../common/sb-data-table/data-table.component';
import {AdditionalMenuItem, TableActionConfig, TableActionType, TableComponent} from '../common/table/table.component';
import {Observable} from 'rxjs';
import {CalendarCreateEventDialogComponent} from '../dialog/calendar-create-event-dialog/calendar-create-event-dialog.component';

@Component({
  selector: 'app-users-registry',
  templateUrl: '../common/table/table.component.html'
})
export class UsersRegistryComponent extends TableComponent {

  uploadDocumentDialog: ComponentType<UploadDocumentDialogComponent> = UploadDocumentDialogComponent;

  sendNotificationDialog: ComponentType<SendNotificationDialogComponent> = SendNotificationDialogComponent;

  calendarEventCreateDialog: ComponentType<CalendarCreateEventDialogComponent> = CalendarCreateEventDialogComponent;

  columns: ISbDataTableColumn[] = [
    {name: 'firstName', label: 'Имя', sortable: true, filter: true, width: 200},
    {name: 'lastName', label: 'Фамилия', sortable: true, filter: true, width: 200},
    {name: 'email', label: 'Электронная почта', sortable: true, filter: true, width: 300},
    {name: 'gender', label: 'Пол', sortable: true, filter: true, width: 200},
    {name: 'groupName', label: 'Номер группы', sortable: true, filter: true, width: 200},
    {
      name: 'languageId', label: 'Язык', sortable: true, filter: true, format: value => {
        if (this.dicts && this.dicts.languages) {
          return this.dicts.languages.find(it => it.id === value).name;
        } else {
          return value;
        }
      }, width: 200
    },
    {
      name: 'activeFcmToken', label: 'Доступны уведомления', sortable: true, width: 150, format: value => {
        return value ? 'Да' : 'Нет';
      }
    },
    {name: 'uploadDocument', label: '', sortable: true, filter: true, width: 100}
  ];

  additionalMenuItems: AdditionalMenuItem[] = [
    {name: 'uploadDocument', func: this.uploadDocument.bind(this), icon: 'insert_drive_file', tooltip: 'Прикрепить документ пользователю'}
  ];

  menuItemList = [{
    id: TableActionType.SendOnUsersNotification,
    name: 'Выборочное уведомление'
  },
    {
      id: TableActionType.SendOnGroupNotification,
      name: 'Групповое уведомление'
    },
    {
      id: TableActionType.CalendarCreateEvent,
      name: 'Создать напоминание'
    }
  ];

  multiple = true;

  selectableButton = true;

  textEnableSelectable = 'Выбрать пользователей';

  textCancelSelectable = 'Отменить выбор пользователей';

  loadingKey = 'userRegistryLoading';

  sortBy = 'firstName';

  tableName = 'Реестр пользователей';

  constructor(
    protected dataTableService: TdDataTableService,
    protected loadingService: TdLoadingService,
    private userService: UserService,
    private dialogService: DialogService
  ) {
    super(dataTableService, loadingService);
  }


  uploadDocument(row: any): void {
    this.dialogService.show(this.uploadDocumentDialog, row);
  }

  enableSelectUsers(): void {
    this.selectable = !this.selectable;
  }

  sendUsersNotification(): void {
    this.dialogService.show(this.sendNotificationDialog, {
      mode: SendNotificationMode.USERS,
      users: this.selectedRows
    });
  }

  sendGroupNotification(): void {
    this.dialogService.show(this.sendNotificationDialog, {
      mode: SendNotificationMode.GROUP,
      dicts: this.dicts
    });
  }

  createCalendarEvent(): void {
    this.dialogService.show(this.calendarEventCreateDialog, {
      selectedUsers: this.selectedRows,
      dicts: this.dicts
    });
  }

  getTableData(): Observable<any> {
    return this.userService.getUsersTable();
  }

  getDictsTableData(): Observable<any> {
    return this.userService.getDicts();
  }

  menuItemClick(event: MouseEvent, menuItem: TableActionConfig): void {
    if (menuItem) {
      switch (menuItem.id) {
        case TableActionType.SendOnUsersNotification:
          this.sendUsersNotification();
          break;
        case TableActionType.SendOnGroupNotification:
          this.sendGroupNotification();
          break;
        case TableActionType.CalendarCreateEvent:
          this.createCalendarEvent();
          break;
      }
    }
  }

}
