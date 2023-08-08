import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';


export interface GradeMasterData {
  grade_id: number;
  grade_name: string;
  main_grade_id: number;
  prime_non_prime: number;
}

export interface GradeMasterDataList extends Array<GradeMasterData> { }

@Injectable()

export class GradeMasterService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getGrades() {
    return this.http.get<GradeMasterDataList>(
      environment.serverUrl + 'api/masters/grade/getAll'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addGrade(grade_name: string, main_grade_id: number, prime_non_prime: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addGrade',
      {
        grade_name: grade_name,
        main_grade_id: main_grade_id,
        prime_non_prime: prime_non_prime
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }

  getOneGrade(grade_id: number) {
    return this.http.post<GradeMasterDataList>(
      environment.serverUrl + 'api/masters/getOneGrade',
      {
        grade_id: grade_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  updateGrade(grade_id: number, grade_name: string, main_grade_id: number, prime_non_prime: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updateGrade',
      {
        grade_id: grade_id,
        grade_name: grade_name,
        main_grade_id: main_grade_id,
        prime_non_prime: prime_non_prime
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  deleteGrade(grade_id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deleteGrade',
      {
        grade_id: grade_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }








}
