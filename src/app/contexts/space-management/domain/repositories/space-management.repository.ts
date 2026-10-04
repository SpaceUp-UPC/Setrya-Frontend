import { Observable } from 'rxjs';
import { Home } from '../models/home';

export abstract class SpaceManagementRepository {

  abstract getHomeById(homeId: number): Observable<Home>;
}
