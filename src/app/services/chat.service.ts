import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private hubConnection: signalR.HubConnection;
  private messageSubject = new Subject<any>();

  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRUrl, { accessTokenFactory: () => localStorage.getItem('token') || '' })
      .build();

    this.hubConnection.on('ReceiveMessage', (senderId: string, content: string) => {
      this.messageSubject.next({ senderId, content });
    });

    this.hubConnection.start().catch(err => console.error(err));
  }

  getMessages(conversationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${conversationId}`);
  }

  sendMessage(conversationId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { conversationId, content });
  }

  getConversations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations`);
  }

  createConversation(otherUserId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversation`, { otherUserId }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  joinConversation(conversationId: string): void {
    this.hubConnection.invoke('JoinConversation', conversationId);
  }

  getMessageUpdates(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}