import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';

import {ISbDataTableSortingOrder} from '../data-table.component';

export interface ISbDataTableSortChangeEvent {
  order: ISbDataTableSortingOrder;
  name: string;
}

export interface ISbDataTableFilterEvent {
  name: string;
}

@Component({
  /* tslint:disable-next-line */
  selector: 'th[sb-data-table-column]',
  styleUrls: ['./data-table-column.component.scss'],
  templateUrl: './data-table-column.component.html',
})
export class SbDataTableColumnComponent {
  private _sortOrder: ISbDataTableSortingOrder = ISbDataTableSortingOrder.Ascending;

  isRightAlignFilter = false;

  @ViewChild('columnContent', {read: ElementRef, static: true}) _columnContent: ElementRef;

  get projectedWidth(): number {
    if (this._columnContent && this._columnContent.nativeElement) {
      return (<HTMLElement> this._columnContent.nativeElement).getBoundingClientRect().width;
    }
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return 100;
  }

  /**
   * name?: string
   * Sets unique column [name] for [sortable] events.
   */
  @Input() name = '';

  /**
   * sortable?: boolean
   * Enables sorting events, sort icons and active column states.
   * Defaults to 'false'
   */
  @Input() sortable = false;

  /**
   * active?: boolean
   * Sets column to active state when 'true'.
   * Defaults to 'false'
   */
  @Input() active = false;

  /**
   * numeric?: boolean
   * Makes column follow the numeric data-table specs and sort icon.
   * Defaults to 'false'
   */
  @Input() numeric = false;

  /**
   * if column sort order is present
   */
  @Input() isColumnSortOrder = false;

  /**
   * if column filter opened
   */
  @Input() filters = [];

  /**
   * if column filter opened
   */
  @Input() isFilterOpen = false;

  /**
   * sortOrder?: ['ASC' | 'DESC'] or TdDataTableSortingOrder
   * Sets the sort order of column.
   * Defaults to 'ASC' or TdDataTableSortingOrder.Ascending
   */
  // eslint-disable-next-line accessor-pairs
  @Input('sortOrder')
  set sortOrder(order: 'ASC' | 'DESC') {
    const sortOrder: string = order ? order.toUpperCase() : 'ASC';
    if (sortOrder !== 'DESC' && sortOrder !== 'ASC') {
      throw new Error('[sortOrder] must be empty, ASC or DESC');
    }

    this._sortOrder = sortOrder === 'ASC' ? ISbDataTableSortingOrder.Ascending : ISbDataTableSortingOrder.Descending;
  }

  /**
   * sortChange?: function
   * Event emitted when the column headers are clicked. [sortable] needs to be enabled.
   * Emits an [ITdDataTableSortChangeEvent] implemented object.
   */
  @Output() sortChange: EventEmitter<ISbDataTableSortChangeEvent> = new EventEmitter<ISbDataTableSortChangeEvent>();

  @Output() openFilter: EventEmitter<ISbDataTableFilterEvent> = new EventEmitter<ISbDataTableFilterEvent>();

  @Output() clearFilter: EventEmitter<ISbDataTableFilterEvent> = new EventEmitter<ISbDataTableFilterEvent>();

  @HostBinding('class.mat-clickable')
  get bindClickable(): boolean {
    return this.sortable;
  }

  @HostBinding('class.mat-sortable')
  get bingSortable(): boolean {
    return this.sortable;
  }

  @HostBinding('class.mat-active')
  get bindActive(): boolean {
    return this.active;
  }

  @HostBinding('class.mat-numeric')
  get bindNumeric(): boolean {
    return this.numeric;
  }

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._renderer.addClass(this._elementRef.nativeElement, 'sb-data-table-column');
  }

  /**
   * Listening to click event on host to throw a sort event
   */
  @HostListener('click')
  handleClick(): void {
    if (this.sortable) {
      this.sortChange.emit({name: this.name, order: this._sortOrder});
    }
  }

  isAscending(): boolean {
    return this._sortOrder === ISbDataTableSortingOrder.Ascending;
  }

  isDescending(): boolean {
    return this._sortOrder === ISbDataTableSortingOrder.Descending;
  }

  checkHaveFilters(): boolean {
    return this.filters.length !== 0;
  }

  checkHaveActiveFilters(): boolean {
    return this.filters.filter(item => item.value && item.value.length ? item.value[0] || item.value[1] : item.value).length !== 0;
  }

  handleOpenFilter(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.clientX <= 300) {
        this.isRightAlignFilter = true;
      } else {
        this.isRightAlignFilter = false;
      }
    }
    this.openFilter.emit({name: this.name});
  }

  handleClearFilter(): void {
    this.clearFilter.emit({name: this.name});
  }

}
