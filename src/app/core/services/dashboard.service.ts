import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.base_url}/dashboard`

  constructor(private http: HttpClient) { }

  getDashboardData_old(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getDashboardData(): Observable<any> {
    return this.http.get(`http://localhost:5000/api/dashboard`);
  }

  getUserProfileData(userId: any): Observable<any> {
    return this.http.get(`http://localhost:5000/api/users/profile/${userId}`)
  }
}
