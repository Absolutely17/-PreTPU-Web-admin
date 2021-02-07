import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
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
  },
  {
    name: 'Учебные группы',
    url: '/studyGroup'
  },
  {
    name: 'Уведомления',
    url: '/notification'
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

  activeLine = {
    width: 0,
    left: null,
    visible: false
  };

  constructor(private errorService: ErrorService,
              private router: Router,
              private authService: AuthService,
              private overlayContainer: OverlayContainer,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private tokenService: TokenStorageService,
              private elRef: ElementRef
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(this.routerSubscription());
    this.isLoggedIn = !!this.tokenService.getToken();
    this.createMenu();
    this.overlayContainer.getContainerElement()
      .classList
      .add('data-table-dialog');
  }

  ngAfterViewInit(): void {
    this.changeLine();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(): void {
    this.tokenService.signOut();
    this.router.navigate(['login']);
  }

  routerSubscription(): Subscription {
    return this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.createMenu();
        setTimeout(() => {
          this.changeLine();
        }, 10);
      }
    });
  }

  createMenu() {
    this.rootMenuItems = userMenuItems;
    this.rootMenuItems.forEach(path => {
      const activeChild = path.children && path.children.find(child =>
        child.url && child.url.endsWith(this.router.url.split('?')[0]));

      if (path.url && path.url.endsWith(this.router.url.split('?')[0])) {
        path.active = true;
      } else if (activeChild) {
        activeChild.active = true;
      }
    });
  }

  navigateTo(menuItem: MenuItem): void {
    if (menuItem.url) {
      this.router.navigate([menuItem.url]);
      this.dropActiveMenu();
      menuItem.active = true;
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

  menuItemIsActive(menuItem: MenuItem): boolean {
    return menuItem.active || menuItem.children && menuItem.children.filter(child => child.active).length > 0;
  }

  dropActiveMenu(): void {
    this.rootMenuItems.filter(item =>
      item.children && item.children.filter(child => child.active).length > 0 || item.active
    ).forEach(it => {
      it.active = false;
      if (it.children) {
        it.children.forEach(child => {
          child.active = false;
        });
      }
    });
  }

  changeLine(): void {
    const activeElem = this.getActiveElem();
    this.changeLineWidth(activeElem);
    this.changeLinePosition(activeElem);
    this.activeLine.visible = !!activeElem;
  }

  getActiveElem(): any {
    return this.elRef.nativeElement.querySelector('.active-item');
  }

  changeLineWidth(activeElem: any): void {
    this.activeLine.width = activeElem ? activeElem.offsetWidth : this.activeLine.width;
  }

  changeLinePosition(activeElem: any): void {
    this.activeLine.left = activeElem ? activeElem.offsetLeft : 0;
  }

}
