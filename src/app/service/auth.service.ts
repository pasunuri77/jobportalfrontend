import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080'; // Update this to match your backend URL

  constructor(private http: HttpClient) { }


  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/user/login`, credentials);
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/user/register`, userData);
  }

  logout(): Observable<any> {
    this.removeToken();
    this.removeUserData();
    return new Observable(observer => observer.complete());
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(userData: any): void {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  removeUserData(): void {
    localStorage.removeItem('userData');
  }

  getUserName(): string | null {
    const userData = this.getUserData();
    return userData ? userData.name || userData.userName : null;
  }

  getUserEmail(): string | null {
    const userData = this.getUserData();
    return userData ? userData.email : null;
  }

  getUserId(): string | null {
    const userData = this.getUserData();
    // Try to get actual user ID first, fallback to email if not available
    return userData ? (userData.id || userData.userId || userData.user_id || userData.email) : null;
  }

  // ========================
  // USER MANAGEMENT METHODS (ADMIN ONLY)
  // ========================

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user/all`);
  }
  

  // Method to get current user details including ID
  getCurrentUser(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/api/user/current`, { headers });
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/user/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/user/deleteUser/${userId}`);
  }

  // ========================
  // JOB MANAGEMENT METHODS
  // ========================

  getAllJobs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/job`);
  }

  getJobById(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/job/${jobId}`);
  }

  createJob(jobData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/job/create`, jobData);
  }

  updateJob(jobId: string, jobData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/job/${jobId}`, jobData);
  }

  deleteJob(jobId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/job/${jobId}`);
  }

  getUserApplications(): Observable<any> {
    // Get token from localStorage for JWT authentication
    const token = localStorage.getItem('token');
    
    // Create headers with Authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get(`${this.apiUrl}/api/application/user`, { headers });
  }

  // ========================
  // COMPANY MANAGEMENT METHODS
  // ========================

  getAllCompanies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/company`);
  }

  getCompanyById(companyId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/company/${companyId}`);
  }

  getCompanyByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/company/email/${email}`);
  }

  createCompany(companyData: any): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/api/company/create`, companyData, { headers });
  }

  updateCompany(companyId: string, companyData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/company/${companyId}`, companyData);
  }

  deleteCompany(companyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/company/${companyId}`);
  }

  // ========================
  // APPLICATION MANAGEMENT METHODS
  // ========================

  applyForJob(applicationData: any): Observable<any> {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Create headers with Authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/api/application/apply`, applicationData, { headers });
  }

  downloadResume(applicationId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/application/download/${applicationId}`, {
      responseType: 'blob'
    });
  }

  getApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/application/user`);
  }

  getAllApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/application`);
  }

  getApplicationById(applicationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/application/${applicationId}`);
  }

  updateApplicationStatus(applicationId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/application/${applicationId}/status?status=${status}`, {});
  }

  deleteApplication(applicationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/application/${applicationId}`);
  }

  // ========================
  // PASSWORD & EMAIL VERIFICATION METHODS
  // ========================

  // Verify email exists in the system
  verifyEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/user/verifyemail`, { email });
  }

  // Change password with email verification
  changePassword(passwordData: { email: string; newPassword: string }): Observable<any> {
    // Password reset should not require authentication token
    // Backend expects /updatepassword endpoint with UpdatePassword request body
    const updatePasswordRequest = {
      email: passwordData.email,
      newPassword: passwordData.newPassword
    };
    return this.http.post(`${this.apiUrl}/api/user/updatepassword`, updatePasswordRequest);
  }

  // Request password reset (sends email with reset link/token)
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/user/forgot-password`, { email });
  }

  // Reset password with token (for email-based reset flow)
  resetPassword(resetData: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/user/reset-password`, resetData);
  }

  // Check if token is valid and contains email
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT token validation (you can enhance this based on your JWT structure)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;

      // Decode payload to check email and expiration
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check if token has email claim
      if (!payload.email) return false;

      // Check if token is not expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) return false;

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Get email from token
  getEmailFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.email || null;
    } catch (error) {
      console.error('Error extracting email from token:', error);
      return null;
    }
  }

  // ========================
  // UTILITY METHODS
  // ========================

  getUserRole(): string | null {
    const userData = this.getUserData();
    return userData ? userData.role : null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isUser(): boolean {
    return this.hasRole('USER');
  }

  isCompany(): boolean {
    return this.hasRole('COMPANY');
  }

}
