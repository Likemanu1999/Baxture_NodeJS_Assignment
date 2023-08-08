import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { error } from 'console';



@Injectable()
export class LocalPurchaseService {
  constructor(private http: HttpClient) {}

  public add_purchase_deal(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/addLocalPurchaseDeal', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }


  public update_purchase_deal(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/updateLocalPurchaseDeal', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

     get_all_purchase_deals(deal_date_from, deal_date_to , lifting_status, payment_status) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/local_purchase/allLocalPurchaseDealDetails',
          {
            deal_date_from : deal_date_from,
            deal_date_to : deal_date_to,
            status_lift : lifting_status,
            status_payment : payment_status,
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }



    get_purchase_deal(id: number) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/purchase_deal/get_one_local_purchase',
          {
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

    cancel_quantity(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/cancelDealQuantity',
        {
          local_purchase_id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }



    delete_deal(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/deleteLocalPurchaseDeal',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
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
