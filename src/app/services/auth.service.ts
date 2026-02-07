import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = 'https://localhost:7188';
    private readonly tokenKey = 'auth_token';
    private readonly userKey = 'auth_user';
    private readonly platformId = inject(PLATFORM_ID);

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    private userSubject = new BehaviorSubject<any>(this.getStoredUser());
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
            tap((response) => {
                this.setToken(response.token);
                this.setUser(response.user);
                this.isAuthenticatedSubject.next(true);
                this.userSubject.next(response.user);
            })
        );
    }

    logout(): void {
        this.removeToken();
        this.removeUser();
        this.isAuthenticatedSubject.next(false);
        this.userSubject.next(null);
    }

    getToken(): string | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        return localStorage.getItem(this.tokenKey);
    }

    private setToken(token: string): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.setItem(this.tokenKey, token);
    }

    private removeToken(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.removeItem(this.tokenKey);
    }

    private hasToken(): boolean {
        if (!isPlatformBrowser(this.platformId)) return false;
        return !!localStorage.getItem(this.tokenKey);
    }

    private setUser(user: any): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    private removeUser(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        localStorage.removeItem(this.userKey);
    }

    private getStoredUser(): any {
        if (!isPlatformBrowser(this.platformId)) return null;
        const user = localStorage.getItem(this.userKey);
        if (!user || user === 'undefined' || user === 'null') return null;
        try {
            return JSON.parse(user);
        } catch (e) {
            // If stored value is malformed, remove it and return null
            localStorage.removeItem(this.userKey);
            return null;
        }
    }

    isAuthenticated(): boolean {
        return this.hasToken();
    }

    getCurrentUser(): LoginResponse['user'] | null {
        return this.userSubject.value;
    }

    getUserRole(): string | null {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    isAdmin(): boolean {
        return this.getUserRole() === 'admin';
    }

    isManager(): boolean {
        return this.getUserRole() === 'manager';
    }

    isMember(): boolean {
        return this.getUserRole() === 'member';
    }
}
