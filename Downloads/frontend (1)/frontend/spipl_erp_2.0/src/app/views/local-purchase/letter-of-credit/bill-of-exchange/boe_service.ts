import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface BoeData {
  id: number;
  ilc_id: number;
  be_date: string;
  be_no: string;
  bank_ref_no: string;
  be_copy: string;
  remark: string;
  status: number;
  dut_dt: string;
  pi_lc_details: string;
  conf_issue_dt: string;
  discount_date: string;
  discount_rate: string;
  amt_credit_supplier: string;
  margin_money: string;
  bex_accept_copy: string;

}
export interface BoeTableData extends Array<BoeData> {}

@Injectable()
export class BoeService {
 constructor(private http: HttpClient) {}

 private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
  }
  return throwError('Something bad happened; please try again later.');
}

 public create_bex(formData: FormData) {
  return   this.http.post<any>(
      environment.serverUrl + 'api/local_purchase/addBex', formData).pipe(catchError(this.handleError), tap(resData => {

    }));
  }

  public update_bex(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/updateBex', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    public bex_acceptance(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/local_purchase/addbexAcceptance', formData).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

  public get_bex(be_date_from, be_date_to) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/getAllBex', {
          be_date_from: be_date_from,
          be_date_to: be_date_to
        }).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

  public delete_bex(id: number) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/deleteBex', {
          id: id
        }).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

}

