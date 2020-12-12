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
import {MenuEditingComponent} from './components/dialog/menu-editing-dialog/menu-editing.component';
import {QuillModule} from 'ngx-quill';
import {ArticleEditingDialogComponent} from './components/dialog/article-edtiting-dialog/article-editing-dialog.component';
import {ArticleRegistryComponent} from './components/article-registry/article-registry.component';
import {ArticleService} from './services/article/article.service';
import {ImageService} from './services/image/image.service';
import {ArticleChooseDialogComponent} from './components/dialog/article-choose-dialog/article-choose-dialog.component';
import {MainPageComponent} from './components/common/main-page/main-page.component';
import {ConfirmDialogComponent} from './components/common/dialog/confirm-dialog/confirm-dialog.component';
import {SaveFormButtonComponent} from './components/common/save-button/save-form-button.component';

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
    MenuRegistryComponent,
    MenuEditingComponent,
    ArticleEditingDialogComponent,
    ArticleRegistryComponent,
    ArticleChooseDialogComponent,
    MainPageComponent,
    ConfirmDialogComponent,
    SaveFormButtonComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonImportsModule,
    QuillModule.forRoot({
      modules: {
        imageResize: true
      }
    }),
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
    ArticleService,
    ImageService,
    authInterceptorProviders
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
}
