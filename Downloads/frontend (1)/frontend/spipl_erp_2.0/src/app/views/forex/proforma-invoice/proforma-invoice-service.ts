import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ProformaInvoiceData {

    id: Number;
    proform_invoice_no: string;
     proform_invoice_date: string;
     supplier_id: Number;
     first_advising_bank_id: Number;
     second_advising_bank_id: Number;
     buyer_bank_id: Number;
     shipment_year: Number;
     shipment_month: string;
     payment_term: Number;
     material_load_port: string;
     destination_port_id: Number;
     pi_quantity: string;
     pi_rate: string;
     total_pi_amount: string;
     currency_id: Number;
     pi_insurance_id: Number;
     unit_id: Number;
     material_pack_id: Number;
     remark: string;
     pi_copy: string;
     grade_id: Number;
     tentitive_departure_date: string;
     tentitive_arrival_date: string;
     grade_assort_id: Number;


}
export interface ProformaInvoiceList extends Array<ProformaInvoiceData> {}

@Injectable()
export class ProformaInvoiceService {
  constructor(private http: HttpClient) {}

  public add_pi(formData: FormData) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/forex/addProdformaInvoice', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    public update_pi(formData: FormData) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/forex/updatePi', formData).pipe(catchError(this.handleError), tap(resData => {

        }));
      }

    get_pi(id: number) {
        return   this.http.post<ProformaInvoiceList>(
          environment.serverUrl + 'api/forex/getPiAgainstOneGa',
          {
            grade_assort_id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      delete_pi(id: number) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/forex/deletePi',
            {
              id: id
            }
          ).pipe(catchError(this.handleError), tap(resData => {
          }));
      }

      getOnePi(id: number) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getOnePi',
          {
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      getAllPi(pi_flag, status, supplier_id, spipl_bank_id , non_pending_check) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getAllPi',
          {
            pi_flag: pi_flag,
            avail_not_avail_all: status,
            supplier_id: supplier_id,
            spipl_bank_id: spipl_bank_id,
            non_pending_check: non_pending_check
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      getPiForSupplier(supplier_id) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/getPiLcCreated',
          {
            supplier_id: supplier_id,

          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

      sendPIMail(mail_object, id, mode) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/forex/sendPiMail',
          {
            mail_object: mail_object,
            piid_arr : id,
            flag : mode
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
