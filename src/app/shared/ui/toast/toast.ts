import { Component, input } from '@angular/core';
import { ToastType } from './toast service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  readonly message = input.required<string>();
  readonly type = input<ToastType>('success');
}
