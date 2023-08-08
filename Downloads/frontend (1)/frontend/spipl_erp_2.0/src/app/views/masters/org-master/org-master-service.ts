import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface MainOrgData {
  id: number;
  org_name: string;
  website: string;
  added_date: string;
  deleted: string;
}
export interface MainOrgTableData extends Array<MainOrgData> { }

@Injectable()
export class OrgMasterService {
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

  getData() {
    return this.http.get<MainOrgTableData>(
      environment.serverUrl + 'api/organization/getAllMainOrg'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addOrg(org_name: string, website: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/organization/addMainOrg',
      {
        org_name: org_name,
        website: website
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }
  getOneOrg(id: number) {
    return this.http.post<MainOrgTableData>(
      environment.serverUrl + 'api/organization/getOneMainOrg',
      {
        org_id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  updateOrg(id: number, org_name: string, website) {
    return this.http.post<any>(
      environment.serverUrl + 'api/organization/updateMainOrg',
      {
        org_id: id,
        org_name: org_name,
        website: website
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  deleteOrg(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/organization/deleteMainOrg',
      {
        org_id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
