import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  newSkillName: string = '';
  newSkillCategory: string = 'Frontend';

  // State for forms/inputs
  newExp = { company: '', position: '', duration: '', description: '', technologies: '' };
  newEdu = { institution: '', degree: '', duration: '', description: '' };

  profileData = {
    firstName: 'Olivia',
    email: 'olivia.vance@designtech.io',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    bio: 'Passionate Senior UX Engineer & Frontend Architect with 7+ years of experience building high-performance web applications. Focused on design systems, web accessibility (a11y), and premium user experiences.',
    title: 'Senior Frontend Architect',
    website: 'https://oliviavance.dev',
    github: this.displayName ,
    linkedin: 'olivia-vance-designtech',
    twitter: 'olivia_codes',
    facebook: 'olivia.vance',
    instagram: 'olivia.designs',
    dribbble: 'olivia_ux',
    availability: 'Open to Work',
    availabilityStatus: 'active', // active (Open), busy (Reviewing), closed (Unavailable)
    skillsByCategory: [
      {
        category: 'Frontend',
        list: ['Angular', 'TypeScript', 'JavaScript', 'HTML5/CSS3', 'React', 'RxJS']
      },
      {
        category: 'Backend',
        list: ['Node.js', 'Express', 'GraphQL', 'NestJS', 'PostgreSQL']
      },
      {
        category: 'Design & DevOps',
        list: ['Figma', 'UI/UX Design', 'Design Systems', 'TailwindCSS', 'Git', 'Vercel']
      }
    ],
    experience: [
      {
        company: 'Vercel',
        position: 'Principal Frontend Architect',
        duration: '2023 - Present',
        description: 'Spearheading design system implementation and UI component optimizations. Collaborated with product teams to decrease load times by 35% using lazy-loading and SSR hydration techniques.',
        technologies: ['Next.js', 'React', 'TypeScript', 'TailwindCSS']
      },
      {
        company: 'Stripe',
        position: 'Senior UX Engineer',
        duration: '2020 - 2023',
        description: 'Designed and engineered dashboard interfaces used by millions of merchants worldwide. Led a team of 4 engineers in migrating legacy dashboards to high-performance Angular apps.',
        technologies: ['Angular', 'TypeScript', 'RxJS', 'CSS Modules']
      },
      {
        company: 'Airbnb',
        position: 'Software Engineer II',
        duration: '2018 - 2020',
        description: 'Contributed to searching and booking flows, enhancing responsive behaviors. Spearheaded accessibility standards compliance (WCAG 2.1) across customer-facing modules.',
        technologies: ['React', 'Redux', 'JavaScript', 'Jest']
      }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'M.S. in Computer Science (HCI Specialization)',
        duration: '2016 - 2018',
        description: 'GPA 3.9/4.0. Thesis on Responsive Micro-interactions for Enterprise Dashboards.'
      },
      {
        institution: 'UC Berkeley',
        degree: 'B.S. in Computer Science',
        duration: '2012 - 2016',
        description: 'GPA 3.8/4.0. Completed honors program and served as peer tutor for web development courses.'
      }
    ],
    stats: {
      applicationsSubmitted: 12,
      interviewsCount: 8,
      offersCount: 3,
      rejected: 2
    } as { applicationsSubmitted: number; interviewsCount: number; offersCount: number; rejected: number },
    recentApplications: [
      { company: 'Google', logo: 'G', title: 'Staff Software Engineer', appliedDate: '2026-05-28', status: 'Interview', color: 'indigo' },
      { company: 'Stripe', logo: 'S', title: 'Principal Frontend Engineer', appliedDate: '2026-05-24', status: 'Offer', color: 'green' },
      { company: 'Microsoft', logo: 'M', title: 'Senior Angular Developer', appliedDate: '2026-05-20', status: 'Applied', color: 'blue' },
      { company: 'Meta', logo: 'F', title: 'UX Architect', appliedDate: '2026-05-15', status: 'Under Review', color: 'yellow' },
      { company: 'Netflix', logo: 'N', title: 'Senior UI Engineer', appliedDate: '2026-05-10', status: 'Rejected', color: 'red' }
    ],
    activities: [
      { type: 'resume', text: 'Updated primary resume document "Olivia_Vance_Resume.pdf"', time: '3h ago' },
      { type: 'applied', text: 'Applied for Staff Software Engineer at Google', time: '2 days ago' },
      { type: 'interview', text: 'Scheduled technical interview with Stripe', time: '4 days ago' },
      { type: 'skill', text: 'Added NestJS to skills list under Backend', time: '1 week ago' }
    ],
    resumes: [
      { name: 'Olivia_Vance_Resume.pdf', size: '1.4 MB', uploadedDate: '2026-05-25', isPrimary: true },
      { name: 'Olivia_Vance_Portfolio.pdf', size: '4.2 MB', uploadedDate: '2026-05-20', isPrimary: false }
    ],
    settings: {
      profileVisible: true,
      jobAlerts: true,
      messagesAlerts: true,
      newsletter: false,
      visibilityOption: 'public'
    }
  };

  originalProfileData: any = {};

  constructor(
    private authService: AuthService,
    public toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.userEmail = this.authService.getUserEmail();
  }
  get displayName(): string {
    if (this.userName) {
      return this.userName;
    }
    if (this.userEmail) {
      // Remove @gmail.com and other domain extensions
      return this.userEmail.replace(/@.*/, '');
    }
    return 'User';
  }

  ngOnInit(): void {
    this.loadProfileData();
    this.simulateRealTimeUpdates();

    // Listen for query parameters to toggle settings tab from sidebar
    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['tab']) {
          this.activeTab = params['tab'];
          this.cdr.detectChanges();
        }
      }
    });
  }

  loadProfileData(): void {
    this.userEmail = this.authService.getUserEmail();
    this.userName = this.authService.getUserName();

    const userData = this.authService.getUserData();
    if (userData) {
      this.profileData.email = userData.email || this.profileData.email;
      this.profileData.firstName = userData.name?.split(' ')[0] || this.profileData.firstName;
    }

    // Load actual applications from API
    this.authService.getUserApplications().subscribe({
      next: (applications: any) => {
        const appliedJobs = Array.isArray(applications) ? applications : [];
        if (appliedJobs.length > 0) {
          this.profileData.stats.applicationsSubmitted = appliedJobs.length;

          const normalizeStatus = (app: any) => {
            return (app?.status || app?.job?.status || '').toString().trim().toLowerCase();
          };

          const selectedCount = appliedJobs.filter((a: any) => {
            const s = normalizeStatus(a);
            return s === 'selected' || s === 'accepted' || s === 'hired' || s === 'offer';
          }).length;

          const rejectedCount = appliedJobs.filter((a: any) => {
            const s = normalizeStatus(a);
            return s === 'rejected' || s === 'declined' || s === 'rejected_by_employer';
          }).length;

          const interviewCount = appliedJobs.filter((a: any) => {
            const s = normalizeStatus(a);
            return s.includes('interview');
          }).length;

          this.profileData.stats.offersCount = selectedCount || this.profileData.stats.offersCount;
          this.profileData.stats.rejected = rejectedCount || this.profileData.stats.rejected;
          this.profileData.stats.interviewsCount = interviewCount || this.profileData.stats.interviewsCount;

          // Map ALL real applications to recentApplications (sorted newest first)
          const sorted = [...appliedJobs].sort((a: any, b: any) => {
            const dateA = new Date(a?.appliedAt || a?.createdAt || 0).getTime();
            const dateB = new Date(b?.appliedAt || b?.createdAt || 0).getTime();
            return dateB - dateA;
          });

          this.profileData.recentApplications = sorted.map((app: any) => {
            const title = app?.job?.title || app?.title || 'Software Developer';
            const companyName = app?.job?.company?.name || app?.company || 'Enterprise Corp';
            const statusRaw = app?.status || 'Applied';
            let color = 'blue';
            let status = 'Applied';

            const s = statusRaw.toLowerCase();
            if (s.includes('interview')) { status = 'Interview'; color = 'indigo'; }
            else if (s.includes('offer') || s.includes('selected') || s.includes('hired') || s.includes('accept')) { status = 'Offer'; color = 'green'; }
            else if (s.includes('reject') || s.includes('decline')) { status = 'Rejected'; color = 'red'; }
            else if (s.includes('review') || s.includes('pending')) { status = 'Under Review'; color = 'yellow'; }

            const appliedDate = app?.appliedAt || app?.createdAt;
            return {
              company: companyName,
              logo: companyName.charAt(0).toUpperCase(),
              title: title,
              appliedDate: appliedDate ? new Date(appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
              status: status,
              color: color
            };
          });

          // Build activities from real application data
          const activityEntries = sorted.slice(0, 5).map((app: any) => {
            const title = app?.job?.title || app?.title || 'a position';
            const companyName = app?.job?.company?.name || app?.company || 'a company';
            const appliedDate = app?.appliedAt || app?.createdAt;
            const timeAgo = this.getTimeAgo(appliedDate ? new Date(appliedDate) : new Date());
            return {
              type: 'applied',
              text: `Applied for ${title} at ${companyName}`,
              time: timeAgo
            };
          });

          if (activityEntries.length > 0) {
            this.profileData.activities = [
              ...activityEntries,
              ...this.profileData.activities.filter(a => a.type !== 'applied')
            ];
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.cdr.detectChanges();
      }
    });

    this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
  }

  simulateRealTimeUpdates(): void {
    // Simulate minor profile updates (e.g. applications being viewed by recruitment)
    setInterval(() => {
      if (Math.random() > 0.7) {
        const index = Math.floor(Math.random() * this.profileData.recentApplications.length);
        const app = this.profileData.recentApplications[index];
        if (app.status === 'Applied') {
          app.status = 'Under Review';
          app.color = 'yellow';
          this.profileData.activities.unshift({
            type: 'interview',
            text: `Your application for ${app.title} at ${app.company} is now Under Review.`,
            time: 'Just now'
          });
          this.toastr.info(`Recruiter is reviewing your application for ${app.company}.`, 'Application Status Update');
          this.cdr.detectChanges();
        }
      }
    }, 45000);
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

    // Simulate API call to save settings
    setTimeout(() => {
      this.isEditing = false;
      this.isSaving = false;
      this.lastUpdated = new Date();

      // Update local storage data if username edited
      const userData = this.authService.getUserData() || {};
      userData.name = `${this.profileData.firstName}`;
      this.authService.setUserData(userData);
      this.authService.getUserName(); // Update local cached name in authService if needed

      this.toastr.success('Profile and Preferences saved successfully!', 'Success');
      this.cdr.detectChanges();
    }, 1200);
  }

  addSkill(): void {
    const trimmedSkill = this.newSkillName.trim();
    if (!trimmedSkill) return;

    // Find category
    const cat = this.profileData.skillsByCategory.find(c => c.category === this.newSkillCategory);
    if (cat) {
      if (!cat.list.includes(trimmedSkill)) {
        cat.list.push(trimmedSkill);
        this.profileData.activities.unshift({
          type: 'skill',
          text: `Added "${trimmedSkill}" to ${this.newSkillCategory} skills`,
          time: 'Just now'
        });
        this.toastr.success(`Skill "${trimmedSkill}" added!`, 'Success');
        this.newSkillName = '';
      } else {
        this.toastr.warning('This skill is already listed.', 'Already Exists');
      }
    }
  }

  removeSkill(categoryName: string, skill: string): void {
    const cat = this.profileData.skillsByCategory.find(c => c.category === categoryName);
    if (cat) {
      const index = cat.list.indexOf(skill);
      if (index > -1) {
        cat.list.splice(index, 1);
        this.toastr.info(`Skill "${skill}" removed.`, 'Removed');
      }
    }
  }

  addExperience(): void {
    if (!this.newExp.company || !this.newExp.position || !this.newExp.duration) {
      this.toastr.error('Please fill company name, position, and duration.', 'Fields Required');
      return;
    }
    const techArray = this.newExp.technologies ? this.newExp.technologies.split(',').map(t => t.trim()) : [];
    this.profileData.experience.unshift({
      company: this.newExp.company,
      position: this.newExp.position,
      duration: this.newExp.duration,
      description: this.newExp.description,
      technologies: techArray
    });

    this.newExp = { company: '', position: '', duration: '', description: '', technologies: '' };
    this.profileData.activities.unshift({
      type: 'resume',
      text: `Added new work experience at ${this.profileData.experience[0].company}`,
      time: 'Just now'
    });
    this.toastr.success('Experience record added!', 'Success');
  }

  deleteExperience(index: number): void {
    const exp = this.profileData.experience[index];
    this.profileData.experience.splice(index, 1);
    this.toastr.info(`Deleted experience at ${exp.company}.`, 'Deleted');
  }

  addEducation(): void {
    if (!this.newEdu.institution || !this.newEdu.degree || !this.newEdu.duration) {
      this.toastr.error('Please fill institution, degree, and duration.', 'Fields Required');
      return;
    }
    this.profileData.education.unshift({
      institution: this.newEdu.institution,
      degree: this.newEdu.degree,
      duration: this.newEdu.duration,
      description: this.newEdu.description
    });

    this.newEdu = { institution: '', degree: '', duration: '', description: '' };
    this.toastr.success('Education record added!', 'Success');
  }

  deleteEducation(index: number): void {
    const edu = this.profileData.education[index];
    this.profileData.education.splice(index, 1);
    this.toastr.info(`Deleted education at ${edu.institution}.`, 'Deleted');
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatLastUpdated(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;

    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  getProfileCompletion(): number {
    let completedPoints = 0;
    let totalPoints = 100;

    // We grade the profile on 8 components
    if (this.profileData.firstName) completedPoints += 15;
    if (this.profileData.bio && this.profileData.bio.length > 20) completedPoints += 15;
    if (this.profileData.title) completedPoints += 10;
    if (this.profileData.phone && this.profileData.location) completedPoints += 10;
    if (this.profileData.skillsByCategory.some(c => c.list.length > 0)) completedPoints += 15;
    if (this.profileData.experience.length > 0) completedPoints += 15;
    if (this.profileData.education.length > 0) completedPoints += 10;
    if (this.profileData.resumes.length > 0) completedPoints += 10;

    return completedPoints;
  }

  // Resume Document actions
  triggerResumeUpload(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      const newDoc = {
        name: file.name,
        size: sizeMB,
        uploadedDate: new Date().toISOString().split('T')[0],
        isPrimary: this.profileData.resumes.length === 0 // primary if it's the first
      };

      this.profileData.resumes.push(newDoc);
      this.profileData.activities.unshift({
        type: 'resume',
        text: `Uploaded resume document "${file.name}"`,
        time: 'Just now'
      });
      this.toastr.success(`Uploaded "${file.name}" successfully!`, 'Document Uploaded');
    }
  }

  deleteResume(index: number): void {
    const doc = this.profileData.resumes[index];
    this.profileData.resumes.splice(index, 1);
    if (doc.isPrimary && this.profileData.resumes.length > 0) {
      this.profileData.resumes[0].isPrimary = true;
    }
    this.toastr.info(`Deleted resume document "${doc.name}"`, 'Document Removed');
  }

  setPrimaryResume(index: number): void {
    this.profileData.resumes.forEach((r, idx) => r.isPrimary = idx === index);
    this.toastr.success('Primary resume updated!', 'Preferences Saved');
  }

  toggleAvailability(): void {
    if (this.profileData.availabilityStatus === 'active') {
      this.profileData.availabilityStatus = 'busy';
      this.profileData.availability = 'Reviewing Offers';
    } else if (this.profileData.availabilityStatus === 'busy') {
      this.profileData.availabilityStatus = 'closed';
      this.profileData.availability = 'Closed to Offers';
    } else {
      this.profileData.availabilityStatus = 'active';
      this.profileData.availability = 'Open to Work';
    }
    this.toastr.info(`Availability updated to: ${this.profileData.availability}`, 'Status Changed');
  }

  saveSettings(): void {
    this.toastr.success('Notification settings and privacy controls saved!', 'Preferences Saved');
  }
}
