import { catchError, retry, tap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { throwError } from 'rxjs';

export interface MainContactPerson {
  cont_id: number;
  sub_org_id: string;
  person_name: string;
  designation_id: string;
  email:string;
  deleted: string;
  org_contact_designations : [],
  org_contact_emails : []
}
export interface MainContactPersonData extends Array<MainContactPerson> {}

@Injectable()
export class MainContactService {
 constructor(private http: HttpClient) {}

 private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
  }
  return throwError('Something bad happened; please try again later.');
}

  addContactPerson(sub_org_id,person_name,designation_id ,email,contact_no,is_default_person) {
    return   this.http.post<any>(
        environment.serverUrl + 'api/organization/addOrgContactPerson',
        {
            sub_org_id: sub_org_id,
            person_name: person_name,
            designation_id: designation_id,
            email: email,
            contact_number: contact_no,
            is_default_person:is_default_person?is_default_person:0

        }
      ).pipe(catchError(this.handleError), tap(resData => {
       
      }));
    }

    updateContactPerson(cont_id:number, sub_org_id: number, person_name: string, designation_id: string ,email:string) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/organization/updateContactPerson',
          {
              sub_org_id: sub_org_id,
              person_name: person_name,
              designation_id: designation_id,
              email: email,
              cont_id:cont_id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
         
        }));
      }

    getOrgContactPerson(sub_org_id: number) {
      return   this.http.post<MainContactPersonData>(
        environment.serverUrl + 'api/organization/getContactPersonAgnOrg',
        {
          sub_org_id: sub_org_id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }

    getOneContactPerson(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/organization/getOneOrgContactPerson',
        {
          cont_id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }


    deleteContactPerson(id: number) {
      return   this.http.post<any>(
        environment.serverUrl + 'api/organization/deleteContactPerson',
        {
          cont_id: id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }
   
  

}
