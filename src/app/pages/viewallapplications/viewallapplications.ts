import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../service/application.service';
import { JobService } from '../../service/job.service';
import { ImageService } from '../../service/image.service';
import { environment } from '../../../environment/environment';
@Component({
  selector: 'app-viewallapplications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viewallapplications.html',
  styleUrl: './viewallapplications.css',
})
export class Viewallapplications implements OnInit {
  applications: any[] = [];
  jobsList: any[] = [];
  expandedJobs: Set<number> = new Set();
  isLoading: boolean = true;
  errorMessage: string = '';
  environment = environment;

  constructor(private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef,
    private jobService: JobService,
    public imageService: ImageService
  ) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.applicationService.getApplicationsByCompanyId().subscribe({
      next: (applications: any) => {


        this.applications = Array.isArray(applications) ? applications : [];
        this.groupApplicationsByJob();
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection to update template
      },
      error: (error) => {

        this.errorMessage = 'Failed to load applications';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  groupApplicationsByJob(): void {
    this.jobsList = [];




    const jobMap = new Map();

    this.applications.forEach((app: any, index: number) => {


      const jobKey = app.job.id;

      if (!jobMap.has(jobKey)) {
        jobMap.set(jobKey, {
          id: app.job.id,
          title: app.job.title,
          companyName: app.job.companyName,
          location: app.job.location,
          type: app.job.type,
          salary: app.job.salary,
          description: app.job.description,
          requirements: app.job.requirements || [],
          applications: [],
        });
      }

      jobMap.get(jobKey).applications.push(app);
    });

    this.jobsList = Array.from(jobMap.values());
    this.cdr.detectChanges(); // Force change detection to update template
  }

  toggleJobAccordion(jobId: number): void {
    if (this.expandedJobs.has(jobId)) {
      this.expandedJobs.delete(jobId);
    } else {
      this.expandedJobs.add(jobId);
    }
  }

  isJobExpanded(jobId: number): boolean {
    return this.expandedJobs.has(jobId);
  }

  trackByJobId(index: number, job: any): any {
    return job.id;
  }

  trackByApplicationId(index: number, application: any): any {
    return application.id;
  }

  selectJob(job: any): void {
    // Handle job selection if needed
  }

  onStatusChange(event: Event, applicationId: number): void {
    // Extract the value from the event target
    const selectElement = event.target as HTMLSelectElement;
    const selectedStatus = selectElement.value;

    console.log(`Status changed for app ${applicationId} to: ${selectedStatus}`);

    // Call updateStatus with the extracted value
    if (selectedStatus) {
      this.updateStatus(applicationId, selectedStatus);
    }
  }

  updateStatus(applicationId: number, newStatus: string): void {
    if (!newStatus) return;

    this.jobService.updateStatus(applicationId, newStatus).subscribe({
      next: (response) => {
        // Update the application status in the local array
        const app = this.applications.find(a => a.id === applicationId);
        if (app) {
          app.status = newStatus;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(`❌ Error updating application status:`, error);
        alert('Failed to update application status. Please try again.');
      }
    });
  }

  openEmailForm(application: any): void {
    // Handle email form opening if needed
  }
}
