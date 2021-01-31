import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectorRef,
  forwardRef,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TemplatePortalDirective } from '@angular/cdk/portal';
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl} from '@angular/forms';

import { ICanDisable, mixinDisabled, IControlValueAccessor, mixinControlValueAccessor } from '@covalent/core/common';
import {MatSnackBar} from "@angular/material/snack-bar";

@Directive({
  selector: '[td-file-input-label]ng-template',
})
export class TdFileInputLabelDirective extends TemplatePortalDirective {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}

export class TdFileInputBase {
  constructor(public _changeDetectorRef: ChangeDetectorRef) {}
}

/* tslint:disable-next-line */
export const _TdFileInputMixinBase = mixinControlValueAccessor(mixinDisabled(TdFileInputBase));

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TdFileInputComponent),
      multi: true,
    },
  ],
  selector: 'td-custom-file-input',
  inputs: ['disabled', 'value'],
  styleUrls: ['./file-input.component.scss'],
  templateUrl: './file-input.component.html',
})
export class TdFileInputComponent extends _TdFileInputMixinBase implements IControlValueAccessor, ICanDisable {
  private _multiple: boolean = false;

  /** The native `<input type="file"> element */
  @ViewChild('fileInput', { static: true }) _inputElement: ElementRef;
  get inputElement(): HTMLInputElement {
    return this._inputElement.nativeElement;
  }

  /**
   * color?: 'accent' | 'primary' | 'warn'
   * Sets button color. Uses same color palette accepted as [MatButton].
   */
  @Input() color: 'accent' | 'primary' | 'warn';

  /**
   * Max size file in Mb
   */
  @Input() maxSize: number;

  @Input() showFileNameInput: boolean;

  /**
   * multiple?: boolean
   * Sets if multiple files can be dropped/selected at once in [TdFileInputComponent].
   */
  @Input('multiple')
  set multiple(multiple: boolean) {
    this._multiple = coerceBooleanProperty(multiple);
  }
  get multiple(): boolean {
    return this._multiple;
  }

  /**
   * accept?: string
   * Sets files accepted when opening the file browser dialog.
   * Same as 'accept' attribute in <input/> element.
   */
  @Input() accept: string;

  /**
   * select?: function
   * Event emitted a file is selected
   * Emits a [File | FileList] object.
   */
  @Output() select: EventEmitter<File | FileList> = new EventEmitter<File | FileList>();

  fileInputName: FormControl;

  constructor(private _renderer: Renderer2, _changeDetectorRef: ChangeDetectorRef, private snackbar: MatSnackBar) {
    super(_changeDetectorRef);
    this.fileInputName = new FormControl(null, null);
  }

  /**
   * Method executed when a file is selected.
   */
  handleSelect(files: File | FileList): void {
    let filesName;
    let summaryFilesSize;
    if (files instanceof File) {
      filesName = files.name;
      summaryFilesSize = files.size;
    } else if (files instanceof FileList) {
      filesName = Array.from(files).map(it => it.name).join(', ');
      Array.from(files).forEach(it => summaryFilesSize+= it.size);
    }
    if (this.maxSize && summaryFilesSize > this.maxSize * 1024 * 1024) {
      this.snackbar.open(`Превышен размер файла. Допустимый размер файла ${this.maxSize}`, 'Закрыть', {duration: 3000});
    } else {
      this.fileInputName.patchValue(filesName);
      this.writeValue(files);
      this.select.emit(files);
    }
  }

  /**
   * Used to clear the selected files from the [TdFileInputComponent].
   */
  clear(): void {
    this.writeValue(undefined);
    this._renderer.setProperty(this.inputElement, 'value', '');
  }

  /** Method executed when the disabled value changes */
  onDisabledChange(v: boolean): void {
    if (v) {
      this.clear();
    }
  }
  /**
   * Sets disable to the component. Implemented as part of ControlValueAccessor.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
