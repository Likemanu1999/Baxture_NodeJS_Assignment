import * as CryptoJS from 'crypto-js';

import { BehaviorSubject, Observable, pipe, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, mergeMap, mergeMapTo, tap } from 'rxjs/operators';

import { AngularFireMessaging } from '@angular/fire/messaging';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserDetails } from './UserDetails.model';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class LoginService {
	token: string;
	encryptionKey: string = '0123456789123456'; // Key to encrypt crypto algo.
	encrypted: any = '';
	decrypted: string;
	request: string;


	private currentUserSubject: BehaviorSubject<UserDetails>;
	public currentUser: Observable<UserDetails>;

	constructor(private http: HttpClient, private router: Router, private angularFireMessaging: AngularFireMessaging,) {
		this.currentUserSubject = new BehaviorSubject<UserDetails>(JSON.parse(localStorage.getItem('currentUser')));
		this.currentUser = this.currentUserSubject.asObservable();
	}


	public get currentUserValue(): UserDetails {
		return this.currentUserSubject.value;
	}



	/**
	 * This method (Observable) takes email & password as parameters and send it to server for authentcation and receive response.
	   Check response code if it is not 101 then it calls to saveToken() & storeMenu() and set userDettoken in localstorage.
	 */
	login(email: string, password: string) {
		return this.http.post<any>(environment.serverUrl + 'api/login/staff_login',
			{
				email: email,
				password: password
			}
		).pipe(catchError(this.handleError), tap(resData => {
			if (resData.code !== '101') {
				if (resData.allow_2fa) {
					localStorage.setItem('user_id', resData.user_id);
					localStorage.setItem('role_id', resData.role_id);
					localStorage.setItem('email', resData.email);
					localStorage.setItem('mobile_no', resData.mobile_no);
				} else {
					this.saveToken(resData.token); // Whole token contains menus,links,userdetails
					localStorage.setItem('userDettoken', resData.userDettoken); // For redis authentications for every requests.
					localStorage.setItem('currentUser', JSON.stringify(resData));
					this.currentUserSubject.next(resData);
					this.storeMenu();
				}
			}
		}));
	}

	token_validate(token: string, user_id: string, role_id: string) {
		return this.http.post<any>(environment.serverUrl + 'api/login/token_validate',
			{
				token: token,
				user_id: user_id,
				role_id: role_id
			}
		).pipe(catchError(this.handleError), tap(resData => {
			if (resData.code !== '101') {
				this.saveToken(resData.token); // Whole token contains menus,links,userdetails
				localStorage.setItem('userDettoken', resData.userDettoken); // For redis authentications for every requests.
				localStorage.setItem('currentUser', JSON.stringify(resData));
				this.currentUserSubject.next(resData);
				this.storeMenu();
			}
		}));
	}

	auth_token_expire(user_id: string) {
		return this.http.post<any>(environment.serverUrl + 'api/login/auth_token_expire',
			{
				user_id: user_id
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	auth_token_set(user_id: string, mobile_no: string, email: string) {
		return this.http.post<any>(environment.serverUrl + 'api/login/auth_token_set',
			{
				user_id: user_id,
				mobile_no: mobile_no,
				email: email
			}
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}





	handleError(errorRes: HttpErrorResponse) {
		if (!errorRes.error || !errorRes.error.error) {
			return throwError(errorRes);
		}
		let errorMessage = 'An Unknown error Occured..';
		errorMessage = errorRes.error.error.message;
		return throwError(errorMessage);
	}
	/**
	 *
	 This method takes token as parameters and assign to request global string then call to encryptUsingAES256() for Encryption of token.
	*/
	private saveToken(token: string): void {
		this.request = token.toString();
		this.encryptUsingAES256();
		localStorage.setItem('usertoken', this.encrypted);
		// store encrypted token to local storage
		this.token = token;
	}
	/**
	 *
	 This method takes token from local storage & return by decrypting that using decryptUsingAES256().
	*/
	public getToken(): string {
		if (localStorage.getItem('usertoken')) {
			this.encrypted = localStorage.getItem('usertoken');
			this.decryptUsingAES256();
			return this.decrypted.replace(/\"/g, '');
		}
		return 'false';
	}
	/**
	 *
	 This method return part of payload which contains user related details.
	*/
	public getUserDetails(): UserDetails {
		const token = this.getToken();
		let payload;
		if (token !== 'false') {
			payload = token.split('.')[1];
			payload = window.atob(payload); // JWT Decryption
			return JSON.parse(payload); // Parse Decrypted part
		} else {
			return null;
		}
	}

	public getCompanyProductDetails(): UserDetails {
		const token = this.getToken();
		let payload;
		if (token !== 'false') {
			payload = token.split('.')[1];
			payload = window.atob(payload); // JWT Decryption
			let userData = JSON.parse(payload);
			let companyProductData = userData.userDet[0].company_master;
			return companyProductData; // Parse Decrypted part
		} else {
			return null;
		}
	}

	/**
	 *
	 This method used to check state of user by using expiray time of token with current time.
	*/
	public isLoggedIn(): boolean {
		const user = this.getUserDetails();
		if (user) {
			return user.exp > Date.now() / 1000;
		} else {
			return false;
		}
	}

	/**
	 *
	 This method separate menu from JWT token and store it to local storage.
	*/
	public storeMenu() {
		const token = this.getToken();
		let payload;
		if (token) {
			payload = token.split('.')[1];
			payload = window.atob(payload);
			const jpayload = JSON.parse(payload);
			localStorage.setItem('menu', JSON.stringify(jpayload.menuDet));
			this.tokenRegistartion(jpayload.userDet[0].id)


		} else {
			return null;
		}
	}
	/**
	 *
	 This method clear all data related to user session from local storage & navigate to root URl.
	*/



	deleteToken() {
		this.angularFireMessaging.getToken
			.pipe(mergeMap(token => this.angularFireMessaging.deleteToken(token)))
			.subscribe(
				(token) => { console.log('Token deleted!'); },
			);
	}



	public logout() {
		this.token = '';
		localStorage.clear();
		this.currentUserSubject.next(null);
		this.deleteToken()
		this.router.navigateByUrl('/');
	}

	/**
	 *
	 This method used to encrypt token using encryptionKey.
	*/
	encryptUsingAES256() {
		const _key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
		const _iv = CryptoJS.enc.Utf8.parse(this.encryptionKey);
		const encrypted = CryptoJS.AES.encrypt(
			JSON.stringify(this.request), _key, {
			keySize: 16,
			iv: _iv,
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		});
		this.encrypted = encrypted.toString();
	}
	/**
	 *
	 This method used to decrypt token using encryptionKey.
	*/
	decryptUsingAES256() {
		const _key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
		const _iv = CryptoJS.enc.Utf8.parse(this.encryptionKey);

		this.decrypted = CryptoJS.AES.decrypt(
			this.encrypted, _key, {
			keySize: 16,
			iv: _iv,
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		}).toString(CryptoJS.enc.Utf8);
	}




	tokenRegistartion(staff_id) {
		// this.angularFireMessaging.requestPermission
		// 	.pipe(mergeMapTo(this.angularFireMessaging.tokenChanges))
		// 	.subscribe(
		// 		(token) => {
		// 			let data = {
		// 				staff_data: { fcm_web_token: token },
		// 				staff_member_id: staff_id
		// 			}
		// 			return this.http.post<any>(environment.serverUrl + 'api/hr/staffMember/updateFCMData', data).subscribe(res => {
		// 			})
		// 		},
		// 		(error) => { console.error(error); },
		// 	);

		this.angularFireMessaging.requestPermission.subscribe((permission: any) => {
			this.angularFireMessaging.requestToken.subscribe((token) => {
				let data = {
					staff_data: { fcm_web_token: token },
					staff_member_id: staff_id
				}
				return this.http.post<any>(environment.serverUrl + 'api/hr/staffMember/updateFCMData', data).subscribe(res => {
					// 
				})
			});


		})

	}
}
