import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './services/auth/auth.guard';
import {ForbiddenComponent} from './components/common/forbidden/forbidden.component';
import {ErrorComponent} from './components/common/error/error.component';
import {UsersRegistryComponent} from './components/user-registry/users-registry.component';
import {MenuRegistryComponent} from './components/menu/menu-registry.component';

// @ts-ignore
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'menu',
        component: MenuRegistryComponent
      },
       {
         path: 'users',
         component: UsersRegistryComponent
       }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
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
