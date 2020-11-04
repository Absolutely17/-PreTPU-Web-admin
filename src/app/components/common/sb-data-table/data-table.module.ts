import {Type} from '@angular/core';

import {SbDataTableComponent} from './data-table.component';
import {SbDataTableColumnComponent} from './data-table-column/data-table-column.component';
import {SbDataTableCellComponent} from './data-table-cell/data-table-cell.component';
import {SbDataTableColumnRowComponent, SbDataTableRowComponent} from './data-table-row/data-table-row.component';
import {SbDataTableTableComponent} from './data-table-table/data-table-table.component';
import {SbDataTableTemplateDirective} from './directives/data-table-template.directive';

export const sbDataTableComponents: Type<any>[] = [
  SbDataTableComponent,
  SbDataTableTemplateDirective,

  SbDataTableColumnComponent,
  SbDataTableCellComponent,
  SbDataTableRowComponent,
  SbDataTableColumnRowComponent,
  SbDataTableTableComponent
];
