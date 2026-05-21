import { Routes } from '@angular/router';
import { UserList } from './users/components/user-list/user-list';
import { UserInfo } from './users/components/user-info/user-info';
import { UserEditor } from './users/components/user-editor/user-editor';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: 'users', component: UserList },
  { path: 'users/new', component: UserEditor },
  { path: 'users/:id', component: UserInfo },
  { path: 'users/:id/edit', component: UserEditor },
  { path: '**', redirectTo: 'users' },
];
