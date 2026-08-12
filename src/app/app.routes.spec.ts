import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth';

describe('App routes', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect unauthenticated users from users to login', async () => {
    await router.navigate(['/users']);

    expect(router.url).toBe('/login');
  });

  it('should redirect authenticated users from login to dashboard', async () => {
    authService.login({
      username: 'admin',
      password: 'admin',
    });

    await router.navigate(['/login']);

    expect(router.url).toBe('/dashboard');
  });


  it('should allow authenticated users to access users', async () => {
    authService.login({
      username: 'admin',
      password: 'admin',
    });

    await router.navigate(['/users']);

    expect(router.url).toBe('/users');
  });
});
