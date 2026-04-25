import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JobService } from '../../service/job.service';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-job-posting',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.css'],
})
export class JobPostingComponent implements OnInit {
  // Input property for editing
  @Input() jobData: any = null;
  
  // Output event emitter for job updates
  @Output() jobUpdated = new EventEmitter<void>();
  
  // Form fields
  title: string = '';
  companyName: string = '';
  location: string = '';
  type: string = 'FULL_TIME';
  salary: string = '';
  posted: string = '';
  description: string = '';
  requirements: string = '';
  file: string = '';

  // File upload
  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;

  // UI state
  isSubmitting: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  isEditMode: boolean = false;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {
    // Pre-fill company name and posted date
    const userData = this.authService.getUserData();
    this.companyName = userData?.name || '';
    this.posted = new Date().toISOString();
  }

  ngOnInit(): void {
    if (this.jobData) {
      this.isEditMode = true;
      this.populateFormWithJobData();
    }
  }

  populateFormWithJobData(): void {
    if (this.jobData) {
      this.title = this.jobData.title || '';
      this.companyName = this.jobData.companyName || '';
      this.location = this.jobData.location || '';
      this.type = this.jobData.type || 'FULL_TIME';
      this.salary = this.jobData.salary || '';
      this.posted = this.jobData.posted || new Date().toISOString();
      this.description = this.jobData.description || '';
      this.requirements = this.jobData.requirements ? 
        Array.isArray(this.jobData.requirements) ? 
          this.jobData.requirements.join(', ') : 
          this.jobData.requirements : '';
      
      // Set logo preview if available
      if (this.jobData.logo) {
        this.logoPreview = this.jobData.logo.startsWith('http') ? 
          this.jobData.logo : 
          `http://localhost:8080${this.jobData.logo}`;
      }
    }
  }

  onSubmit(): void {
    if (
      !this.title ||
      !this.companyName ||
      !this.location ||
      !this.salary ||
      !this.description ||
      !this.requirements
    ) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    if (!this.selectedLogoFile) {
      this.showMessage('Please upload a company logo', 'error');
      return;
    }

    this.isSubmitting = true;

    const requirementsArray = this.requirements
      .split(',')
      .map((req) => req.trim())
      .filter((req) => req.length > 0);

    const formData = new FormData();

    const jobData = {
      title: this.title,
      companyName: this.companyName,
      location: this.location,
      type: this.type,
      salary: this.salary,
      posted: this.posted,
      description: this.description,
      requirements: requirementsArray,
    };

    // ✅ FIX: Send as JSON Blob
    formData.append('jobData', new Blob([JSON.stringify(jobData)], { type: 'application/json' }));

    // ✅ File
    formData.append('file', this.selectedLogoFile);

    if (this.isEditMode && this.jobData?.id) {
      // Update existing job
      this.jobService.updateJob(this.jobData.id, formData).subscribe({
        next: () => {
          this.toastr.success('Job updated successfully!', 'Success');
          this.showMessage('Job updated successfully!', 'success');
          this.resetForm();
          this.isSubmitting = false;
          this.isEditMode = false;
          this.jobData = null;
          
          // Emit event to notify parent component
          this.jobUpdated.emit();
        },
        error: (error) => {
          console.error('Error updating job:', error);
          this.toastr.error('Failed to update job. Please try again.', 'Error');
          this.showMessage('Failed to update job. Please try again.', 'error');
          this.isSubmitting = false;
        },
      });
    } else {
      // Create new job
      console.log('Creating job with data:', formData);
      this.jobService.createJob(formData).subscribe({
        next: (response) => {
          console.log('Job creation response:', response);
          this.toastr.success('Job posted successfully!', 'Success');
          this.showMessage('Job posted successfully!', 'success');
          this.resetForm();
          this.isSubmitting = false;
          
          // Emit event to notify parent component
          this.jobUpdated.emit();
        },
        error: (error) => {
          console.error('Error posting job:', error);
          this.toastr.error('Failed to post job. Please try again.', 'Error');
          this.showMessage('Failed to post job. Please try again.', 'error');
          this.isSubmitting = false;
        },
        complete: () => {
          console.log('Job creation observable completed');
        }
      });
    }
  }

  resetForm(): void {
    this.title = '';
    this.location = '';
    this.type = 'FULL_TIME';
    this.salary = '';
    this.description = '';
    this.requirements = '';
    this.file = '';
    this.selectedLogoFile = null;
    this.logoPreview = null;
    this.isEditMode = false;
    this.jobData = null;
    // Keep companyName and posted as they should persist
  }

  onLogoFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showMessage('Please select an image file', 'error');
        event.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('Image size should be less than 5MB', 'error');
        event.target.value = '';
        return;
      }

      this.selectedLogoFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreview = null;
    const fileInput = document.getElementById('logoFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;

    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  // Job type options
  jobTypes = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
  ];
}
