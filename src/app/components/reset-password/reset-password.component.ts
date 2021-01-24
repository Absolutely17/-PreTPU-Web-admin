import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {TdLoadingService} from "@covalent/core/loading";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;

  resetToken: string;

  passwordFieldVisibility: boolean;

  repeatPasswordFieldVisibility: boolean;

  errorMessage: string;

  loader = 'loader';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loadingService: TdLoadingService,
    private snackBar: MatSnackBar
  ) {
    this.resetToken = route.snapshot.params['token'];
  }

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        newPassword: new FormControl(null,
          [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!&^%$#@_|/\\\\]{8,}$')]),
        repeatNewPassword: new FormControl(null,
          [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!&^%$#@_|/\\\\]{8,}$')])
      },
    );
    this.form.get('repeatNewPassword').valueChanges.subscribe(it => this.enterRePassword(it));
    this.form.get('newPassword').valueChanges.subscribe(it => this.enterPassword(it));
  }


  changeVisibilityPC() {
    this.passwordFieldVisibility = !this.passwordFieldVisibility;
  }

  changeVisibilityRPC() {
    this.repeatPasswordFieldVisibility = !this.repeatPasswordFieldVisibility;
  }

  doReset() {
    this.authService.resetPassword({
      password: this.get('newPassword').value,
      token: this.resetToken
    }).subscribe(it => {
      this.snackBar.open('Пароль успешно изменен. Переадресация...', 'Закрыть', {duration: 5000});
      setTimeout(() => {
        window.location.href = 'https://tpu.ru/';
      }, 3000);
    }, error => this.handleError(error));
  }

  private handleError(err): void {
    this.errorMessage = null;
    if(err.error.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = 'Проблемы при смене пароля.';
    }
  }

  isInvalid(name: string): boolean {
    const control = this.get(name);
    return control.touched && control.invalid;
  }

  get(name: string): AbstractControl {
    return this.form.get(name);
  }

  getError(name: string): string {
    const error = this.form.get(name).errors;
    if(error) {
      if(error.required) {
        return 'Обязательно для заполнения';
      }
      if (error.pattern) {
        return 'Пароль должен содержать минимум 8 символов. Минимум одна заглавная буква, минимум одна цифра. Разрешенные символы: ! & ^ % $ # @ _ | \\ /';
      }
      if (error.notEquals) {
        return error.notEquals;
      }
    }
  }

  enterPassword(value: any) {
    if (value && value !== this.form.get('repeatNewPassword').value) {
      this.form.get('repeatNewPassword').setErrors({notEquals: "Пароли не совпадают"});
    } else if (value === this.form.get('repeatNewPassword').value) {
      this.form.get('repeatNewPassword').setErrors(null);
    }
  }

  enterRePassword(value: any) {
    if (value && value !== this.form.get('newPassword').value) {
      this.form.get('repeatNewPassword').setErrors({notEquals: "Пароли не совпадают"});
    } else if (value === this.form.get('repeatNewPassword').value) {
      this.form.get('repeatNewPassword').setErrors(null);
    }
  }

}
