import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { UserService } from '../../services/user.service';
import { User } from '../../types';

@Component({
  selector: 'app-user-info',
  imports: [
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzIconModule,
    NzModalModule,
    NzPageHeaderModule,
    NzSpinModule,
    NzTagModule,
  ],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly isDeleteModalVisible = signal(false);
  readonly errorMessage = signal('');

  readonly addressLine = computed(() => {
    const address = this.user()?.address;

    if (!address) {
      return '';
    }

    return `${address.city}, ${address.street}, ${address.suite}, ${address.zipcode}`;
  });

  readonly mapUrl = computed<SafeResourceUrl | null>(() => {
    const geo = this.user()?.address.geo;

    if (!geo) {
      return null;
    }

    const lat = Number(geo.lat);
    const lng = Number(geo.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    const delta = 0.05;
    const url = new URL('https://www.openstreetmap.org/export/embed.html');
    url.searchParams.set('bbox', `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`);
    url.searchParams.set('layer', 'mapnik');
    url.searchParams.set('marker', `${lat},${lng}`);

    return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) {
        this.errorMessage.set('Некорректный идентификатор пользователя');
        return;
      }

      this.loadUser(id);
    });
  }

  private loadUser(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.isLoading.set(false);
        },
        error: () => {
          this.user.set(null);
          this.isLoading.set(false);
          this.errorMessage.set('Не удалось загрузить пользователя');
        },
      });
  }

  openDeleteModal(): void {
    this.isDeleteModalVisible.set(true);
  }

  closeDeleteModal(): void {
    if (!this.isDeleting()) {
      this.isDeleteModalVisible.set(false);
    }
  }

  confirmDelete(): void {
    const userId = this.user()?.id;

    if (!userId || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');

    this.userService
      .deleteUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.isDeleteModalVisible.set(false);
          void this.router.navigate(['/users']);
        },
        error: () => {
          this.isDeleting.set(false);
          this.errorMessage.set('Не удалось удалить пользователя');
        },
      });
  }
}
