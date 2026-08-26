import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { User, UserRole } from '../../core/auth/auth-models.model';

interface JsonPlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://jsonplaceholder.typicode.com/users';

  getUsers(): Observable<User[]> {
    return this.http
      .get<JsonPlaceholderUser[]>(this.apiUrl)
      .pipe(
        map((users) => users.map((user) => this.toUser(user))),
      );
  }

  searchUsers(term: string): Observable<User[]> {
    return this.http
      .get<JsonPlaceholderUser[]>(this.apiUrl)
      .pipe(
        map((users) =>
          users.filter(
            (user) =>
              user.username
                .toLowerCase()
                .includes(term.toLowerCase()) ||
              user.name
                .toLowerCase()
                .includes(term.toLowerCase()) ||
              user.email
                .toLowerCase()
                .includes(term.toLowerCase()),
          ),
        ),
      )
      .pipe(
        map((users) => users.map((user) => this.toUser(user))),
      );
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.http
      .get<JsonPlaceholderUser>(`${this.apiUrl}/${id}`)
      .pipe(
        map((user) => this.toUser(user)),
        catchError(() => of(undefined)),
      );
  }

  createUser(user: User): Observable<User> {
    return this.http
      .post<JsonPlaceholderUser>(this.apiUrl, {
        name: user.displayName,
        username: user.username,
        email: user.email,
      })
      .pipe(
        map((createdUser) => ({
          ...user,
          id: String(createdUser.id),
        })),
      );
  }

  updateUser(user: User): Observable<User> {
    return this.http
      .put<JsonPlaceholderUser>(
        `${this.apiUrl}/${user.id}`,
        {
          name: user.displayName,
          username: user.username,
          email: user.email,
        },
      )
      .pipe(
        map(() => user),
      );
  }

  deleteUser(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  private toUser(user: JsonPlaceholderUser): User {
    const role: UserRole[] = ['user', Math.random() < 0.5 ? 'admin' : 'manager'];
    return {
      id: String(user.id),
      username: user.username,
      displayName: user.name,
      email: user.email,
      roles: role,
    };
  }
}