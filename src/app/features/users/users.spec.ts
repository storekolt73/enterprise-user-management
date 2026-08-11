import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Users } from './users';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  const router = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (key: string) => key === 'edit' ? '1' : null,
              has: (key: string) => key === 'edit',
            }),
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'edit' ? '1' : null,
                has: (key: string) => key === 'edit',
              },
            },
          },      
        },
        {
          provide: Router,
          useValue: router,
        },
      ],    
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
    //await fixture.whenStable();
    router.navigate.mockClear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the edit form when an edit query parameter is present', () => {
    expect(component.showCreateForm).toBe(true);
    expect(component.editingUserId).toBe('1');
    expect(component.userForm.getRawValue()).toEqual({
      username: 'admin',
      displayName: 'System Administrator',
      email: 'admin@example.com',
      role: 'admin',
    });
  });  

  it('should navigate back to user details after editing from details', () => {
    component.userForm.setValue({
      username: 'admin',
      displayName: 'Updated Administrator',
      email: 'updated@example.com',
      role: 'admin',
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/users', '1']);
  });

  it('should navigate back to user details when cancelling an edit from details', () => {
    component.cancelForm();

    expect(router.navigate).toHaveBeenCalledWith(['/users', '1']);
  });

});
