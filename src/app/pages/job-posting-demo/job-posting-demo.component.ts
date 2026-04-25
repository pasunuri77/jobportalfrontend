import { Component } from '@angular/core';
import { JobPostingComponent } from '../../components/job-posting/job-posting.component';

@Component({
  selector: 'app-job-posting-demo',
  standalone: true,
  imports: [JobPostingComponent],
  template: `
    <div class="demo-container">
      <header class="demo-header">
        <h1>Job Posting Demo</h1>
        <p>This is a demonstration of the job posting component</p>
      </header>
      <main>
        <app-job-posting></app-job-posting>
      </main>
    </div>
  `,
  styles: [`
    .demo-container {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 2rem;
    }
    
    .demo-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .demo-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .demo-header p {
      color: #6c757d;
      margin: 0;
    }
  `]
})
export class JobPostingDemoComponent {}
