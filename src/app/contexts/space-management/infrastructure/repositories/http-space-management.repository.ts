import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { SpaceManagementRepository } from '../../domain/repositories/space-management.repository';
import { Home } from '../../domain/models/home';

@Injectable()
export class HttpSpaceManagementRepository
  extends SpaceManagementRepository {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl;


  getHomeById(
    homeId: number
  ): Observable<Home> {

    return this.http.get<Home>(
      `${this.apiUrl}/homes/${homeId}`
    );

  }

}
