import { Component, Renderer2, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Remove any leftover inline styles that could persist from hot-reloads
    const header = document.querySelector('.app-header') as HTMLElement | null;
    if (header) {
      this.renderer.removeStyle(header, 'left');
      const headerContent = header.querySelector('.header-content') as HTMLElement | null;
      if (headerContent) {
        this.renderer.removeStyle(headerContent, 'padding-left');
      }
    }
    // Initialize CSS variable for sidebar width to match default expanded state
    document.body.style.setProperty('--sidebar-current-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-expanded') || '260px');
  }

  onSidebarToggle(isCollapsed: boolean): void {
    // Use a body-level class plus a dynamic CSS variable so layout CSS
    // can read the exact sidebar width and align header/main precisely.
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-current-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-collapsed') || '72px');
    } else {
      document.body.classList.remove('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-current-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-expanded') || '260px');
    }
  }
}
