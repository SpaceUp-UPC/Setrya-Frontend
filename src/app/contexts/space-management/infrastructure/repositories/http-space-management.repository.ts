import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Home } from '../../domain/models/home';
import { SpaceManagementRepository } from '../../domain/repositories/space-management.repository';

@Injectable()
export class HttpSpaceManagementRepository
  extends SpaceManagementRepository {

  private readonly apiUrl = 'http://localhost:3000';

  constructor(
    private readonly http: HttpClient
  ) {
    super();
  }

  getHomeById(homeId: number): Observable<Home> {
    return this.http.get<Home>(
      `${this.apiUrl}/homes/${homeId}`
    );
  }
}
