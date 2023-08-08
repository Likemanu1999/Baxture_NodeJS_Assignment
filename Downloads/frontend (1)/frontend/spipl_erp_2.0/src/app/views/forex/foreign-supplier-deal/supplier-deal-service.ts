import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface SupplierSalesDealData {
	id: Number;
	sub_org_name: string;
	deal_dt: string;
	deal_quantity: string;
	deal_rate: string;
	indent_quantity: string;
	shipment_month: string;
	shipment_year: string;
	deal_docs: string;
	addedBy: string;
	added_date: string;
}
export interface SupplierSalesDealList extends Array<SupplierSalesDealData> { }

@Injectable()
export class SupplierDealService {
	constructor(private http: HttpClient) { }


	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}


	addSupplierSalesDeal(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/addFsDeal', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}

  uploadFile(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/file/upload', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}

	getFsDeal() {
		return this.http.get<SupplierSalesDealList>(
			environment.serverUrl + 'api/forex/getAllFsDealDetails',
			{

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	getOneFsDeal(id: number) {
		return this.http.post<SupplierSalesDealList>(
			environment.serverUrl + 'api/forex/getOneFsDeal',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	updateSupplierSalesDeal(formData: FormData) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/updateFsDeal', formData).pipe(catchError(this.handleError), tap(resData => {

			}));
	}

	deleteFsDeal(id: number) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/deleteFsDeal',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}


	getDistinctSupplier() {
		return this.http.get<SupplierSalesDealList>(
			environment.serverUrl + 'api/forex/getDistinctSupplier',
			{

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	getDealOneSupplier(id: number) {
		return this.http.post<any>(
			environment.serverUrl + 'api/forex/getAllDealOneSupplier',
			{
				sub_org_id: id,

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}



}
