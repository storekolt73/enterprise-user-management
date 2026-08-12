import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Layout } from './layout';
import { AuthService } from '../core/auth/auth';
import { Login } from '../features/auth/login/login';

describe('Layout', () => {
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideRouter([
          { path: 'login', component: Login },
        ])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
  });

  it('should create', () => {
    const layout = fixture.componentInstance;

    expect(layout).toBeTruthy();
  });

  it('should display the current user', () => {
    const authService = TestBed.inject(AuthService);

    authService.login({
      username: 'admin',
      password: 'admin',
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.header-user')?.textContent)
      .toContain('System Administrator');

    expect(compiled.querySelector('.header-user')?.textContent)
      .toContain('admin');
  });

  it('should logout when clicking the logout button', () => {
    const authService = TestBed.inject(AuthService);
    const logoutSpy = vi.spyOn(authService, 'logout');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      '.header-user button',
    ) as HTMLButtonElement;

    button.click();

    expect(logoutSpy).toHaveBeenCalled();
  });

});