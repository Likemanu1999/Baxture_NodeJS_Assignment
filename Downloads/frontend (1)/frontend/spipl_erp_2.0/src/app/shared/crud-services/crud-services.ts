import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, tap, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PusherService } from '../../service/pusher.service';
// import { Courier } from '../../interfaces/courier';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/map';
import { Interface } from 'readline';
import { FileNamePipe } from '../file-name/file-name.pipe';

@Injectable()

export class CrudServices {

	private channel: any;

	constructor(
		private http: HttpClient,
		private pusherService: PusherService,
		// private FileNamePipe: FileNamePipe
	) {
		this.channel = this.pusherService.getPusher().subscribe('courier');
	}

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}

	addData<InterfaceName>(url, data) {
		return this.postRequest<InterfaceName>(url, data).pipe(
			timeout(120000)
		);
	}

	updateData<InterfaceName>(url, data) {
		return this.postRequest<InterfaceName>(url, data).pipe(
			timeout(120000)
		);
	}

	deleteData<InterfaceName>(url, data) {
		return this.postRequest<InterfaceName>(url, data).pipe(
			timeout(120000)
		);
	}

	getOne<InterfaceName>(url, data) {
		return this.postRequest<InterfaceName>(url, data).pipe(
			timeout(120000)
		);
	}

	getAll<InterfaceName>(url) {
		return this.getRequest<InterfaceName>(url).pipe(
			timeout(120000)
		);
	}

	getFile<InterfaceName>(url) {
		return this.http.get<InterfaceName>(url).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}

	getRequest<InterfaceName>(url) {
		return this.http.get<InterfaceName>(
			environment.serverUrl + url
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}

	postRequest<InterfaceName>(url, body) {
		return this.http.post<InterfaceName>(environment.serverUrl + url, body
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}

	postTDSTCSRequest<InterfaceName>(url, body) {
		return this.http.post<InterfaceName>('https://erp.sparmarglobal.com/3050/' + url, body
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}
	fileUploadTDSTCS(url, file) {
		return this.http.post<any>('https://erp.sparmarglobal.com/3050/' + url, file
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}

	putRequest<InterfaceName>(url, body) {
		return this.http.put<InterfaceName>(environment.serverUrl + url, body
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}

	fileUpload(url, file) {
		return this.http.post<any>(environment.serverUrl + url, file
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}


	chkExists(url, body) {
		return this.http.post<any>(environment.serverUrl + url, body
		).pipe(
			timeout(120000),
			retry(3),
			catchError(this.handleError)
		);
	}

	/* REAL TIME */

	getChannel() {
		return this.channel;
	}

	list(): Observable<Interface[]> {
		return this.http.get(environment.serverUrl + "api/masters/courier/getAll").map(res => <Interface[]>res);
	}

	create(param: Interface): Observable<Interface> {
		return this.http.post(environment.serverUrl + "api/masters/courier/add", param).map(res => <Interface>res);
	}

	delete(param: Interface): Observable<Interface> {
		return this.http.delete(environment.serverUrl + "api/masters/courier/delete/" + param['id']).mapTo(param);
	}

	downloadMultipleFiles(files) {
		if (files.length > 1) {
			files.forEach(async element => {
				this.download(element).subscribe(blob => {
					const a = document.createElement('a');
					const objectUrl = URL.createObjectURL(blob);
					a.href = objectUrl;
					a.download = new FileNamePipe().transform(element);
					a.click();
					URL.revokeObjectURL(objectUrl);
				});
			});
		} else {
			if (files.length > 0) {
				window.open(files[0]);
			}
		}
	}

	download(url: string): Observable<Blob> {
		return this.http.get(url, {
			responseType: 'blob'
		})
	}

}
