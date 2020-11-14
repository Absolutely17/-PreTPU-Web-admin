import {ITdDataTableColumn, ITdDataTableSortChangeEvent, TdDataTableService, TdDataTableSortingOrder} from '@covalent/core/data-table';
import {Component, OnInit, ViewChild} from '@angular/core';
import {TdDialogService} from '@covalent/core/dialogs';
import {UserService} from '../../services/user/user.service';
import {IPageChangeEvent, TdPagingBarComponent} from '@covalent/core/paging';
import {DialogService} from '../../services/dialog/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {UploadDocumentDialogComponent} from '../dialog/upload-document-dialog/upload-document-dialog.component';
import {SendNotificationDialogComponent, SendNotificationMode} from '../dialog/send-notification-dialog/send-notification-dialog.component';
import {TdLoadingService} from '@covalent/core/loading';
import {ISbDataTableColumn, ISbDataTableSortingOrder} from '../common/sb-data-table/data-table.component';
import {ISbDataTableSortChangeEvent} from '../common/sb-data-table/data-table-column/data-table-column.component';

@Component({
  selector: 'app-users-registry',
  templateUrl: './users-registry.component.html'
})
export class UsersRegistryComponent implements OnInit {

  @ViewChild(TdPagingBarComponent, {static: true}) pagingBar: TdPagingBarComponent;

  uploadDocumentDialog: ComponentType<UploadDocumentDialogComponent> = UploadDocumentDialogComponent;

  sendNotificationDialog: ComponentType<SendNotificationDialogComponent> = SendNotificationDialogComponent;

  columns: ISbDataTableColumn[] = [
    {name: 'firstName', label: 'Имя', sortable: true, filter: true, width: 200},
    {name: 'lastName', label: 'Фамилия', sortable: true, filter: true, width: 200},
    {name: 'email', label: 'Электронная почта', sortable: true, filter: true, width: 300},
    {name: 'gender', label: 'Пол', sortable: true, filter: true, width: 200},
    {name: 'groupName', label: 'Номер группы', sortable: true, filter: true, width: 200},
    {name: 'languageId', label: 'Язык', sortable: true, filter: true, format: value => {
        if (this.dicts && this.dicts.languages) {
          return this.dicts.languages.find(it => it.id === value).name;
        } else {
          return value;
        }
      }, width: 200},
    {name: 'uploadDocument', label: '', sortable: true, filter: true, width: 100},
  ];

  data: any[];

  dicts: any;

  selectable = false;

  filteredData: any[];
  filteredTotal: number;
  selectedRows: any[] = [];

  loadingKey = 'userRegistryLoading';

  fromRow = 1;
  currentPage = 1;
  pageSize = 25;
  sortBy = 'firstName';
  sortOrder: ISbDataTableSortingOrder = ISbDataTableSortingOrder.Descending;

  constructor(
    private dataTableService: TdDataTableService,
    private userService: UserService,
    private dialogService: DialogService,
    private loadingService: TdLoadingService
  ) {
  }

  ngOnInit(): void {
    this.userService.getUsersTable().subscribe(it => {
      this.data = it;
      this.refreshTable();
    });
    this.userService.getDicts().subscribe(it => {
      if (it) {
        this.dicts = it;
      }
    });
  }

  sort(sortEvent: ISbDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.refreshTable();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.refreshTable();
  }

  refreshTable(): void {
    this.loadingService.register(this.loadingKey);
    let newData: any[] = this.data;
    this.filteredTotal = newData.length;
    // @ts-ignore
    newData = this.dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this.dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
    this.loadingService.resolve(this.loadingKey);
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

}
