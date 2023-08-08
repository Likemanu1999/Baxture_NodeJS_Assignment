import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


export interface QualificationData {
  id: number;
  name: string;
  added_date: string;
  deleted: string;
}
export interface QualicationTableData extends Array<QualificationData> { }

@Injectable()
export class QualificationMasterService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getData() {
    return this.http.get<QualicationTableData>(
      environment.serverUrl + 'api/masters/getAllQualification'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addQualification(name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/qualification_master/add_qualification',
      {
        name: name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }
  getOneQualification(id: number) {
    return this.http.post<QualicationTableData>(
      environment.serverUrl + 'api/qualification_master/get_one_qualification',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  updateQualification(id: number, name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/qualification_master/update_qualification',
      {
        id: id,
        name: name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  deleteQualification(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/qualification_master/delete_qualification',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
