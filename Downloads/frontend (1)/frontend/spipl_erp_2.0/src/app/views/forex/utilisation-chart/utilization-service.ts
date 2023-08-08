import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

export interface UtilizationFieldList {
  bank_lc_no: string;
}
export interface UtilizationData extends Array<UtilizationFieldList> { }


@Injectable()
export class UtilizationService {


  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }



  getLcUtilization(lc_open_dt_from, lc_open_dt_to, spipl_bank_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/lcUtilization',
      {
        lc_open_dt_to: lc_open_dt_to,
        lc_open_dt_from: lc_open_dt_from,
        spipl_bank_id: spipl_bank_id
      }
    ).pipe(catchError(this.handleError), tap(resData1 => {
      // console.log(resData1);
    }));
  }


  getDocAccepatnce(lc_open_dt_from, lc_open_dt_to, spipl_bank_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/docAccepatnce',
      {
        lc_open_dt_to: lc_open_dt_to,
        lc_open_dt_from: lc_open_dt_from,
        spipl_bank_id: spipl_bank_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // console.log(resData);
    }));
  }

  getPaymentRollOver(lc_open_dt_from, lc_open_dt_to, spipl_bank_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/paymentRollOver',
      {
        lc_open_dt_to: lc_open_dt_to,
        lc_open_dt_from: lc_open_dt_from,
        spipl_bank_id: spipl_bank_id
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
      // console.log(resData3);
    }));
  }

  getPaymentRollOverNonLc(spipl_bank_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/NonLcPaymentRollOverList',
      {
        spipl_bank_id: spipl_bank_id
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
      // console.log(resData3);
    }));
  }

  UpdatePaymentRate(n_id, payment_status, rate) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/updatePaymentRate',
      {
        n_id: n_id,
        // payment_status: payment_status,
        rate: rate
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
      // console.log(resData3);
    }));
  }

  UpdatePaymentRateNonLcRoll(pi_id, payment_status, rate) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/updatePaymentRateNonLcRoll',
      {
        pi_id: pi_id,
        // payment_status: payment_status,
        rate: rate
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
      // console.log(resData3);
    }));
  }


  getPaymentList(spipl_bank_id, payment_due_dtFrom, payment_due_dtTo, supplier_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/nonPaymentList',
      {
        spipl_bank_id: spipl_bank_id,
        payment_due_dtFrom: payment_due_dtFrom,
        payment_due_dtTo: payment_due_dtTo,
        supplier_id: supplier_id
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
     // console.log(resData3);
    }));
  }
  getPaymentListNew(spipl_bank_id, payment_due_dtFrom, payment_due_dtTo, supplier_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/nonPaymentListNew',
      {
        spipl_bank_id: spipl_bank_id,
        payment_due_dtFrom: payment_due_dtFrom,
        payment_due_dtTo: payment_due_dtTo,
        supplier_id: supplier_id
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
    }));
  }
  updatePaymentDate(payment_due_dt, payment_status, n_id, pi_id, payment_term_id) {
    return this.http.post<any>(
      environment.serverUrl + 'api/forex/updatePaymentDate',
      {
        payment_due_dt: payment_due_dt,
        payment_status: payment_status,
        n_id: n_id,
        pi_id: pi_id,
        payment_term_id: payment_term_id
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
      // console.log(resData3);
    }));
  }

  UpdatePaymentCharges(n_id, payment_status, supplier_charge, confirmation_charge) {
    return this.http.post<any>(
      environment.serverUrl + 'api/utilisation/update_sc_cc_charges',
      {
        n_id: n_id,
        payment_charges_status: payment_status,
        supp_charges: supplier_charge,
        confirmation_charges: confirmation_charge
      }
    ).pipe(catchError(this.handleError), tap(resData3 => {
      // console.log(resData3);
    }));
  }


}
