import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Users } from './users';
import { UsersService } from './users-data';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { HarnessLoader } from '@angular/cdk/testing';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  const router = {
    navigate: vi.fn(),
  };
  let usersService: UsersService;
  let loader: HarnessLoader;

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

    usersService = TestBed.inject(UsersService);
    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;

    fixture.detectChanges();
    //await fixture.whenStable();

    loader = TestbedHarnessEnvironment.loader(fixture);

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
      roles: ['admin'],
    });
  });  

  it('should navigate back to user details after editing from details', () => {
    component.userForm.setValue({
      username: 'admin',
      displayName: 'Updated Administrator',
      email: 'updated@example.com',
      roles: ['admin'],
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
    component.showCreateForm = false;
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
    component.showCreateForm = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const previousButton = compiled.querySelector(
      '.pagination button:first-of-type'
    ) as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
  });

  it('should disable Next on the last page', () => {
    component.showCreateForm = false;
    component.currentPage = component.totalPages;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const nextButton = compiled.querySelector(
      '.pagination button:last-of-type'
    ) as HTMLButtonElement;

    expect(nextButton.disabled).toBe(true);
  });

  it('should display the current page and total pages', () => {
    component.showCreateForm = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.pagination')?.textContent)
      .toContain('1');

    expect(compiled.querySelector('.pagination')?.textContent)
      .toContain(String(component.totalPages));
  });

  it('should populate all user roles when editing', () => {
    const user = component.users.find(
      (user) => user.username === 'admin',
    );

    expect(user).toBeTruthy();

    component.openEditForm(user!);

    expect(component.userForm.getRawValue().roles).toEqual(
      user!.roles,
    );
  });

  it('should require at least one role', () => {
    component.userForm.controls.roles.setValue([]);
    component.userForm.controls.roles.markAsTouched();

    expect(component.userForm.controls.roles.invalid).toBe(true);
    expect(
      component.userForm.controls.roles.hasError('required'),
    ).toBe(true);
  });

  it('should save all selected roles when editing', () => {
    component.openEditForm(component.users[0]);

    component.userForm.patchValue({
      roles: ['admin', 'manager'],
    });

    component.onSubmit();

    const updatedUser = component.users.find(
      (user) => user.id === component.users[0].id,
    );

    expect(updatedUser?.roles).toEqual(['admin', 'manager']);

    const updated2User = usersService.getUserById(
      component.users[0].id,
    );
    
    expect(updated2User?.roles).toEqual(['admin', 'manager']);
  });

  it('should accept one or more roles', () => {
    component.userForm.controls.roles.setValue(['admin', 'manager']);

    expect(component.userForm.controls.roles.valid).toBe(true);
  });

  it('should select multiple roles', async () => {
    component.openCreateForm();
    component.userForm.controls.roles.setValue([]);
    const select = await loader.getHarness(MatSelectHarness);

    await select.open();

    const options = await select.getOptions();

    for (const option of options) {
      const text = await option.getText();

      if (text === 'admin' || text === 'manager') {
        await option.click();
        await select.open();
      }
    }

    expect(component.userForm.controls.roles.value).toEqual([
      'admin',
      'manager',
    ]);
  });

  it('should show existing roles as selected when editing', async () => {
    const select = await loader.getHarness(MatSelectHarness);
    component.openEditForm(component.users[2]); // user with roles ['manager', 'user']

    const values = await select.getValueText();

    expect(values).toContain('manager');
    expect(values).toContain('user');
  });

  it('should update pagination when the paginator changes page', () => {
    component.onPageChange({
      pageIndex: 1,
      pageSize: 5,
      length: component.sortedUsers.length,
    });

    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(5);
  });

  it('should navigate to the next page using the paginator', async () => {
    component.showCreateForm = false;
    fixture.detectChanges();
    const paginator = await loader.getHarness(MatPaginatorHarness);

    await paginator.goToNextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should update page size using the paginator', () => {
    component.showCreateForm = false;
    fixture.detectChanges();

    component.onPageChange({
      pageIndex: 0,
      pageSize: 10,
      length: component.sortedUsers.length,
    });

    expect(component.pageSize).toBe(10);
    expect(component.currentPage).toBe(1);
  });


  it('should reset to the first page when page size changes', () => {
    component.showCreateForm = false;
    component.currentPage = 2;
    fixture.detectChanges();

    component.onPageChange({
      pageIndex: 0,
      pageSize: 10,
      length: component.sortedUsers.length,
    });

    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should change page size using the paginator', async () => {
    component.showCreateForm = false;
    fixture.detectChanges();
    const paginator = await loader.getHarness(MatPaginatorHarness);

    await paginator.setPageSize(10);

    expect(await paginator.getPageSize()).toBe(10);
    expect(component.pageSize).toBe(10);
  });

  it('should sort users when the Material sort changes', () => {
    component.onSortChange({
      active: 'username',
      direction: 'asc',
    });

    expect(component.sortedUsers[0].username).toBe('admin');
  });

  it('should update sorting from Material sort event', () => {
    component.currentPage = 2;

    component.onSortChange({
      active: 'username',
      direction: 'desc',
    });

    expect(component.sortField).toBe('username');
    expect(component.sortDirection).toBe('desc');
    expect(component.currentPage).toBe(1);
  });

  it('should apply ascending Material sort direction', () => {
    component.onSortChange({
      active: 'displayName',
      direction: 'asc',
    });

    expect(component.sortField).toBe('displayName');
    expect(component.sortDirection).toBe('asc');
  });

  it('should sort users by username using Material sort', async () => {
    component.showCreateForm = false;
    fixture.detectChanges();
    const sort = await loader.getHarness(MatSortHarness);
    const headers = await sort.getSortHeaders();

    let usernameHeader;

    for (const header of headers) {
      if ((await header.getLabel()) === 'Username') {
        usernameHeader = header;
        break;
      }
    }

    expect(usernameHeader).toBeTruthy();

    await usernameHeader!.click();

    expect(component.sortField).toBe('username');
    expect(component.sortDirection).toBe('asc');
    expect(component.sortedUsers[0].username).toBe('admin');
  });

  it('should toggle username sorting using Material sort', async () => {
    component.showCreateForm = false;
    fixture.detectChanges();
    const sort = await loader.getHarness(MatSortHarness);
    const headers = await sort.getSortHeaders();

    let usernameHeader;

    for (const header of headers) {
      if ((await header.getLabel()) === 'Username') {
        usernameHeader = header;
        break;
      }
    }

    expect(usernameHeader).toBeTruthy();

    await usernameHeader!.click();
    await usernameHeader!.click();

    expect(component.sortField).toBe('username');
    expect(component.sortDirection).toBe('desc');
    expect(component.sortedUsers[0].username).toBe('john.doe');
  });

  it('should filter, sort and paginate users using Material controls', async () => {
    component.showCreateForm = false;
    fixture.detectChanges();
    const paginator = await loader.getHarness(MatPaginatorHarness);
    const sort = await loader.getHarness(MatSortHarness);

    // sort
    const headers = await sort.getSortHeaders();

    let usernameHeader;

    for (const header of headers) {
      if ((await header.getLabel()) === 'Username') {
        usernameHeader = header;
        break;
      }
    }

    expect(usernameHeader).toBeTruthy();

    await usernameHeader!.click();

    // pagination
    await paginator.setPageSize(5);

    expect(component.sortDirection).toBe('asc');
    expect(component.pageSize).toBe(5);
    expect(component.currentPage).toBe(1);
  });

});
