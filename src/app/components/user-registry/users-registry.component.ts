import {TdDataTableService} from '@covalent/core/data-table';
import {Component} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {DialogService} from '../../services/dialog/dialog.service';
import {UploadDocumentDialogComponent} from '../dialog/upload-document-dialog/upload-document-dialog.component';
import {TdLoadingService} from '@covalent/core/loading';
import {ISbDataTableColumn} from '../common/sb-data-table/data-table.component';
import {TableActionConfig, TableActionType, TableComponent} from '../common/table/table.component';
import {Observable} from 'rxjs';
import {CalendarCreateEventDialogComponent} from '../dialog/calendar-create-event-dialog/calendar-create-event-dialog.component';
import {DialogMode} from "../dialog/dialog-mode";
import {UserEditDialogComponent} from "../dialog/user-edit-dialog/user-edit-dialog.component";

@Component({
  selector: 'app-users-registry',
  templateUrl: '../common/table/table.component.html'
})
export class UsersRegistryComponent extends TableComponent {

  columns: ISbDataTableColumn[] = [
    {name: 'firstName', label: 'Имя', sortable: true, filter: true, width: 200},
    {name: 'lastName', label: 'Фамилия', sortable: true, filter: true, width: 200},
    {name: 'email', label: 'Электронная почта', sortable: true, filter: true, width: 300},
    {name: 'gender', label: 'Пол', sortable: true, filter: true, width: 200},
    {name: 'groupName', label: 'Номер группы', sortable: true, filter: true, width: 200},
    {
      name: 'languageId', label: 'Язык', sortable: true, filter: true, format: value => {
        if(this.dicts && this.dicts.languages) {
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
    }
  ];

  menuItemList = [
    {
      id: TableActionType.AddRow,
      name: 'Создать пользователя'
    },
    {
      id: TableActionType.CalendarCreateEvent,
      name: 'Добавить событие'
    },
    {
      id: TableActionType.AttachDocument,
      name: 'Прикрепить документ'
    }
  ];

  multiple = true;

  sortBy = 'firstName';

  iconColumn = true;

  iconImg = 'edit';

  iconAction = this.editIconAction;

  tableName = 'Реестр пользователей';

  constructor(
    protected dataTableService: TdDataTableService,
    protected loadingService: TdLoadingService,
    private userService: UserService,
    private dialogService: DialogService
  ) {
    super(dataTableService, loadingService);
  }


  uploadDocument(): void {
    this.dialogService.show(UploadDocumentDialogComponent);
  }

  createCalendarEvent(): void {
    this.dialogService.show(CalendarCreateEventDialogComponent, {
      dicts: this.dicts,

    }, '', '', true);
  }

  getTableData(): Observable<any> {
    return this.userService.getUsersTable();
  }

  getDictsTableData(): Observable<any> {
    return this.userService.getDicts();
  }

  menuItemClick(event: MouseEvent, menuItem: TableActionConfig): void {
    if(menuItem) {
      switch(menuItem.id) {
        case TableActionType.AddRow:
          this.createUser();
          break;
        case TableActionType.CalendarCreateEvent:
          this.createCalendarEvent();
          break;
        case TableActionType.AttachDocument:
          this.uploadDocument();
          break;
      }
    }
  }

  editIconAction(row: any, _this: UsersRegistryComponent): void {
    _this.edit(row);
  }

  createUser() {
    this.dialogService.show(UserEditDialogComponent, {
      mode: DialogMode.CREATE,
      dict: this.dicts
    }, '1000px').afterClosed().subscribe(it => {
      if(it) {
        this.refreshTable();
      }
    })
  }

  edit(user: any) {
    this.dialogService.show(UserEditDialogComponent, {
      currentUser: user,
      mode: DialogMode.EDIT,
      dict: this.dicts
    }, '1000px').afterClosed().subscribe(it => {
      if(it) {
        this.refreshTable();
      }
    });
  }

}
