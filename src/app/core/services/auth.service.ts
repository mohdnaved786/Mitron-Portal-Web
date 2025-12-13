import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environment/environment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.base_url}/applogin`;
  private userUrl = `${environment.base_url}/user`;

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) { }

  login_old(userObj: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl, userObj);
  }

  login(userObj: { email: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:5000/api/auth/login', userObj);
  }

  saveToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Logout',
        message: 'Are you sure, you want to logout?',
        confirmBtnText: 'Logout'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        sessionStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  // Fetch user info (name + profile image)
  public getUserInfo(): Observable<{ username: string | null; profile: string | null }> {
    const token = this.getToken();
    if (!token) return of({ username: null, profile: null });

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any>(this.userUrl, { headers }).pipe(
      map(user => ({
        username: user.last_name || user.name || null,
        profile: user.profile_image || null
      })),
      catchError(err => {
        console.error('Failed to fetch user info', err);
        return of({ username: null, profile: null });
      })
    );
  }

}
