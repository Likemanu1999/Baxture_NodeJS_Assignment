import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface UnitData {
  ut_id: number;
  unit_type: string;
  deleted: string;
}
export interface UnitTableData extends Array<UnitData> { }

@Injectable()
export class UnitService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getData() {
    return this.http.get<UnitTableData>(
      environment.serverUrl + 'api/masters/getAllUnit'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addUnit(unit_type: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addUnit',
      {
        unit_type: unit_type
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  getOneUnit(ut_id: number) {
    return this.http.post<UnitTableData>(
      environment.serverUrl + 'api/masters/getOneUnit',
      {
        ut_id: ut_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  updateUnit(ut_id: number, unit_type: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updateUnit',
      {
        ut_id: ut_id,
        unit_type: unit_type
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  deleteUnit(ut_id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deleteUnit',
      {
        ut_id: ut_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
