import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';  

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = environment.apiUrl + '/api/job';

  constructor(private http: HttpClient) { }

  createJob(jobData: any): Observable<any> {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Create headers with Authorization (don't set Content-Type for FormData)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/create`, jobData, { headers });
  }

  updateJob(jobId: number, jobData: any): Observable<any> {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Create headers with Authorization (don't set Content-Type for FormData)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/update/${jobId}`, jobData, { headers });
  }

  updateStatus(applicationId: number, status: string) {
    return this.http.put(
      `${environment.apiUrl}/api/application/status/${applicationId}?status=${status}`,
      {}
    );
  }






}
