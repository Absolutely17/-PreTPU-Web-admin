import {TdDataTableService} from '@covalent/core/data-table';
import {OnInit, ViewChild} from '@angular/core';
import {IPageChangeEvent, TdPagingBarComponent} from '@covalent/core/paging';
import {TdLoadingService} from '@covalent/core/loading';
import {ISbDataTableColumn, ISbDataTableSortingOrder} from '../sb-data-table/data-table.component';
import {ISbDataTableSortChangeEvent} from '../sb-data-table/data-table-column/data-table-column.component';
import {Observable} from 'rxjs';

export enum TableActionType {
  SendOnUsersNotification = 'SendOnUsersNotification',
  SendOnGroupNotification = 'SendOnGroupNotification',
  AddRow = 'AddRow'
}

export interface TableActionConfig {
  id: TableActionType;
  name: string;
}

export interface AdditionalMenuItem {
  name: string;
  func: any;
  icon: string;
}

export abstract class TableComponent implements OnInit {

  @ViewChild(TdPagingBarComponent, {static: true}) pagingBar: TdPagingBarComponent;

  /**
   * Информация о колонках (Обязательно для переопределения!)
   */
  columns: ISbDataTableColumn[] = [];

  data: any[];

  dicts: any;

  selectable = false;

  filteredData: any[];
  filteredTotal: number;
  selectedRows: any[] = [];

  /**
   * Переопределить
   */
  loadingKey = 'tableLoader';

  fromRow = 1;
  currentPage = 1;
  pageSize = 25;

  /**
   * Переопределить
   */
  sortBy = 'name';

  sortOrder: ISbDataTableSortingOrder = ISbDataTableSortingOrder.Descending;

  /**
   * Список функций
   */
  menuItemList: TableActionConfig[] = [];

  /**
   * Текст для кнопки с включением возможности выбора объектов таблицы
   */
  textSelectableButton: string;

  /**
   * Нужна ли кнопка с выбором объектов таблицы
   */
  selectableButton: boolean;

  additionalMenuItems: AdditionalMenuItem[];

  iconColumn: boolean;

  iconImg: string;

  /**
   * Действие которое выполнится при нажатии на кнопку
   */
  iconAction: (row: any, _this: TableComponent) => void;

  constructor(
    protected dataTableService: TdDataTableService,
    protected loadingService: TdLoadingService
  ) {
  }

  /**
   * Получения табличных данных (обязательно переопределить)
   */
  abstract getTableData(): Observable<any>;

  /**
   * Получение дополнительных данных (переопределить если нужно)
   */
  abstract getDictsTableData(): Observable<any>;

  ngOnInit(): void {
    this.loadingService.register(this.loadingKey);
    this.getTableData().subscribe(it => {
      if (it) {
        this.data = it;
        this.refreshTable();
      }
    });
    const dictsObservable = this.getDictsTableData();
    if (dictsObservable) {
      dictsObservable.subscribe(it => {
        this.dicts = it;
        this.loadingService.resolve(this.loadingKey);
      });
    } else {
      this.loadingService.resolve(this.loadingKey);
    }
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
    this.getTableData().subscribe(it => {
      if (it) {
        this.data = it;
      }
    });
    let newData: any[] = this.data;
    this.filteredTotal = newData.length;
    // @ts-ignore
    newData = this.dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this.dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  enableSelectUsers(): void {
    this.selectable = !this.selectable;
  }

  /**
   * Обработка нажатия кнопки. Переопределить если добавляются пункты меню
   */
  menuItemClick(event: MouseEvent, menuItem: TableActionConfig): void {
    return;
  }

}
