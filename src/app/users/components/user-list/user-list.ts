import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { UserService } from '../../services/user.service';
import { User } from '../../types';

@Component({
  selector: 'app-user-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzEmptyModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzPageHeaderModule,
    NzPaginationModule,
    NzSpinModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly currentPage = signal(1);
  readonly limit = signal(5);
  readonly totalCount = signal(0);
  readonly limitOptions = [1, 2, 5, 10];
  readonly filterForm = this.formBuilder.nonNullable.group({
    name: [''],
    email: [''],
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.limit())));

  ngOnInit(): void {
    this.initStateFromQueryParams();
    this.loadUsers();
  }

  loadUsers(): void {
    const filters = this.filterForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService
      .getUsers({
        _page: this.currentPage(),
        _limit: this.limit(),
        name_like: filters.name.trim(),
        email_like: filters.email.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ users, totalCount }) => {
          const totalPages = Math.max(1, Math.ceil(totalCount / this.limit()));

          if (this.currentPage() > totalPages) {
            this.currentPage.set(totalPages);
            this.isLoading.set(false);
            this.updateQueryParamsAndLoad();
            return;
          }

          this.users.set(users);
          this.totalCount.set(totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.users.set([]);
          this.totalCount.set(0);
          this.errorMessage.set('Не удалось загрузить пользователей');
          this.isLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.updateQueryParamsAndLoad();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage() || this.isLoading()) {
      return;
    }

    this.currentPage.set(page);
    this.updateQueryParamsAndLoad();
  }

  changeLimit(limit: number): void {
    this.limit.set(limit);
    this.currentPage.set(1);
    this.updateQueryParamsAndLoad();
  }

  openUser(user: User): void {
    void this.router.navigate(['/users', user.id]);
  }

  private initStateFromQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const page = this.getPositiveNumber(params.get('page'), 1);
    const limit = this.getLimitFromQuery(params.get('limit'));

    this.currentPage.set(page);
    this.limit.set(limit);
    this.filterForm.patchValue({
      name: params.get('name') ?? '',
      email: params.get('email') ?? '',
    });
  }

  private updateQueryParamsAndLoad(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.getQueryParams(),
      replaceUrl: true,
    });

    this.loadUsers();
  }

  private getQueryParams(): Record<string, number | string | null> {
    const filters = this.filterForm.getRawValue();
    const name = filters.name.trim();
    const email = filters.email.trim();

    return {
      page: this.currentPage() === 1 ? null : this.currentPage(),
      limit: this.limit() === 5 ? null : this.limit(),
      name: name || null,
      email: email || null,
    };
  }

  private getLimitFromQuery(value: string | null): number {
    const limit = this.getPositiveNumber(value, 5);

    return this.limitOptions.includes(limit) ? limit : 5;
  }

  private getPositiveNumber(value: string | null, fallback: number): number {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      return fallback;
    }

    return parsedValue;
  }
}
