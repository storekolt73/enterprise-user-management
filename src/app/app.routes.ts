import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout')
        .then(m => m.Layout),

    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users')
            .then(m => m.Users),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found')
        .then(m => m.NotFound),
  },
];