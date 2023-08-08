import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';




@Injectable()
export class IndentPIService {
  constructor(private http: HttpClient) {}


  updateIndentPI(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/updateIndentPi', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }


  addIndentSwiftDt(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/addIndentSwiftDetails', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }


  updateIndentSwiftDt(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/updateIndentSwiftDetails', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }


  deleteIndentSwiftDt(id: number) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/deleteIndentSwiftDetails', {
          id: id,
        }).pipe(catchError(this.handleError), tap(resData => {

      }));
    }



  getIndentSwiftDt(piid) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/getIndentSwiftDetails',{
         piid: piid,
        }).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
