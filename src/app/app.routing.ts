import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth/auth.guard';
import {ForbiddenComponent} from './components/common/forbidden/forbidden.component';
import {ErrorComponent} from './components/common/error/error.component';
import {UsersRegistryComponent} from './components/user-registry/users-registry.component';
import {MenuRegistryComponent} from './components/menu/menu-registry.component';
import {ArticleRegistryComponent} from './components/article-registry/article-registry.component';
import {MainPageComponent} from './components/common/main-page/main-page.component';
import {SystemConfigComponent} from './components/system-config/system-config.component';
import {LanguageRegistryComponent} from './components/language-registry/language-registry.component';
import {StudyGroupRegistryComponent} from "./components/study-group-registry/study-group-registry.component";
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

// @ts-ignore
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        component: MainPageComponent
      },
      {
        path: 'menu',
        component: MenuRegistryComponent
      },
      {
        path: 'users',
        component: UsersRegistryComponent
      },
      {
        path: 'article',
        component: ArticleRegistryComponent
      },
      {
        path: 'systemConfig',
        component: SystemConfigComponent
      },
      {
        path: 'language',
        component: LanguageRegistryComponent
      },
      {
        path: 'studyGroup',
        component: StudyGroupRegistryComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'resetPassword/:token',
    component: ResetPasswordComponent,
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: 'error',
    component: ErrorComponent
  }
];

export const appRouting = RouterModule.forRoot(routes, {useHash: true});
