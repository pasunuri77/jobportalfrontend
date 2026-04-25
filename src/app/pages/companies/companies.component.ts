import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import {ToastrService} from 'ngx-toastr';
import { environment } from '../../../environment/environment';
@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent  {
  // companies = [
  //   {
  //     id: 1,
  //     name: 'TechCorp Solutions',
  //     industry: 'Technology',
  //     location: 'San Francisco, CA',
  //     size: '1000-5000',
  //     description: 'Leading technology company specializing in software development and cloud solutions.',
  //     logo: 'https://via.placeholder.com/60x60/667eea/ffffff?text=TC',
  //     rating: 4.5,
  //     openPositions: 12
  //   },
  //   {
  //     id: 2,
  //     name: 'Digital Innovations Inc',
  //     industry: 'Software',
  //     location: 'New York, NY',
  //     size: '500-1000',
  //     description: 'Innovative software company focused on digital transformation and AI solutions.',
  //     logo: 'https://via.placeholder.com/60x60/764ba2/ffffff?text=DI',
  //     rating: 4.3,
  //     openPositions: 8
  //   },
  //   {
  //     id: 3,
  //     name: 'Global Systems Ltd',
  //     industry: 'IT Services',
  //     location: 'London, UK',
  //     size: '5000+',
  //     description: 'Global IT services provider with expertise in enterprise solutions and consulting.',
  //     logo: 'https://via.placeholder.com/60x60/3498db/ffffff?text=GS',
  //     rating: 4.1,
  //     openPositions: 25
  //   },
  //   {
  //     id: 4,
  //     name: 'StartupHub',
  //     industry: 'Technology',
  //     location: 'Austin, TX',
  //     size: '50-100',
  //     description: 'Fast-growing startup building next-generation mobile and web applications.',
  //     logo: 'https://via.placeholder.com/60x60/e74c3c/ffffff?text=SH',
  //     rating: 4.7,
  //     openPositions: 5
  //   },
  //   {
  //     id: 5,
  //     name: 'DataTech Analytics',
  //     industry: 'Data Science',
  //     location: 'Boston, MA',
  //     size: '100-500',
  //     description: 'Specialized in big data analytics, machine learning, and business intelligence.',
  //     logo: 'https://via.placeholder.com/60x60/2ecc71/ffffff?text=DT',
  //     rating: 4.4,
  //     openPositions: 7
  //   },
  //   {
  //     id: 6,
  //     name: 'CloudFirst Technologies',
  //     industry: 'Cloud Computing',
  //     location: 'Seattle, WA',
  //     size: '500-1000',
  //     description: 'Cloud-native company providing scalable infrastructure and DevOps solutions.',
  //     logo: 'https://via.placeholder.com/60x60/f39c12/ffffff?text=CF',
  //     rating: 4.6,
  //     openPositions: 15
  //   }
  // ];

  company: any[] = []
  
  selectedCompany: any; // Declare without initialization

  constructor(private authService: AuthService,private cdr: ChangeDetectorRef,private toastr: ToastrService) { }

  ngOnInit(): void {
    this.authService.getAllCompanies().subscribe({
      next: (Company: any) => {
        this.company = Company;
        // Initialize selectedCompany after data loads
        if (this.company.length > 0) {
          this.selectedCompany = this.company[0];
          this.toastr.success('Companies loaded successfully', 'Success');
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.toastr.error('Failed to load companies', 'Error');
      }
    });
  }

  selectCompany(company: any): void {
    this.selectedCompany = company;
  }

  getRatingFloor(rating: number): number {
    return Math.floor(rating);
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
