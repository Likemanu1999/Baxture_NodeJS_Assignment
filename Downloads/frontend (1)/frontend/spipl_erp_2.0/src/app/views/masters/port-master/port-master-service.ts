import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface PortData {
  id: number;
  port_name: string;
  abbr: string;
  port_full_name: string;
  port_address: string;
  deleted: string;
}
export interface PortMasterList extends Array<PortData> { }

@Injectable()
export class PortMasterService {
  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get<PortMasterList>(
      environment.serverUrl + 'api/masters/port/getAll'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
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
  addPort(port_name: string, port_full_name: string, abbr: string, port_address: string, gst_no: string, email: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addPort',
      {
        port_name: port_name,
        port_full_name: port_full_name,
        abbr: abbr,
        port_address: port_address,
        gst_no: gst_no,
        email: email

      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }
  getOnePort(id: number) {
    return this.http.post<PortData>(
      environment.serverUrl + 'api/masters/getOnePort',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  updatePort(id: number, port_name: string, port_full_name: string, abbr: string, port_address: string, gst_no: string, email: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updatePort',
      {
        id: id,
        port_name: port_name,
        port_full_name: port_full_name,
        abbr: abbr,
        port_address: port_address,
        gst_no: gst_no,
        email: email
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  deletePort(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deletePort',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
