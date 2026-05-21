import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users/:id',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users/:id/edit',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
