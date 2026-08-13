import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserDetails } from './user-details';
import { UsersService } from '../users-data';
import { User } from '../../../core/auth/auth-models.model';

describe('UserDetails', () => {
  const mockUser: User = {
    id: '1',
    username: 'admin',
    displayName: 'System Administrator',
    email: 'admin@example.com',
    roles: ['admin'],
  };

  const usersServiceMock = {
    getUserById: vi.fn((id: string) =>
      of(id === mockUser.id ? mockUser : undefined),
    ),
  };

  function createComponent(userId: string) {
    TestBed.configureTestingModule({
      imports: [UserDetails],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => userId,
              },
            },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(UserDetails);

    fixture.detectChanges();

    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    const fixture = createComponent('1');

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the user details for an existing user', () => {
    const fixture = createComponent('1');
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('System Administrator');
    expect(compiled.textContent).toContain('admin');
    expect(compiled.textContent).toContain('admin@example.com');
    expect(compiled.textContent).toContain('admin');
  });

  it('should display not found for an unknown user', () => {
    const fixture = createComponent('unknown');
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('User not found');
    expect(compiled.textContent).toContain(
      'The requested user does not exist.',
    );
  });

  it('should display an edit action for an existing user', () => {
    const fixture = createComponent('1');
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Edit user');
  });
});