import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PusherService } from '../../service/pusher.service';
import { Interface } from 'readline';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private channel: any;
  private channelHead: any;

  constructor(private http: HttpClient, private pusherService: PusherService) {
    this.channel = this.pusherService.getPusher().subscribe('whatsapp');
    this.channelHead = this.pusherService.getPusher().subscribe('whatsappHead');
  }



  getChatHeads(path, data) {
    return this.http.post<any>(
      environment.serverUrl + path, data).pipe(catchError(this.handleError), tap(resData => {

      }));

  }

  sendBulkWhatsapp(path, data) {


    return this.http.post<any>(
      environment.whatsappUrl + path, data).pipe(catchError(this.handleError), tap(resData => {

      }));

  }

  getChatDetails(path, data): Observable<Interface[]> {

    return this.http.post(environment.serverUrl + path, data).map(res => <Interface[]>res);
    // return this.http.post<any>(
    //           environment.serverUrl + path, data).pipe(catchError(this.handleError), tap(resData => {

    //           }));

  }

  sendMsg(path, data): Observable<Interface[]> {
    return this.http.post(environment.serverUrl + path, data).map(res => <Interface[]>res);
    // return this.http.post<any>(
    //           environment.serverUrl + path, data).pipe(catchError(this.handleError), tap(resData => {

    //           }));

  }
  getChannel() {
    return this.channel;
  }

  getChannelHead() {
    return this.channelHead;
  }



  sendWhatsapp(path, data: Interface): Observable<Interface> {
    return this.http.post(environment.serverUrl + path, data).map(res => <Interface>res);


    // return this.http.post<any>(
    //           environment.serverUrl + path, data).pipe(catchError(this.handleError), tap(resData => {

    //           }));

  }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`, error);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getTemplate(path, data) {


    return this.http.post<any>(
      environment.serverUrl + path, data).pipe(catchError(this.handleError), tap(resData => {

      }));

  }

}
