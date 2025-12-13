import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface RawApiResponse {
  success: boolean;
  message: string;
  data: Record<string, any>;
}

export interface ChatMessage {
  message_id?: number;     // unique id from backend
  sender: 'customer' | 'user';
  text?: string;
  imageUrl?: string;
  time: Date;
  raw?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private apiUrl = `${environment.base_url}/messages`;

  constructor(private http: HttpClient) { }

  getMessages(page: number = 1, per_page: number = 10,): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&per_page=${per_page}`;
    // if (searchQuery) url += `&search_query=${encodeURIComponent(searchQuery)}`;
    return this.http.get(url);
  }

  searchMessages(searchQuery: string, page: number = 1): Observable<any> {
    const body = { agent_id: 1, search_query: searchQuery };
    return this.http.post(`${this.apiUrl}/search?page=${page}`, body);
  }

  getMessagesForNumber(fullNumber: string): Observable<ChatMessage[]> {
    if (!fullNumber || fullNumber.length < 3) return new Observable<ChatMessage[]>(observer => observer.next([]));

    const localNumber = fullNumber.slice(2);
    const url = `https://kalam-demo-chat-01-ewhkenandagaeqcd.centralindia-01.azurewebsites.net/api/messages/chat/${localNumber}`;

    return this.http.get<RawApiResponse>(url).pipe(
      map(resp => {
        if (!resp || !resp.data) return [];

        const arr = Object.values(resp.data) as any[];

        const mapped = arr.map(r => {
          const ts = r.created_at || r.received_at || r.sent_at || r.updated_at;
          const time = ts ? new Date(ts) : new Date();

          // Sender mapping
          let sender: 'user' | 'customer';
          if (r.wa_from && r.wa_from !== fullNumber) {
            sender = 'user'; // admin → right
          } else {
            sender = 'customer'; // client → left
          }

          // Message text
          const text = sender === 'customer' ? r.wa_req_message : r.wa_res_message ?? r.wa_req_message ?? '';

          const imageUrl = r.wa_media_url && r.wa_mime_type ? r.wa_media_url : undefined;

          return { message_id: r.id, sender, text, imageUrl, time, raw: r };
        });

        return mapped.sort((a, b) => a.time.getTime() - b.time.getTime());
      })
    );
  }

  replyMessageWithFiles(formData: FormData): Observable<RawApiResponse> {
    return this.http.post<RawApiResponse>(
      'https://kalam-demo-chat-01-ewhkenandagaeqcd.centralindia-01.azurewebsites.net/api/reply/',
      formData
    );
  }


  assignagent(data: any): Observable<any> {
    return this.http.post('https://kalam-demo-chat-01-ewhkenandagaeqcd.centralindia-01.azurewebsites.net/api/customers/assignagent', data)
  }
}
