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

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  createUser(user: User): void {
    this.users.push(user);
  }

  updateUser(user: User): boolean {
    const index = this.users.findIndex((existingUser) => existingUser.id === user.id);

    if (index === -1) {
      return false;
    }

    this.users[index] = user;
    return true;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    return true;
  }
}