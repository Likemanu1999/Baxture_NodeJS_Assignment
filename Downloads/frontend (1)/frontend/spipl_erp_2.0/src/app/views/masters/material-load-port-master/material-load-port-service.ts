import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';


export interface LoadPortData {
  id: number;
  load_port_name: string;
}

export interface LoadPortDataList extends Array<LoadPortData> { }

@Injectable()
export class MaterialLoadPortService {
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

  getLoadPort() {
    return this.http.get<LoadPortDataList>(
      environment.serverUrl + 'api/load_port_master/get_all_load_port'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addLoadPort(load_port_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/load_port_master/add_load_port',
      {
        load_port_name: load_port_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }


  updateLoadPort(id: number, load_port_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/load_port_master/update_load_port',
      {
        id: id,
        load_port_name: load_port_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }


  deleteLoadPort(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/load_port_master/delete_load_port',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}

