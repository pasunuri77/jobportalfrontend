import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgetpassword',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgetpassword.html',
  styleUrl: './forgetpassword.css'
})
export class Forgetpassword implements OnInit {
  forgotPasswordForm: FormGroup;
  resetPasswordForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
  showPasswordReset = false;
  successMessage = '';
  errorMessage = '';
  showNewPassword = false;
  showConfirmPassword = false;
  submittedEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Clear any existing messages when component loads
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitted = false;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.value.email;
    this.submittedEmail = email;

    // Call auth service to verify email
    this.authService.verifyEmail(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Check if verification is successful - handle different response formats
        console.log('Verification response:', response); // Debug log
        
        // If response is true (boolean) or any truthy value, show password reset form
        console.log('Response:', response, 'Type:', typeof response);
        if (response) {
          this.showPasswordReset = true;
          this.successMessage = `Email verified! You can now change your password for ${email}.`;
          
          // Show success toaster message
          this.toastr.success('Email verified successfully!', 'Success');
          
          console.log('showPasswordReset set to:', this.showPasswordReset);
          
          // Force Angular change detection
          this.cdr.detectChanges();
          
          // Force change detection
          setTimeout(() => {
            console.log('showPasswordReset in timeout:', this.showPasswordReset);
          }, 0);
        } else {
          this.errorMessage = 'Email verification failed. Please try again.';
          console.log('Verification failed, showPasswordReset:', this.showPasswordReset);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'Email not found. Please check your email address and try again.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to verify email. Please try again.';
        }
      }
    });
  }

  onPasswordReset(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const passwordData = {
      email: this.submittedEmail,
      newPassword: this.resetPasswordForm.value.newPassword
    };

    // Call auth service to change password
    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.showPasswordReset = false;
        
        // Show success toaster message
        this.toastr.success('Password updated successfully!', 'Success');
        
        this.successMessage = 'Your password has been successfully reset! You will be redirected to the login page.';
        
        // Clear forms
        this.resetPasswordForm.reset();
        this.forgotPasswordForm.reset();
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Current password is incorrect. Please try again.';
        } else if (error.status === 404) {
          this.errorMessage = 'User not found. Please start over.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to change password. Please try again.';
        }
      }
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() { return this.forgotPasswordForm.get('email'); }
  get newPassword() { return this.resetPasswordForm.get('newPassword'); }
  get confirmPassword() { return this.resetPasswordForm.get('confirmPassword'); }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(password: string): { strength: string; color: string; text: string } {
    if (!password) return { strength: 'weak', color: '#ef4444', text: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    if (score <= 2) return { strength: 'weak', color: '#ef4444', text: 'Weak password' };
    if (score <= 3) return { strength: 'medium', color: '#f59e0b', text: 'Medium strength' };
    return { strength: 'strong', color: '#22c55e', text: 'Strong password' };
  }

  startOver(): void {
    this.showPasswordReset = false;
    this.isSubmitted = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.submittedEmail = '';
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
