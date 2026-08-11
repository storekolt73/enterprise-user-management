import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { UserDetails } from './user-details';
import { UsersService } from '../users-data';

describe('UserDetails', () => {
  function createComponent(userId: string) {
    TestBed.configureTestingModule({
      imports: [UserDetails],
      providers: [
        UsersService,
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

    expect(compiled.textContent).toContain('Edit');
  });

});