import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthSession,
  LoginCredentials,
  User,
} from './auth-models.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly session = signal<AuthSession | null>(null);
  readonly currentUser = this.session.asReadonly();
  private readonly authenticated = signal(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  readonly isAuthenticated = this.authenticated.asReadonly();

  login(credentials: LoginCredentials): boolean {
    if (
      credentials.username !== 'admin' ||
      credentials.password !== 'admin'
    ) {
      return false;
    }

    const user: User = {
      id: 'usr-001',
      username: 'admin',
      displayName: 'System Administrator',
      email: 'admin@example.com',
      roles: ['admin'],
    };

    this.session.set({
      user,
      token: 'mock-access-token',
    });

    this.authenticated.set(true);
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  }

  logout(): void {
    this.authenticated.set(false);
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
}