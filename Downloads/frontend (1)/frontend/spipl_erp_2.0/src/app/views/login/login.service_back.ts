import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { pipe, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserDetails } from './UserDetails.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  token: string;
  constructor(private http: HttpClient, private router: Router) { }
  login(email: string, password: string) {
    return this.http.post<any>(environment.serverUrl + 'api/login/staff_login',
      {
        email: email,
        password: password
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.saveToken(resData.token);
      this.storeMenu();
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
  private saveToken(token: string): void {
    localStorage.setItem('usertoken', token);
    this.token = token;
  }
  public getToken(): string {
    // if (!this.token) {
    this.token = localStorage.getItem('usertoken');
    // }
    return this.token;
  }
  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }
  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }
  public storeMenu() {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      const jpayload = JSON.parse(payload);
      localStorage.setItem('menu', JSON.stringify(jpayload.menuDet));
    } else {
      return null;
    }
  }
  public logout(): void {
    this.token = '';
    localStorage.clear();
    // window.localStorage.removeItem('usertoken');
    this.router.navigateByUrl('/');
  }
}
