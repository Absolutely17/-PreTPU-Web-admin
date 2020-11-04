import {Component, ElementRef, HostListener, Input, Renderer2} from '@angular/core';

@Component({
  /* tslint:disable-next-line */
  selector: 'tr[sb-data-table-column-row]',
  styleUrls: ['./data-table-row.component.scss'],
  templateUrl: './data-table-row.component.html',
})
export class SbDataTableColumnRowComponent {
  constructor(protected _elementRef: ElementRef, protected _renderer: Renderer2) {
    this._renderer.addClass(this._elementRef.nativeElement, 'sb-data-table-column-row');
  }
}

@Component({
  /* tslint:disable-next-line */
  selector: 'tr[sb-data-table-row]',
  styleUrls: ['./data-table-row.component.scss'],
  templateUrl: './data-table-row.component.html',
})
export class SbDataTableRowComponent {
  private _selected = false;

  @Input('customCssClass')
  set customCssClass(cssClass: string) {
    if (cssClass) {
      this._renderer.addClass(this._elementRef.nativeElement, cssClass);
    }
  }

  @Input('selected')
  set selected(selected: boolean) {
    if (selected) {
      this._renderer.addClass(this._elementRef.nativeElement, 'td-selected');
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement, 'td-selected');
    }
    this._selected = selected;
  }
  get selected(): boolean {
    return this._selected;
  }

  get height(): number {
    let height = 48;
    if (this._elementRef.nativeElement) {
      height = (<HTMLElement> this._elementRef.nativeElement).getBoundingClientRect().height;
    }
    return height;
  }

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._renderer.addClass(this._elementRef.nativeElement, 'sb-data-table-row');
  }

  /**
   * Listening to click event to explicitly focus the row element.
   */
  @HostListener('click')
  clickListener(): void {
    this.focus();
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
  }
}
