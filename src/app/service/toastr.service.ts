import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastrService {
  success(message: string, title?: string): void {
    this.showNotification(message, title || 'Success', 'success');
  }

  error(message: string, title?: string): void {
    this.showNotification(message, title || 'Error', 'error');
  }

  private showNotification(message: string, title: string, type: 'success' | 'error'): void {
    // Simple console notification for now
    console.log(`${type.toUpperCase()}: ${title}`, message);

    // You can extend this to show actual toastr notifications
    // by implementing the ngx-toastr integration
    if (typeof window !== 'undefined' && (window as any).toastr) {
      (window as any).toastr[type](message, title);
    }
  }
}
