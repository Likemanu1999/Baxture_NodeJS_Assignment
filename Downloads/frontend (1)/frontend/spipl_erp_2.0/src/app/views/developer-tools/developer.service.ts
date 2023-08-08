import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MenuList } from './menu-master/menu.model';
import { LinkList } from './link-master/link.model';

@Injectable()
export class DeveloperServices {
 constructor(private http: HttpClient) {}

 private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
  }
  return throwError('Something bad happened; please try again later.');
}

    /* API CALLS FOR PERMISSION */
   getPermission(role_id: number) {
      return   this.http.post(
        environment.serverUrl + 'api/masters/permission/getAll',
        {
          role_id: role_id
        }
      ).pipe(catchError(this.handleError), tap(resData => {
      }));
    }
    signle_check_update(role_id: number, p_id: number,
      type: string, create_op: string, view_op: string, update_op: string, del_op: string) {
      return   this.http.post<any>(
          environment.serverUrl + 'api/permission/signle_check_update',
          {
            role_id: role_id,
            p_id: p_id,
            create_op: create_op,
            view_op: view_op,
            update_op: update_op,
            delete_op: del_op,
          }
        // JSON.stringify('{"role_id": ' + role_id + ',"p_id":' + p_id + ',"' + type + '": ' + flag + '}')
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      signle_check_link_update(role_id: number, link_id: number,
        access: string) {
      return this.http.post<any>(
          environment.serverUrl + 'api/permission/signle_check_link_update',
          {
            role_id: role_id,
            link_id: link_id,
            access: access
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      all_check_update(role_id: number, check: string) {
      return this.http.post<any>(
          environment.serverUrl + 'api/permission/all_check_update',
          {
            role_id: role_id,
            check: check
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      /* API CALLS FOR MENU MASTER */
      getAllMenu() {
        return this.http.get<Array<MenuList>>(
          environment.serverUrl + 'api/masters/menu/getAll'
        )
          .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.handleError) // then handle the error
          );
      }
      addMenu(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/masters/menu/add', formData).pipe(catchError(this.handleError), tap(resData => {
            // const userdata = resData.data;
          }));
      }
      updateMenu(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/masters/menu/update', formData).pipe(catchError(this.handleError), tap(resData => {
            // const userdata = resData.data;
          }));
      }
      getOneMenu(id: number) {
        return   this.http.post<MenuList>(
          environment.serverUrl + 'api/masters/menu/getOne',
          {
            p_id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      deleteMenu(id: number) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/masters/menu/delete',
          {
            p_id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      /* API CALLS FOR LINK MASTER */
      getAllLink() {
        return this.http.get<Array<LinkList>>(
          environment.serverUrl + 'api/link_master/get_all_link'
        )
          .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.handleError) // then handle the error
          );
      }
      addLink(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/link_master/add_link', formData).pipe(catchError(this.handleError), tap(resData => {
            // const userdata = resData.data;
          }));
      }
      updateLink(formData: FormData) {
        return   this.http.post<any>(
            environment.serverUrl + 'api/link_master/update_link', formData).pipe(catchError(this.handleError), tap(resData => {
            // const userdata = resData.data;
          }));
      }
      getOneLink(id: number) {
        return   this.http.post<LinkList>(
          environment.serverUrl + 'api/link_master/get_one_link',
          {
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }
      deleteLink(id: number) {
        return   this.http.post<any>(
          environment.serverUrl + 'api/link_master/delete_link',
          {
            id: id
          }
        ).pipe(catchError(this.handleError), tap(resData => {
        }));
      }

}
