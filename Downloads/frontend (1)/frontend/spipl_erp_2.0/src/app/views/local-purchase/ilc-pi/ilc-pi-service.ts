import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface IlcPiData {
  id: number;
  pi_date: string;
  pi_invoice_no: string;
  pi_copy: string;
  local_purchase_deal_details: string;
  supplier_id: number;
  place_of_loading: string;
  place_of_destination: string;
  remark: string;
  ilc_id: number;
  LocalPurchaseDealDet: any[];
  amount_utilized_rtgs?: number;
  amount_utilized_lc?: number;

}
export interface IlcPiTableData extends Array<IlcPiData> {}

@Injectable()
export class IlcPiService {
 constructor(private http: HttpClient) {}

 public add_ilc_pi(formData: FormData) {
  return   this.http.post<any>(
      environment.serverUrl + 'api/local_purchase/addIlcPi', formData).pipe(catchError(this.handleError), tap(resData => {

    }));
  }

  public update_ilc_pi(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/updateIlcPi', formData).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

  public get_Ilc_Pi_List(ilc_pi_from_dt: string, ilc_pi_to_dt: string) {
    return this.http.post<IlcPiTableData>(environment.serverUrl + 'api/local_purchase/allIlcProformaInvoice', {
      ilc_pi_from_dt: ilc_pi_from_dt ,
      ilc_pi_to_dt: ilc_pi_to_dt
    }).pipe(catchError(this.handleError), tap(resData => {

    }));
  }

  public delete_ilc_pi(id: number) {
    return this.http.post<any>(environment.serverUrl + 'api/local_purchase/deleteIlcPi', {
     id: id
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
