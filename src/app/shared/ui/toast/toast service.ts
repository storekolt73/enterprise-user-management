import { Component, Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly message = signal<string | null>(null);
  readonly type = signal<ToastType>('success');
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(
    message: string,
    type: ToastType = 'success',
    duration = 3000,
  ): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.message.set(message);
    this.type.set(type);

    this.hideTimer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    this.message.set(null);
  }
}