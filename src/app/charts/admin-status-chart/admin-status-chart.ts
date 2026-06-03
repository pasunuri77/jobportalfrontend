import { 
  Component, 
  ElementRef, 
  Input, 
  ViewChild, 
  OnChanges, 
  SimpleChanges, 
  AfterViewInit, 
  OnDestroy, 
  Inject, 
  PLATFORM_ID 
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-admin-status-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-status-chart.html',
  styleUrl: './admin-status-chart.css',
})
export class AdminStatusChart implements OnChanges, AfterViewInit, OnDestroy {
  // Inputs from Admin Dashboard
  @Input() users: any[] = [];
  @Input() companies: any[] = [];
  @Input() jobs: any[] = [];
  @Input() applicants: any[] = [];
  @Input() isCompact: boolean = false;

  // Canvas and active state
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  activeTab: string = 'overview';
  chartInstance: Chart | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-render chart if input data changes and the view is initialized
    if (this.isBrowser && this.chartCanvas && this.chartInstance) {
      if (changes['isCompact']) {
        // Wait for 550ms CSS layout animation before resizing chart canvas
        setTimeout(() => {
          if (this.chartInstance) {
            this.chartInstance.resize();
          }
        }, 550);
      } else {
        this.renderChart();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Delay slightly to ensure canvas layout is computed
      setTimeout(() => this.renderChart(), 50);
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (this.isBrowser) {
      // Small timeout to allow canvas refresh if container size updates
      setTimeout(() => this.renderChart(), 50);
    }
  }

  /**
   * Safe destruction of the active Chart.js instance
   */
  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  /**
   * Aggregation functions for stats sidebar and charts
   */
  getRoleCount(role: string): number {
    return this.users.filter(u => u.role?.toUpperCase() === role.toUpperCase()).length;
  }

  getJobTypeCount(type: string): number {
    return this.jobs.filter(j => j.type?.toUpperCase() === type.toUpperCase()).length;
  }

  getApplicationStatusCount(status: string): number {
    return this.applicants.filter(a => a.status?.toUpperCase() === status.toUpperCase()).length;
  }

  /**
   * Renders the chart using Chart.js on the canvas context
   */
  private renderChart(): void {
    if (!this.isBrowser || !this.chartCanvas) return;

    this.destroyChart();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Define configuration options
    let chartType: any = 'bar';
    let data: any = {};
    let options: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: {
              family: "'Outfit', 'Inter', 'Segoe UI', sans-serif",
              size: 12,
              weight: 500
            },
            color: '#64748b',
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleFont: {
            family: "'Outfit', 'Inter', sans-serif",
            size: 13,
            weight: 700
          },
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 12,
          cornerRadius: 10,
          borderColor: 'rgba(79, 70, 229, 0.12)',
          borderWidth: 1,
          boxPadding: 6
        }
      }
    };
    // Apply ease-in animation for all chart types to animate smoothly on render
    options.animation = {
      duration: 600,
      easing: 'easeInCubic'
    };

    // Construct configuration based on selected active tab
    if (this.activeTab === 'overview') {
      chartType = 'bar';
      
      // Values: Users, Companies, Jobs, Applicants
      const values = [
        this.users.length,
        this.companies.length,
        this.jobs.length,
        this.applicants.length
      ];

      data = {
        labels: ['Total Users', 'Registered Companies', 'Jobs Posted', 'Applications Submitted'],
        datasets: [{
          label: 'Count',
          data: values,
          backgroundColor: [
            'rgba(175,153,255,0.92)',
            'rgba(139,115,232,0.9)',
            'rgba(216,204,255,0.88)',
            'rgba(238,234,255,0.86)'
          ],
          borderColor: [
            '#af99ff',
            '#8b73e8',
            '#d8ccff',
            '#eeeaff'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 45
        }]
      };

      options.plugins.legend.display = false; // Bar chart doesn't need legend for single dataset
      options.scales = {
        y: {
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
          ticks: {
            color: '#64748b',
            font: { family: "'Inter', sans-serif", size: 11 },
            stepSize: 1,
            precision: 0
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: { family: "'Outfit', 'Inter', sans-serif", size: 12, weight: 500 }
          }
        }
      };
    } 
    else if (this.activeTab === 'roles') {
      chartType = 'doughnut';
      
      const adminCount = this.getRoleCount('ADMIN');
      const companyCount = this.getRoleCount('COMPANY');
      const seekerCount = this.getRoleCount('USER');

      data = {
        labels: ['Admins', 'Company Reps', 'Job Seekers'],
        datasets: [{
          data: [adminCount, companyCount, seekerCount],
          backgroundColor: [
            'rgba(175,153,255,0.9)',
            'rgba(139,115,232,0.88)',
            'rgba(216,204,255,0.86)'
          ],
          borderColor: [
            '#af99ff',
            '#8b73e8',
            '#d8ccff'
          ],
          borderWidth: 2,
          hoverOffset: 12
        }]
      };

      options.cutout = '70%';
      options.borderRadius = 5;
    } 
    else if (this.activeTab === 'jobTypes') {
      chartType = 'doughnut';

      const fullTime = this.getJobTypeCount('FULL_TIME');
      const partTime = this.getJobTypeCount('PART_TIME');
      const contract = this.getJobTypeCount('CONTRACT');
      const internship = this.getJobTypeCount('INTERNSHIP');

      data = {
        labels: ['Full Time', 'Part Time', 'Contract', 'Internship'],
        datasets: [{
          data: [fullTime, partTime, contract, internship],
          backgroundColor: [
            'rgba(175,153,255,0.92)',
            'rgba(139,115,232,0.9)',
            'rgba(216,204,255,0.88)',
            'rgba(238,234,255,0.86)'
          ],
          borderColor: [
            '#af99ff',
            '#8b73e8',
            '#d8ccff',
            '#eeeaff'
          ],
          borderWidth: 2,
          hoverOffset: 12
        }]
      };

      options.cutout = '70%';
      options.borderRadius = 5;
    } 
    else if (this.activeTab === 'applications') {
      chartType = 'doughnut';

      const applied = this.getApplicationStatusCount('APPLIED');
      const selected = this.getApplicationStatusCount('SELECTED');
      const rejected = this.getApplicationStatusCount('REJECTED');

      data = {
        labels: ['Applied (Pending)', 'Selected (Hired)', 'Rejected'],
        datasets: [{
          data: [applied, selected, rejected],
          backgroundColor: [
            'rgba(175,153,255,0.92)',
            'rgba(139,115,232,0.9)',
            'rgba(216,204,255,0.88)'
          ],
          borderColor: [
            '#af99ff',
            '#8b73e8',
            '#d8ccff'
          ],
          borderWidth: 2,
          hoverOffset: 12
        }]
      };

      options.cutout = '70%';
      options.borderRadius = 5;
    }

    this.chartInstance = new Chart(ctx, {
      type: chartType,
      data: data,
      options: options
    });
  }
}
