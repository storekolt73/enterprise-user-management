import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Login } from './login';
import { AuthService } from '../../../core/auth/auth';


describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  const router = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: Router,
          useValue: router,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();

    router.navigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should login with valid credentials', () => {
    const authService = TestBed.inject(AuthService);

    component.loginForm.setValue({
      username: 'admin',
      password: 'admin',
    });

    component.onSubmit();

    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.currentUser()?.user.username).toBe('admin');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });


  it('should show an error for invalid credentials', () => {
    const authService = TestBed.inject(AuthService);

    component.loginForm.setValue({
      username: 'admin',
      password: 'wrong-password',
    });

    component.onSubmit();

    expect(authService.isAuthenticated()).toBe(false);
    expect(component.loginError.value).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});