import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class NonLcService {
  constructor(private http: HttpClient) {}


  addPaymentDetails(formData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/addPaymentDate', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

  addSwiftDetails(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/updateSwiftDetails', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

  //   updateNonLc(formData: FormData) {
  //     return   this.http.post<any>(
  //         environment.serverUrl + 'api/letter_of_credit/update_lc_application', formData).pipe(catchError(this.handleError), tap(resData => {

  //       }));
  //     }



    getNonLcList(id: number ) {

        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getPaymentTermList', {
            id : id
          }).pipe(catchError(this.handleError), tap(resData => {

          }));

    }

    getNonDetails(id: number ) {
      console.log(id);
      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/getNonLcNon', {
          id : id
        }).pipe(catchError(this.handleError), tap(resData => {

        }));

  }
  // id: number , payment_term_id: number
    deleteSwift(swift_id: number) {

      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/deleteSwift', {
          swift_id : swift_id
        }).pipe(catchError(this.handleError), tap(resData => {

        }));

  }

  resetRollOver(id: number) {

    return   this.http.post<any>(
      environment.serverUrl + 'api/non_lc/reset_RollOver_in_nonlc', {
        id : id
      }).pipe(catchError(this.handleError), tap(resData => {

      }));

}

    // getOneLcInDetail(id: number) {
    //   return   this.http.post<any>(
    //     environment.serverUrl + 'api/letter_of_credit/one_lc_all_pi_non_details',
    //     {
    //       id: id
    //     }
    //   ).pipe(catchError(this.handleError), tap(resData => {
    //   }));
    // }

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
