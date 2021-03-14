import {Component} from '@angular/core';
import {ISbDataTableColumn} from '../common/sb-data-table/data-table.component';
import {TableActionConfig, TableActionType, TableComponent} from '../common/table/table.component';
import {TdDataTableService} from '@covalent/core/data-table';
import {DomSanitizer} from '@angular/platform-browser';
import {FormBuilder} from '@angular/forms';
import {TdLoadingService} from '@covalent/core/loading';
import {DialogService} from '../../services/dialog/dialog.service';
import {Observable} from 'rxjs';
import {LanguageService} from '../../services/language/language.service';
import {LanguageCreateDialogComponent} from '../dialog/language-create-dialog/language-create-dialog.component';

export interface Language {
  id?: string;
  shortName: string;
  name: string;
  imageId?: string;
}

@Component({
  selector: 'app-language-registry',
  templateUrl: '../common/table/table.component.html'
})
export class LanguageRegistryComponent extends TableComponent {

  columns: ISbDataTableColumn[] = [
    {name: 'name', label: 'Язык', sortable: true, filter: true, width: 200},
    {name: 'shortName', label: 'Аббревиатура', sortable: true, filter: true, width: 100},
    {name: 'countUsers', label: 'Число пользователей', sortable: true, filter: true, width: 100}
  ];

  menuItemList = [{
    id: TableActionType.AddRow,
    name: 'Добавить язык'
  }
  ];

  sortBy = 'shortName';

  tableName = 'Реестр языков';

  iconColumn = true;

  iconImg = 'remove';

  iconTooltip = 'Удалить';

  iconColor = 'warn';

  iconAction = this.deleteLanguage;

  constructor(
    protected dataTableService: TdDataTableService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    protected loadingService: TdLoadingService,
    private dialogService: DialogService,
    private languageService: LanguageService
  ) {
    super(dataTableService, loadingService);
  }

  getTableData(): Observable<any> {
    return this.languageService.getTable();
  }

  getDictsTableData(): Observable<any> {
    return;
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
    this.dialogService.show(LanguageCreateDialogComponent, {}, '500px').afterClosed().subscribe(() => this.refreshTable());
  }

  deleteLanguage(row: any, _this: LanguageRegistryComponent): void {
    _this.delete(row.id);
  }

  delete(id: string): void {
   this.dialogService.showConfirmDialog({
     title: 'Удаление языка',
     message: 'Вы уверены, что хотите удалить язык из системы?',
     acceptButton: 'Удалить',
     cancelButton: 'Отмена'
   }).afterClosed().subscribe(it => {
     if (it) {
       this.languageService.delete(id).subscribe(() => this.refreshTable());
     }
   })
  }

}
