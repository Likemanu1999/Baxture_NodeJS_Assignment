import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { retry, catchError, tap } from 'rxjs/operators';



export interface ProductMasterData {
  id: number;
  name: string;
  abbr: string;
  desc_goods: string;
  hsn_code: string;
}

export interface ProductMasterDataList extends Array<ProductMasterData> { }

@Injectable()

export class ProductMasterService {

  constructor(private http: HttpClient) { }

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

  addProduct(name: string, abbr: string, desc_goods: string, hsn_code: string) {

    return this.http.post<any>(
      environment.serverUrl + 'api/masters/addProduct',
      {
        name: name,
        abbr: abbr,
        desc_goods: desc_goods,
        hsn_code: hsn_code

      }
    ).pipe(catchError(this.handleError), tap(resData => {
      // 
    }));
  }

  getProducts() {
    return this.http.get<ProductMasterDataList>(
      environment.serverUrl + 'api/masters/getAllProduct'
    )
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }

  getOneProduct(id: number) {
    return this.http.post<ProductMasterDataList>(
      environment.serverUrl + 'api/masters/getOneProduct',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  updateProduct(id: number, name: string, abbr: string, desc_goods: string, hsn_code: string) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/updateProduct',
      {
        id: id,
        name: name,
        abbr: abbr,
        desc_goods: desc_goods,
        hsn_code: hsn_code
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }

  deleteProduct(id: number) {
    return this.http.post<any>(
      environment.serverUrl + 'api/masters/deleteProduct',
      {
        id: id
      }
    ).pipe(catchError(this.handleError), tap(resData => {
    }));
  }
}