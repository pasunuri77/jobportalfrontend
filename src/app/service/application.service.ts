import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ApplicationService {

    private apiUrl='https://jobportalbackend-fowp.onrender.com/api/application';

    constructor(
        private http:HttpClient
    ){}

    getApplicationsByCompanyId(): Observable<any> {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Create headers with Authorization
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        // Extract email from token or get from user service
        // For now, we'll need to get the email from somewhere
        // This assumes you have a way to get the current user's email
        const email = localStorage.getItem('userEmail') || 'raja@gmail.com'; // fallback for testing

        return this.http.get(`${this.apiUrl}/company/${email}`, { headers });
    }


    sendApplicationEmail(applicationId: number, emailData: any): Observable<any> {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Create headers with Authorization
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.post(`${this.apiUrl}/${applicationId}/send-email`, emailData, { headers });
    }
}