import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';

export interface GodownData {
  id: number;
  godown_name: string;
  port_id: number;
  load_charges: number;
  cross_charges: number;
  gst_no: string;
  godown_incharge_name: string;
  godown_incharge_sign: any;
  godown_address: string;
}

export interface GodownDataList extends Array<GodownData> { }

@Injectable()

export class GodownService {

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getGodown() {
    return this.http.get<GodownDataList>(
      environment.serverUrl + 'api/masters/getAllGodown'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }


  addGodown(formData: FormData) {

    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addGodown', formData).pipe(catchError(this.handleError), tap(resData => {
      }));


  }

  getOneGodown(id: number) {
    return this.http.post<GodownDataList>(
      environment.serverUrl + 'api/masters/getOneGodown',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }


  updateGodown(formData: FormData) {

    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updateGodown', formData).pipe(catchError(this.handleError), tap(resData => {
      }));

  }

  deleteGodown(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deleteGodown',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
