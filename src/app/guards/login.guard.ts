import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Redirect based on user role
    if (authService.isAdmin()) {
      router.navigate(['/admin-dashboard']);
    } else if (authService.isCompany()) {
      router.navigate(['/company-dashboard']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  } else {
    return true;
  }
};
