import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth';
import { Login } from '../../features/auth/login/login';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: Login },
        ]),
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should authenticate with valid credentials', () => {
    const result = service.login({
      username: 'admin',
      password: 'admin',
    });

    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reject invalid credentials', () => {
    const result = service.login({
      username: 'admin',
      password: 'wrong-password',
    });

    expect(result).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should expose the current user after login', () => {
    service.login({
      username: 'admin',
      password: 'admin',
    });

    expect(service.currentUser()?.user.username).toBe('admin');
  });

  it('should clear the current user on logout', () => {
    service.login({
      username: 'admin',
      password: 'admin',
    });

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should restore the session from localStorage', () => {
    const session = {
      user: {
        id: 'usr-001',
        username: 'admin',
        displayName: 'System Administrator',
        email: 'admin@example.com',
        roles: ['admin'],
      },
      token: 'mock-access-token',
    };

    localStorage.setItem('authSession', JSON.stringify(session));

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: Login },
        ]),
      ],
    });
    
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBe(true);
    expect(restoredService.currentUser()?.user.username).toBe('admin');
    expect(restoredService.currentUser()?.user.displayName).toBe(
      'System Administrator',
    );
  });

});