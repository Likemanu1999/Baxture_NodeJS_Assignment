import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { State } from './state';
import { City } from './city';
import { Currency } from './currency';
import { Packing } from './packing';
import { Pi_insurance } from './pi_insurance';
import { Unit } from './unit';
import { DeliveryTerm } from './delivery_term';

@Injectable()
export class SelectService {
  constructor(private http: HttpClient) {}

  getcountry() {
    return   this.http.get<State>(
      environment.serverUrl + 'api/masters/countries/getCountries',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getStates() {
    return   this.http.get<State>(
      environment.serverUrl + 'api/masters/states/getAllStates',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getStateOnCountry(country_id: number) {
    return   this.http.post<City>(
     environment.serverUrl + 'api/masters/states/getStates',
      {
        country_id: country_id
      },
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getCurrency() {
    return this.http.get<Currency>(
      environment.serverUrl + 'api/masters/currencyMaster/getAll',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getCity(state_id: number) {
    return   this.http.post<City>(
     environment.serverUrl + 'api/masters/cities/getCities',
      {
        state_id: state_id
      },
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getPacking() {
    return this.http.get<Packing>(
      environment.serverUrl + 'api/masters/getAllMaterialPack',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getUnit() {
    return this.http.get<Unit>(
      environment.serverUrl + 'api/masters/unitDrumMt/getAll',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getPiInsurance() {
    return this.http.get<Pi_insurance>(
      environment.serverUrl + 'api/masters/getPiInsurance',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getDeliveryTerm() {
    return this.http.get<DeliveryTerm>(
      environment.serverUrl + 'api/masters/getDeliveryTerm',
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
