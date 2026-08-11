import { Component, inject } from '@angular/core';
import { UsersService } from './users-data';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})

export class Users {
  private readonly usersService = inject(UsersService);

  readonly users = this.usersService.getUsers();
}
