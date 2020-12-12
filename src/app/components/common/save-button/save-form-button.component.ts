import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {S} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-save-form-button',
  templateUrl: './save-form-button.component.html'
})
export class SaveFormButtonComponent {

  @Input() disableSave: boolean;
  @Input() savingForm: boolean;
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor() {
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.keyCode === S) {

      this.save.emit();
      event.stopPropagation();
      event.preventDefault();

    }
  }
}
