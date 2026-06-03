import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { JobService } from '../../service/job.service';
import { ToastrService } from 'ngx-toastr';
import { JobPostingComponent } from '../../components/job-posting/job-posting.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { Viewallapplications } from '../viewallapplications/viewallapplications';
import { environment } from '../../../environment/environment';
import { ApplicationService } from '../../service/application.service';
import { AdminStatusChart } from '../../charts/admin-status-chart/admin-status-chart';
import { Chart } from 'chart.js';

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
    Viewallapplications
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
  applications: any[] = [];
  totalApplications = 0;
  activeJobs = 0;
  hiredCandidates = 0;
  applicationsThisWeek = 0;
  recentApplications: any[] = [];
  activityOverview: any[] = [];

  @ViewChild('applicationsPerJobCanvas') applicationsPerJobCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('applicationsStatusCanvas') applicationsStatusCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;
  private statusChartInstance: Chart | null = null;

  // ✅ UPDATE STATE
  selectedJobForUpdate: any = null;
  selectedLogoFile: File | null = null;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private router: Router,
    private applicationService: ApplicationService
  ) { }

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
            // Load related data for dashboard metrics
            this.loadCompanyJobs();
            this.loadCompanyApplications();
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

  ngAfterViewInit(): void {
    // charts render after data arrives
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

  private loadCompanyApplications(): void {
    this.applicationService.getApplicationsByCompanyId().subscribe({
        next: (apps: any) => {
          this.applications = Array.isArray(apps) ? apps : (apps?.data || []);
        this.computeDerivedMetrics();
        this.renderApplicationsPerJobChart();
        this.renderApplicationsStatusChart();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load applications', err);
        this.applications = [];
        this.computeDerivedMetrics();
      }
    });
  }

  private computeDerivedMetrics(): void {
    this.totalApplications = this.applications.length;
    this.activeJobs = this.postedJobs.length || (this.company?.openPositions || 0);
    this.hiredCandidates = this.applications.filter(a => (a.status || '').toUpperCase() === 'SELECTED' || (a.status || '').toUpperCase() === 'HIRED').length;

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.applicationsThisWeek = this.applications.filter(a => new Date(a.createdAt || a.appliedAt || Date.now()).getTime() >= oneWeekAgo).length;

    this.recentApplications = [...this.applications].sort((a, b) => (new Date(b.createdAt || b.appliedAt || Date.now()).getTime()) - (new Date(a.createdAt || a.appliedAt || Date.now()).getTime())).slice(0, 6);
  }

  private renderApplicationsPerJobChart(): void {
    if (!this.applicationsPerJobCanvas) return;

    const counts: { [key: string]: number } = {};
    this.applications.forEach(app => {
      const title = app.jobTitle || app.job?.title || 'Unknown';
      counts[title] = (counts[title] || 0) + 1;
    });

    const labels = Object.keys(counts).slice(0, 8);
    const data = labels.map(l => counts[l]);

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    this.chartInstance = new Chart(this.applicationsPerJobCanvas.nativeElement.getContext('2d') as any, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Applications',
          barThickness: 30,
          data,
          backgroundColor: 'rgba(175,153,255,0.92)',
          borderColor: '#af99ff',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(31,41,55,0.06)' } },
          x: { ticks: { color: '#6b7280' } }
        }
      }
    });
  }

  private renderApplicationsStatusChart(): void {
    if (!this.applicationsStatusCanvas) return;

    const applied = this.applications.filter(a => (a.status || '').toUpperCase() === 'APPLIED').length;
    const selected = this.applications.filter(a => (a.status || '').toUpperCase() === 'SELECTED' || (a.status || '').toUpperCase() === 'HIRED').length;
    const rejected = this.applications.filter(a => (a.status || '').toUpperCase() === 'REJECTED').length;

    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
      this.statusChartInstance = null;
    }

    this.statusChartInstance = new Chart(this.applicationsStatusCanvas.nativeElement.getContext('2d') as any, {
      type: 'doughnut',
      data: {
        labels: ['Applied', 'Hired', 'Rejected'],
        datasets: [{
          data: [applied, selected, rejected],
          backgroundColor: [
            'rgba(175,153,255,0.92)',
            'rgba(139,115,232,0.9)',
            'rgba(216,204,255,0.9)'
          ],
          borderColor: ['#af99ff', '#8b73e8', '#d8ccff'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '65%'
      }
    });
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
      next: (response) => {
        this.postedJobs = this.postedJobs.filter(j => j.id !== jobId);
        this.toastr.success('Delete successfully', 'Success');
        this.cdr.detectChanges();
      },
      error: (error) => {
        // Check if it's actually a success (some backends return 200 but Angular treats it as error)
        if (error.status === 200 || error.status === 204) {
          this.postedJobs = this.postedJobs.filter(j => j.id !== jobId);
          this.toastr.success('Delete successfully', 'Success');
          this.cdr.detectChanges();
          return;
        }

        // Show more specific error message based on status
        if (error.status === 401) {
          this.toastr.error('Authentication failed. Please login again.', 'Error');
        } else if (error.status === 403) {
          this.toastr.error('You do not have permission to delete this job.', 'Error');
        } else if (error.status === 404) {
          this.toastr.error('Job not found.', 'Error');
        } else {
          this.toastr.error('Delete failed. Please try again.', 'Error');
        }
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
    if (!path) return '';

    const base = environment.apiUrl;

    return path.startsWith('http')
      ? path
      : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
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