import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ForwardBookService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

  addForwardBook(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/forwardBookAdd', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    updateForwardBook(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/forex/updateForward', formData).pipe(catchError(this.handleError), tap(resData => {
     }));
      }


    hedgeInvoice(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/forex/hedgePayment', formData).pipe(catchError(this.handleError), tap(resData => {
     }));
      }

      hedgeInvoiceEdit(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/forex/hedgePaymentEdit', formData).pipe(catchError(this.handleError), tap(resData => {
       }));
        }

      deleteHedge(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/forex/deleteHedge', formData).pipe(catchError(this.handleError), tap(resData => {
       }));
        }



    getAllForwardBook(forward_book_date_from , forward_book_date_to,due_dt) {

      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/getAllForwardBook', {
          forward_book_date_from : forward_book_date_from,
          forward_book_date_to : forward_book_date_to,
          due_dt:due_dt
        }).pipe(catchError(this.handleError), tap(resData => {

        }));

  }

    deleteForwardBook(id: number) {

      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/deleteForward', {
          id : id
        }).pipe(catchError(this.handleError), tap(resData => {

        }));

  }



    getOneForwardBook(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/forex/getOneForwardBook',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

}
