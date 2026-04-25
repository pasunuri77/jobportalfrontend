import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { adminGuard } from './guards/admin.guard';
import { companyGuard } from './guards/company.guard';
import path from 'path';
import ca from '@angular/common/locales/ca';

export const routes: Routes = [
  // Landing page redirects to login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Public routes (no layout)
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
    canActivate: [loginGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
    canActivate: [loginGuard],
  }, 
  {
    path: 'forgetpassword',
    loadComponent: () => import('./auth/forgetpassword/forgetpassword').then((m) => m.Forgetpassword),
    canActivate: [loginGuard],
  },
  {
    path: 'company-registration',
    loadComponent: () => import('./pages/company-registration/company-registration.component').then((m) => m.CompanyRegistrationComponent),
    canActivate: [authGuard],
  },

  // Protected routes with dashboard layout
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard/profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./pages/companies/companies.component').then((m) => m.CompaniesComponent),
      },
      {
        path: 'jobs',
        loadComponent: () => import('./pages/jobs/jobs.component').then((m) => m.JobsComponent),
      },
      {
        path: 'apply-jobs',
        loadComponent: () => import('./pages/apply-jobs/apply-jobs.component').then((m) => m.ApplyJobsComponent),
      },
    ],
  },

  // Company dashboard routes
  {
    path: 'company-dashboard',
    loadComponent: () =>
      import('./pages/company-dashboard/company-dashboard.component').then(
        (m) => m.CompanyDashboardComponent,
      ),
    canActivate: [authGuard, companyGuard],
  },

  // View all applications route
  {
    path: 'view-all-applications',
    loadComponent: () =>
      import('./pages/viewallapplications/viewallapplications').then((m) => m.Viewallapplications),
    canActivate: [authGuard, companyGuard],
  },

  // Admin dashboard routes
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard],
  },
];
