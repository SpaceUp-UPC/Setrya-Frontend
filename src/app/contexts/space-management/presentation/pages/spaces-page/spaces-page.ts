import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TranslatePipe } from '@ngx-translate/core';

import { AuthSessionService } from
  '../../../../identity-access/application/services/auth-session.service';

import { SpaceApiService } from
  '../../../infrastructure/services/space-api.service';

import {
  Space,
  CreateSpaceRequest
} from '../../../domain/models/space';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-spaces-page',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './spaces-page.html',
  styleUrl: './spaces-page.scss'
})
export class SpacesPage implements OnInit {

  private readonly api = inject(SpaceApiService);
  private readonly session = inject(AuthSessionService);
  private readonly fb = inject(FormBuilder);

  readonly spaces = signal<Space[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly showCreateForm = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly successKey = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(160)
    ]],
    description: [''],
    address: ['', Validators.required],
    district: ['', Validators.required],
    city: ['', Validators.required],
    width: [4.5, [
      Validators.required,
      Validators.min(0.01)
    ]],
    length: [5.0, [
      Validators.required,
      Validators.min(0.01)
    ]]
  });

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    const user = this.session.currentUser();

    if (!user) {
      this.errorKey.set('spaces.loadError');
      return;
    }

    this.isLoading.set(true);
    this.errorKey.set(null);

    this.api.listByOwner(String(user.id)).subscribe({
      next: spaces => {
        this.spaces.set(spaces);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorKey.set('spaces.loadError');
      }
    });
  }

  toggleForm(): void {
    this.showCreateForm.update(value => !value);
    this.errorKey.set(null);
    this.successKey.set(null);
  }

  createSpace(): void {
    if (this.isSaving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.session.currentUser();

    if (!user) {
      this.errorKey.set('spaces.createError');
      return;
    }

    const values = this.form.getRawValue();

    const request: CreateSpaceRequest = {
      ownerId: String(user.id),
      name: values.name.trim(),
      description: values.description.trim(),
      location: {
        address: values.address.trim(),
        district: values.district.trim(),
        city: values.city.trim()
      },
      dimensions: {
        width: values.width,
        length: values.length
      }
    };

    if (
      !request.name ||
      !request.location.address ||
      !request.location.district ||
      !request.location.city
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorKey.set(null);
    this.successKey.set(null);

    this.api.createSpace(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showCreateForm.set(false);
        this.form.reset();
        this.successKey.set('spaces.created');
        this.loadSpaces();
      },
      error: () => {
        this.isSaving.set(false);
        this.errorKey.set('spaces.createError');
      }
    });
  }
}