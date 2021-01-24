import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ErrorService} from '../../../services/error/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TdLoadingService} from '@covalent/core/loading';
import {LanguageService} from '../../../services/language/language.service';
import {Language} from '../../language-registry/language-registry.component';
import {AutocompleteSelectComponent} from '../../common/autocomplete-select/autocomplete-select.component';

@Component({
  selector: 'app-language-create-dialog',
  templateUrl: './language-create-dialog.component.html'
})
export class LanguageCreateDialogComponent implements OnInit {

  @ViewChild(AutocompleteSelectComponent) languageSelect: AutocompleteSelectComponent;

  loaderName = 'languageCreateLoading';

  availableLanguages: Language[];

  constructor(
    private dialogRef: MatDialogRef<LanguageCreateDialogComponent>,
    private errorService: ErrorService,
    protected snackBar: MatSnackBar,
    private loadingService: TdLoadingService,
    private languageService: LanguageService
  ) {

  }

  ngOnInit(): void {
    this.loadingService.register(this.loaderName);
    this.languageService.getAllAvailableForCreate().subscribe(it => {
      this.loadingService.resolve(this.loaderName);
      if (it) {
        this.availableLanguages = it;
      } else {
        this.snackBar.open('Не получены данные с веб-сервиса. Повторите попытку.', 'Закрыть', {duration: 3000});
        this.dialogRef.close();
      }
    }, error => this.errorService.handleServiceError(error));
  }


  cancel(): void {
    this.dialogRef.close();
  }

  accept(): void {
    const selectedLang = this.languageSelect.control.value;
    const createRequest = {
      id: selectedLang,
      // todo сделать изображения
      imageId: null
    };
    this.languageService.create(createRequest).subscribe(() => {
      this.snackBar.open('Язык успешно добавлен', 'Закрыть', {duration: 3000});
    }, error => {
      this.errorService.handleServiceError(error);
    }).add(() => this.dialogRef.close());
  }

  @HostListener('window:keyup.esc')
  onKeyUp(): void {
    this.cancel();
  }

}


