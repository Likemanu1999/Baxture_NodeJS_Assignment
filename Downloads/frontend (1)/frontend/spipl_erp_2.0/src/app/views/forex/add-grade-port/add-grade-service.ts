import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AddGradeData {
	id: String;
	ga_quantity: Number;
	grade_name: String;
	port_name: String;
	fs_deal_id: Number;
	ga_rate: Number;
	remark: String;
	grade_id: String;
	destination_port_id: String;
	added_by: Number;

}

export interface AddGradeList extends Array<AddGradeData> { }

@Injectable()
export class AddGradeService {
	constructor(private http: HttpClient) { }


	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

	addGradeAssortment(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/addGradeAssortment', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}

	updateGradeAssortment(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/updateGa', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}
	getGaAgainstOneFs(id: number) {
		return this.http.post<AddGradeList>(
			environment.serverUrl + 'api/forex/getGaAgainstOneFs',
			{
				fs_deal_id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	getGa(id: number) {
		return this.http.post<AddGradeList>(
			environment.serverUrl + 'api/forex/getOneGa',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	get_ga_sales_report(from_date,to_date) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/getGaSalesReport',
			{
				from_date:from_date,
				to_date:to_date
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	deleteGa(id: number) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/deleteGa',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	getSupplierDetail(id: number) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/getSupplierDetail',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));

	}

}
