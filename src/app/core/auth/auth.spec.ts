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

  it('should persist authentication state', () => {
    service.login({
      username: 'admin',
      password: 'admin',
    });

    expect(localStorage.getItem('isAuthenticated')).toBe('true');
  });

  it('should clear authentication state on logout', () => {
    service.login({
      username: 'admin',
      password: 'admin',
    });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });
});