import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface SpiplBankDetails {
  bank_name: string;
  account_no: string;
  swiftcode: string;
  ifsc_code: string;
  ad_code: string;
  bank_address: string;
  gst_no: string;
  addedBy: string;
  added_date: string;
  bank_type: number;
  branch_code: string;
  bank_phone: string;
  credit_limit: string;
  ilc_template: string;
  lc_template: string;
  fd_creation_template:string;
  fd_liquidation_template:string;
  fd_renew_template:string;
}
export interface SpiplBankList extends Array<SpiplBankDetails> {

}

@Injectable()
export class SpiplBankService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
  }

    addBank(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/masters/addSpiplBank', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    updateBank(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/masters/updateSpiplBank', formData).pipe(catchError(this.handleError), tap(resData => {

        }));
      }

    getBankList() {
    return   this.http.get<SpiplBankList>(
      environment.serverUrl + 'api/masters/getOurSpiplBank',
      {

      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

      getAllBankList() {
        return   this.http.get<SpiplBankList>(
          environment.serverUrl + 'api/masters/getAllSpiplBank',
          {

          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      getBankListType(type: number) {
        return   this.http.post<SpiplBankList>(
          environment.serverUrl + 'api/masters/spiplBank/bankType',
          {
            bank_type: type

          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      getOneBank(id: number) {
        return   this.http.post<SpiplBankList>(
          environment.serverUrl + 'api/masters/spiplBank/getOne',
          {
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }





    deleteBank(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/masters/deleteSpiplBank',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

}
