import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';



export interface SubOrgList {
  sub_org_name: string;
  sub_org_id: number;
  }
export interface SubOrgListData extends Array<SubOrgList> {}


@Injectable()
export class SubOrgService {
 constructor(private http: HttpClient) {}

 private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
  }
  return throwError('Something bad happened; please try again later.');
}

 getSubOrg() {
    return this.http.get<SubOrgListData>(
      environment.serverUrl + 'api/organization/getSubOrgList'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error

      );
  }



}
