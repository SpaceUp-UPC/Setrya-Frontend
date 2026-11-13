import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable, throwError } from 'rxjs';

import { environment } from
  '../../../../../environments/environment';

import {
  Space,
  CreateSpaceRequest
} from '../../domain/models/space';

@Injectable({
  providedIn: 'root'
})
export class SpaceApiService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    environment.spaceManagementApiUrl.replace(/\/+$/, '');

  listByOwner(ownerId: string): Observable<Space[]> {

    if (!this.baseUrl) {
      return throwError(
        () => new Error('SPACE_API_NOT_CONFIGURED')
      );
    }

    return this.http
      .get<Space[] | null>(
        `${this.baseUrl}/owners/${encodeURIComponent(ownerId)}/spaces`
      )
      .pipe(
        map(spaces => spaces ?? [])
      );
  }

  createSpace(
    request: CreateSpaceRequest
  ): Observable<Space> {

    if (!this.baseUrl) {
      return throwError(
        () => new Error('SPACE_API_NOT_CONFIGURED')
      );
    }

    return this.http.post<Space>(
      `${this.baseUrl}/spaces`,
      request
    );
  }

}