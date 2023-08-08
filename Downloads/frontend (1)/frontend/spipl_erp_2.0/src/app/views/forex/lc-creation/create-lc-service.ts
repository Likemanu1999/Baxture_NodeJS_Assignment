import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface CreateLcData {
	id: number;
	payment_term_id: number;
	lc_date: string;
	date_of_shipment: string;
	lc_expiry_date: string;
	transhipment: string;
	partial_shipment: string;
	confirmation: string;
	available_with_by: string;
	annexe_6_date: string;
	annexe_7_date: string;
	bl_description: string;
	tolerance: string;
	suppiler_id: number;
	spipl_bank_id: number;
	lc_created_by: number;
	lc_created_date: string;
	payment_term: string;
	suppier_name: string;
	bank_name: number;
}
export interface CreateLcList extends Array<CreateLcData> { }

@Injectable()
export class CreateLcService {
	constructor(private http: HttpClient) { }

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

	addlc(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/createLc', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}

	updateLc(formData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/UpdateLcApplication', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}



	getLcList(formData: FormData) {

		return this.http.post<any>(
			environment.serverUrl + 'api/forex/getLcList', formData).pipe(catchError(this.handleError), tap(resData => {

			}));

	}

	getOneLcInDetail(id: number) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/oneLcAllPiNonDetails',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	deleteLc(id: number, pi_arr) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/deleteLc',
			{
				lc_id: id,
				pi_arr: pi_arr
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	resetPiList(lc_id, spipl_bank_id, suppiler_id) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/resetPiAvailPiList',
			{
				supplier_id: suppiler_id,
				lc_id: lc_id,
				spipl_bank_id: spipl_bank_id

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	updateLcPiList(lc_id, pi_arr) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/resetLcPi',
			{
				lc_id: lc_id,
				pi_arr: pi_arr

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	lcOpen(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/lcOpen', formData).pipe(catchError(this.handleError), tap(resData => {
			}));
	}

	lcAmmend(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/lcAmmend', formData).pipe(catchError(this.handleError), tap(resData => {
			}));
	}

	lcInsurance(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/lcInsurance', formData).pipe(catchError(this.handleError), tap(resData => {
			}));
	}

	lcCancel(formData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/lcCancel', formData).pipe(catchError(this.handleError), tap(resData => {
			}));
	}

	discardLc(lc_id) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/discardLcOpen',
			{
				lc_id: lc_id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	adjustTolerence(lc_id) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/adjustTolerance',
			{
				lc_id: lc_id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));

	}

	tolerenceReset(lc_id) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/toleranceReset',
			{
				lc_id: lc_id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));

	}
}
