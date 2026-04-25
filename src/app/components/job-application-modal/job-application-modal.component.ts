import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-job-application-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-application-modal.component.html',
  styleUrls: ['./job-application-modal.component.css']
})
export class JobApplicationModalComponent {
  @Input() show: boolean = false;
  @Input() job: any = null;
  @Output() close = new EventEmitter<void>();

  // Form fields
  applicantEmail: string = '';
  selectedResume: File | null = null;
  resumePreview: string | null = null;

  // UI state
  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Pre-fill user data if logged in
    const userData = this.authService.getUserData();
    if (userData) {
      this.applicantEmail = userData.email || '';
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onResumeSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Please select a PDF or Word document', 'Error');
        event.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('Resume size should be less than 10MB', 'Error');
        event.target.value = '';
        return;
      }

      this.selectedResume = file;
      this.resumePreview = file.name;
    }
  }

  removeResume(): void {
    this.selectedResume = null;
    this.resumePreview = null;
    const fileInput = document.getElementById('resumeFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (!this.applicantEmail || !this.selectedResume) {
      this.toastr.error('Please provide your email and upload your resume', 'Error');
      return;
    }

    if (!this.job || !this.job.id) {
      this.toastr.error('Invalid job selection', 'Error');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    
    // Add separate form parameters as expected by backend API
    formData.append('email', this.applicantEmail);
    formData.append('jobId', this.job.id.toString());
    formData.append('file', this.selectedResume);

    // Submit application
    this.authService.applyForJob(formData).subscribe({
      next: () => {
        this.toastr.success('Application submitted successfully!', 'Success');
        this.isSubmitting = false;
        this.onClose();
      },
      error: (error) => {
        this.toastr.error('Failed to submit application. Please try again.', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  private resetForm(): void {
    this.applicantEmail = '';
    this.selectedResume = null;
    this.resumePreview = null;
    this.isSubmitting = false;
  }
}
