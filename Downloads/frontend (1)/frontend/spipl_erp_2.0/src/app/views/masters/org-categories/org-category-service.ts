import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';


export interface OrgCategoryData {
  id: number;
  cont_type: string;
  deleted: number;
}

export interface OrgCategoryDataList extends Array<OrgCategoryData> { }

@Injectable()
export class OrgCategoryService {
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

  getCategories() {
    return this.http.get<OrgCategoryDataList>(
      environment.serverUrl + 'api/masters/getAllOrgCategory'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addCategories(cont_type: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addOrgCategory',
      {
        cont_type: cont_type
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }

  getOneCategories(id: number) {
    return this.http.post<OrgCategoryDataList>(
      environment.serverUrl + 'api/masters/getOneOrgCategory',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  updateCategories(id: number, cont_type: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updateOrgCategory',
      {
        id: id,
        cont_type: cont_type
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }


  deleteCategories(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deleteOrgCategory',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}

