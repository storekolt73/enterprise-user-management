import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { guestGuard } from './core/auth/guest-guard';
import { UserDetails } from './features/users/user-details/user-details';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/users').then((m) => m.Users),
      },
      {
        path: 'users/:id',
        component: UserDetails,
        canActivate: [authGuard],
      },
      {
        path: 'user-table',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/user-table/user-table').then((m) => m.UserTable),
      },
      {
        path: 'user-data-view',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/user-data-view/user-data-view').then((m) => m.UserDataView),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];