import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, interval, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplicants: number;
}

interface PaginationData {
  users: { page: number; limit: number };
  companies: { page: number; limit: number };
  jobs: { page: number; limit: number };
  applicants: { page: number; limit: number };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, HeaderComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Data arrays
  user: any[] = [];
  company: any[] = [];
  jobs: any[] = [];
  applicants: any[] = [];

  // Search and filter
  searchUser: string = '';
  searchCompany: string = '';
  searchJob: string = '';
  searchApplicant: string = '';
  roleFilter: string = '';
  jobTypeFilter: string = '';
  applicationStatusFilter: string = '';

  // Pagination
  pagination: PaginationData = {
    users: { page: 1, limit: 6 },
    companies: { page: 1, limit: 6 },
    jobs: { page: 1, limit: 6 },
    applicants: { page: 1, limit: 6 },
  };

  // Loading and visibility states
  showUsers: boolean = false;
  showCompanies: boolean = false;
  showJobs: boolean = false;
  showApplicants: boolean = false;

  isLoadingUsers: boolean = false;
  isLoadingCompanies: boolean = false;
  isLoadingJobs: boolean = false;
  isLoadingApplicants: boolean = false;
  isRefreshing: boolean = false;

  // Real-time updates
  private destroy$ = new Subject<void>();
  lastUpdated: Date = new Date();
  autoRefresh: boolean = true;
  refreshInterval: number = 10000; // 10 seconds

  // Sorting
  jobSortBy: string = '';
  companySortBy: string = '';

  // Delete confirmation modal
  deleteModal: { show: boolean; type: string; id: string; name: string } = {
    show: false,
    type: '',
    id: '',
    name: '',
  };

  // Update job modal
  updateJobModal: { show: boolean; job: any } = {
    show: false,
    job: null,
  };

  // Expanded items
  expandedJobs: Set<number> = new Set();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.loadAllData();

    // Set up real-time polling if enabled
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data
   */
  loadAllData(): void {
    this.loadUsers();
    this.loadCompanies();
    this.loadJobs();
    this.loadApplications();
  }

  /**
   * Setup auto-refresh of data
   */
  setupAutoRefresh(): void {
    interval(this.refreshInterval)
      .pipe(
        switchMap(() => this.authService.getAllUsers()),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (users: any) => {
          this.user = Array.isArray(users) ? users : [];
          this.lastUpdated = new Date();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Auto-refresh error:', err),
      });
  }

  /**
   * Load Users
   */
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.authService.getAllUsers().subscribe({
      next: (users: any) => {
        this.user = Array.isArray(users) ? users : [];
        this.pagination.users.page = 1;
        this.isLoadingUsers = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.toastr.error('Failed to load users data', 'Error');
        this.isLoadingUsers = false;
        console.error('Error loading users:', error);
      },
    });
  }

  /**
   * Load Companies
   */
  loadCompanies(): void {
    this.isLoadingCompanies = true;
    this.authService.getAllCompanies().subscribe({
      next: (companies: any) => {
        this.company = Array.isArray(companies) ? companies : [];
        this.pagination.companies.page = 1;
        this.isLoadingCompanies = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.toastr.error('Failed to load companies data', 'Error');
        this.isLoadingCompanies = false;
        console.error('Error loading companies:', error);
      },
    });
  }

  /**
   * Load Jobs
   */
  loadJobs(): void {
    this.isLoadingJobs = true;
    this.authService.getAllJobs().subscribe({
      next: (jobs: any) => {
        this.jobs = Array.isArray(jobs) ? jobs : [];
        this.pagination.jobs.page = 1;
        this.isLoadingJobs = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.toastr.error('Failed to load jobs data', 'Error');
        this.isLoadingJobs = false;
        console.error('Error loading jobs:', error);
      },
    });
  }

  /**
   * Load Applications
   */
  loadApplications(): void {
    this.isLoadingApplicants = true;
    this.authService.getAllApplications().subscribe({
      next: (applications: any) => {
        this.applicants = Array.isArray(applications) ? applications : [];
        this.pagination.applicants.page = 1;
        this.isLoadingApplicants = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.toastr.error('Failed to load applications data', 'Error');
        this.isLoadingApplicants = false;
        console.error('Error loading applications:', error);
      },
    });
  }

  /**
   * Toggle section visibility
   */
  toggleUsers(): void {
    this.showUsers = !this.showUsers;
    if (this.showUsers && this.user.length === 0) this.loadUsers();
    this.cdr.detectChanges();
  }

  toggleCompanies(): void {
    this.showCompanies = !this.showCompanies;
    if (this.showCompanies && this.company.length === 0) this.loadCompanies();
    this.cdr.detectChanges();
  }

  toggleJobs(): void {
    this.showJobs = !this.showJobs;
    if (this.showJobs && this.jobs.length === 0) this.loadJobs();
    this.cdr.detectChanges();
  }

  toggleApplicants(): void {
    this.showApplicants = !this.showApplicants;
    if (this.showApplicants && this.applicants.length === 0) this.loadApplications();
    this.cdr.detectChanges();
  }

  /**
   * Filter Users
   */
  get filteredUsers(): any[] {
    return this.user.filter((u) => {
      const matchesSearch =
        !this.searchUser ||
        u.name?.toLowerCase().includes(this.searchUser.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchUser.toLowerCase());

      const matchesRole = !this.roleFilter || u.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }

  /**
   * Paginated Users
   */
  get paginatedUsers(): any[] {
    const start = (this.pagination.users.page - 1) * this.pagination.users.limit;
    return this.filteredUsers.slice(start, start + this.pagination.users.limit);
  }

  get userPageCount(): number {
    return Math.ceil(this.filteredUsers.length / this.pagination.users.limit);
  }

  /**
   * Filter Companies
   */
  get filteredCompanies(): any[] {
    let filtered = this.company.filter((c) => {
      const matchesSearch =
        !this.searchCompany ||
        c.name?.toLowerCase().includes(this.searchCompany.toLowerCase()) ||
        c.location?.toLowerCase().includes(this.searchCompany.toLowerCase());
      return matchesSearch;
    });

    // Sorting
    if (this.companySortBy === 'rating') {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.companySortBy === 'size') {
      const sizeOrder: any = { STARTUP: 1, SMALL: 2, MEDIUM: 3, LARGE: 4, ENTERPRISE: 5 };
      filtered = filtered.sort((a, b) => (sizeOrder[b.size] || 0) - (sizeOrder[a.size] || 0));
    }

    return filtered;
  }

  /**
   * Paginated Companies
   */
  get paginatedCompanies(): any[] {
    const start = (this.pagination.companies.page - 1) * this.pagination.companies.limit;
    return this.filteredCompanies.slice(start, start + this.pagination.companies.limit);
  }

  get companyPageCount(): number {
    return Math.ceil(this.filteredCompanies.length / this.pagination.companies.limit);
  }

  /**
   * Filter Jobs
   */
  get filteredJobs(): any[] {
    return this.jobs.filter((j) => {
      const matchesSearch =
        !this.searchJob ||
        j.title?.toLowerCase().includes(this.searchJob.toLowerCase()) ||
        j.location?.toLowerCase().includes(this.searchJob.toLowerCase());

      const matchesType = !this.jobTypeFilter || j.type === this.jobTypeFilter;

      return matchesSearch && matchesType;
    });
  }

  /**
   * Paginated Jobs
   */
  get paginatedJobs(): any[] {
    const start = (this.pagination.jobs.page - 1) * this.pagination.jobs.limit;
    return this.filteredJobs.slice(start, start + this.pagination.jobs.limit);
  }

  get jobPageCount(): number {
    return Math.ceil(this.filteredJobs.length / this.pagination.jobs.limit);
  }

  /**
   * Filter Applications
   */
  get filteredApplicants(): any[] {
    return this.applicants.filter((app) => {
      const matchesSearch =
        !this.searchApplicant ||
        app.user?.name?.toLowerCase().includes(this.searchApplicant.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(this.searchApplicant.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(this.searchApplicant.toLowerCase());

      const matchesStatus =
        !this.applicationStatusFilter || app.status === this.applicationStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Paginated Applicants
   */
  get paginatedApplicants(): any[] {
    const start = (this.pagination.applicants.page - 1) * this.pagination.applicants.limit;
    return this.filteredApplicants.slice(start, start + this.pagination.applicants.limit);
  }

  get applicantPageCount(): number {
    return Math.ceil(this.filteredApplicants.length / this.pagination.applicants.limit);
  }

  /**
   * Update application status
   */
  updateApplicationStatus(appId: number, newStatus: string): void {
    if (!newStatus) return;

    this.authService.updateApplicationStatus(appId, newStatus).subscribe({
      next: () => {
        const app = this.applicants.find((a) => a.id === appId);
        if (app) {
          app.status = newStatus;
          this.toastr.success(`Application status updated to ${newStatus}`, 'Success');
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error updating status:', error);
        this.toastr.error('Failed to update application status', 'Error');
      },
    });
  }

  /**
   * Handle status dropdown change event
   */
  onStatusChange(event: Event, appId: number): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    this.updateApplicationStatus(appId, newStatus);
  }

  /**
   * Show delete confirmation modal
   */
  showDeleteConfirmation(type: string, id: string, name: string): void {
    this.deleteModal = { show: true, type, id, name };
  }

  /**
   * Close delete confirmation modal
   */
  closeDeleteConfirmation(): void {
    this.deleteModal = { show: false, type: '', id: '', name: '' };
  }

  /**
   * Confirm and delete
   */
  confirmDelete(): void {
    if (this.deleteModal.type === 'company') {
      this.deleteCompany(this.deleteModal.id);
    } else if (this.deleteModal.type === 'job') {
      this.deleteJob(this.deleteModal.id);
    } else if (this.deleteModal.type === 'user') {
      this.deleteUser(this.deleteModal.id);
    }
    this.closeDeleteConfirmation();
  }

  /**
   * Delete Company
   */
  deleteCompany(companyId: string): void {
    this.authService.deleteCompany(companyId).subscribe({
      next: () => {
        this.company = this.company.filter((c) => c.id !== companyId);
        this.cdr.detectChanges();
        this.toastr.success('Company deleted successfully!', 'Success');
      },
      error: (error: any) => {
        console.error('Error deleting company:', error);
        this.toastr.error('Failed to delete company. Please try again.', 'Error');
      },
    });
  }

  /**
   * Delete User
   */
  deleteUser(userId: string): void {
    // Convert string ID to number for backend compatibility
    const numericId = parseInt(userId, 10);
    if (isNaN(numericId)) {
      this.toastr.error('Invalid user ID', 'Error');
      return;
    }
    
    console.log('Attempting to delete user with ID:', numericId);
    console.log('Token available:', !!localStorage.getItem('token'));
    
    this.authService.deleteUser(numericId.toString()).subscribe({
      next: () => {
        this.user = this.user.filter((u) => u.id !== userId);
        this.cdr.detectChanges();
        this.toastr.success('User deleted successfully!', 'Success');
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // Check if it's actually a success (some backends return 200 but Angular treats it as error)
        if (error.status === 200 || error.status === 204) {
          this.user = this.user.filter((u) => u.id !== userId);
          this.cdr.detectChanges();
          this.toastr.success('User deleted successfully!', 'Success');
          return;
        }
        
        this.toastr.error(`Failed to delete user: ${error.status} ${error.statusText || ''}`, 'Error');
      },
    });
  }

  /**
   * Delete Job
   */
  deleteJob(jobId: string): void {
    this.authService.deleteJob(jobId).subscribe({
      next: () => {
        this.jobs = this.jobs.filter((j) => j.id !== jobId);
        this.cdr.detectChanges();
        this.toastr.success('Job deleted successfully!', 'Success');
      },
      error: (error: any) => {
        console.error('Error deleting job:', error);
        this.toastr.error('Failed to delete job. Please try again.', 'Error');
      },
    });
  }

  /**
   * Show update job modal
   */
  showUpdateJobModal(job: any, event?: Event): void {
    // Prevent event bubbling to avoid opening accordion
    event?.stopPropagation();

    // Store the job to be updated and show modal
    this.updateJobModal = {
      show: true,
      job: { ...job }, // Create a copy to avoid direct reference
    };
  }

  /**
   * Close update job modal
   */
  closeUpdateJobModal(): void {
    this.updateJobModal = { show: false, job: null };
  }

  /**
   * Update job
   */
  updateJob(): void {
    if (!this.updateJobModal.job) return;

    this.authService.updateJob(this.updateJobModal.job.id, this.updateJobModal.job).subscribe({
      next: (updatedJob: any) => {
        // Update the job in the array
        const index = this.jobs.findIndex((j) => j.id === updatedJob.id);
        if (index !== -1) {
          this.jobs[index] = updatedJob;
          this.cdr.detectChanges();
        }
        this.toastr.success('Job updated successfully!', 'Success');
        this.closeUpdateJobModal();
      },
      error: (error: any) => {
        console.error('Error updating job:', error);
        this.toastr.error('Failed to update job. Please try again.', 'Error');
      },
    });
  }

  /**
   * Toggle job accordion
   */
  toggleJobApplicants(jobId: number): void {
    if (this.expandedJobs.has(jobId)) {
      this.expandedJobs.delete(jobId);
    } else {
      this.expandedJobs.add(jobId);
    }
    this.cdr.detectChanges();
  }

  isJobExpanded(jobId: number): boolean {
    return this.expandedJobs.has(jobId);
  }

  /**
   * Get applicants for a job
   */
  getJobApplicants(jobId: number): any[] {
    return this.applicants.filter((app) => app.job?.id === jobId);
  }

  /**
   * Get company logo URL
   */
  getLogoUrl(logoPath: string): string {
    if (!logoPath)
      return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
    if (logoPath.startsWith('http')) return logoPath;
    const backendUrl = environment.apiUrl;
    return logoPath.startsWith('/') ? `${backendUrl}${logoPath}` : `${backendUrl}/${logoPath}`;
  }

  /**
   * Get resume download URL
   */
  getResumeUrl(resumePath: string): string {
    if (!resumePath) return '';
    // Don't prepend API URL for resume downloads - use the path as is
    return resumePath.startsWith('http') ? resumePath : resumePath;
  }

  /**
   * Refresh all data manually
   */
  refreshData(): void {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    this.loadAllData();
    this.toastr.info('Data refreshed', 'Info');

    // Keep spinning for at least 1 second for a nice effect
    setTimeout(() => {
      this.isRefreshing = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  /**
   * Track by functions for ngFor performance
   */
  trackByUserId(index: number, user: any): number {
    return user.id;
  }

  trackByCompanyId(index: number, company: any): number {
    return company.id;
  }

  trackByJobId(index: number, job: any): number {
    return job.id;
  }

  trackByApplicantId(index: number, applicant: any): number {
    return applicant.id;
  }
}
