import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, PipeTransform, ViewChild, ViewEncapsulation } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { Table } from 'primeng/table';
import { MessagingService } from '../../../service/messaging.service';
import { Notifications, NotificationsNameMaster, NotificationsUserRel, Payables, UsersNotification } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { PaymentRequestRes } from './payment-request-res.model';

@Component({
  selector: 'app-payment-request',
  templateUrl: './payment-request-list.component.html',
  styleUrls: ['./payment-request-list.component.scss'],
  providers: [ToasterService, ConfirmationService, InrCurrencyPipe, DatePipe, CrudServices, MessagingService],
  encapsulation: ViewEncapsulation.None,
})
/**
 * Showing all payment requests for approval.
 */
export class PaymentRequestListComponent implements OnInit {
  /**
  * To store request list using this array of type PaymentRequestRes.
  */
  paymentReqList: PaymentRequestRes[];
  /**
  * Making copy of request list into beforeFilterList.
  */
  beforeFilterList: PaymentRequestRes[];
  /**
  * For showing loading spinner.
  */
  isLoading: boolean = true;
  cols: { field: string; header: string; width: string; }[];
  @ViewChild('dt', { static: false }) table: Table;


  @ViewChild("myModal", { static: false })
  public myModal: ModalDirective;
  /**
  * Configuring toaster.
  */
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  req_amount: number;
  bsRangeValue: any = [];
  user: UserDetails;
  links: string[] = [];

  notification_details: any;
  notification_tokens = [];
  notification_id_users = []
  notification_users = [];

  lookup = {};
  supplier_list = [];

  message: any;
  notification_id: any;
  /**
  * These are requests status used for filter dropdown.
  */
  statusOptions = [{
    id: 0,
    status: 'Pending'
  },
  {
    id: 1,
    status: 'Approved'
  },
  {
    id: 2,
    status: 'Rejected'
  }];
  /**
  * used for binding to the filter dropdown.
  */
  currentStatus: any;
  /**
  * For Approval/Rejection of request user will click on pending status then we are setting that object to this variable.
  */
  selectedItemForStatus: PaymentRequestRes;
  /**
  * used for hide/show request verification popup.
  */
  displayPop: boolean = false;
  /**
  * used for showing total of requested in footer.
  */
  totalAmount: number = 0;
  complete_list: boolean;

  request_name: string;
  req_flag: number;
  approve: boolean;
  company_id: number;
  company: { label: string; id: number; }[];
  filteredValuess = [];
  request_by = [];
  lookupRequest = {};
  local_purchase_req_list: boolean;

  constructor(
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService,
    private currenyPipeInr: InrCurrencyPipe,
    private loginService: LoginService,
    private datePipe: DatePipe, private crudServices: CrudServices, private messagingService: MessagingService) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.complete_list = (this.links.indexOf('Request Complete List') > -1);
    this.approve = (this.links.indexOf('Payment Approve') > -1);
    this.local_purchase_req_list = (this.links.indexOf('Local Request Complete List') > -1);



    this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }, { label: 'SURISHA', id: 3 }];


    this.company_id = this.user.userDet[0].company_id;



    this.cols = [
      { field: 'id', header: 'Req.No.', width: '100px' },
      { field: 'org_emp_name', header: 'Beneficiary', width: '200px' },
      { field: 'category', header: 'Category.', width: '200px' },
      { field: 'req_amount', header: 'Amount', width: '200px' },
      { field: 'invoice_no', header: 'Invoice No.', width: '200px' },
      { field: 'record_id', header: 'Reference ID', width: '200px' },
      { field: 'utr_no', header: 'UTR No.', width: '200px' },
      { field: 'added_date', header: 'Added Date', width: '200px' },
      { field: 'added_by_name', header: 'Request By', width: '200px' },
      { field: 'approved_date', header: 'Approve Date', width: '200px' },
      { field: 'advanced_agnst_bill', header: 'Payment Type', width: '200px' },
      { field: 'normal_priority', header: 'Priority', width: '200px' },
      { field: 'approved_by_name', header: 'Approve By', width: '200px' },
      { field: 'remark', header: 'Remark', width: '200px' },
      { field: 'request_status', header: 'Status', width: '200px' },
    ];
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.bsRangeValue = [new Date(today), new Date(today)];
  }

  ngOnInit() {

  }
  getRequestText(val) {
    if (val === 1) {
      return 'Advanced';
    } else if (val === 2) {
      return 'Against Bill';
    }
  }
  getPriorityText(val) {
    if (val === 1) {
      return 'Normal';
    } else if (val === 2) {
      return 'High';
    }
  }
  /**
  * For Approval/Rejection of request user will click on pending status then this method gets executed & shows popup for verification of request & user can change requested amount too.
  * On accept we are calling updateStatus() with required parameters.
  * Here we are using primeng confirm dialog.
  */
  confirm(item: PaymentRequestRes) {
    this.displayPop = true;
    this.selectedItemForStatus = item;
    const msg = '<strong>Beneficiary Name</strong> :' + item.org_emp_name + ' | <strong>Req. Amount :</strong>' + this.currenyPipeInr.transform(item.req_amount) + '|  <br><strong>Category : </strong>' + item.category;
    this.req_amount = item.req_amount;

    this.getNotificationName(item.req_flag);

    this.confirmationService.confirm({
      message: msg,
      header: 'Verify Request Details',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (item.req_flag == 1) {
          if (this.req_amount <= item.req_amount) {
            this.updateStatus(1, item.id, item, this.req_amount);
          } else {
            this.toasterService.pop('warning', 'warning', 'Amount Exeeded')
          }
        } else {
          this.updateStatus(1, item.id, item, this.req_amount);
        }

      },
    });



  }
  /**
  * On reject this methods gets executed and update the status of request by passing parameters to  updateStatus() & hide the popup.
  */
  onReject() {
    this.updateStatus(2, this.selectedItemForStatus.id, this.selectedItemForStatus, this.req_amount);
    this.displayPop = false;
  }
  /**
  * We are calling service method to update request status.
  */
  updateStatus(request_status: number, id: number, item: PaymentRequestRes, amount?: number) {
    this.crudServices.updateData<any>(Payables.request_approve, {
      id: id, request_status: request_status,
      amount: amount,
      record_id: item.record_id,
      req_flag: item.req_flag
    }).subscribe((response) => {
      if (response.code === '100') {
        const index = this.paymentReqList.indexOf(item);
        if (request_status === 1) {
          item.req_amount = amount;
        }
        item.request_status = request_status;

        if (item.fcm_web_token != null) {
          this.notification_tokens.push(item.fcm_web_token);
          this.notification_users.push(item.addby_id);
        }
        this.generateNotification(item);
        this.paymentReqList.splice(index, 1, item);

      }
      this.toasterService.pop(response.message, response.message, response.data);
    });
  }
  /**
  * We are fetching data through service method to display.
  */
  onRefresh(req_date_from?: string, req_date_to?: string) {
    this.isLoading = true;
    let listType = 0;

    if (this.complete_list == false && this.local_purchase_req_list == true) {
      listType = 2;
    } else if (this.complete_list == true && this.local_purchase_req_list == true) {
      listType = 0;
    } else if (this.complete_list == false && this.local_purchase_req_list == false) {
      listType = 1;
    } else {
      listType = 0;
    }



    this.crudServices.getOne<any>(Payables.payable_list, {
      req_date_from: req_date_from,
      req_date_to: req_date_to,
      listType: listType,
      company_id: this.company_id
    }).subscribe((response) => {


      this.paymentReqList = response;
      this.filteredValuess = response;
      this.beforeFilterList = response;
      this.totalAmount = this.beforeFilterList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
      this.isLoading = false;

      this.setFilter(response)
    });
  }



  setFilter(data) {

    for (let val of data) {
      const name = val.org_emp_name;
      const requestby = val.added_by_name;
      if (!(name in this.lookup)) {
        this.lookup[name] = 1;
        this.supplier_list.push({ 'org_emp_name': name });
      }

      if (!(requestby in this.lookupRequest)) {
        this.lookupRequest[requestby] = 1;
        this.request_by.push({ 'added_by_name': requestby });
      }
    }

  }
  /**
  * On refresh button click this methods gets executed.
  */
  onDataRefresh() {
    const fromdate = this.datePipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
    const todate = this.datePipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
    this.onRefresh(fromdate, todate);
  }
  /**
  * On date filter change this methods gets executed.
  */
  onchange() {
    if (this.bsRangeValue[0]) {
      const fromdate = this.datePipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
      const todate = this.datePipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
      this.onRefresh(fromdate, todate);
    }
  }
  /**
  * On status filter change this methods gets executed.
  * Filter the array of json object using filter() with selected status which is currentStatus.
  */
  statusFilter() {
    if (this.currentStatus !== null) {
      if (this.currentStatus == 0) {
        this.paymentReqList = this.beforeFilterList.filter(_data => _data.request_status === 0 || _data.request_status === null);
      } else {
        this.paymentReqList = this.beforeFilterList.filter(_data => _data.request_status === this.currentStatus);
      }

    } else {
      this.paymentReqList = this.beforeFilterList;
    }
    this.totalAmount = this.paymentReqList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
  }

  getNotificationName(flag) {
    let name = '';
    if (flag == 1) {
      name = "LOCAL_PAYMENT_APPROVED";
      this.request_name = "Local Purchase";
    }

    else if (flag == 6) {
      name = "VENDOR_PAYMENT_APPROVED";
      this.request_name = "Vendor";
    }

    else if (flag == 5) {
      name = "STAFF_PAYMENT_APPROVED";
      this.request_name = "Staff";
    }
    else if (flag == 4) {
      name = "ILC_PAYMENT_APPROVED";
      this.request_name = "ILC";
    }

    else if (flag == 3) {
      name = "EXPENCE_PAYMENT_APPROVED";
      this.request_name = "Expense";
    }

    else if (flag == 2) {
      name = "FD_PAYMENT_APPROVED";
      this.request_name = "FD";
    } else {
      name = "PAYMENT_APPROVED";
      this.request_name = "";
    }
    this.crudServices.getOne<any>(NotificationsNameMaster.getOne, { notification_name: name }).subscribe(response => {
      if (response.data) {
        this.notification_id = response.data[0]["id"];
        if (this.notification_id) {
          this.getNotifications();
        }

      }
    })
  }


  getNotifications() {
    this.notification_tokens = [];
    this.notification_id_users = []
    this.notification_users = [];

    this.crudServices.getOne(Notifications.getOne, { notification_name_id: this.notification_id }).subscribe((notification: any) => {
      if (notification.code == '100' && notification.data.length > 0) {
        this.notification_details = notification.data[0];
        this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
          if (notificationUser.code == '100' && notificationUser.data.length > 0) {
            notificationUser['data'].forEach((element) => {
              if (element.fcm_web_token) {
                this.notification_tokens.push(element.fcm_web_token);
                this.notification_id_users.push(element.id);
              }
            });
          }
        });
      }
    })





  }


  generateNotification(data) {
    if (this.notification_details != undefined) {
      let status = ''
      if (data.request_status == 1) {
        status = 'Approved'
      } else if (data.request_status == 2) {
        status = 'Rejected'
      } else if (data.request_status == 3) {
        status = 'Canceled'
      }
      let body = {
        notification: {
          "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
          "body": ` ${this.request_name} Payment Request of Amount ${data.req_amount} ${status}  `,
          "click_action": "#"
        },
        registration_ids: this.notification_tokens
      };



      this.messagingService.sendNotification(body).then((response) => {
        if (response) {
          this.saveNotifications(body['notification'], data.id)
        }
        this.messagingService.receiveMessage();
        this.message = this.messagingService.currentMessage;

      })

    }


  }

  saveNotifications(notification_body, id) {

    this.notification_users = [];
    for (const element of this.notification_id_users) {
      this.notification_users.push({
        notification_id: this.notification_details.id,
        reciever_user_id: element,
        department_id: 1,
        heading: notification_body.title,
        message_body: notification_body.body,
        url: notification_body.click_action,
        record_id: id,
        table_name: 'central_payable_request',
      })
    }

    this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
    }, (error) => console.error(error));
  }



  onFilter(event, dt) {
    this.filteredValuess = event.filteredValue;
    this.totalAmount = this.filteredValuess.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
  }

  // multiselect filter
  onchangeFilter(event, name) {
    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }

      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

  // onPaymentClick() {
  //   this.myModal.hide()
  //   if(this.typeId) {
  //     this.showPaymentList = true
  //     const record_id = 0;
  //     const sub_org_id = 7935;
  //     const sub_org_name = 'SPIPL - Sushila Parmar International Pvt. Ltd. ';
  //     const amount = 0;
  //     const req_flag = this.typeId
  //     const emp_id = 0;
  //     const headerMsg = 'Payment Details for: ' + sub_org_name;
  //     this.initialPara = new PayableParameter(sub_org_id, emp_id, headerMsg, amount, record_id, req_flag, sub_org_name, true, true,this.company_id );
  //   } else {
  //     this.toasterService.pop('warning' , 'Warning' , 'Type Not Selected')
  //   }


  // }

  // backFromPayable(event) {
  //   this.typeId = null
  // 	this.showPaymentList = false;
  // }

  // selectType() {
  //   this.type = staticValues.other_payment_type
  //   this.myModal.show();


  // }

  // closeModal() {
  //   this.typeId = null
  //   this.myModal.hide()

  // }



}
