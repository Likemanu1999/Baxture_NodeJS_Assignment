import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaymentRequestRes } from './payment-request-list/payment-request-res.model';

@Injectable()
export class PayablesServices {
 constructor(private http: HttpClient) {}
/**
* For fetching payment request lists.
*/
 getPayableList(req_date_from?: string,
  req_date_to?: string) {
   return this.http.post<PaymentRequestRes[]>(environment.serverUrl + 'api/payables/payableList', {
    req_date_from: req_date_from,
    req_date_to: req_date_to
   });
 }

 /**
* For fetching Past Payment lists.
*/
past_payment_list(paid_date_from?: string,
  paid_date_to?: string) {
   return this.http.post<PaymentRequestRes[]>(environment.serverUrl + 'api/payables/pastPaymentList', {
    paid_date_from: paid_date_from,
    paid_date_to: paid_date_to
   });
 }


/**
* For update the status of request.
*/
 updateStatus(request_status: number, id: number,
  amount?: number) {
   return this.http.post<any>(environment.serverUrl + 'api/payables/approveRequest', {
    id: id,
    request_status: request_status,
    amount: amount,
   });
 }
/**
* For updating request with SPIPL Bank, Paid Amount.
*/
 updateAll(req_details_arr: any) {
   return this.http.post<any>(environment.serverUrl + 'api/payables/updateSbPaidAmount', {
    req_details_arr: req_details_arr
  });
 }
/**
* For getting list of payment request within date range.
*/
 processPaymentList(req_date_from: any, req_date_to: any) {
   return this.http.post<any>(environment.serverUrl + 'api/payables/processPaymentList', {
    req_date_from: req_date_from,
    req_date_to: req_date_to
  });
 }

/**
* For getting bank details of organization/employee.
*/
 getBankDetails(sub_org_id: any, emp_id: any) {
  return this.http.post<any>(environment.serverUrl + 'api/payables/bankDetailsGroupByRecord', {
   sub_org_id: sub_org_id,
   emp_id: emp_id
 });
}
/**
* For updating process payment details.
*/
updateProcessPayment(formData: FormData) {
 return  this.http.post<any>(environment.serverUrl + 'api/payables/updateProcessPaymentDetails', formData);
}
/**
* For updating UTR No. after payment processed.
*/
updateUtr(formData: FormData) {
 return  this.http.post<any>(environment.serverUrl + 'api/payables/updateUtrNo', formData);
}
}
