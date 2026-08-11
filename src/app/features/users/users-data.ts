import { Injectable } from '@angular/core';

import { User } from '../../core/auth/auth-models.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      username: 'admin',
      displayName: 'System Administrator',
      email: 'admin@example.com',
      roles: ['admin'],
    },
    {
      id: '2',
      username: 'john.doe',
      displayName: 'John Doe',
      email: 'john.doe@example.com',
      roles: ['user'],
    },
    {
      id: '3',
      username: 'jane.smith',
      displayName: 'Jane Smith',
      email: 'jane.smith@example.com',
      roles: ['manager', 'user'],
    },
  ];

  getUsers(): User[] {
    return this.users;
  }
}