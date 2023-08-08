import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';



export interface ExpenseCatList {
    category: string;
  }
export interface ExpenseCatListData extends Array<ExpenseCatList> {}


@Injectable()
export class ExpenseCatService {
 constructor(private http: HttpClient) {}

 private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
  }
  return throwError('Something bad happened; please try again later.');
}

 getExpenseCat() {
    return this.http.get<ExpenseCatListData>(
      environment.serverUrl + 'api/expense_cat_master/get_all_expense_cat'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
    
      );
  }

  addExpenseCat(category: string) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/expense_cat_master/add_expense_cat',
        {
          category: category
        }
      ).pipe(catchError(this.handleError), tap(resData => {
        // const userdata = resData.data;
      }));
    }

    deleteExpenseCat(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/expense_cat_master/delete_expense_cat',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getOneExpenseCat(id: number) {
      return   this.http.post<ExpenseCatListData>(
        environment.serverUrl + 'api/expense_cat_master/get_one_expense_cat',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    updateExpenseCat(id: number, up_category: string)
     {
      return   this.http.post<any>(
        environment.serverUrl + 'api/expense_cat_master/update_expense_cat',
        {
          id: id,
          category: up_category
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }
 

}