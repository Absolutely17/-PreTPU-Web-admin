import {TdDataTableService} from '@covalent/core/data-table';
import {Component} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {DialogService} from '../../services/dialog/dialog.service';
import {TdLoadingService} from '@covalent/core/loading';
import {ISbDataTableColumn} from '../common/sb-data-table/data-table.component';
import {TableActionConfig, TableActionType, TableComponent} from '../common/table/table.component';
import {Observable} from 'rxjs';
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
      name: 'languageId', label: 'Язык', sortable: true, filter: true, width: 200
    },
    {
      name: 'activeFcmToken', label: 'Доступны уведомления', sortable: true, width: 150
    }
  ];

  menuItemList = [
    {
      id: TableActionType.AddRow,
      name: 'Создать пользователя'
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

  protected customizeTableRows(tableRows: any[]): any[] {
    tableRows.forEach(f => {
      if (f.activeFcmToken) {
        f.activeFcmToken = "Да";
      } else {
        f.activeFcmToken = "Нет";
      }
      if (f.languageId && this.dicts && this.dicts.languages) {
        f.languageId = this.dicts.languages.find(it => it.id === f.languageId).name;
      }
    });
    return tableRows;
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
