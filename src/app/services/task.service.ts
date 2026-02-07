import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Task } from '../models/task.model';

export interface CreateTaskDto {
    title: string;
    description: string;
    status?: number; // ✅ Opcional agora
    assignedToId?: string;
}

export interface UpdateTaskDto {
    title: string;
    description: string;
    status: number;
    assignedToId?: string;
}

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private baseUrl = 'https://localhost:7188/tasks';

    private getAuthHeaders(): HttpHeaders {
        const token = this.auth.getToken();
        return new HttpHeaders({
            Authorization: token ? `Bearer ${token}` : '',
        });
    }

    getAll(status?: string, page: number = 1, pageSize: number = 10): Observable<Task[]> {
        let params = new HttpParams().set('page', page).set('pageSize', pageSize);

        if (status) params = params.set('status', status);

        return this.http.get<Task[]>(this.baseUrl, {
            headers: this.getAuthHeaders(),
            params,
        });
    }

    getById(id: string): Observable<Task> {
        return this.http.get<Task>(`${this.baseUrl}/${id}`, {
            headers: this.getAuthHeaders(),
        });
    }

    create(dto: CreateTaskDto): Observable<Task> {
        return this.http.post<Task>(this.baseUrl, dto, {
            headers: this.getAuthHeaders(),
        });
    }

    update(id: string, dto: UpdateTaskDto): Observable<Task> {
        return this.http.put<Task>(`${this.baseUrl}/${id}`, dto, {
            headers: this.getAuthHeaders(),
        });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, {
            headers: this.getAuthHeaders(),
        });
    }
}
