import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CovalentCommonModule} from '@covalent/core/common';
import {MatToolbar, MatToolbarModule} from '@angular/material/toolbar';
import {MatMenu, MatMenuModule} from '@angular/material/menu';
import {MatDivider, MatDividerModule} from '@angular/material/divider';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardContent, MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {CovalentSearchModule} from '@covalent/core/search';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTreeModule} from '@angular/material/tree';
import {CovalentVirtualScrollModule} from '@covalent/core/virtual-scroll';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {CovalentFileModule} from '@covalent/core/file';
import {MatPaginatorModule} from '@angular/material/paginator';
import {CovalentStepsModule} from '@covalent/core/steps';
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, MatPseudoCheckboxModule} from '@angular/material/core';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {MatGridListModule} from '@angular/material/grid-list';
import {CovalentExpansionPanelModule} from '@covalent/core/expansion-panel';
import {MatSortModule} from '@angular/material/sort';
import {CovalentPagingModule} from '@covalent/core/paging';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTableModule} from '@angular/material/table';
import {CovalentLoadingModule} from '@covalent/core/loading';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {CovalentDataTableModule} from '@covalent/core/data-table';
import {CovalentBreadcrumbsModule} from '@covalent/core/breadcrumbs';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatStepperModule} from '@angular/material/stepper';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {MatChipsModule} from '@angular/material/chips';
import {CovalentMenuModule} from '@covalent/core/menu';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CovalentNotificationsModule} from '@covalent/core/notifications';
import {CovalentMessageModule} from '@covalent/core/message';
import {ReactiveFormsModule} from '@angular/forms';

const commonModules = [
  CommonModule,
  DragDropModule,
  ReactiveFormsModule,
  MatCheckboxModule,
  MatButtonModule,
  MatInputModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatRadioModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatGridListModule,
  MatCardModule,
  MatStepperModule,
  MatTabsModule,
  MatExpansionModule,
  MatButtonToggleModule,
  MatChipsModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatPseudoCheckboxModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatTreeModule,
  CovalentCommonModule,
  CovalentDialogsModule,
  CovalentMenuModule,
  CovalentNotificationsModule,
  CovalentVirtualScrollModule,
  CovalentExpansionPanelModule,
  CovalentLayoutModule,
  CovalentStepsModule,
  CovalentSearchModule,
  CovalentDataTableModule,
  CovalentPagingModule,
  CovalentFileModule,
  CovalentMessageModule,
  CovalentLoadingModule,
  CovalentBreadcrumbsModule,
  CovalentExpansionPanelModule
];

@NgModule({
  imports: [
    ...commonModules
  ],
  exports: [
    ...commonModules
  ]
})
export class CommonImportsModule {

}
