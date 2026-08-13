import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth';
import { Toast } from '../shared/ui/toast/toast';
import { ToastService } from '../shared/ui/toast/toast service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Toast],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})

export class Layout {
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);
  logout(): void {
    this.authService.logout();
  }
}