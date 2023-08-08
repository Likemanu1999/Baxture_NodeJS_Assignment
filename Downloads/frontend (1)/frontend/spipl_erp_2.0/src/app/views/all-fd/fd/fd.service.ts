import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { UserDetails } from '../../login/UserDetails.model';
import { SpiplBankList } from '../../masters/spipl-bank-master/spipl-bank-service';

export interface FdDetails {
  fd_id: number;
  fd_make_dt: string;
  bk_id: number;
  fd_no: string;
  fd_amt: number;
  fd_maturity_dt: string;
  fd_release_dt: string;
  fd_in_days: number;
  rate_of_interest: number;
  gross_interest: number;
  tds_per: number;
  tds_amt: string;
  net_interest: number;
  total_amt: string;
  fd_type: string;
  lc_no: string;
  rel_fd_in_days: number;
  rel_rate_of_interest: number;
  rel_gross_interest: number;
  rel_tds_amt: number;
  rel_tds_per: number;
  rel_net_interest: number;
  rel_total_amt: number;
  added_by: string;
  added_date: string;
  modified_by: string;
  modified_date: string;
  deleted: number;
  status: number;
  lc_copy: string;
  message: string;
  data: string
}

export interface FDList extends Array<FdDetails> {

}

@Injectable()
export class FdService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

  getBankList() {
    return this.http.get<SpiplBankList>(environment.serverUrl + 'api/spipl_bank_master/get_ours_spipl_bank', {}).pipe(
      catchError(this.handleError), tap(res => { })
    )
  }
  
  addNewFd(fdData) {
    return   this.http.post<any>(
      environment.serverUrl + 'api/all_fds/add_fd', fdData).pipe(catchError(this.handleError), tap(resData => {

    }));
  }

  updateNewFd(fdData) {
    return   this.http.post<any>(
      environment.serverUrl + 'api/all_fds/update_fd', fdData).pipe(catchError(this.handleError), tap(resData => {

    }));
  }

  deleteNewFd(fdId: number) {
    return this.http.post<{ message: string, code: string, data: string }>(`${environment.serverUrl}api/all_fds/delete_fd`, { fdId }).pipe(
      catchError(this.handleError), tap(res => { })
    )
  }

  getAllFds() {
    return this.http.get<FDList>(`${environment.serverUrl}api/all_fds/get_all_fds`).pipe(
      catchError(this.handleError), tap(res => {
      })
    );
  }

}
