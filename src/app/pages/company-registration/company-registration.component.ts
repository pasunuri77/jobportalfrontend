import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-company-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './company-registration.component.html',
  styleUrl: './company-registration.component.css'
})
export class CompanyRegistrationComponent implements OnInit {

  companyForm: FormGroup;
  isSubmitting = false;
  selectedLogoFile: File | null = null;
  userId: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      industry: ['', [Validators.required]],
      location: ['', [Validators.required]],
      size: ['', [Validators.required]],
      openPositions: [0, [Validators.required, Validators.min(0)]], // ✅ FIXED
      rating: [0, [Validators.min(0), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    // Check for user data from dashboard
    const userDataStr = sessionStorage.getItem('userRegistrationData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      console.log('User data from token:', userData);
      
      // Pre-fill form with user data if available
      if (userData) {
        // You can pre-fill any relevant fields here
        // For example, if user has a name that could be related to company name
        if (userData.name) {
          this.companyForm.patchValue({
            // You might want to use user's name as initial company name suggestion
            // name: userData.name + ' Company' // Uncomment if needed
          });
        }
        
        // Store user ID for form submission
        this.userId = userData.id;
      }
      
      // Clear the session data after using it
      sessionStorage.removeItem('userRegistrationData');
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
    }
  }

  onSubmit(): void {

    if (this.companyForm.invalid) {
      this.toastr.error('Please fill all required fields correctly', 'Error');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    // Add form fields
    Object.keys(this.companyForm.value).forEach(key => {
      formData.append(key, this.companyForm.value[key]);
    });

    // Add user_id from token if available
    if (this.userId) {
      formData.append('user_id', this.userId.toString());
      console.log('Added user_id from token:', this.userId);
    } else {
      // Fallback: get user ID from auth service
      const fallbackUserId = this.authService.getUserId();
      if (fallbackUserId) {
        formData.append('user_id', fallbackUserId.toString());
        console.log('Added fallback user_id:', fallbackUserId);
      }
    }

    // Add logo file
    if (this.selectedLogoFile) {
      formData.append('file', this.selectedLogoFile);
    }

    this.authService.createCompany(formData).subscribe({
      next: (response) => {
        this.toastr.success('Company registered successfully!', 'Success');
        this.router.navigate(['/company-dashboard']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.toastr.error(error.error?.message || 'Failed to register company', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}