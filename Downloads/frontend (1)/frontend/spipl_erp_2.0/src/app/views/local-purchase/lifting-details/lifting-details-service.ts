import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';



@Injectable()
export class LiftingDetailsService {
  constructor(private http: HttpClient) {}



  public add_lifting_detail(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/addLiftingDetails', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }


  public update_lifting_detail(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/updateLiftingDetails', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    lifting_detail_list(lifting_date_from , lifting_date_to , status_short_damage_mat) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/local_purchase/completeLiftingDetailList',
          {
            lifting_date_from: lifting_date_from,
            lifting_date_to: lifting_date_to,
            status_short_damage_mat: status_short_damage_mat

          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      update_dr_cr_note(id: number, damage_short_dr_cr_note: string) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/local_purchase/updateDrCrNote',
          {
            id: id,
            damage_short_dr_cr_note: damage_short_dr_cr_note,
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      verify_local_purchase(id: number, material_received_date: string) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/local_purchase/verifyLocalPurchaseLIfting',
          {
            id: id,
            material_received_date: material_received_date,
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }



    // get_purchase_deal(id: number) {
    //     return   this.http.post<any>(
    //       environment.serverUrl + 'api/purchase_deal/get_one_local_purchase',
    //       {
    //         id: id
    //       }
    //     ).pipe(catchError(this.handleError), tap(resData => {
    //     }));
    //   }


    delete_lifting_detail(id: number , local_purchase_id) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/local_purchase/deleteLocalPurchaseLifting',
        {
          id: id,
          local_purchase_id: local_purchase_id,
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
