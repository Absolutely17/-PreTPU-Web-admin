import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RootComponent} from './components/root.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonImportsModule} from '../common-imports/common-imports.module';
import {appRouting} from './app.routing';
import {MessageService} from './services/message/message.service';
import {AppConfig} from './app.config';
import {ErrorService} from './services/error/error.service';
import {MainHeaderComponent} from './components/main/main-header/main-header.component';
import {LoginComponent} from './components/login/login.component';
import {MainComponent} from './components/main/main.component';
import {MessageDialogComponent} from './components/dialog/message-dialog/message-dialog.component';
import {AuthService} from './services/auth/auth.service';
import {AuthGuard} from './services/auth/auth.guard';
import {ForbiddenComponent} from './components/common/forbidden/forbidden.component';
import {ErrorComponent} from './components/common/error/error.component';
import {UsersRegistryComponent} from './components/user-registry/users-registry.component';
import {UserService} from './services/user/user.service';
import {DialogService} from './services/dialog/dialog.service';
import {UploadDocumentDialogComponent} from './components/dialog/upload-document-dialog/upload-document-dialog.component';
import {DocumentService} from './services/document/document.service';
import {authInterceptorProviders} from './http-interceptor';
import {SendNotificationDialogComponent} from './components/dialog/send-notification-dialog/send-notification-dialog.component';
import {NotificationService} from './services/notification/notification.service';
import {sbDataTableComponents} from './components/common/sb-data-table/data-table.module';
import {ChecklistDatabase, MenuRegistryComponent} from './components/menu/menu-registry.component';
import {MenuService} from './services/menu/menu.service';

export const commonServices = [
  MessageService
];


@NgModule({
  declarations: [
    RootComponent,
    MainComponent,
    MainHeaderComponent,
    LoginComponent,
    ForbiddenComponent,
    ErrorComponent,
    MessageDialogComponent,
    UsersRegistryComponent,
    UploadDocumentDialogComponent,
    SendNotificationDialogComponent,
    ...sbDataTableComponents,
    MenuRegistryComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonImportsModule,
    appRouting
  ],
  providers: [
    ...commonServices,
    AuthGuard,
    AppConfig,
    ErrorService,
    AuthService,
    UserService,
    DialogService,
    DocumentService,
    NotificationService,
    ChecklistDatabase,
    MenuService,
    authInterceptorProviders
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
}
