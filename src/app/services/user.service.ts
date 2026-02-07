import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7188/api/users';

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    create(user: Partial<User>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    update(id: string, user: User): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, user);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}