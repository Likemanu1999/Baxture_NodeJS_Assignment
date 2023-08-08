import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface RoleData {
	id: number;
	role_name: string;
	added_date: string;
	deleted: string;
}
export interface RoleTableData extends Array<RoleData> { }

@Injectable()
export class RoleMasterDtService {
	dataUrl = 'assets/data.json';

	constructor(private http: HttpClient) { }

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

	getData() {
		// return this.crudServices
		// 	 this.crudServices
		// .addData<any>(StockTransfer.add, formData)
		return this.http.get<RoleTableData>(
			environment.serverUrl + 'api/masters/getAllRole'
		)
			.pipe(
				retry(3), // retry a failed request up to 3 times
				catchError(this.handleError) // then handle the error
			);
	}

	addRole(role_name: string) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/add_role',
			{
				role_name: role_name
			}
		).pipe(catchError(this.handleError), tap(resData => {
			// 
		}));
	}
	getOneRole(id: number) {
		return this.http.post<RoleTableData>(
			environment.serverUrl + 'api/masters/get_one_role',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}
	updateRole(id: number, role_name: string) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/update_role',
			{
				id: id,
				role_name: role_name
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}
	deleteRole(id: number) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/delete_role',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

}
