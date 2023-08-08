import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';

export interface PortData {
  id: number
  port_name: string;
  abbr: string;
  port_address: string;
  port_full_name: string;
}

export interface PortDataList extends Array<PortData> { }

@Injectable()

export class PortService {

  constructor(private http: HttpClient) { }

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

  getPort() {
    return this.http.get<PortDataList>(
      environment.serverUrl + 'api/masters/getAllPort'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }


  addPort(port_name: string, abbr: string, port_address: string, port_full_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addPort',
      {
        port_name: port_name,
        abbr: abbr,
        port_address: port_address,
        port_full_name: port_full_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }

  getOnePort(id: number) {
    return this.http.post<PortDataList>(
      environment.serverUrl + 'api/masters/getOnePort',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }


  updateGodown(id: number, port_name: string, abbr: string, port_address: string, port_full_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updatePort',
      {
        id: id,
        port_name: port_name,
        abbr: abbr,
        port_address: port_address,
        port_full_name: port_full_name
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