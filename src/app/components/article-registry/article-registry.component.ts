import {Component, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {IPageChangeEvent, TdPagingBarComponent} from '@covalent/core/paging';
import {ISbDataTableColumn, ISbDataTableSortingOrder} from '../common/sb-data-table/data-table.component';
import {TdDataTableService} from '@covalent/core/data-table';
import {ISbDataTableSortChangeEvent} from '../common/sb-data-table/data-table-column/data-table-column.component';
import {TdLoadingService} from '@covalent/core/loading';
import {DialogService} from '../../services/dialog/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {ArticleEditingDialogComponent} from '../dialog/article-edtiting-dialog/article-editing-dialog.component';
import {DialogMode} from '../dialog/DialogMode';
import {ArticleService} from '../../services/article/article.service';

@Component({
  selector: 'app-article-registry',
  templateUrl: './article-registry.component.html'
})
export class ArticleRegistryComponent {

  @ViewChild(TdPagingBarComponent, {static: true}) pagingBar: TdPagingBarComponent;

  articleDialog: ComponentType<ArticleEditingDialogComponent> = ArticleEditingDialogComponent;

  columns: ISbDataTableColumn[] = [
    {name: 'name', label: 'Название статьи', sortable: true, filter: true, width: 500},
    {name: 'topic', label: 'Тематика', sortable: true, filter: true, width: 200},
    {name: 'language', label: 'Язык статьи', sortable: true, width: 150, format: value => {
        if (this.dicts && this.dicts.languages) {
          return this.dicts.languages.find(it => it.id === value).name;
        } else {
          return value;
        }
      }},
    {name: 'countView', label: 'Число просмотров', sortable: true, width: 70},
    {name: 'createDate', label: 'Дата создания', sortable: true, filter: true, width: 200}
  ];

  filteredData: any[];
  filteredTotal: number;

  loadingKey = 'articleRegistryLoading';

  fromRow = 1;
  currentPage = 1;
  pageSize = 25;
  sortBy = 'name';
  sortOrder: ISbDataTableSortingOrder = ISbDataTableSortingOrder.Descending;

  data: any;
  dicts: any;

  constructor(
    private dataTableService: TdDataTableService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private loadingService: TdLoadingService,
    private dialogService: DialogService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.articleService.getTable().subscribe(it => {
      if (it) {
       this.data = it;
       this.refreshTable();
      }
    });
    this.articleService.getDicts().subscribe(it => {
      if (it) {
        this.dicts = it;
      }
    })
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

  create(): void {
    this.dialogService.show(this.articleDialog, {
      mode: DialogMode.CREATE,
      dicts: this.dicts
    }, '1000px').afterClosed().subscribe(() => this.refreshTable());
  }


}
