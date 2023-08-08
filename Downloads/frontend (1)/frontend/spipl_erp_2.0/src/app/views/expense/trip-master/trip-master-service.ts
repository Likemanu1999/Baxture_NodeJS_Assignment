import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';



export interface TripMasterList {
  trip_name: string;
  credit_note: [];

}
export interface TripMasterListData extends Array<TripMasterList> { }


@Injectable()
export class TripMasterService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getAllTrip() {
    return this.http.get<TripMasterListData>(
      environment.serverUrl + 'api/trip_master/get_all_trip'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error

      );
  }

  deleteTrip(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/trip_master/delete_trip',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  addTrip(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/trip_master/add_trip_master', formData).pipe(catchError(this.handleError), tap(resData => {
        // 
      }));
  }

  updateTrip(formData: FormData) {
    return this.http.post<any>(
      environment.serverUrl + 'api/trip_master/update_trip', formData).pipe(catchError(this.handleError), tap(resData => {
        // 
      }));
  }

  getOneTrip(id: number) {
    return this.http.post(
      environment.serverUrl + 'api/trip_master/get_one_trip',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }



}