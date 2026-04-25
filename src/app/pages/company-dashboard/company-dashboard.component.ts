import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { JobService } from '../../service/job.service';
import { ToastrService } from 'ngx-toastr';
import { JobPostingComponent } from '../../components/job-posting/job-posting.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { Viewallapplications } from '../viewallapplications/viewallapplications';
import { ImageService } from '../../service/image.service';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    JobPostingComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    HeaderComponent,
    Viewallapplications,
  ],
  templateUrl: './company-dashboard.component.html',
  styleUrl: './company-dashboard.component.css',
})
export class CompanyDashboardComponent implements OnInit {

  company: any;
  showJobForm = false;
  showApplications = false;
  showJobs = false;
  isSubmitting = false;
  showRegistrationLink = false;
  userData: any = {};

  postedJobs: any[] = [];

  // ✅ UPDATE STATE
  selectedJobForUpdate: any = null;
  selectedLogoFile: File | null = null;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private router: Router,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    const email = this.authService.getUserEmail();
    
    // Extract user data from token
    this.userData = this.authService.getUserData();

    if (email) {
      this.authService.getCompanyByEmail(email).subscribe({
        next: (company) => {
          console.log('Company data received:', company);
          if (company && company.id) {
            this.company = company;
            this.toastr.success(`Welcome ${company.name}`, 'Success');
            this.cdr.detectChanges();
          } else {
            // No company data found, show registration link
            console.log('No company data found, showing registration link');
            this.showRegistrationLink = true;
            this.toastr.info('Please register your company to continue', 'Info');
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.log('API error occurred, showing registration link:', error);
          // API call failed, show registration link
          this.showRegistrationLink = true;
          this.toastr.info('Please register your company to continue', 'Info');
          this.cdr.detectChanges();
        }
      });
    } else {
      // No email found, show registration link
      console.log('No email found, showing registration link');
      this.showRegistrationLink = true;
      this.cdr.detectChanges();
    }
  }

  // ===============================
  // 🔥 TOGGLE SECTIONS
  // ===============================

  toggleJobForm(): void {
    this.showJobForm = !this.showJobForm;

    if (!this.showJobForm) {
      this.selectedJobForUpdate = null;
      this.selectedLogoFile = null;
    }
  }

  toggleApplications(): void {
    this.showApplications = !this.showApplications;
  }

  toggleJobs(): void {
    this.showJobs = !this.showJobs;

    if (this.showJobs) {
      this.loadCompanyJobs();
    }
  }

  // ===============================
  // 🔥 LOAD JOBS (FIXED)
  // ===============================

  loadCompanyJobs(): void {
    this.authService.getAllJobs().subscribe({
      next: (jobs: any) => {
        const allJobs = Array.isArray(jobs) ? jobs : [];
        
        // Filter jobs by company ID using if condition
        if (this.company && this.company.id) {
          this.postedJobs = allJobs.filter(job => {
            // Check if job belongs to current company
            if (job.companyId === this.company.id) {
              return true;
            }
            // Also check nested company object if available
            if (job.company && job.company.id === this.company.id) {
              return true;
            }
            return false;
          });
        } else {
          this.postedJobs = [];
        }
        
        console.log(`Filtered ${this.postedJobs.length} jobs for company ${this.company?.name || 'Unknown'} (ID: ${this.company?.id})`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load jobs', 'Error');
        this.postedJobs = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ===============================
  // 🔥 DELETE JOB
  // ===============================

  deleteJob(jobId: number): void {
    if (!confirm('Delete this job?')) return;

    this.authService.deleteJob(String(jobId)).subscribe({
      next: () => {
        this.postedJobs = this.postedJobs.filter(j => j.id !== jobId);
        this.toastr.success('Job deleted', 'Success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Delete failed', 'Error');
      }
    });
  }

  // ===============================
  // 🔥 OPEN UPDATE FORM
  // ===============================

  updateJob(job: any): void {
    this.selectedJobForUpdate = { ...job };
    this.showJobForm = true;
    this.showJobs = false;

    this.toastr.info('Edit job details', 'Info');
  }

  // ===============================
  // 🔥 HANDLE FILE
  // ===============================

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
    }
  }

  // ===============================
  // 🔥 HANDLE JOB UPDATE COMPLETION
  // ===============================

  onJobUpdated(): void {
    // Close the form
    this.showJobForm = false;
    this.selectedJobForUpdate = null;
    
    // Show success message
    this.toastr.success('Job updated successfully!', 'Success');
    
    // Refresh the jobs list
    this.loadCompanyJobs();
  }

  // ===============================
  // 🔥 IMAGE URL FIX
  // ===============================

  getLogoUrl(path: string): string {
    return this.imageService.getLogoUrl(path);
  }

  onImageError(event: any): void {
    this.imageService.onImageError(event);
  }

  // ===============================
  // 🔥 REGISTRATION LINK METHOD
  // ===============================

  navigateToRegistration(): void {
    // Store user data in sessionStorage for registration component
    sessionStorage.setItem('userRegistrationData', JSON.stringify(this.userData));
    this.router.navigate(['/company-registration']);
  }

}