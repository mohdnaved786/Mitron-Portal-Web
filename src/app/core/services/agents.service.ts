import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentsService {
  private apiUrl = `${environment.base_url}/agents`
  constructor(private http: HttpClient) { }

  getAgents(page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/?page=${page}`);
  }

  addAgent(agentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, agentData)
  }
  updateAgent(agentId: number, agentData: any) {
    const url = `${this.apiUrl}/${agentId}`;
    return this.http.put(url, agentData);
  }
  getAgentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteAgent(agentId: number) {
  return this.http.delete(`${this.apiUrl}/${agentId}`)
}
}
