import {TdDataTableService} from '@covalent/core/data-table';
import {Input, OnInit, ViewChild} from '@angular/core';
import {IPageChangeEvent, TdPagingBarComponent} from '@covalent/core/paging';
import {TdLoadingService} from '@covalent/core/loading';
import {ISbDataTableColumn, ISbDataTableSortingOrder, SbDataTableComponent} from '../sb-data-table/data-table.component';
import {ISbDataTableSortChangeEvent} from '../sb-data-table/data-table-column/data-table-column.component';
import {Observable} from 'rxjs';

export enum TableActionType {
  SendOnUsersNotification = 'SendOnUsersNotification',
  SendOnGroupNotification = 'SendOnGroupNotification',
  AddRow = 'AddRow',
  CalendarCreateEvent = 'CalendarCreateEvent',
  AttachDocument = 'AttachDocument'
}

export interface TableActionConfig {
  id: TableActionType;
  name: string;
}

export interface AdditionalMenuItem {
  name: string;
  func: any;
  icon: string;
  tooltip?: string;
}

export abstract class TableComponent implements OnInit {

  @ViewChild(TdPagingBarComponent, {static: true}) pagingBar: TdPagingBarComponent;

  @ViewChild(SbDataTableComponent) dataTable: SbDataTableComponent;

  /**
   * Информация о колонках (Обязательно для переопределения!)
   */
  columns: ISbDataTableColumn[] = [];

  data: any[];

  dicts: any;

  _selectable: boolean;

  _multiple: boolean;

  tableName: string;

  @Input('selectable')
  set selectable(selectDefault: boolean) {
    this._selectable = selectDefault;
  }

  get selectable() {
    return this._selectable;
  }

  @Input('multiple')
  set multiple(multiple: boolean) {
    this._multiple = multiple;
  }

  get multiple() {
    return this._multiple;
  }

  // Старый метод выделения уже имеющихся строк. Пока пусть останется
  @Input('defaultSelected')
  defaultSelected: string[];

  filteredData: any[];
  filteredTotal: number;

  @Input() selectedRows: any[];

  @Input() loaderName = 'tableLoading';

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

  additionalMenuItems: AdditionalMenuItem[];

  _iconColumn: boolean;

  @Input('iconColumn')
  set iconColumn(showIcon: boolean) {
    this._iconColumn = showIcon;
  }

  get iconColumn() {
    return this._iconColumn;
  }

  iconImg: string;

  /**
   * Действие которое выполнится при нажатии на кнопку
   */
  iconAction: (row: any, _this: TableComponent) => void;

  @Input('isDialogView') isDialogView: boolean;

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
    this.loadingService.register(this.loaderName);
    this.initTableData();
    // todo Тут подумать. Надо выделять статьи тогда, когда компонент уже загрузился.
    setTimeout(() => {
      if (this.dataTable) {
        this.dataTable.doInitSelection(this.defaultSelected);
      }
    }, 1000);
  }

  initTableData() {
    const dictsObservable = this.getDictsTableData();
    if (dictsObservable) {
      dictsObservable.subscribe(it => {
        this.dicts = it;
        this.refreshTable(true);
      });
    } else {
      this.refreshTable(true);
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

  refreshTable(initRefresh: boolean = false): void {
    if (!initRefresh) {
      this.loadingService.register(this.loaderName);
    }
    this.getTableData().subscribe(it => {
      if (it) {
        let newData: any[] = it;
        this.filteredTotal = newData.length;
        // @ts-ignore
        newData = this.dataTableService.sortData(newData, this.sortBy, this.sortOrder);
        newData = this.dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
        this.filteredData = newData;
        this.loadingService.resolve(this.loaderName);
      }
    });
  }

  enableSelectUsers(): void {
    this.selectable = !this.selectable;
    this.selectedRows = [];
  }

  /**
   * Обработка нажатия кнопки. Переопределить если добавляются пункты меню
   */
  menuItemClick(event: MouseEvent, menuItem: TableActionConfig): void {
    return;
  }

}
