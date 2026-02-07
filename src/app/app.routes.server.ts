import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  }
  ,
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**', // 👈 FALTAVA ESTA
    renderMode: RenderMode.Prerender
  }
];

