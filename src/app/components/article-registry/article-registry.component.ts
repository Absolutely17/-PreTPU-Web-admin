import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {FormBuilder} from '@angular/forms';
import {ISbDataTableColumn} from '../common/sb-data-table/data-table.component';
import {TdDataTableService} from '@covalent/core/data-table';
import {TdLoadingService} from '@covalent/core/loading';
import {DialogService} from '../../services/dialog/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {ArticleEditingDialogComponent} from '../dialog/article-edtiting-dialog/article-editing-dialog.component';
import {DialogMode} from '../dialog/DialogMode';
import {ArticleService} from '../../services/article/article.service';
import {TableActionConfig, TableActionType, TableComponent} from '../common/table/table.component';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-article-registry',
  templateUrl: '../common/table/table.component.html'
})
export class ArticleRegistryComponent extends TableComponent {

  articleDialog: ComponentType<ArticleEditingDialogComponent> = ArticleEditingDialogComponent;

  columns: ISbDataTableColumn[] = [
    {name: 'name', label: 'Название статьи', sortable: true, filter: true, width: 500},
    {name: 'topic', label: 'Тематика', sortable: true, filter: true, width: 200},
    {
      name: 'language', label: 'Язык статьи', sortable: true, width: 150, format: value => {
        if (this.dicts && this.dicts.languages) {
          return this.dicts.languages.find(it => it.id === value).name;
        } else {
          return value;
        }
      }
    },
    {name: 'countView', label: 'Число просмотров', sortable: true, width: 70},
    {name: 'createDate', label: 'Дата создания', sortable: true, filter: true, width: 200}
  ];

  menuItemList = [{
    id: TableActionType.AddRow,
    name: 'Создать статью'
  }
  ];

  loadingKey = 'articleRegistryLoading';


  sortBy = 'name';

  iconColumn = true;

  iconImg = 'subdirectory_arrow_right';

  iconAction = this.open;


  constructor(
    protected dataTableService: TdDataTableService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    protected loadingService: TdLoadingService,
    private dialogService: DialogService,
    private articleService: ArticleService
  ) {
    super(dataTableService, loadingService);
  }

  getTableData(): Observable<any> {
    return this.articleService.getTable();
  }

  getDictsTableData(): Observable<any> {
    return this.articleService.getDicts();
  }

  menuItemClick(event: MouseEvent, menuItem: TableActionConfig): void {
    if (menuItem) {
      switch (menuItem.id) {
        case TableActionType.AddRow:
          this.create();
          break;
      }
    }
  }

  create(): void {
    this.dialogService.show(this.articleDialog, {
      mode: DialogMode.CREATE,
      dicts: this.dicts
    }, '1000px').afterClosed().subscribe(() => this.refreshTable());
  }

  open(): void {
    console.log('TODO OPEN');
  }

}
