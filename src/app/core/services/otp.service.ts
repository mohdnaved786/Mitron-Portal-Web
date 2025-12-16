import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  constructor(private _http: HttpClient) { }

  getOtp(data: any): Observable<any> {
    return this._http.post(`${environment.apiUrl}otp/getOtp`, data)
  }

  validateOtp(data: any): Observable<any> {
    return this._http.post(`${environment.apiUrl}otp/validateOtp`, data)
  }



}
