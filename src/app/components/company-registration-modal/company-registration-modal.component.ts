import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-company-registration-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './company-registration-modal.component.html',
  styleUrl: './company-registration-modal.component.css'
})
export class CompanyRegistrationModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  companyForm: FormGroup;
  isSubmitting = false;
  selectedLogoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      industry: ['', [Validators.required]],
      location: ['', [Validators.required]],
      size: ['', [Validators.required]],
      open_positions: [0, [Validators.required, Validators.min(0)]],
      rating: [0, [Validators.min(0), Validators.max(5)]]
    });
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
    }
  }

  onSubmit(): void {
    console.log('Modal form submitted');
    
    if (this.companyForm.invalid) {
      console.log('Form is invalid:', this.companyForm.value);
      this.toastr.error('Please fill all required fields correctly', 'Error');
      return;
    }

    this.isSubmitting = true;
    
    const formData = new FormData();
    const userId = this.authService.getUserId();
    
    console.log('User ID:', userId);
    
    if (!userId) {
      this.toastr.error('User not found. Please login again.', 'Error');
      this.isSubmitting = false;
      return;
    }

    // Add form fields
    Object.keys(this.companyForm.value).forEach(key => {
      formData.append(key, this.companyForm.value[key]);
      console.log(`Adding ${key}:`, this.companyForm.value[key]);
    });
    
    // Add user_id
    formData.append('user_id', userId.toString());
    console.log('Adding user_id:', userId);
    
    // Add logo file if selected
    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
      console.log('Adding logo file:', this.selectedLogoFile.name);
    }

    console.log('Calling createCompany API from modal...');
    this.authService.createCompany(formData).subscribe({
      next: (response) => {
        console.log('Company created successfully from modal:', response);
        this.toastr.success('Company registered successfully!', 'Success');
        this.success.emit();
        this.closeModal();
      },
      error: (error) => {
        console.error('Registration error from modal:', error);
        this.toastr.error(error.error?.message || 'Failed to register company', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit();
    this.isSubmitting = false;
    this.companyForm.reset();
    this.selectedLogoFile = null;
  }

  // Prevent closing when clicking inside the modal content
  onModalClick(event: Event): void {
    event.stopPropagation();
  }
}
