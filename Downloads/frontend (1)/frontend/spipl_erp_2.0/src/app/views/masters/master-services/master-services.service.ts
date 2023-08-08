import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, tap, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { throwError } from 'rxjs';
import { Courier } from '../interfaces/courier';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import { PusherService } from '../../../service/pusher.service';

@Injectable({
	providedIn: 'root'
})

export class MasterServicesService {

	private channel: any;

	constructor(private http: HttpClient, private pusherService: PusherService) {
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

	getChannel() {
		return this.channel;
	}

	list(): Observable<Courier[]> {
		return this.http.get(environment.serverUrl + "api/masters/courier/getAll").map(res => <Courier[]>res);
	}

	create(param: Courier): Observable<Courier> {
		return this.http.post(environment.serverUrl + "api/masters/courier/add", param).map(res => <Courier>res);
	}

	delete(param: Courier): Observable<Courier> {
		return this.http.delete(environment.serverUrl + "api/masters/courier/delete/" + param.id).mapTo(param);
	}
}
