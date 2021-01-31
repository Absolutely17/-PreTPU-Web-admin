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
import {ChecklistDatabase, MenuRegistryComponent} from './components/menu-registry/menu-registry.component';
import {MenuService} from './services/menu/menu.service';
import {MenuEditingDialogComponent} from './components/dialog/menu-editing-dialog/menu-editing-dialog.component';
import {QuillModule} from 'ngx-quill';
import {ArticleEditingDialogComponent} from './components/dialog/article-edtiting-dialog/article-editing-dialog.component';
import {ArticleRegistryComponent} from './components/article-registry/article-registry.component';
import {ArticleService} from './services/article/article.service';
import {ImageService} from './services/image/image.service';
import {ArticleChooseDialogComponent} from './components/dialog/article-choose-dialog/article-choose-dialog.component';
import {MainPageComponent} from './components/common/main-page/main-page.component';
import {ConfirmDialogComponent} from './components/common/dialog/confirm-dialog/confirm-dialog.component';
import {SaveFormButtonComponent} from './components/common/save-button/save-form-button.component';
import {SystemConfigComponent} from './components/system-config/system-config.component';
import {SystemConfigService} from './services/systemConfig/system-config.service';
import {LanguageRegistryComponent} from './components/language-registry/language-registry.component';
import {LanguageService} from './services/language/language.service';
import {LanguageCreateDialogComponent} from './components/dialog/language-create-dialog/language-create-dialog.component';
import {AutocompleteSelectComponent} from './components/common/autocomplete-select/autocomplete-select.component';
import {CalendarCreateEventDialogComponent} from './components/dialog/calendar-create-event-dialog/calendar-create-event-dialog.component';
import {NGX_MAT_DATE_FORMATS, NgxMatDateFormats, NgxMatDatetimePickerModule} from '@angular-material-components/datetime-picker';
import {NgxMatMomentModule} from '@angular-material-components/moment-adapter';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {StudyGroupService} from "./services/studyGroup/study-group.service";
import {StudyGroupRegistryComponent} from "./components/study-group-registry/study-group-registry.component";
import {StudyGroupDialogComponent} from "./components/dialog/study-group-dialog/study-group-dialog.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";
import {UserDialogComponent} from "./components/dialog/user-dialog/user-dialog.component";
import {TdFileInputComponent} from "./components/common/file-input/file-input.component";
import {MenuRegistryReferenceComponent} from "./components/dialog/menu-registry-reference-dialog/menu-registry-reference.component";

export const commonServices = [
  AppConfig,
  MessageService,
  ErrorService,
  AuthService,
  ImageService
];

export const commonComponents = [
  RootComponent,
  MainComponent,
  MainHeaderComponent,
  LoginComponent,
  ForbiddenComponent,
  ErrorComponent,
  AutocompleteSelectComponent,
  SaveFormButtonComponent,
  ConfirmDialogComponent,
  TdFileInputComponent
];


const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS'
  },
  display: {
    dateInput: 'DD.MM.YYYY HH:mm',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@NgModule({
  declarations: [
    ...sbDataTableComponents,
    commonComponents,
    MessageDialogComponent,
    UsersRegistryComponent,
    UploadDocumentDialogComponent,
    SendNotificationDialogComponent,
    MenuRegistryComponent,
    MenuEditingDialogComponent,
    ArticleEditingDialogComponent,
    ArticleRegistryComponent,
    ArticleChooseDialogComponent,
    MainPageComponent,
    SystemConfigComponent,
    LanguageRegistryComponent,
    LanguageCreateDialogComponent,
    CalendarCreateEventDialogComponent,
    StudyGroupRegistryComponent,
    StudyGroupDialogComponent,
    ResetPasswordComponent,
    UserDialogComponent,
    MenuRegistryReferenceComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonImportsModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    CKEditorModule,
    QuillModule.forRoot({
      modules: {
        imageResize: true
      }
    }),
    appRouting
  ],
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: 'ru'},
    ...commonServices,
    authInterceptorProviders,
    AuthGuard,
    UserService,
    DialogService,
    DocumentService,
    NotificationService,
    ChecklistDatabase,
    MenuService,
    ArticleService,
    SystemConfigService,
    LanguageService,
    StudyGroupService
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
}
