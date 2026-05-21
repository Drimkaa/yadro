import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Observable } from 'rxjs';

import { UserService } from '../../services/user.service';
import { CreateUserPayload, User } from '../../types';

const COORDINATE_PATTERN = /^-?\d+(\.\d+)?$/;

@Component({
  selector: 'app-user-editor',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzGridModule,
    NzInputModule,
    NzModalModule,
    NzPageHeaderModule,
    NzSpinModule,
  ],
  templateUrl: './user-editor.html',
  styleUrl: './user-editor.scss',
})
export class UserEditor implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userId = signal<number | null>(null);
  readonly isCreateMode = computed(() => this.userId() === null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isSuccessModalVisible = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    website: ['', [Validators.required]],
    address: this.formBuilder.nonNullable.group({
      street: ['', [Validators.required]],
      suite: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zipcode: ['', [Validators.required]],
      geo: this.formBuilder.nonNullable.group({
        lat: ['', [Validators.required, Validators.pattern(COORDINATE_PATTERN)]],
        lng: ['', [Validators.required, Validators.pattern(COORDINATE_PATTERN)]],
      }),
    }),
    company: this.formBuilder.nonNullable.group({
      name: ['', [Validators.required]],
      catchPhrase: ['', [Validators.required]],
      bs: ['', [Validators.required]],
    }),
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.handleRouteId(params.get('id'));
    });
  }

  private handleRouteId(rawId: string | null): void {
    this.successMessage.set('');

    if (rawId === null) {
      this.userId.set(null);
      this.form.reset();
      return;
    }

    const id = Number(rawId);

    if (!Number.isFinite(id)) {
      this.errorMessage.set('Некорректный идентификатор пользователя');
      return;
    }

    this.userId.set(id);
    this.loadUser(id);
  }

  private loadUser(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.fillForm(user);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Не удалось загрузить пользователя');
        },
      });
  }

  submit(): void {
    this.successMessage.set('');
    this.isSuccessModalVisible.set(false);
    this.errorMessage.set('');

    if (this.isLoading() || this.isSaving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Проверьте обязательные поля и формат email');
      return;
    }

    this.isSaving.set(true);
    this.getSaveRequest()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set(
            this.isCreateMode() ? 'Пользователь создан' : 'Пользователь обновлён',
          );
          this.isSuccessModalVisible.set(true);

          if (this.isCreateMode()) {
            this.form.reset();
          }
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMessage.set('Не удалось сохранить пользователя');
        },
      });
  }

  closeSuccessModal(): void {
    this.isSuccessModalVisible.set(false);
  }

  getControl(path: string): AbstractControl | null {
    return this.form.get(path);
  }

  isInvalid(path: string): boolean {
    const control = this.getControl(path);

    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  getError(path: string): string {
    const errors = this.getControl(path)?.errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'обязательное поле';
    }

    if (errors['email']) {
      return 'Введите корректный email';
    }

    if (errors['minlength']) {
      return `Длина минимум ${errors['minlength'].requiredLength} символа`;
    }

    if (errors['pattern']) {
      return 'введите число, например -37.3159';
    }

    return 'некорректное значение';
  }

  private fillForm(user: User): void {
    this.form.patchValue({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      website: user.website,
      address: user.address,
      company: user.company,
    });
  }

  private getSaveRequest(): Observable<User> {
    const payload: CreateUserPayload = this.form.getRawValue();
    const userId = this.userId();

    if (userId === null) {
      return this.userService.createUser(payload);
    }

    return this.userService.updateUser(userId, payload);
  }
}
