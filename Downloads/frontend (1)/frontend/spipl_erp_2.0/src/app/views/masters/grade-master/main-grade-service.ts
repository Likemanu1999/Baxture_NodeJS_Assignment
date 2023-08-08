import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';


export interface MainGradeData {
    id: number;
    name: string ;
    product_id: number;
}

export interface MainGradeDataList extends Array<MainGradeData> {}

 @Injectable()

 export class MainGradeService {

    constructor (private http: HttpClient) {}

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

    getMainGrade() {
        return this.http.get<MainGradeDataList>(
          environment.serverUrl + 'api/masters/getAllMainGrade'
        )
          .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.handleError) // then handle the error
          );
    }

    getOneMainGrade(id: number) {
        return this.http.get<MainGradeDataList>(
          environment.serverUrl + 'api/grade_master/get_one_main_grade'
        )
          .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.handleError) // then handle the error
          );
    }

 }
