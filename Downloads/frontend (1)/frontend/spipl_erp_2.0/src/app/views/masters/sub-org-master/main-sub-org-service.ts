import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface SubOrgDetails {
  unit_type: string;
  sub_org_name: string;
  org_address: string;
  gst_no: string;
  addedBy: string;
  added_date: string;
}
export interface SubOrgList extends Array<SubOrgDetails> {}

@Injectable()
export class MainSubOrgService {
  constructor(private http: HttpClient) {}

  getSuborgAgstMain(org_id: number) {
    return   this.http.post<SubOrgList>(
      environment.serverUrl + 'api/organization/get_suborg_agst_main',
      {
        org_id: org_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getSubOrg() {
    return   this.http.get<SubOrgList>(
      environment.serverUrl + 'api/organization/getSubOrgList',
      {

      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getForeignSupplier() {
    return   this.http.get<SubOrgList>(
      environment.serverUrl + 'api/organization/foreignSupplier/getAll',
      {

      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getAllForeignLCSupplier() {
    return   this.http.get<SubOrgList>(
      environment.serverUrl + 'api/organization/foreignSupplier/getAll',
      {

      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  getSupplier() {
    return   this.http.get<SubOrgList>(
      environment.serverUrl + 'api/organization/getAllSupplier',
      {

      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }


  getOneSubOrg(sub_org_id: number) {
    return   this.http.post<SubOrgList>(
      environment.serverUrl + 'api/organization/getOneSubOrganization',
      {
        sub_org_id: sub_org_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }


  getSupplierToZOne(zone_id: number) {
    return   this.http.post<SubOrgList>(
      environment.serverUrl + 'api/organization/getSupplierOfPurchaseAccHolder',
      {
        zone_id: zone_id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  addSubOrgMain(formData: any) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/organization/addSubOrg', formData).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    updateSubOrgMain(formData: any) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/organization/updateSubOrganization', formData).pipe(catchError(this.handleError), tap(resData => {

        }));
      }


    deleteSubOrg(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/organization/deleteSubOrganization',
        {
          sub_org_id: id
        }
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



