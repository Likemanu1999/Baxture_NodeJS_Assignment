import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface PaymentTermData {
  pt_id: number;
  pay_term: string;
  pay_val: number;
  pay_type: number;
}


export interface PaymentTermDataList extends Array<PaymentTermData> { }

@Injectable()
export class PaymentTermService {

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

  getPaymentTerm() {
    return this.http.get<PaymentTermDataList>(
      environment.serverUrl + 'api/masters/paymentTerm/getAll',
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  getPaymentTermType(pay_type: number) {
    return this.http.post<PaymentTermDataList>(
      environment.serverUrl + 'api/masters/paymentTerm/getPayTermPaytype', {
      pay_type: pay_type
    }
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }


  addPaymentTerm(pay_val: number, pay_type: number, on_within: number,
    baseline_date: string, pay_percentage: number, advance_credit_payment: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addPaymentTerm',
      {
        credit_days: pay_val,
        pay_type: pay_type,
        within_on: on_within,
        baseline_date: baseline_date,
        percentage: pay_percentage,
        advance_credit_payment: advance_credit_payment

      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }

  getOnePaymentTerm(pt_id: number) {
    return this.http.post<PaymentTermDataList>(
      environment.serverUrl + 'api/masters/getOnePaymentTerm',
      {
        pt_id: pt_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  updatePaymentTerm(pt_id: number, pay_val: number, pay_type: number, on_within: number,
    baseline_date: string, pay_percentage: number, advance_credit_payment: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updatePaymentTerm',
      {
        pt_id: pt_id,
        credit_days: pay_val,
        pay_type: pay_type,
        within_on: on_within,
        baseline_date: baseline_date,
        percentage: pay_percentage,
        advance_credit_payment: advance_credit_payment
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  deletePaymentTerm(pt_id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deletePaymentTerm',
      {
        pt_id: pt_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

}
