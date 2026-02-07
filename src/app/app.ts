// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   template: `<router-outlet></router-outlet>`,
//   styleUrl: './app.css'
// })
// export class App {
//   title = signal('Task App');
// }

import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './pages/navbar/navbar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (showNavbar()) {
      <app-navbar></app-navbar>
    }
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  title = signal('Task App');
  showNavbar = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Esconde a navbar no login
        this.showNavbar.set(event.url !== '/login' && event.url !== '/');
      });
  }
}