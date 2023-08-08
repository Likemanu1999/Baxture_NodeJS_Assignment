import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface OrgContactNumber {
  id: number;
  cont_id: number;
  contact_number: string;
  dispatch_sms: number;
  reminder_sms: number;
  whatsapp_flag: number;
  event_sms: number;

}
export interface OrgContactNumberData extends Array<OrgContactNumber> {}

@Injectable()
export class OrgContactNumberService {
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

  
  addContactNumber(cont_id: number, contact_number: string, sales_order_sms: number , dispatch_sms: number, reminder_sms: number, whatsapp_flag: number, event_sms: number ,finance: number ,logistics: number ,sales: number , sub_org_id: number , country_code : string , area_code : string) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/organization/addContactNum',
        {
            cont_id: cont_id,
            contact_no: contact_number,
            sales_order_sms: sales_order_sms,
            dispatch_sms: dispatch_sms,
            reminder_sms: reminder_sms,
            whatsapp_flag: whatsapp_flag,
            event_sms: event_sms,
            finance:finance,
            logistics:logistics,
            sales:sales,
            country_code : country_code,
            area_code : area_code,
            sub_org_id:sub_org_id

        }
      ).pipe(catchError(this.handleError), tap(resData => {

      }));
    }

 
    updateContactNumber(id: number, cont_id: number, contact_number: string, sales_order_sms: number , dispatch_sms: number, reminder_sms: number, whatsapp_flag: number, event_sms: number,finance: number, logistics: number,sales: number,sub_org_id:number,country_code : string , area_code : string) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/organization/updateOrgContactNum',
          {
            cont_id: cont_id,
            contact_no: contact_number,
            sales_order_sms: sales_order_sms,
            dispatch_sms: dispatch_sms,
            reminder_sms: reminder_sms,
            whatsapp_flag: whatsapp_flag,
            event_sms: event_sms,
            finance:finance,
            logistics:logistics,
            sales:sales,
            sub_org_id:sub_org_id,
            country_code : country_code,
            area_code : area_code,
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {

        }));
      }


      addEmail(cont_id: number, email_id: string, finance: number ,logistics: number ,sales: number , sub_org_id: number) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/organization/add_org_mail',
            {
                cont_id: cont_id,
                email_id: email_id,
                finance:finance,
                logistics:logistics,
                sales:sales,
                sub_org_id:sub_org_id
    
            }
          ).pipe(catchError(this.handleError), tap(resData => {
    
          }));
        }


        updateEamil(id: number, cont_id: number, email_id: string, finance: number, logistics: number,sales: number,sub_org_id:number) {
          return   this.http.post<any>(
              environment.serverUrl + 'api/organization/update_org_mail',
              {
                cont_id: cont_id,
                email_id: email_id,
                finance:finance,
                logistics:logistics,
                sales:sales,
                sub_org_id:sub_org_id,
                id: id
              }
            ).pipe(catchError(this.handleError), tap(resData => {
    
            }));
          }
        


    getOrgContactNumber(cont_id: number) {
      return   this.http.post<OrgContactNumberData>(
        environment.serverUrl + 'api/organization/getPerOrgContactNum',
        {
          cont_id: cont_id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getOneContactNumber(id: number) {
      return   this.http.post<OrgContactNumberData>(
        environment.serverUrl + 'api/organization/getOneOrgContactNum',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getOneEmailid(id: number) {
      return   this.http.post<OrgContactNumberData>(
        environment.serverUrl + 'api/organization/get_email_id',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getOneContAllMailId(cont_id: number) {
      return   this.http.post<OrgContactNumberData>(
        environment.serverUrl + 'api/organization/get_all_mail_one_cont',
        {
          cont_id: cont_id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    deleteContactNumber(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/organization/deleteOrgContactNum',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    deleteEmail(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/organization/delete_email_id',
        {
          id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }



}
