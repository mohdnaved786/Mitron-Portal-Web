import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';
import { LoginGuard } from './core/guard/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth module (login/signup) – free access
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES), canActivate: [LoginGuard]
  },

  // Pages module – protected by AuthGuard
  {
    path: '',
    loadChildren: () => import('./pages/pages.routes').then(m => m.PAGES_ROUTES),
    canActivate: [AuthGuard]   // single guard for all child routes
  },

  { path: '**', redirectTo: 'login' }
];


