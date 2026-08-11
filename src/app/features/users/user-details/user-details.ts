import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../../core/auth/auth-models.model';
import { UsersService } from '../users-data';

@Component({
  selector: 'app-user-details',
  imports: [RouterLink],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss',
})
export class UserDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);

  readonly user: User | undefined = this.loadUser();

  private loadUser(): User | undefined {
    const userId = this.route.snapshot.paramMap.get('id');

    if (!userId) {
      return undefined;
    }

    return this.usersService.getUserById(userId);
  }
}