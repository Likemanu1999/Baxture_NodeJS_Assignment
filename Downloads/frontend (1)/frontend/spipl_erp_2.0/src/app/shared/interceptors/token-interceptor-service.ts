import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { LoginService } from '../../views/login/login.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
	// We inject a LoginService
	urlsToNotUse: Array<string>;
	constructor(private loginService: LoginService) {
		this.urlsToNotUse = [
			'https://fcm.googleapis.com/fcm/send',
			'https://erp.sparmarglobal.com/3050/api/tdsForm/tds_add',

		];
	}
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// We retrieve the token, if any
		if (!this.loginService.isLoggedIn()) {
			// this.loginService.logout();
			// return next.handle(req);
		}

		if (this.isValidRequestForInterceptor(req.url)) {
			// const token = this.loginService.getToken();
			const token = localStorage.getItem('userDettoken');
			let newHeaders = req.headers;
			if (token) {
				// If we have a token, we append it to our new headers
				newHeaders = newHeaders.append('webtoken', token);
			}
			// Finally we have to clone our request with our new headers
			// This is required because HttpRequests are immutable
			const authReq = req.clone({ headers: newHeaders });
			// Then we return an Observable that will run the request
			// or pass it to the next interceptor if any
			return next.handle(authReq) // This Pipe is used for getting all responses
				.pipe(
					tap(event => {
						if (event instanceof HttpResponse) {

							if (event.body.code === '201') {

								this.loginService.logout();
							}

							// http response status code
						}
					}, error => {
						// http response status code
						console.error(error.status);
						console.error(error.message);
					})
				);
		}
		return next.handle(req);
	}



	private isValidRequestForInterceptor(requestUrl: string): boolean {
		for (let address of this.urlsToNotUse) {
			if (new RegExp(address).test(requestUrl)) {
				return false;
			}
		}
		return true;
	}



}
