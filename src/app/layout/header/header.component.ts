import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userName: string | null = '';
  userEmail: string | null = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.userEmail = this.authService.getUserEmail();
    this.userName = this.authService.getUserName();
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
}
