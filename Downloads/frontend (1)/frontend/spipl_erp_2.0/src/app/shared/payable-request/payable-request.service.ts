import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class PayableRequestService {

  constructor(private http: HttpClient) { }
  payableRequestList(record_id: number, req_flag: number) {
    return this.http.post<any>(environment.serverUrl + 'api/payables/payableList', {
      record_id: record_id,
      req_flag: req_flag,
    });
  }
  createRequest(formdata: FormData) {
    return this.http.post<any>(environment.serverUrl + 'api/payables/addPayableRequest', formdata);
  }
  updateRequest(formdata: FormData) {
    return this.http.post<any>(environment.serverUrl + 'api/payables/updateRequest', formdata);
  }

 
}
