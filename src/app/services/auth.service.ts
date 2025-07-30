import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new Subject<string>();

  constructor(private http: HttpClient) { }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, passwordHash: password });
  }

  login(username: string, password: string): Observable<any> {
    this.currentUserSubject.next( username || 'User');
    return this.http.post(`${this.apiUrl}/login`, { username, passwordHash: password });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next('');
  }

  getCurrentUser(): Observable<string> {
    return this.currentUserSubject.asObservable();
  }
}