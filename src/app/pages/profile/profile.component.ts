import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userName: string | null = '';
  userEmail: string | null = '';
  isEditing: boolean = false;
  isSaving: boolean = false;
  activeTab: string = 'overview';
  lastUpdated: Date = new Date();
  
  profileData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    bio: 'Experienced software developer looking for new opportunities in the tech industry.',
    title: 'Senior Frontend Developer',
    website: 'https://johndoe.dev',
    github: 'johndoe',
    linkedin: 'john-doe',
    skills: ['JavaScript', 'Angular', 'TypeScript', 'Node.js', 'HTML/CSS', 'React', 'Python'],
    experience: [
      {
        company: 'Tech Corp',
        position: 'Senior Developer',
        duration: '2020 - Present',
        description: 'Leading development of enterprise web applications',
        technologies: ['Angular', 'TypeScript', 'Node.js']
      },
      {
        company: 'StartupXYZ',
        position: 'Frontend Developer',
        duration: '2018 - 2020',
        description: 'Built responsive web applications using modern frameworks',
        technologies: ['React', 'JavaScript', 'CSS']
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Science in Computer Science',
        duration: '2014 - 2018',
        description: 'Graduated with honors, GPA 3.8/4.0'
      }
    ],
    stats: {
      applicationsSubmitted: 12,
      interviewsScheduled: 5,
      offersReceived: 2,
      profileViews: 156
    }
  };

  originalProfileData: any = {};
  newSkill: string = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
    this.simulateRealTimeUpdates();
  }

  loadProfileData(): void {
    this.userEmail = this.authService.getUserEmail();
    this.userName = this.authService.getUserName();
    
    const userData = this.authService.getUserData();
    if (userData) {
      this.profileData.email = userData.email || this.profileData.email;
      this.profileData.firstName = userData.name?.split(' ')[0] || this.profileData.firstName;
      this.profileData.lastName = userData.name?.split(' ')[1] || this.profileData.lastName;
    }
    
    this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
  }

  simulateRealTimeUpdates(): void {
    // Simulate profile views updating
    setInterval(() => {
      this.profileData.stats.profileViews += Math.floor(Math.random() * 3);
      this.cdr.detectChanges();
    }, 30000); // Update every 30 seconds
  }

  editProfile(): void {
    this.isEditing = true;
    this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileData = JSON.parse(JSON.stringify(this.originalProfileData));
  }

  saveProfile(): void {
    this.isSaving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isEditing = false;
      this.isSaving = false;
      this.lastUpdated = new Date();
      this.toastr.success('Profile updated successfully!', 'Success');
      this.cdr.detectChanges();
    }, 1500);
  }

  addSkill(): void {
    if (this.newSkill.trim() && !this.profileData.skills.includes(this.newSkill.trim())) {
      this.profileData.skills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  removeSkill(skill: string): void {
    const index = this.profileData.skills.indexOf(skill);
    if (index > -1) {
      this.profileData.skills.splice(index, 1);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatLastUpdated(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  getProfileCompletion(): number {
    const fields: (keyof typeof this.profileData)[] = Object.keys(this.profileData) as (keyof typeof this.profileData)[];
    let completedFields = 0;
    
    fields.forEach(field => {
      if (field !== 'stats') {
        const value = this.profileData[field];
        if (Array.isArray(value)) {
          if (value.length > 0) completedFields++;
        } else if (value && typeof value === 'object') {
          if (Object.keys(value).length > 0) completedFields++;
        } else if (value && value.toString().trim()) {
          completedFields++;
        }
      }
    });
    
    return Math.round((completedFields / (fields.length - 1)) * 100);
  }
}
