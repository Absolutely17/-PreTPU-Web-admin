import {Component, EventEmitter, Output} from '@angular/core';
import {ErrorService} from '../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SystemConfigService} from '../../services/systemConfig/system-config.service';
import {TdLoadingService} from '@covalent/core/loading';
import {ImageService} from "../../services/image/image.service";
import {AppConfig} from "../../app.config";
import {BehaviorSubject} from "rxjs";

export interface SystemParameter {
  id: string;
  key: string;
  value: string;
  name: string;
  description: string;
  disabled: boolean;
  type: SystemParameterType;
}

export enum SystemParameterType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss']
})
export class SystemConfigComponent {

  type = SystemParameterType;

  @Output() save = new EventEmitter();

  types = Object.values(SystemParameterType);

  form: FormGroup;

  params: FormArray = this.formBuilder.array([]);

  dataSource = new BehaviorSubject<AbstractControl[]>([]);

  saving = false;

  formInitialized = false;

  displayedColumns = ['edit', 'name', 'key', 'type', 'value', 'description'];

  loadingKey = 'systemConfigLoading';

  constructor(
    private systemService: SystemConfigService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private errorService: ErrorService,
    private loadingService: TdLoadingService,
    private imageService: ImageService,
    private appConfig: AppConfig
  ) {
    this.form = formBuilder.group({'params': this.params});
    this.initDataSource();
  }

  ngOnInit() {
  }

  initDataSource() {
    this.loadingService.register(this.loadingKey);
    this.systemService.getTable().subscribe(data => {
      data.forEach(it => {
        const control = this.createNewRow(it);
        this.params.push(control);
      });
      this.updateView();
      this.loadingService.resolve(this.loadingKey);
      this.formInitialized = true;
    });
  }

  createNewRow(row?: SystemParameter) {
    if (row) {
      return this.formBuilder.group({
        'id': [row.id, null],
        'key': [row.key, Validators.required],
        'value': [row.value, Validators.required],
        'name': [row.name, Validators.required],
        'description': [row.description, null],
        'disabled': [row.disabled, null],
        'type': [row.type, Validators.required]
      });
    } else {
      return this.formBuilder.group({
        'id': [null, null],
        'key': [null, Validators.required],
        'value': [null, Validators.required],
        'name': [null, Validators.required],
        'disabled': [false, null],
        'type': [SystemParameterType.TEXT, Validators.required]
      });
    }
  }

  updateView() {
    this.dataSource.next(this.params.controls);
  }

  get() {
    return this.form.get('params') as FormArray;
  }

  getByIndex(index: number, name: string) {
    return this.get().at(index).get(name);
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
    this.form.markAsDirty();
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

  selectImage(index: number): void {
    this.loadingService.register(this.loadingKey);
    const file = this.get().at(index).get('value');
    if(/^image\//.test(file.value.type)) {
      this.imageService.upload(file.value).subscribe(it => {
        if(it) {
          file.setValue(it);
          this.loadingService.resolve(this.loadingKey);
        }
      });
    } else {
      this.snackBar.open('Можно загружать только изображения',
        'Закрыть', {duration: 3000}
      );
      this.loadingService.resolve(this.loadingKey);
    }
  }

  openImage(index: number): void {
    const imageId = this.getByIndex(index, 'value').value;
    let image = new Image();
    image.src = this.appConfig.webServiceFullUrl + '/media/img/' + imageId;
    let win = window.open('');
    win.document.write(image.outerHTML);
  }

}
