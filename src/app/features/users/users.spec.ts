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

  it('should show all users when there is no search term', () => {
    expect(component.filteredUsers).toHaveLength(7);
  });

  it('should filter users by username', () => {
    component.searchTerm = 'john';
    fixture.detectChanges();

    expect(component.filteredUsers).toHaveLength(1);
    expect(component.filteredUsers[0].username).toBe('john.doe');
  });

  it('should filter users case-insensitively', () => {
    component.searchTerm = 'JANE';
    fixture.detectChanges();

    expect(component.filteredUsers).toHaveLength(1);
    expect(component.filteredUsers[0].username).toBe('jane.smith');
  });

  it('should return no users when there is no match', () => {
    component.searchTerm = 'nonexistent';
    fixture.detectChanges();

    expect(component.filteredUsers).toHaveLength(0);
  });

  it('should display an empty state when there are no matching users', () => {
    component.searchTerm = 'nonexistent';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('.empty-state')?.textContent)
      .toContain('No users found');
  });

  it('should filter users by roles', () => {
    component.selectedRole = 'admin';
    fixture.detectChanges();

    expect(component.filteredUsers).toHaveLength(3);
    expect(component.filteredUsers[0].roles).toContain('admin');
  });

  it('should filter users by search term and roles', () => {
    component.searchTerm = 'john';
    component.selectedRole = 'user';
    fixture.detectChanges();

    expect(component.filteredUsers).toHaveLength(1);
    expect(component.filteredUsers[0].roles).toContain('user');
    expect(component.filteredUsers[0].username).toBe('john.doe');
  });

  it('should paginate users', () => {
    component.currentPage = 1;

    expect(component.paginatedUsers).toHaveLength(5);
  });

  it('should move to the next page', () => {
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(2);
    expect(component.paginatedUsers).toHaveLength(2);
  });

  it('should not move past the last page', () => {
    component.currentPage = 2;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should move to the previous page', () => {
    component.currentPage = 2;

    component.previousPage();

    expect(component.currentPage).toBe(1);
    expect(component.paginatedUsers).toHaveLength(5);
  });

  it('should not move before the first page', () => {
    component.currentPage = 1;

    component.previousPage();

    expect(component.currentPage).toBe(1);
  });

  it('should sort users by username ascending', () => {
    component.sortBy('username');

    expect(component.sortedUsers[0].username).toBe('admin');
    expect(component.sortDirection).toBe('asc');
  });

  it('should toggle username sorting direction', () => {
    component.sortBy('username');

    expect(component.sortDirection).toBe('asc');

    component.sortBy('username');

    expect(component.sortDirection).toBe('desc');
    expect(component.sortedUsers[0].username).toBe('john.doe');
  });

  it('should reset pagination when sorting changes', () => {
    component.currentPage = 2;

    component.sortBy('email');

    expect(component.currentPage).toBe(1);
  });

  it('should sort filtered users', () => {
    component.searchTerm = 'example.com';
    component.sortBy('displayName');

    expect(component.sortedUsers).toHaveLength(7);
    expect(component.sortedUsers[0].displayName).toBe('Alice Jones');
  });

  it('should filter, sort and paginate users together', () => {
    component.searchTerm = 'example.com';

    component.sortBy('displayName');

    Object.defineProperty(component, 'pageSize', {
      value: 2,
      writable: false,
    });

    expect(component.sortedUsers).toHaveLength(7);
    expect(component.sortedUsers[0].displayName).toBe('Alice Jones');

    expect(component.currentPage).toBe(1);
    expect(component.paginatedUsers).toHaveLength(2);
    expect(component.paginatedUsers[0].displayName).toBe('Alice Jones');
    expect(component.paginatedUsers[1].displayName).toBe('Bob Wilson');

    component.nextPage();

    expect(component.currentPage).toBe(2);
    expect(component.paginatedUsers).toHaveLength(2);
    expect(component.paginatedUsers[0].displayName).toBe('Charlie Brown');
    expect(component.paginatedUsers[1].displayName).toBe('David Miller');
  });

  it('should disable Previous on the first page', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const previousButton = compiled.querySelector(
      '.pagination button:first-of-type'
    ) as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
  });

  it('should disable Next on the last page', () => {
    component.currentPage = component.totalPages;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const nextButton = compiled.querySelector(
      '.pagination button:last-of-type'
    ) as HTMLButtonElement;

    expect(nextButton.disabled).toBe(true);
  });

  it('should display the current page and total pages', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.pagination')?.textContent)
      .toContain('1');

    expect(compiled.querySelector('.pagination')?.textContent)
      .toContain(String(component.totalPages));
  });

});
