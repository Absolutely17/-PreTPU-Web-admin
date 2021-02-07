import {TableActionConfig, TableActionType, TableComponent} from "../common/table/table.component";
import {Component} from "@angular/core";
import {ISbDataTableColumn} from "../common/sb-data-table/data-table.component";
import {TdDataTableService} from "@covalent/core/data-table";
import {TdLoadingService} from "@covalent/core/loading";
import {DialogService} from "../../services/dialog/dialog.service";
import {Observable} from "rxjs";
import {StudyGroupService} from "../../services/studyGroup/study-group.service";
import {DialogMode} from "../dialog/dialog-mode";
import {StudyGroupDialogComponent} from "../dialog/study-group-dialog/study-group-dialog.component";

@Component({
  selector: 'app-study-group-registry',
  templateUrl: '../common/table/table.component.html'
})
export class StudyGroupRegistryComponent extends TableComponent {

  columns: ISbDataTableColumn[] = [
    {name: 'name', label: 'Название группы', sortable: true, filter: true, width: 200},
    {name: 'internalID', label: 'Внутренний номер группы', sortable: true, filter: true, width: 200}
  ];

  menuItemList = [
    {
      id: TableActionType.AddRow,
      name: 'Добавить новую группу'
    }
  ];

  iconColumn = true;

  iconImg = 'edit';

  iconAction = this.editIconAction;

  sortBy = 'name';

  tableName = 'Реестр учебных групп';

  constructor(
    protected dataTableService: TdDataTableService,
    protected loadingService: TdLoadingService,
    private studyGroupService: StudyGroupService,
    private dialogService: DialogService
  ) {
    super(dataTableService, loadingService);
  }

  getTableData(): Observable<any> {
    return this.studyGroupService.getTable();
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

  editIconAction(row: any, _this: StudyGroupRegistryComponent): void {
    _this.edit(row.id);
  }

  edit(id: string): void {
    this.dialogService.show(StudyGroupDialogComponent, {
      groupId: id,
      mode: DialogMode.EDIT
    }, '500px').afterClosed().subscribe(() => this.refreshTable());
  }

  create(): void {
    this.dialogService.show(StudyGroupDialogComponent, {
      mode: DialogMode.CREATE
    }, '500px').afterClosed().subscribe(() => this.refreshTable());
  }

}
