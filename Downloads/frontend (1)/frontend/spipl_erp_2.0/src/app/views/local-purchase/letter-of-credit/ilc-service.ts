import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface IlcData {
  id: number;
  ilc_date: string;
  latest_date_of_shipment: string;
  ilc_expiry_date: string;
  advising_bank_id: number;
  negotiating_bank_id: number;
  spipl_bank_id: number;
  transhipment: number;
  partial_shipment: number;
  ilc_opening_date: string;
  ilc_bank_no: string;
  ilc_copy: string;
  ilc_ammend_dt: string;
  ilc_ammend_copy: string;
  ilc_ammend_remark: string;

}
export interface IlcTableData extends Array<IlcData> {}

@Injectable()
export class IlcService {
 constructor(private http: HttpClient) {}

 public create_lc_application(formData: FormData) {
  return   this.http.post<any>(
      environment.serverUrl + 'api/local_purchase/addIlcApplication', formData).pipe(catchError(this.handleError), tap(resData => {

    }));
  }

  public update_lc_application(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/updateIlcApplication', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

  public ilc_open(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/ilcOpen', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    public ilc_ammend(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/local_purchase/ilcAmmend', formData).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      public discard_ilc(ilc_id: number) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/local_purchase/ilcDiscard', {
             ilc_id: ilc_id
            }).pipe(catchError(this.handleError), tap(resData => {
          }));
        }

  public ilc_letter_credit_list(spipl_bank_id: number, lc_date_from: string , lc_date_to: string , lc_opening_dt_from: string , lc_opening_dt_to: string, ilc_id?: number ) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/allIlcList', {
          lc_date_from: lc_date_from,
          lc_date_to: lc_date_to,
          lc_opening_dt_from: lc_opening_dt_from,
          lc_opening_dt_to: lc_opening_dt_to,
          ilc_id: ilc_id,
          spipl_bank_id: spipl_bank_id

        }).pipe(catchError(this.handleError), tap(resData => {
      }));
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



}
