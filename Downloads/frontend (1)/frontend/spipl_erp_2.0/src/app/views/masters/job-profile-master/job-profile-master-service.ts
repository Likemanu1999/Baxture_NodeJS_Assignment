import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


export interface JobProfileData {
  id: number;
  profile_name: string;
  added_date: string;
  deleted: string;
}
export interface JobTableData extends Array<JobProfileData> { }

@Injectable()
export class JobProfileMasterService {
  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get<JobTableData>(
      environment.serverUrl + 'api/job_profile_master/get_all_job_profile'
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
  addJobProfile(profile_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/job_profile_master/add_job_profile',
      {
        profile_name: profile_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }
  getOneJobProfile(id: number) {
    return this.http.post<JobTableData>(
      environment.serverUrl + 'api/job_profile_master/get_one_job_prodfile',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  updateJobProfile(id: number, profile_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/job_profile_master/update_job_profile',
      {
        id: id,
        profile_name: profile_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  deleteJobProfile(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/job_profile_master/delete_job_profile',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
