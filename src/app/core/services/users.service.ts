import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.base_url}/users`;
  constructor(private http: HttpClient) { }




  getAllUsersList(): Observable<any> {
    return this.http.get('http://localhost:5000/api/users')
  }

  getAllCountriesList(): Observable<any> {
    return this.http.get('http://localhost:5000/api/countries/getAllCountries')
  }

  addNewUser(data: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/users/create', data)
  }

  getUserById(userId: any): Observable<any> {
    return this.http.get(`http://localhost:5000/api/users/profile/${userId}`)
  }

  updateUserById(userId: any, data: any): Observable<any> {
    return this.http.put(`http://localhost:5000/api/users/profile/${userId}`, data)
  }














  getUserInfo() {
    return this.http.get(`${environment.base_url}/user`)
  }

  getUser(page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/?page=${page}`);
  }

  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, userData);
  }
  updateUser(userId: number, userData: any) {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.put(url, userData);
  }
  getUserById_old(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteUser(userId: number) {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  updatestatus(userId: any, data: any) {
    const url = `${this.apiUrl}/updatestatus/${userId}`;
    return this.http.put(url, data);
  }
}
