import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface DepartmentData {
  id: number;
  dept_name: string;
  added_date: string;
  deleted: string;
}
export interface DepartmentTableData extends Array<DepartmentData> { }

@Injectable()
export class DepartmentMasterService {
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
    return this.http.get<DepartmentTableData>(
      environment.serverUrl + 'api/masters/getAllDepartment'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  addDepartment(dept_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/department_master/add_dept',
      {
        dept_name: dept_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }
  getOneDepartment(id: number) {
    return this.http.post<DepartmentTableData>(
      environment.serverUrl + 'api/department_master/get_one_dept',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  updateDepartment(id: number, dept_name: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/department_master/update_dept',
      {
        id: id,
        dept_name: dept_name
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
  deleteDepartment(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/department_master/delete_dept',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
