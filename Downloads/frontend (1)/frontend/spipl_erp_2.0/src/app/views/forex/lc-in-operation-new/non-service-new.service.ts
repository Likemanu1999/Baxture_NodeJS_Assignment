import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface NonData {
  id: number;
}
export interface NonList extends Array<NonData> {}

@Injectable()
export class NonServiceNewService {
  constructor(private http: HttpClient) {}
  addNon(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/createNon', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    updateNon(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/forex/updateNon', formData).pipe(catchError(this.handleError), tap(resData => {
        }));
      }



      getOneNon(id) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getOneNon',
          {
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      updateOriginalReceivedDate(id, date, docReferenceNumber, lc_id) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/updateOrginalDocDate',
          {
            id: id,
            lc_id: lc_id,
            doc_ref_no: docReferenceNumber,
            original_doc_received_date: date
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      updateDocketNo(id, docket_no) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/updateDocketNoDet',
          {
            id: id,
            docket_no: docket_no
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      updateReviseNon(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/forex/updateReviseNon', formData).pipe(catchError(this.handleError), tap(resData => {
          }));
        }

      updatePaymentStatus(formData: FormData) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/UpdatePaymentStatus', formData).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      updatePaymentStatusNonLc(formData) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/UpdatePaymentStatusNonLc', formData).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      getNonLcRollOverPayment(formData) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getNonLcRollOverPaymentDetails',
          formData).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      

      sendNonMail(mail_object, non_id, mode) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/sendNonMail',
          {
            mail_object: mail_object,
            nid_arr : non_id,
            flag : mode
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }


    deleteNon(id) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/deleteNon',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getAllNonold() {
      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/getAllNon',
        {
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    // getAllNon() {
    //   return this.http.post<any>(
    //     environment.serverUrl + 'api/non_negotiable/get_all_non',
    //     {
    //     }
    //   )
    //     .pipe(
    //       retry(3), // retry a failed request up to 3 times
    //       catchError(this.handleError) // then handle the error
    //     );
    // }

    getAllNon(formData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getAllNon', formData).pipe(catchError(this.handleError), tap(resData => {
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
