import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.base_url}/customers`;

  constructor(private http: HttpClient) {}

  // ✅ Get all customers (paginated)
  getCustomers(page: number = 1, page_size:number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&per_page=${page_size}`);
  }

  // ✅ Add new customer
  // POST → https://.../api/customers/store
  addCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/store`, customerData);
  }

  // ✅ Update existing customer
  // POST → https://.../api/customers/{id}/update
  updateCustomer(customerId: number, customerData: any): Observable<any> {
    const url = `${this.apiUrl}/${customerId}/update`;
    return this.http.post(url, customerData);
  }

  // ✅ Get single customer details
  // GET → https://.../api/customers/view/{id}
  getCustomerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/view/${id}`);
  }

  // ✅ Delete customer
  // DELETE → https://.../api/customers/{id}
 deleteCustomer(customer_id: number): Observable<any> {
    const payload = { customer_id };
    return this.http.post(`${this.apiUrl}/delete`, payload);
  }
}
