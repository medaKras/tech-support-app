import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IWorker } from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  baseUrl: string = 'assets/';

  constructor(private http: HttpClient) { }

  getWorkers() : Observable<IWorker[]> {
    return this.http.get<IWorker[]>(this.baseUrl + 'workers.json')
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('server error:', error);
    if (error.error instanceof Error) {
        const errMessage = error.error.message;
        return Observable.throw(errMessage);
        // Use the following instead if using lite-server
        // return Observable.throw(err.text() || 'backend server error');
    }
    return Observable.throw(error || 'Node.js server error');
  }

}
