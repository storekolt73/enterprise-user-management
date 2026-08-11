import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User, UserRole } from '../../core/auth/auth-models.model';
import { UsersService } from './users-data';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

type SortField = 'username' | 'displayName' | 'email';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly users = this.usersService.getUsers();
  readonly roles: UserRole[] = ['admin', 'manager', 'user'];

  readonly userForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as UserRole, Validators.required],
  });

  showCreateForm = false;
  editingUserId: string | null = null;

  searchTerm = '';
  selectedRole: UserRole | 'all' = 'all';
  currentPage = 1;
  readonly pageSize = 5;
  sortField: SortField | null = null;
  sortDirection: SortDirection = 'asc';

  get filteredUsers(): User[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.users.filter((user) => {
      const matchesSearch =
        !search ||
        user.username.toLowerCase().includes(search) ||
        user.displayName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        this.selectedRole === 'all' ||
        user.roles.includes(this.selectedRole);

      return matchesSearch && matchesRole;
    });
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.sortedUsers.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  get sortedUsers(): User[] {
    const users = [...this.filteredUsers];
    if (!this.sortField) {
      return users;
    }

    users.sort((a, b) => {
      const aValue = a[this.sortField!].toLowerCase();
      const bValue = b[this.sortField!].toLowerCase();

      const comparison = aValue.localeCompare(bValue);

      return this.sortDirection === 'asc'
        ? comparison
        : -comparison;
    });

    return users;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  sortBy(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }
  
  openCreateForm(): void {
    this.editingUserId = null;

    this.userForm.reset({
      username: '',
      displayName: '',
      email: '',
      role: 'user',
    });

    this.showCreateForm = true;
  }

  openEditForm(user: User): void {
    this.editingUserId = user.id;

    this.userForm.reset({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.roles[0] ?? 'user',
    });

    this.showCreateForm = true;
  }

  cancelForm(): void {
    const editingUserId = this.editingUserId;

    this.showCreateForm = false;
    this.editingUserId = null;

    if (editingUserId && this.route.snapshot.queryParamMap.has('edit')) {
      void this.router.navigate(['/users', editingUserId]);
    }
  }

  onSubmit(): void {
    const returnToDetails = this.route.snapshot.queryParamMap.has('edit');

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (this.editingUserId) {
      const user: User = {
        id: this.editingUserId,
        username: formValue.username,
        displayName: formValue.displayName,
        email: formValue.email,
        roles: [formValue.role],
      };

      this.usersService.updateUser(user);

      if (returnToDetails && this.editingUserId) {
        void this.router.navigate(['/users', this.editingUserId]);
        return;
      }

    } else {
      const user: User = {
        id: crypto.randomUUID(),
        username: formValue.username,
        displayName: formValue.displayName,
        email: formValue.email,
        roles: [formValue.role],
      };

      this.usersService.createUser(user);
    }

    this.cancelForm();
  }
  
  deleteUser(user: User): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.displayName}?`,
    );

    if (!confirmed) {
      return;
    }

    this.usersService.deleteUser(user.id);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const userId = params.get('edit');

      if (!userId) {
        return;
      }

      const user = this.usersService.getUserById(userId);

      if (user) {
        this.openEditForm(user);
      }
    });
  }
}