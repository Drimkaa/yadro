import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserListParams,
  UserListResult,
} from '../types';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  private getUserUrl(id: number): string {
    return `${API_URL}/${id}`;
  }


  getUsers(params: UserListParams = {}): Observable<UserListResult> {
    // так как GET https://jsonplaceholder.typicode.com/users возвращает массив объектов 
    // без указания totalPage или totalCount, используем 2 запроса
    // первый запрос для получения отфильтрованных пользователей учитывая лимиты пагинации
    // второй запрос для определения количества отфильтр. пользователей, без учета пагинации
    return forkJoin({
      users: this.http.get<User[]>(API_URL, {
        params: this.buildUserListParams(params),
      }),
      filteredUsers: this.http.get<User[]>(API_URL, {
        params: this.buildUserListParams(this.getFilterParams(params)),
      }),
    }).pipe(
      map(({ users, filteredUsers }) => ({
        users,
        totalCount: filteredUsers.length,
      })),
    );
  }



  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.getUserUrl(id));
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(API_URL, payload);
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(this.getUserUrl(id), payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(this.getUserUrl(id));
  }


  private getFilterParams(params: UserListParams): UserListParams {
    const { _limit, _page, _start, ...filterParams } = params;

    return filterParams;
  }
  private buildUserListParams(params: UserListParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
