import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subscription} from 'rxjs';
import {MatMenuTrigger} from '@angular/material/menu';
import {MenuItem} from '../../../models/menu/menu.model';
import {ErrorService} from '../../../services/error/error.service';
import {AuthService} from '../../../services/auth/auth.service';
import {TokenStorageService} from '../../../services/token/token-storage.service';

export const userMenuItems: MenuItem[] = [
  {
    name: 'Меню',
    url: '/menu'
  },
  {
    name: 'Пользователи',
    url: '/users'
  },
  {
    name: 'Статьи',
    url: '/article'
  },
  {
    name: 'Языки',
    url: '/language'
  },
  {
    name: 'Служебные данные',
    url: '/systemConfig'
  }
];

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html'
})
export class MainHeaderComponent implements OnInit, OnDestroy {

  rootMenuItems: MenuItem[] = [];

  mainPageMenuItem: MenuItem = {
    name: 'Главная',
    url: '/'
  };

  isLoggedIn: boolean;

  private subscriptions = new Subscription();


  enteredButton = false;
  isMatMenuOpen = false;
  isMatMenu2Open = false;
  prevButtonTrigger;

  constructor(private errorService: ErrorService,
              private router: Router,
              private authService: AuthService,
              private overlayContainer: OverlayContainer,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private tokenService: TokenStorageService
  ) {
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getToken();
    this.rootMenuItems = userMenuItems;
    this.overlayContainer.getContainerElement()
      .classList
      .add('data-table-dialog');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(): void {
    this.tokenService.signOut();
    this.router.navigate(['login']);
  }

  navigateTo(menuItem: MenuItem): void {
    if (menuItem.url) {
      this.router.navigate([menuItem.url]);
    }
  }

  menuEnter(): void {
    this.isMatMenuOpen = true;
    if (this.isMatMenu2Open) {
      this.isMatMenu2Open = false;
    }
  }

  menuLeave(trigger: MatMenuTrigger): void {
    setTimeout(() => {
      if (!this.isMatMenu2Open && !this.enteredButton) {
        this.isMatMenuOpen = false;
        trigger.closeMenu();
      } else {
        this.isMatMenuOpen = false;
      }
    }, 80);
  }

  menu2Enter(): void {
    this.isMatMenu2Open = true;
  }

  menu2Leave(trigger1: MatMenuTrigger, trigger2: MatMenuTrigger): void {
    setTimeout(() => {
      if (this.isMatMenu2Open) {
        trigger1.closeMenu();
        this.isMatMenuOpen = false;
        this.isMatMenu2Open = false;
        this.enteredButton = false;
      } else {
        this.isMatMenu2Open = false;
        trigger2.closeMenu();
      }
    }, 100);
  }

  buttonEnter(trigger: MatMenuTrigger): void {
    setTimeout(() => {
      if (this.prevButtonTrigger && this.prevButtonTrigger !== trigger) {
        this.prevButtonTrigger.closeMenu();
        this.prevButtonTrigger = trigger;
        this.isMatMenuOpen = false;
        this.isMatMenu2Open = false;
        trigger.openMenu();
      } else if (!this.isMatMenuOpen) {
        this.enteredButton = true;
        this.prevButtonTrigger = trigger;
        trigger.openMenu();
      } else {
        this.enteredButton = true;
        this.prevButtonTrigger = trigger;
      }
    });
  }

  buttonLeave(trigger: MatMenuTrigger): void {
    setTimeout(() => {
      if (this.enteredButton && !this.isMatMenuOpen) {
        trigger.closeMenu();
      }
      if (!this.isMatMenuOpen) {
        trigger.closeMenu();
      } else {
        this.enteredButton = false;
      }
    }, 100);
  }
}
