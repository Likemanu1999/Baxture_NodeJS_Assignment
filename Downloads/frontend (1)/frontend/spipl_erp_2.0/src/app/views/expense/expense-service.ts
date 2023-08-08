import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';



export interface ExpenseFieldList {
    id: number;
    category_id: number;
    expense_date: string;
    service_provider: string;
    company_id: number;
    description: string;
    amount: number;
    status: number;
    category: string;
    sub_org_name : string;
    refundable_status : number;
    expense_copy : [];
    trip_id : number;
    reimburse_amount :number;
    refund_amount : number;
    emp_id : any ;
    added_date :Date;
    modified_date : Date;
    added_by : number;
    modified_by : number;

  }
  export interface ExpenseFieldListData extends Array<ExpenseFieldList> {}


@Injectable()
export class ExpenseService {
 constructor(private http: HttpClient) {}

 private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
  }
  return throwError('Something bad happened; please try again later.');
}

 getExpenseList(expense_list) {
    return this.http.post<ExpenseFieldListData>(
      environment.serverUrl + 'api/expense_master/get_all_expense', {
        expense_list : expense_list
      }
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error

      );
  }

  addExpense(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/expense_master/add_expense', formData).pipe(catchError(this.handleError), tap(resData => {
        // const userdata = resData.data;
      }));
  }

  getOneExpense(id: number) {
    return   this.http.post(
      environment.serverUrl + 'api/expense_master/get_one_expense',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  updateRefund(id: number, up_refundable_status : number, up_refund_amount :number ) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/expense_master/refund_update', {
          id: id,
          refundable_status : up_refundable_status,
          refund_amount : up_refund_amount
        }).pipe(catchError(this.handleError), tap(resData => {
        // const userdata = resData.data;
      }));
    }

    updateReimburse(id: number, up_reimburse_amount : number ) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/expense_master/reimburse_update', {
            id: id,
            reimburse_amount : up_reimburse_amount
          }).pipe(catchError(this.handleError), tap(resData => {
          // const userdata = resData.data;
        }));
      }

      updateExpense(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/expense_master/update_expense', formData).pipe(catchError(this.handleError), tap(resData => {
            // const userdata = resData.data;
          }));
        }


  deleteExpense(id: number) {
    return   this.http.post<any>(
      environment.serverUrl + 'api/expense_master/delete_expense',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }



  getTripWiseExpense(trip_id: number) {
    return   this.http.post(
      environment.serverUrl + 'api/expense_master/get_trip_wise_expense',
      {
        trip_id : trip_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
