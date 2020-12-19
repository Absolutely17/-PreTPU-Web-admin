import {FormControl, ValidatorFn, Validators} from '@angular/forms';
import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Component({
  selector: 'autocomplete-select',
  templateUrl: 'autocomplete-select.component.html'
})
export class AutocompleteSelectComponent implements OnInit {

  control = new FormControl(null, null);

  _options: any[];

  _title: string;

  _validator: ValidatorFn;

  filteredOptions = new BehaviorSubject<any[]>([]);

  @Input('validator')
  set validator(validator: ValidatorFn) {
    this._validator = validator;
    this.control.setValidators([Validators.required, this._validator]);
  }

  @Input('title')
  set title(title: string) {
    this._title = title;
  }

  @Input('options')
  set options(options: any[]) {
    this._options = options;
    this.filteredOptions.next(this._options);
  }

  ngOnInit(): void {
    this.control.valueChanges.subscribe(it => this._filter(it));
  }

  private _filter(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredOptions.next(this._options.filter(option => option.name.toLowerCase().includes(filterValue)));
  }

  getError(): string {
    const error = this.control.errors;
    if (error) {
      if (error.required) {
        return 'Обязательно для заполнения';
      }
      if (error.requireMatch) {
        return 'Необходимо выбрать значение из списка';
      }
    }
  }

}
