import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  @Output() loginSuccess = new EventEmitter<void>();

  registerUrl = '/register';

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // UI state
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Handle remember me functionality
    if (this.loginForm.value.rememberMe) {
      localStorage.setItem('rememberedEmail', credentials.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          this.authService.setToken(response.token);
          
          // Store user data including role
          if (response.user) {
            this.authService.setUserData(response.user);
          } else if (response.data) {
            this.authService.setUserData(response.data);
          } else {
            // If user data is not in response, create minimal user object with role
            this.authService.setUserData({
              email: credentials.email,
              role: response.role || 'USER'
            });
          }
          
          // Fetch complete user details to get the actual user ID
          this.authService.getCurrentUser().subscribe({
            next: (userDetails) => {
              // Update user data with complete details including ID
              const currentData = this.authService.getUserData();
              const updatedData = {
                ...currentData,
                id: userDetails.id || userDetails.userId || userDetails.user_id,
                ...userDetails
              };
              this.authService.setUserData(updatedData);
              
              this.toastr.success('Login successful!', 'Success');
              this.loginSuccess.emit();
              
              // Redirect based on user role
              setTimeout(() => {
                if (this.authService.isAdmin()) {
                  this.router.navigate(['/admin-dashboard']);
                } else if (this.authService.isCompany()) {
                  this.router.navigate(['/company-dashboard']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
              }, 1500);
            },
            error: () => {
              // If fetching user details fails, continue with basic data
              this.toastr.success('Login successful!', 'Success');
              this.loginSuccess.emit();
              
              setTimeout(() => {
                if (this.authService.isAdmin()) {
                  this.router.navigate(['/admin-dashboard']);
                } else if (this.authService.isCompany()) {
                  this.router.navigate(['/company-dashboard']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
              }, 1500);
            }
          });
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        if (error.status === 0) {
          this.toastr.error('Unable to connect to server. Please check if the backend is running and accessible.', 'Error');
        } else if (error.status === 401) {
          this.toastr.error('Invalid email or password. Please try again.', 'Error');
        } else if (error.status === 404) {
          this.toastr.error('Login endpoint not found. Please check your backend configuration.', 'Error');
        } else if (error.error?.message) {
          this.toastr.error(error.error.message, 'Error');
        } else {
          this.toastr.error('Login failed. Please check your credentials and try again.', 'Error');
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); }
}
