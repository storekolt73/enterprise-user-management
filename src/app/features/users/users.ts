import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';import { User, UserRole } from '../../core/auth/auth-models.model';
import { UsersService } from './users-data';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';

type SortField = 'username' | 'displayName' | 'email';
type SortDirection = 'asc' | 'desc';

function atLeastOneRoleValidator(control: AbstractControl,): ValidationErrors | null {
  const roles = control.value as UserRole[];

  return roles.length > 0
    ? null
    : { required: true };
}

@Component({
  selector: 'app-users',
  imports: [
    ReactiveFormsModule, 
    RouterLink, 
    FormsModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly roles: UserRole[] = ['admin', 'manager', 'user'];
  readonly users = signal<User[]>([]);
  showCreateForm = signal(false);
  editingUserId = signal<string | null>(null);
  searchTerm = signal('');
  selectedRole = signal<UserRole | 'all'>('all');
  currentPage = signal(1);
  pageSize = signal(5);
  sortField = signal<SortField | null>(null);
  sortDirection = signal<SortDirection>('asc');

  readonly userForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roles: this.formBuilder.nonNullable.control<UserRole[]>(['user'], atLeastOneRoleValidator ),
  });

  readonly filteredUsers = computed(() => {
    const users = this.users();
    const search = this.searchTerm().trim().toLowerCase();
    const selectedRole = this.selectedRole();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.username.toLowerCase().includes(search) ||
        user.displayName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        selectedRole === 'all' ||
        user.roles.includes(selectedRole);

      return matchesSearch && matchesRole;
    });
  });

  readonly paginatedUsers = computed(() => {
    const startIndex =
      (this.currentPage() - 1) * this.pageSize();

    return this.sortedUsers().slice(
      startIndex,
      startIndex + this.pageSize(),
    );
  });

  readonly sortedUsers = computed(() => {
    const users = [...this.filteredUsers()];
    const field = this.sortField();

    if (!field) {
      return users;
    }

    users.sort((a, b) => {
      const aValue = a[field].toLowerCase();
      const bValue = b[field].toLowerCase();

      const comparison = aValue.localeCompare(bValue);

      return this.sortDirection() === 'asc'
        ? comparison
        : -comparison;
    });

    return users;
  });

  readonly totalPages = computed(() =>
    Math.ceil(
      this.filteredUsers().length / this.pageSize(),
    ),
  );

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((value) => value - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((value) => value + 1);
    }
  }

  sortBy(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.update((value) => value === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }

    this.currentPage.set(1);
  }
  
  openCreateForm(): void {
    this.editingUserId.set(null);

    this.userForm.reset({
      username: '',
      displayName: '',
      email: '',
      roles: ['user'],
    });

    this.showCreateForm.set(true);
  }

  openEditForm(user: User): void {
    this.editingUserId.set(user.id);

    this.userForm.reset({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      roles: user.roles,
    });

    this.showCreateForm.set(true);
  }

  cancelForm(): void {
    const editingUserId = this.editingUserId();

    this.showCreateForm.set(false);
    this.editingUserId.set(null);

    if (editingUserId && this.route.snapshot.queryParamMap.has('edit')) {
      void this.router.navigate(['/users', editingUserId]);
    }
  }

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users) => {
      this.users.set(users);
    });
    
    this.route.queryParamMap.subscribe((params) => {
      const userId = params.get('edit');

      if (!userId) {
        return;
      }

      this.usersService.getUserById(userId).subscribe((user) => {
        if (user) {
          this.openEditForm(user);
        }
      });

    });
  }

  onSubmit(): void {
    const returnToDetails =
      this.route.snapshot.queryParamMap.has('edit');

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (this.editingUserId()) {
      const user: User = {
        id: this.editingUserId()!,
        username: formValue.username,
        displayName: formValue.displayName,
        email: formValue.email,
        roles: formValue.roles,
      };

      this.usersService.updateUser(user).subscribe((updatedUser) => {
        this.users.update((users) => {
          const index = users.findIndex(
            (existingUser) => existingUser.id === updatedUser.id,
          );

          if (index === -1) {
            return users;
          }

          const updatedUsers = [...users];
          updatedUsers[index] = updatedUser;

          return updatedUsers;
        });

        if (returnToDetails) {
          void this.router.navigate(['/users', updatedUser.id]);
          return;
        }

        this.cancelForm();
      });

      return;
    }

    const user: User = {
      id: crypto.randomUUID(),
      username: formValue.username,
      displayName: formValue.displayName,
      email: formValue.email,
      roles: formValue.roles,
    };

    this.usersService.createUser(user).subscribe((createdUser) => {
      this.users.update((users) => [
        ...users,
        createdUser,
      ]);      

      this.cancelForm();
    });
  }

  deleteUser(user: User): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.displayName}?`,
    );

    if (!confirmed) {
      return;
    }

    this.usersService.deleteUser(user.id).subscribe(() => {
      this.users.update((users) =>
        users.filter(
          (existingUser) => existingUser.id !== user.id,
        ),
      );
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      return;
    }

    this.sortField.set(sort.active as SortField);
    this.sortDirection.set(sort.direction);
    this.currentPage.set(1);
  }
}