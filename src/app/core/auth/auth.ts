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
  private readonly sessionStorageKey = 'authSession';
  private readonly router = inject(Router);
  private readonly session = signal<AuthSession | null>(this.restoreSession(),);
  readonly currentUser = this.session.asReadonly();
  private readonly authenticated = signal(
    this.session() !== null,
  );
  readonly isAuthenticated = this.authenticated.asReadonly();

  private restoreSession(): AuthSession | null {
    const storedSession = localStorage.getItem(this.sessionStorageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      localStorage.removeItem(this.sessionStorageKey);
      return null;
    }
  }
 
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
    localStorage.setItem(
      this.sessionStorageKey,
      JSON.stringify(this.session()),
    );
    return true;
  }

  logout(): void {
    this.session.set(null);
    this.authenticated.set(false);
    localStorage.removeItem(this.sessionStorageKey);
    void this.router.navigate(['/login']);
  }
}