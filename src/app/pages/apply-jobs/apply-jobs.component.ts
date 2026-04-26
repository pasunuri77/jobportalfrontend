import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-apply-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-jobs.component.html',
  styleUrl: './apply-jobs.component.css'
})
export class ApplyJobsComponent implements OnInit {
  appliedJobs: any[] = [];
  filteredJobs: any[] = [];
  searchTerm: string = '';
  selectedJobType: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppliedJobs();
    this.cdr.detectChanges();
  }

  loadAppliedJobs(): void {
    this.isLoading = true;
    // Get current user's applications using JWT authentication
    this.authService.getUserApplications().subscribe({
      next: (applications: any) => {
        this.appliedJobs = Array.isArray(applications) ? applications : [];
        this.filteredJobs = [...this.appliedJobs];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading applied jobs:', error);
        this.toastr.error('Failed to load your applications', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterJobs(): void {
    this.filteredJobs = this.appliedJobs.filter(application => {
      const job = application.job || application; // Handle both nested and flat structures
      const matchesSearch = !this.searchTerm || 
        job.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedJobType || job.type === this.selectedJobType;
      
      return matchesSearch && matchesType;
    });
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filterJobs();
  }

  onTypeChange(): void {
    this.filterJobs();
  }

  viewApplicationDetails(application: any): void {
    // This would show application details or status
    this.toastr.info(`Application details for ${application.title} at ${application.companyName}`, 'Info');
  }

  withdrawApplication(application: any): void {
    if (confirm(`Are you sure you want to withdraw your application for ${application.title}?`)) {
      // This would call an API to withdraw the application
      this.toastr.success('Application withdrawn successfully', 'Success');
      // Reload the applied jobs
      this.loadAppliedJobs();
    }
  }

  getLogoUrl(logoPath: any): string {
    if (!logoPath) return '';
    
    if (typeof logoPath === 'string' && logoPath.startsWith('http')) {
      return logoPath;
    }
    
    if (typeof logoPath === 'object' && logoPath.url) {
      return logoPath.url;
    }
    
    if (typeof logoPath === 'string') {
      const backendUrl = environment.apiUrl;
      return logoPath.startsWith('/') ? `${backendUrl}${logoPath}` : `${backendUrl}/${logoPath}`;
    }
    
    return '';
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  formatJobType(type: string): string {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' }
  ];
}
