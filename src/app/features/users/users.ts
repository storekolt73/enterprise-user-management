import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User, UserRole } from '../../core/auth/auth-models.model';
import { UsersService } from './users-data';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, RouterLink],
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