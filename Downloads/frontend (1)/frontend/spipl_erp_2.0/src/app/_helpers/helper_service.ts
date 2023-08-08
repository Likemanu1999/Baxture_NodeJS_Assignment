import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// import { AuthenticationService } from '../_services';

@Injectable({ providedIn: 'root' })


export  class HelperService {

    /* We inject the service helper */
    constructor(private http: HttpClient) {

      
    }
  
    deleteDoc(arr, doc, name , where ,path ) {
	
			const index = arr.indexOf(doc);
			let data = {};
	
			if (index > -1) {
				arr.splice(index, 1);
			}
			data[name] = JSON.stringify(arr);
			for(let key in where) {
				data[key] = where[key];
			}
			
			return this.http.post<any>(
                environment.serverUrl + path, data).pipe(catchError(this.handleError), tap(resData => {
    
                }));
	
	}

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}
    
   
}