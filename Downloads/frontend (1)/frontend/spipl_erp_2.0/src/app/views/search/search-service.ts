import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { City } from '../../shared/dropdown-services/city';
export interface SearchResult {
  person_name: string;
  email: string;
  contact_no: string;
  sub_org_id: string;
  sub_org_name: string;
}
export interface SearchResultList extends Array<SearchResult> { }


export interface DetailSearchResult {
  OrgnisationDetails: {
    sub_org_id: number,
    sub_org_name: string,
    org_address: string,
    location_vilage: string,
    pin_code: string,
    pan_no: string,
    iec: string,
    gst_no: string,
    product_id: number,
    category_id: number,
    unitName: string,
    countryName: string,
    stateName: string,
    cityName: string,
    salesHolderName: string,
    purchaseHolder: string,
    categories: string,
    products: string
  };
  ContactPersonDetails: {
    cont_id: number,
    sub_org_name: string,
    profile_name: string,
    person_name: string,
    email: string,
    contNumber: string
  };
  BulkEmail: {
    email: string,
  };

  BulkNumber: {
    contactno: string,
  };
}

export interface DetailSearchResultList extends Array<DetailSearchResult> { }


@Injectable()
export class SearchService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getData(search_str) {
    return this.http.post<SearchResultList>(
      environment.serverUrl + 'api/search/contact',
      {
        search_str: search_str
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }
  detailSearch(formData: FormData) {
    return this.http.post<DetailSearchResultList>(
      environment.serverUrl + 'api/search/detail_search', formData).pipe(catchError(this.handleError), tap(resData => {
        // 
      }));
  }
  getCity(state_id: string) {
    return this.http.post<City>(
      environment.serverUrl + 'api/masters/getCityFromState',
      {
        state_id: state_id
      },
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
}
