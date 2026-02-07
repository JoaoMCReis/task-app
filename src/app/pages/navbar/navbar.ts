import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
    label: string;
    route: string;
    roles: string[];
}

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    currentUser = signal<any>(null);
    menuOpen = signal(false);

    // Define aqui os itens do menu e quem pode ver
    navItems: NavItem[] = [
        { label: 'Utilizadores', route: '/users', roles: ['admin'] },
        { label: 'Dashboard', route: '/dashboard', roles: ['admin', 'manager', 'member'] },
        // { label: 'Relatorios', route: '/reports', roles: ['admin', 'manager'] },
    ];

    constructor() {
        this.authService.user$.subscribe(user => this.currentUser.set(user));
    }

    // Filtra os itens conforme o role do utilizador
    get visibleItems(): NavItem[] {
        const role = this.currentUser()?.role;
        if (!role) return [];
        return this.navItems.filter(item => item.roles.includes(role));
    }

    toggleMenu() {
        this.menuOpen.update(open => !open);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}