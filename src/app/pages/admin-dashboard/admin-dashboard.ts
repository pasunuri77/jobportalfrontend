import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { ReusableTableComponent, TableConfig } from '../../ui-components/reusable-table/reusable-table.component';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, interval, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environment/environment';
import { AdminStatusChart } from '../../charts/admin-status-chart/admin-status-chart';

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
  imports: [CommonModule, FormsModule, RouterOutlet, HeaderComponent, ReusableTableComponent, AdminStatusChart],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
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

  // Table Configuration
  usersTableConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '70px', type: 'number' },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      {
        key: 'role', label: 'Role', type: 'badge', sortable: true,
        badgeClass: (value) => {
          switch (value?.toLowerCase()) {
            case 'admin':
              return 'status-active';
            case 'company':
              return 'role-company';
            default:
              return 'role-user';
          }
        }
      },
      { key: 'delete', label: 'Actions', type: 'action' }
    ],
    pageSize: 10,
    striped: true,
    bordered: true,
    hoverable: true,
    selectable: false
  };

  // Caching configs to prevent repeated template generation on change detection
  private cachedCompaniesConfig: TableConfig | null = null;
  private cachedJobsConfig: TableConfig | null = null;
  private cachedApplicantsConfig: TableConfig | null = null;

  getCompaniesTableConfig(logoCol: any, ratingCol: any, actionsCol: any): TableConfig {
    if (this.cachedCompaniesConfig) return this.cachedCompaniesConfig;
    if (!logoCol) return { columns: [] };

    this.cachedCompaniesConfig = {
      columns: [
        { key: 'logo', label: 'Logo', type: 'custom', customTemplate: logoCol, width: '90px' },
        { key: 'name', label: 'Company Name', sortable: true },
        { key: 'industry', label: 'Industry', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'size', label: 'Size', sortable: true },
        { key: 'rating', label: 'Rating', type: 'custom', customTemplate: ratingCol, sortable: true },
        { key: 'openPositions', label: 'Open Positions', sortable: true },
        { key: 'actions', label: 'Actions', type: 'custom', customTemplate: actionsCol }
      ],
      pageSize: 6,
      striped: true,
      bordered: true,
      hoverable: true,
      selectable: false
    };
    return this.cachedCompaniesConfig;
  }

  getJobsTableConfig(applicantsCol: any, actionsCol: any): TableConfig {
    if (this.cachedJobsConfig) return this.cachedJobsConfig;
    if (!applicantsCol) return { columns: [] };

    this.cachedJobsConfig = {
      columns: [
        { key: 'title', label: 'Job Title', sortable: true },
        {
          key: 'type', label: 'Type', type: 'badge', sortable: true,
          badgeClass: (value) => {
            return 'type-' + (value?.toLowerCase().replace('_', '-') || 'full-time');
          }
        },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'salary', label: 'Salary', sortable: true },
        { key: 'applicants', label: 'Applicants', type: 'custom', customTemplate: applicantsCol },
        { key: 'actions', label: 'Actions', type: 'custom', customTemplate: actionsCol }
      ],
      pageSize: 6,
      striped: true,
      bordered: true,
      hoverable: true,
      selectable: false
    };
    return this.cachedJobsConfig;
  }

  getApplicantsTableConfig(userCol: any, jobCol: any, resumeCol: any, actionsCol: any): TableConfig {
    if (this.cachedApplicantsConfig) return this.cachedApplicantsConfig;
    if (!userCol) return { columns: [] };

    this.cachedApplicantsConfig = {
      columns: [
        { key: 'user', label: 'Applicant', type: 'custom', customTemplate: userCol },
        { key: 'job', label: 'Job Details', type: 'custom', customTemplate: jobCol },
        {
          key: 'status', label: 'Status', type: 'badge', sortable: true,
          badgeClass: (value) => {
            return 'status-' + (value?.toLowerCase() || 'applied');
          }
        },
        { key: 'resume', label: 'Resume', type: 'custom', customTemplate: resumeCol },
        { key: 'actions', label: 'Actions', type: 'custom', customTemplate: actionsCol }
      ],
      pageSize: 6,
      striped: true,
      bordered: true,
      hoverable: true,
      selectable: false
    };
    return this.cachedApplicantsConfig;
  }

  ngAfterViewInit() {
    // Empty definition since we bind directly in template
  }

  // Loading and visibility states
  showUsers: boolean = false;
  showCompanies: boolean = false;
  showJobs: boolean = false;
  showApplicants: boolean = false;

  get isAnySectionOpen(): boolean {
    return this.showUsers || this.showCompanies || this.showJobs || this.showApplicants;
  }

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
  expandedCompanies: Set<string> = new Set();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) { }

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
    const opening = !this.showUsers;
    this.showUsers = opening;
    this.showCompanies = false;
    this.showJobs = false;
    this.showApplicants = false;

    if (opening && this.user.length === 0) this.loadUsers();
    this.cdr.detectChanges();
  }

  toggleCompanies(): void {
    const opening = !this.showCompanies;
    this.showCompanies = opening;
    this.showUsers = false;
    this.showJobs = false;
    this.showApplicants = false;

    if (opening && this.company.length === 0) this.loadCompanies();
    this.cdr.detectChanges();
  }

  toggleJobs(): void {
    const opening = !this.showJobs;
    this.showJobs = opening;
    this.showUsers = false;
    this.showCompanies = false;
    this.showApplicants = false;

    if (opening && this.jobs.length === 0) this.loadJobs();
    this.cdr.detectChanges();
  }

  toggleApplicants(): void {
    const opening = !this.showApplicants;
    this.showApplicants = opening;
    this.showUsers = false;
    this.showCompanies = false;
    this.showJobs = false;

    if (opening && this.applicants.length === 0) this.loadApplications();
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
   * Handle user table actions (from reusable table component)
   */
  onUserTableAction(event: { action: string; row: any }): void {
    if (event.action === 'delete') {
      // Check if user is admin (cannot delete admin users)
      if (event.row.role === 'ADMIN') {
        this.toastr.warning('Cannot delete admin users', 'Warning');
        return;
      }
      this.showDeleteConfirmation('user', event.row.id, event.row.name);
    }
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
        // Treat 200/204 returned inside error as success (some backends return success but response parsing triggers error)
        if (error && (error.status === 200 || error.status === 204)) {
          this.company = this.company.filter((c) => c.id !== companyId);
          this.cdr.detectChanges();
          this.toastr.success('Company deleted successfully!', 'Success');
          return;
        }
        const serverMessage = error?.error?.message || error?.message || 'Failed to delete company. Please try again.';
        this.toastr.error(serverMessage, 'Error');
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
        // Some backends return 200/204 but Angular reports an error; treat those as success.
        if (error && (error.status === 200 || error.status === 204)) {
          this.user = this.user.filter((u) => u.id !== userId);
          this.cdr.detectChanges();
          this.toastr.success('User deleted successfully!', 'Success');
          return;
        }
        const serverMessage = error?.error?.message || error?.message || `Failed to delete user: ${error.status || ''}`;
        this.toastr.error(serverMessage, 'Error');
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
        if (error && (error.status === 200 || error.status === 204)) {
          this.jobs = this.jobs.filter((j) => j.id !== jobId);
          this.cdr.detectChanges();
          this.toastr.success('Job deleted successfully!', 'Success');
          return;
        }
        const serverMessage = error?.error?.message || error?.message || 'Failed to delete job. Please try again.';
        this.toastr.error(serverMessage, 'Error');
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

  toggleCompanyDescription(companyId: any): void {
    const idStr = companyId?.toString();
    if (this.expandedCompanies.has(idStr)) {
      this.expandedCompanies.delete(idStr);
    } else {
      this.expandedCompanies.add(idStr);
    }
    this.cdr.detectChanges();
  }

  isCompanyExpanded(companyId: any): boolean {
    return this.expandedCompanies.has(companyId?.toString());
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
