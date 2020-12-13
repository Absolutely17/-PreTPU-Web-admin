import {Component, EventEmitter, Output} from '@angular/core';
import {ErrorService} from '../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SystemConfigService} from '../../services/systemConfig/system-config.service';
import {BehaviorSubject} from 'rxjs';

export interface SystemParameter {
  id: string;
  key: string;
  value: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss']
})
export class SystemConfigComponent {


  @Output() save = new EventEmitter();

  form: FormGroup;

  dataSource = new BehaviorSubject<AbstractControl[]>([]);

  saving = false;

  formInitialized = false;

  params: FormArray = this.formBuilder.array([]);

  displayedColumns = ['edit', 'name', 'key', 'value', 'description'];

  constructor(
    private systemService: SystemConfigService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private errorService: ErrorService,
  ) {
    this.form = formBuilder.group({'params': this.params});
    this.initDataSource();
  }

  ngOnInit() {
  }

  initDataSource() {
    this.systemService.getTable().subscribe(data => {
      data.forEach(it => {
        const control = this.createNewRow(it);
        this.params.push(control);
      });
      this.updateView();
    });
    this.formInitialized = true;

  }

  createNewRow(row?: SystemParameter) {
    if (row) {
      return this.formBuilder.group({
        'id': [row.id, null],
        'key': [row.key, Validators.required],
        'value': [row.value, Validators.required],
        'name': [row.name, Validators.required],
        'description': [row.description, null]
      });
    } else {
      return this.formBuilder.group({
        'id': [null, null],
        'key': [null, Validators.required],
        'value': [null, Validators.required],
        'name': [null, Validators.required],
        'description': [null, null]
      });
    }
  }

  updateView() {
    this.dataSource.next(this.params.controls);
  }

  get() {
    return this.form.get('params') as FormArray;
  }

  isInvalid(controlName: string, index?: number): boolean {
    const control = this.get().at(index).get(controlName);
    return control && control.invalid || false;
  }

  getError(name: string, index: number) {
    const error = this.get().at(index).get(name).errors;
    if (error) {
      if (error.required) {
        return 'Обязательно для заполнения';
      }
      if (error.server) {
        return error.server;
      }
    }
  }

  addRow() {
    this.params.push(this.createNewRow());
    this.updateView();
  }


  removeRow(index: number) {
    this.get().removeAt(index);
    this.updateView();
  }

  onSave() {
    const sendData = this.get().getRawValue();
    this.systemService.editConfig(sendData).subscribe(data => {
      this.form.markAsPristine();
      this.snackBar.open('Настройки изменены', 'Закрыть', {duration: 3000});
    }, error => {
      this.errorService.handleFormError(error, this.form);
    });
  }

  resetValues() {
    this.saving = false;
    this.initDataSource();
    this.form.markAsPristine();
  }

}
