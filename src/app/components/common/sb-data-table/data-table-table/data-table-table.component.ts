import { Component, Renderer2, ElementRef } from '@angular/core';

@Component({
  /* tslint:disable-next-line */
  selector: 'table[sb-data-table]',
  styleUrls: ['./data-table-table.component.scss'],
  templateUrl: './data-table-table.component.html',
})
export class SbDataTableTableComponent {
  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._renderer.addClass(this._elementRef.nativeElement, 'sb-data-table');
  }
}
