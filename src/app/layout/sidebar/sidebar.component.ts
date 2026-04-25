import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  activeRoute: string = '';
  isCollapsed: boolean = false;
  @Output() sidebarToggle = new EventEmitter<boolean>();

  menuItems = [
    { path: '/dashboard/profile', label: 'Profile', icon: 'user' },
    { path: '/dashboard/companies', label: 'Companies', icon: 'building' },
    { path: '/dashboard/jobs', label: 'Jobs', icon: 'briefcase' },
    { path: '/dashboard/apply-jobs', label: 'Applied Jobs', icon: 'apply' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.urlAfterRedirects;
      });

    // Set initial active route
    this.activeRoute = this.router.url;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }

  onLogout(): void {
    // Call the logout method and handle navigation
    this.authService.logout().subscribe({
      next: () => {
        // Navigation is handled in the complete callback
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

  isActive(path: string): boolean {
    return this.activeRoute.includes(path);
  }
}
