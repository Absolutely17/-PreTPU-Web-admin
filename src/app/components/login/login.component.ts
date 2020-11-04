import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TdDialogService} from '@covalent/core/dialogs';
import {TdLoadingService} from '@covalent/core/loading';
import {LoginInfo} from '../../models/auth/login-info';
import {AuthService} from '../../services/auth/auth.service';
import {TokenStorageService} from '../../services/token/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email?: string;
  password?: string;

  passwordVisibility: Map<string, boolean> = new Map<string, boolean>();

  errorMessage?: string;

  loadingKey = 'loginLoadingName';
  passwordFieldName = 'password';

  private returnUrl?: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private tdDialogService: TdDialogService,
    private loadingService: TdLoadingService,
    private tokenService: TokenStorageService
  ) {
    this.passwordVisibility.set(this.passwordFieldName, false);
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || null;
    if (this.tokenService.getToken()) {
      this.router.navigateByUrl(this.returnUrl || '/');
    }
  }

  doLogin(): void {
    const loginInfo: LoginInfo = {
      email: this.email,
      password: this.password,
    };
    this.loadingService.register(this.loadingKey);
    this.authService.login(loginInfo).subscribe(it => {
      console.log(it);
      if (it && it.token) {
        this.tokenService.saveToken(it.token);
        this.tokenService.saveUser(it.user);
        this.doNavigation();
      }
    },
      err => this.handleError(err));

  }

  changeVisibility(name: string): void {
    const visibility = this.passwordVisibility.get(name);
    this.passwordVisibility.set(name, !visibility);
  }

  private doNavigation(): void {
    this.loadingService.resolve(this.loadingKey);
    this.router.navigateByUrl(this.returnUrl || '/', {
      replaceUrl: true
    });
  }

  private handleError(err): void {
    this.errorMessage = null;
    if (err.error.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = 'Проблемы при входе в систему.';
    }
    this.loadingService.resolve(this.loadingKey);

  }

  @HostListener('window:keyup.enter')
  onEnter(): void {
    this.doLogin();
  }
}
