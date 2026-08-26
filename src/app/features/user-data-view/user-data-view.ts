import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { User, UserRole } from '../../core/auth/auth-models.model';
import { UsersService } from '../users/users-data';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialog } from '../../shared/ui/dialog/dialog';
import { ToastService } from '../../shared/ui/toast/toast service';
import { DataViewModule, DataViewLayout } from 'primeng/dataview';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-user-data-view',
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    DataViewModule,
    SelectModule,
    SelectButtonModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './user-data-view.html',
  styleUrl: './user-data-view.scss',
})
export class UserDataView implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(Dialog);
  private readonly toastService = inject(ToastService);
  readonly roles: UserRole[] = ['admin', 'manager', 'user'];
  readonly users = signal<User[]>([]);
  searchTerm = signal('');
  selectedRole = signal<UserRole | 'all'>('all');
  currentPage = signal(1);
  pageSize = signal(5);
  readonly searchResults = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        this.usersService.searchUsers(term),
      ),
    ),
    { initialValue: [] },
  );
  layoutOptions: any[] = ['list', 'grid'];
  layout: DataViewLayout = 'grid';
  sortOptions: SelectItem[] = [
      { label: 'By Name ascending', value: 'asc' },
      { label: 'By Name descending', value: 'desc' }
  ];
  sortOrder!: number;
  sortField: string = 'displayName';

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users) => {
      this.users.set(users);
    });
  }

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

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete user',
        message: `Are you sure you want to delete ${user.displayName}?`,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.usersService.deleteUser(user.id).subscribe(() => {
        this.users.update((users) =>
          users.filter(
            (existingUser) => existingUser.id !== user.id,
          ),
        );
        
        this.toastService.show('User deleted successfully.', 'success');
      });
    });
  }

  onSortChange(event: SelectChangeEvent): void {
    if (!event.value) {
      return;
    }
    this.sortField = 'displayName';
    this.sortOrder = event.value === 'asc' ? 1 : -1;
    this.currentPage.set(1);
  }
}
