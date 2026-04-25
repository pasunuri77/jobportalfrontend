import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { JobApplicationModalComponent } from '../../components/job-application-modal/job-application-modal.component';
import se from '@angular/common/locales/se';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, JobApplicationModalComponent],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {


  jobs: any[] = [];
  selectedJob: any = null;
  searchTerm = '';
  selectedType = '';
  userApplications: any[] = [];

  // Modal properties
  showApplicationModal: boolean = false;
  selectedJobForApplication: any = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadUserApplications();
    this.authService.getAllJobs().subscribe((data: any) => {
      this.jobs = data;
      if (this.jobs.length > 0) {
        this.selectedJob = this.jobs[0];
      }
      this.cdr.detectChanges();
    });
  }

  loadUserApplications(): void {
    this.authService.getUserApplications().subscribe((data: any) => {
      this.userApplications = data;
      this.cdr.detectChanges();
    }, (error) => {
      console.error('Error loading user applications:', error);
    });
  }

  hasAlreadyApplied(jobId: string): boolean {
    return this.userApplications.some(app => app.jobId === jobId);
  }



  get filteredJobs() {
    return this.jobs.filter((job: any) => {
      const matchesSearch = job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.selectedType || job.type === this.selectedType;
      return matchesSearch && matchesType;
    });
  }

  selectJob(job: any): void {
    this.selectedJob = job;
  }

  applyForJob(job?: any): void {
    // Use provided job or selected job
    const jobToApply = job || this.selectedJob;
    if (!jobToApply) {
      return;
    }
    
    // Check if user has already applied to this job
    if (this.hasAlreadyApplied(jobToApply.id)) {
      // User has already applied, show error message
      this.toastr.error('You have already applied to this job.', 'Error');
      return;
    }
    
    this.selectedJobForApplication = jobToApply;
    this.showApplicationModal = true;
  }

  closeApplicationModal(): void {
    this.showApplicationModal = false;
    this.selectedJobForApplication = null;
    // Refresh user applications to update the UI
    this.loadUserApplications();
  }

  getLogoUrl(logoPath: any): string {
    if (!logoPath) return '';
    
    // If it's already a full URL, return as is
    if (typeof logoPath === 'string' && logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // If it's an object with url property
    if (typeof logoPath === 'object' && logoPath.url) {
      return logoPath.url;
    }
    
    // If it's a string path, prepend backend URL
    if (typeof logoPath === 'string') {
      const backendUrl = environment.apiUrl;
      return logoPath.startsWith('/') ? `${backendUrl}${logoPath}` : `${backendUrl}/${logoPath}`;
    }
    
    return '';
  }

  onImageError(event: any): void {
    // Hide the broken image
    event.target.style.display = 'none';
  }
}
