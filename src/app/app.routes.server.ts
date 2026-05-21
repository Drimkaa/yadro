import { RenderMode, ServerRoute } from '@angular/ssr';

const userPrerenderParams = () =>
  Promise.resolve(Array.from({ length: 10 }, (_, index) => ({ id: String(index + 1) })));

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/new',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: userPrerenderParams,
  },
  {
    path: 'users/:id/edit',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: userPrerenderParams,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
