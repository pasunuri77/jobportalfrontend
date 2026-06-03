import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userName: string | null = '';
  userEmail: string | null = '';
  userRole: string = 'Professional Seeker';
  searchQuery = '';
  dropdownOpen = false;
  notificationsOpen = false;
  notifications = [
    // { id: 1, text: 'New job recommendation: Senior Angular Developer at Google', time: '10m ago', unread: true },
    // { id: 2, text: 'Your application for Senior Frontend Developer at Stripe was viewed', time: '1h ago', unread: true },
    // { id: 3, text: 'Interview scheduled with Stripe for Wednesday at 10:00 AM', time: '3h ago', unread: false }
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    private toastr: ToastrService,
    private elRef: ElementRef
  ) {
    this.userEmail = this.authService.getUserEmail();
    this.userName = this.authService.getUserName();
    const role = this.authService.getUserRole();
    this.userRole = role ? (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) : 'Professional';
  }

  get displayName(): string {
    if (this.userName) {
      return this.userName;
    }
    if (this.userEmail) {
      // Remove @gmail.com and other domain extensions
      return this.userEmail.replace(/@.*/, '');
    }
    return 'User';
  }

  onLogout(): void {
    // Call the logout method and handle navigation
    this.authService.logout().subscribe({
      next: () => {
        // Show success message
        console.log("logout successful");
        this.toastr.success('Logged out successfully!', 'Success');
      },
      complete: () => {
        // Use setTimeout to ensure auth state is cleared before navigation
        setTimeout(() => {
          this.router.navigate(['/login']).then(success => {
            if (!success) {
              // Fallback to window reload if router navigation fails
              window.location.reload();
            }
          });
        }, 100);
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.notificationsOpen = false;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.dropdownOpen = false;
  }

  // get unreadNotificationsCount(): number {
  //   return this.notifications.filter(n => n.unread).length;
  // }

  // markAllAsRead(): void {
  //   this.notifications.forEach(n => n.unread = false);
  // }

  onSearch(): void {
    const q = (this.searchQuery || '').trim();
    if (!q) { return; }
    // navigate to jobs page with query param if available
    this.router.navigate(['/jobs'], { queryParams: { q } }).catch(() => {
      console.log('navigation failed');
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.dropdownOpen = false;
      this.notificationsOpen = false;
    }
  }
}
