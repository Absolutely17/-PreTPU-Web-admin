import {FormControl, Validators} from '@angular/forms';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';


@Component({
  selector: 'autocomplete-select',
  templateUrl: 'autocomplete-select.component.html',
  styleUrls: ['autocomplete-select.component.scss']
})
export class AutocompleteSelectComponent implements OnInit, OnChanges {

  control = new FormControl(null, [Validators.required]);

  filteredOptions = [];

  selectedValue = [];

  selectAllChecked = false;

  displayString = '';

  @Input() defaultSelected: any;

  @Input()
  labelCount = 5;
  @Input()
  multiple = false;
  @Input()
  title: string;

  _options: any[];

  @Input('options')
  set options(options: any[]) {
    this.filteredOptions = options;
    this._options = options;
  }

  @Input()
  value = 'id';
  @Input()
  display = 'value';
  @Input()
  required = false;

  @Output()
  selectionChange: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    if (this.required) {
      this.control.setValidators(Validators.required);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.defaultSelected && changes.defaultSelected.currentValue) {
      const currentValue = changes.defaultSelected.currentValue;
      this.doDefaultSelect(currentValue);
    }
  }

  private doDefaultSelect(value: any) {
    if (value instanceof Array) {
      this.selectedValue = this._options.filter(opt => value.includes(opt.id)).map(opt => opt.id);
    } else {
      this.selectedValue = this._options.filter(opt => opt.id === value).map(opt => opt.id);
    }
  }

  toggleSelectAll(val) {
    if (val.checked) {
      this.filteredOptions.forEach(option => {
        if (!this.selectedValue.includes(option[this.value])) {
          this.selectedValue = this.selectedValue.concat([option[this.value]]);
        }
      });
    } else {
      const filteredValues = this.getFilteredOptionsValues();
      this.selectedValue = this.selectedValue.filter(
        item => !filteredValues.includes(item)
      );
    }
    this.selectionChange.emit(this.selectedValue);
  };

  filterItem(value) {
    this.filteredOptions = this._options.filter(
      item => item[this.display].toLowerCase().startsWith(value.toLowerCase())
    );
    this.selectAllChecked = true;
    this.filteredOptions.forEach(item => {
      if (!this.selectedValue.includes(item[this.value])) {
        this.selectAllChecked = false;
      }
    });
  }

  hideOption(option) {
    return !(this.filteredOptions.indexOf(option) > -1);
  }

  getFilteredOptionsValues() {
    const filteredValues = [];
    this.filteredOptions.forEach(option => {
      filteredValues.push(option[this.value]);
    });
    return filteredValues;
  }

  onDisplayString() {
    this.displayString = '';
    if (this.selectedValue && this.selectedValue.length) {
      let displayOption = [];
      if (this.multiple) {
        for (let i = 0; i < this.labelCount; i++) {
          const selectValue = this._options.filter(
            option => option[this.value] === this.selectedValue[i]
          );
          if (selectValue.length) {
            displayOption[i] = selectValue[0];
          }
        }
        if (displayOption.length) {
          for (let i = 0; i < displayOption.length; i++) {
            this.displayString = displayOption.map(it => it[this.display]).join(', ');
          }
          if (this.selectedValue.length > this.labelCount) {
            this.displayString += ` (+ ${this.selectedValue.length - this.labelCount})`;
          }
        }
      } else {
        displayOption = this._options.filter(
          option => option[this.value] === this.selectedValue
        );
        if (displayOption.length) {
          this.displayString = displayOption[0][this.display];
        }
      }
    }
    return this.displayString;
  }

  onSelectionChange(val) {
    const filteredValues = this.getFilteredOptionsValues();
    let count = 0;
    if (this.multiple) {
      this.selectedValue.filter(item => {
        if (filteredValues.includes(item)) {
          count++;
        }
      });
      this.selectAllChecked = count === this.filteredOptions.length;
    }
    this.selectedValue = val.value;
    this.selectionChange.emit(this.selectedValue);
  }

  getError(): string {
    const error = this.control.errors;
    if (error) {
      if (error.required) {
        return 'Обязательно для заполнения';
      }
    }
  }

}
