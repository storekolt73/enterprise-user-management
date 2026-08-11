import { TestBed } from '@angular/core/testing';
import { UsersService } from './users-data';
import { User } from '../../core/auth/auth-models.model';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all users', () => {
    expect(service.getUsers()).toHaveLength(3);
  });

  it('should return a user by id', () => {
    const user = service.getUserById('2');

    expect(user?.username).toBe('john.doe');
  });

  it('should return undefined for an unknown id', () => {
    expect(service.getUserById('unknown')).toBeUndefined();
  });

  it('should create a user', () => {
    const user: User = {
      id: '4',
      username: 'alice',
      displayName: 'Alice Johnson',
      email: 'alice@example.com',
      roles: ['user'],
    };

    service.createUser(user);

    expect(service.getUserById('4')).toEqual(user);
  });

  it('should update an existing user', () => {
    const user: User = {
      id: '2',
      username: 'john.doe',
      displayName: 'John Updated',
      email: 'john.updated@example.com',
      roles: ['manager'],
    };

    expect(service.updateUser(user)).toBe(true);
    expect(service.getUserById('2')).toEqual(user);
  });

  it('should return false when updating an unknown user', () => {
    const user: User = {
      id: '999',
      username: 'unknown',
      displayName: 'Unknown',
      email: 'unknown@example.com',
      roles: ['user'],
    };

    expect(service.updateUser(user)).toBe(false);
  });

  it('should delete an existing user', () => {
    expect(service.deleteUser('3')).toBe(true);
    expect(service.getUserById('3')).toBeUndefined();
  });

  it('should return false when deleting an unknown user', () => {
    expect(service.deleteUser('999')).toBe(false);
  });
});