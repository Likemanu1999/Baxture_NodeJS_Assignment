import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface OrgBankList {
  bank_id: number;
  bank_name: string;
  bank_address: string;
  account_number: string;
  account_name: string;
  branch_name: string;
  swift_code: string;
  ifsc_code: string;
}
export interface OrgBankData extends Array<OrgBankList> {}

@Injectable()
export class OrgBankService {
 constructor(private http: HttpClient) {}



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

  addOrgBank(sub_org_id: number, bank_name: string, bank_address: string , account_no: string, account_name: string, ifsc_code: string, swift_code: string, branch_name: string) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/organization/addOrgBank',
        {
            sub_org_id: sub_org_id,
            bank_name: bank_name,
            bank_address: bank_address,
            account_no: account_no,
            account_name: account_name,
            ifsc_code: ifsc_code,
            swift_code: swift_code,
            branch_name: branch_name

        }
      ).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

    updateOrgBank(bank_id: number, sub_org_id: number, bank_name: string, bank_address: string , account_no: string, account_name: string, ifsc_code: string, swift_code: string, branch_name: string) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/organization/updateOrgBank',
          {
            bank_id: bank_id,
            sub_org_id: sub_org_id,
            bank_name: bank_name,
            bank_address: bank_address,
            account_no: account_no,
            account_name: account_name,
            ifsc_code: ifsc_code,
            swift_code: swift_code,
            branch_name: branch_name
          }
        ).pipe(catchError(this.handleError), tap(resData => {

        }));
      }



    getOrgBank(sub_org_id: number) {
      return   this.http.post<OrgBankData>(
        environment.serverUrl + 'api/organization/getPerticularOrgBank',
        {
          sub_org_id: sub_org_id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getallOrgBank() {
      return   this.http.get<OrgBankData>(
        environment.serverUrl + 'api/organization/getAllOrgBank',
        {

        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getOneOrgBank(id: number) {
      return   this.http.post<OrgBankData>(
        environment.serverUrl + 'api/organization/getOneOrgBank',
        {
          bank_id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getBankRelatedToMain(id: number) {
      return   this.http.post<OrgBankData>(
        environment.serverUrl + 'api/organization/getBankRelatedToMain',
        {
          org_id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }



    deleteOrgBank(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/organization/deleteOrgBank',
        {
          bank_id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }



}
