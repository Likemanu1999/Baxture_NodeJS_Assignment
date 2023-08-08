import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Subject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class TemplateService {
	constructor(private http: HttpClient) { }

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

	getTemplate() {
		return this.http.get<any>(
			environment.serverUrl + 'api/masters/getAllEmailTemplate'
		)
			.pipe(
				retry(3), // retry a failed request up to 3 times
				catchError(this.handleError) // then handle the error
			);
	}

	getOneTemplate(id) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/emailTemplate/getOne',
			{
				id: id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	updateTemplate(id: number, html: string, template_name: string, subject: string, from: string, keys: string) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/updateEmailTemplate',
			{
				id: id,
				html: html,
				template_name: template_name,
				subject: subject,
				from: from,
				keys: keys

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	addTemplate(name: string, html: string, subject: string, from: string, keys: string) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/addEmailTemplate',
			{
				template_name: name,
				html: html,
				subject: subject,
				from: from,
				keys: keys

			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

}
