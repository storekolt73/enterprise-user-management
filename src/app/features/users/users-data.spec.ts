import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { UsersService } from './users-data';
import { User } from '../../core/auth/auth-models.model';

describe('UsersService', () => {
  let service: UsersService;
  let httpTestingController: HttpTestingController;

  const apiUrl = 'https://jsonplaceholder.typicode.com/users';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsersService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all users', () => {
    const mockResponse = [
      {
        id: 1,
        name: 'John Doe',
        username: 'john.doe',
        email: 'john.doe@example.com',
      },
      {
        id: 2,
        name: 'Jane Smith',
        username: 'jane.smith',
        email: 'jane.smith@example.com',
      },
    ];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual([
        {
          id: '1',
          username: 'john.doe',
          displayName: 'John Doe',
          email: 'john.doe@example.com',
          roles: ['user'],
        },
        {
          id: '2',
          username: 'jane.smith',
          displayName: 'Jane Smith',
          email: 'jane.smith@example.com',
          roles: ['user'],
        },
      ]);
    });

    const request = httpTestingController.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');

    request.flush(mockResponse);
  });

  it('should GET a user by id', () => {
    const mockResponse = {
      id: 2,
      name: 'John Doe',
      username: 'john.doe',
      email: 'john.doe@example.com',
    };

    service.getUserById('2').subscribe((user) => {
      expect(user).toEqual({
        id: '2',
        username: 'john.doe',
        displayName: 'John Doe',
        email: 'john.doe@example.com',
        roles: ['user'],
      });
    });

    const request = httpTestingController.expectOne(`${apiUrl}/2`);

    expect(request.request.method).toBe('GET');

    request.flush(mockResponse);
  });

  it('should POST a new user', () => {
    const user: User = {
      id: '99',
      username: 'alfa',
      displayName: 'Alfa Beta',
      email: 'alfa@beta.com',
      roles: ['user'],
    };

    const mockResponse = {
      id: 101,
      name: 'Alfa Beta',
      username: 'alfa',
      email: 'alfa@beta.com',
    };

    service.createUser(user).subscribe((createdUser) => {
      expect(createdUser).toEqual({
        ...user,
        id: '101',
      });
    });

    const request = httpTestingController.expectOne(apiUrl);

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      name: 'Alfa Beta',
      username: 'alfa',
      email: 'alfa@beta.com',
    });

    request.flush(mockResponse);
  });

  it('should PUT an existing user', () => {
    const user: User = {
      id: '2',
      username: 'john.doe',
      displayName: 'John Updated',
      email: 'john.updated@example.com',
      roles: ['manager'],
    };

    service.updateUser(user).subscribe((updatedUser) => {
      expect(updatedUser).toEqual(user);
    });

    const request = httpTestingController.expectOne(`${apiUrl}/2`);

    expect(request.request.method).toBe('PUT');

    expect(request.request.body).toEqual({
      name: 'John Updated',
      username: 'john.doe',
      email: 'john.updated@example.com',
    });

    request.flush({
      id: 2,
      name: 'John Updated',
      username: 'john.doe',
      email: 'john.updated@example.com',
    });
  });

  it('should DELETE a user', () => {
    service.deleteUser('3').subscribe((result) => {
      expect(result).toBeUndefined();
    });

    const request = httpTestingController.expectOne(`${apiUrl}/3`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });
});