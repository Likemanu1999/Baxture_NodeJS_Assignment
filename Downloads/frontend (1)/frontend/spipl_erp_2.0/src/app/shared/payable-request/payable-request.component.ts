import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { MessagingService } from '../../service/messaging.service';
import { LoginService } from '../../views/login/login.service';
import { Notifications, NotificationsNameMaster, NotificationsUserRel, Payables, SpiplBankMaster, SubOrg, subOrgRespectiveBank, UsersNotification } from '../apis-path/apis-path';
import { CrudServices } from '../crud-services/crud-services';
import { InrCurrencyPipe } from '../currency/currency.pipe';
import { PayableParameterModel } from './payable-parameter.model';
import { UserDetails } from "../../views/login/UserDetails.model";
import { forkJoin } from 'rxjs';
import { staticValues } from '../common-service/common-service';

@Component({
  selector: 'app-payable-request',
  templateUrl: './payable-request.component.html',
  styleUrls: ['./payable-request.component.scss'],
  providers: [InrCurrencyPipe, DatePipe, CrudServices, LoginService, MessagingService],
  // , MessagingService, LoginService
  encapsulation: ViewEncapsulation.None,
})
export class PayableRequestComponent implements OnInit {
  @ViewChild('myModal', { static: true }) public myModal: ModalDirective;
  /**
  * This component needed initial paramters to display payment history of perticular category.
  * we need to pass PayableParameter class obeject of type PayableParameterModel.
  */
  @Input() initialPara: PayableParameterModel;
  /**
   * On back button press it will emit payableBack flag to the parent component.
   */
  @Output() payableBack = new EventEmitter<boolean>(false);


  payableRequestList: any = [];
  isLoading: boolean = false;
  cols: { field: string; header: string; }[];
  @ViewChild('dt', { static: false }) table: Table;
  forSumList: any[];
  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  totalPaidAmount: number;
  requestForm: FormGroup;
  balanceAmount: number;
  bankTotalAmount: any;
  limitErrorMessage: boolean = false;
  totalAmountExceed: boolean = false;
  totalAmountZero: boolean = false;
  zerolimitError: boolean = false;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  /**
   * 1-> add 2-> edit
   */
  formMode: number = 1;
  currentActiveRequest: any;
  createAccess: boolean = false;
  editAccess: boolean = false;
  titleMode: string = 'Create';
  balanceAmountBack: number;
  quantity: number;
  rate: number;
  total_amount: number;
  ILc_amount: number;
  Ilc_rtgs_amount: number;
  requestAmt: any;

  notification_details: any;
  notification_tokens = [];
  notification_id_users = []
  notification_users = [];
  user: UserDetails;
  message: any;
  notification_id: any;
  request_name: any;
  company_id: number;
  bank_list: any = [];
  bankField: boolean = false;
  type_list: { id: number; name: string; }[];

  // 
  spipl_bank: any = [];
  temp_spipl_bank: any = [];
  test_spipl_bank_name: any;
  test_bank_name: any;

  temp: any;
  toBankList: boolean = false;
  fromBankList: boolean = false;

  // 
  countBank: any[] = [];
  mainError: boolean = false;
  spiplError: boolean = false;
  tobankError: boolean = false;
  myName: any;
  TwoBankList: any = [{ 'spipl': null, 'tobank': null }];
  bank1: any = null;
  bank2: any = null;
  disableBank: boolean;
  from_date: string;
  to_date: string;
  data: any[];
  totalAmt: number;
  totalCredit: number;
  totalDebit: number;
  pvc_local_statement_value: any = staticValues.pvc_local_statement_temp_value;
  local_statement_set_date: any = staticValues.local_statement_set_date;
  local_statement_set_date_pvc: any = staticValues.local_statement_set_date_pvc;

  // private messagingService: MessagingService , private loginService : LoginService

  constructor(private currencyPipe: InrCurrencyPipe, private datePipe: DatePipe, private toasterService: ToasterService, private crudServices: CrudServices, private loginService: LoginService, private messagingService: MessagingService) {
    this.user = this.loginService.getUserDetails();
    this.cols = [
      { field: 'id', header: 'Req.No.' },
      { field: 'req_date', header: 'Request Date' },
      { field: 'req_amount', header: 'Request Amount' },
      { field: 'paid_amount', header: 'Paid Amount' },
      { field: 'invoice_no', header: 'Invoice Number' },
      { field: 'advanced_agnst_bill', header: 'Payment Type' },
      { field: 'normal_priority', header: 'Priority' },
      { field: 'remark', header: 'Remark' },
      { field: 'utr_no', header: 'UTR No.' },
      { field: 'approved_date', header: 'Approve Date' },
      { field: 'approved_by_name', header: 'Approve By' },
      { field: 'added_date', header: 'Added Date' },
      { field: 'added_by_name', header: 'Request By' },
      { field: 'request_status', header: 'Status' },
    ];
    this.type_list = [{ id: 1, name: 'Advance' }, { id: 2, name: 'Against Bill' }]
    // this.company_id = this.user.userDet[0].company_id;
  }
  /**
   * We are setting create button & edit button access which send by the parent component.
   * on createForm() Called it initializes requestForm form.
   */
  ngOnInit() {
    this.createAccess = this.initialPara.createRequestAccess;
    this.editAccess = this.initialPara.editRequestAccess;
    this.getNotificationName();
    this.getSpiplBank();
    this.getLocalData();
    this.onRefresh();
    this.createForm();

  }
  /**
  * Initializes requestForm form with fields & their default values.
  */
  createForm() {
    this.requestForm = new FormGroup({
      req_date: new FormControl(new Date, [Validators.required]),
      req_amount: new FormControl(0, [Validators.required]),
      advanced_agnst_bill: new FormControl('', [Validators.required]),
      normal_priority: new FormControl('', [Validators.required]),
      remark: new FormControl('', [Validators.required]),
      invoice_no: new FormControl(''),
      request_status: new FormControl(null),
      bank_id: new FormControl(null),
      spipl_bank_id: new FormControl(null),

    });

  }
  /**
   * By calling service method to get the history of payment requests for perticular record & category flag
   */
  onRefresh() {

    this.isLoading = true;
    this.company_id = this.initialPara.company_id;

    // if (this.bankField == false) {
    //   this.requestForm.get('bank_id').clearValidators();
    //   this.requestForm.get('bank_id').updateValueAndValidity();
    //   this.requestForm.get('spipl_bank_id').clearValidators();
    //   this.requestForm.get('spipl_bank_id').updateValueAndValidity();
    // }


    this.crudServices.getOne<any>(Payables.payable_list, {
      record_id: this.initialPara.record_id,
      req_flag: this.initialPara.req_flag

    }).subscribe(response => {
      this.payableRequestList = response;


      this.isLoading = false;
      if (this.initialPara.req_flag == 1) {
        this.bankField = true;
        this.disableBank = true;
        // this.requestForm.get('spipl_bank_id').disable();        
        this.requestForm.get('bank_id').setValidators(Validators.required);
        this.requestForm.get('bank_id').updateValueAndValidity();
        this.requestForm.get('spipl_bank_id').setValidators(Validators.required);
        // this.requestForm.get('spipl_bank_id').updateValueAndValidity();
        if (this.initialPara.company_id == 1) {
          this.requestForm.patchValue({
            spipl_bank_id: 24
          });
        } else if (this.initialPara.company_id == 2) {
          this.requestForm.patchValue({
            spipl_bank_id: 19
          });
        } else if (this.initialPara.company_id == 3) {
          this.requestForm.patchValue({
            spipl_bank_id: 28
          });
        }

        this.crudServices.getOne<any>(subOrgRespectiveBank.getPerticularOrgBank, { sub_org_id: this.initialPara.sub_org_id }).subscribe(response => {
          this.bank_list = response;
          this.bank_list.map(result => result.bankName = result.account_no != null ? result.bank_name + " ( " + result.account_no + " ) " : result.bank_name);
        })

        this.forSumList = response.filter(_data => _data.utr_no !== null && _data.request_status === 1);
        const approveList = response.filter(_data => _data.request_status !== 2);
        const totalReqAmt = approveList.reduce((previousValue, currentValue) => previousValue + (currentValue['paid_amount'] || 0), 0);
        this.totalPaidAmount = this.forSumList.reduce((previousValue, currentValue) => previousValue + (currentValue['paid_amount'] || 0), 0);
        const total_utilize = this.initialPara.ILc_amount ? Number(this.initialPara.ILc_amount) : 0 + this.initialPara.Ilc_rtgs_amount ? Number(this.initialPara.Ilc_rtgs_amount) : 0;
        const debitAmount = this.initialPara.local_debit_amount ? Number(this.initialPara.local_debit_amount) : 0
        this.total_amount = this.initialPara.total_amount;
        this.balanceAmount = this.initialPara.total_amount - total_utilize - totalReqAmt - debitAmount;
        this.balanceAmountBack = this.initialPara.total_amount - total_utilize - totalReqAmt - debitAmount;
        this.ILc_amount = this.initialPara.ILc_amount ? Number(this.initialPara.ILc_amount) : 0;
        this.Ilc_rtgs_amount = this.initialPara.Ilc_rtgs_amount ? Number(this.initialPara.Ilc_rtgs_amount) : 0;
        this.requestAmt = totalReqAmt;
      } else if (this.initialPara.req_flag == 5 || this.initialPara.req_flag == 6) {
        this.disableBank = false;
        this.forSumList = response.filter(_data => _data.utr_no !== null && _data.request_status === 1);
        const approveList = response.filter(_data => _data.request_status !== 2);
        this.totalPaidAmount = this.forSumList.reduce((previousValue, currentValue) => previousValue + (currentValue['paid_amount'] || 0), 0);
        const totalReqAmt = approveList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
        // this.balanceAmount = this.initialPara.total_amount - totalReqAmt ;
        // this.balanceAmountBack = this.initialPara.total_amount - totalReqAmt ;
      } else if (this.initialPara.req_flag == 8 || this.initialPara.req_flag == 9 || this.initialPara.req_flag == 10 || this.initialPara.req_flag == 11 || this.initialPara.req_flag == 12) {
        this.bankField = true;
        if (this.initialPara.req_flag == 8) {

          this.disableBank = false;
          this.requestForm.get('bank_id').setValidators(Validators.required);
          this.requestForm.get('bank_id').updateValueAndValidity();
          this.requestForm.get('spipl_bank_id').setValidators(Validators.required);
          this.requestForm.get('spipl_bank_id').updateValueAndValidity();
        }
        this.crudServices.getOne<any>(subOrgRespectiveBank.getPerticularOrgBank, { sub_org_id: this.initialPara.sub_org_id }).subscribe(response => {
          this.bank_list = response;
        })
        this.forSumList = response.filter(_data => _data.utr_no !== null && _data.request_status === 1);
        const approveList = response.filter(_data => _data.request_status !== 2);
        this.totalPaidAmount = this.forSumList.reduce((previousValue, currentValue) => previousValue + (currentValue['paid_amount'] || 0), 0);
        const totalReqAmt = approveList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
      }
      else {

        this.forSumList = response.filter(_data => _data.utr_no !== null && _data.request_status === 1);
        const approveList = response.filter(_data => _data.request_status !== 2);
        this.totalPaidAmount = this.forSumList.reduce((previousValue, currentValue) => previousValue + (currentValue['paid_amount'] || 0), 0);
        const totalReqAmt = approveList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
        this.balanceAmount = this.initialPara.total_amount - totalReqAmt;
        this.balanceAmountBack = this.initialPara.total_amount - totalReqAmt;
      }
    });
  }
  /**
   * On back button click this function gets executed & emit payableBack flag to the parent component.
   */
  onBack() {
    this.payableBack.emit(true);
  }
  getTotalValue(value) {
    return this.currencyPipe.transform(String(value));
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
  * On add button click this function gets executed & shows popup to create request.
  */
  onAddRequest() {
    this.formMode = 1;
    this.limitErrorMessage = false;
    this.totalAmountExceed = false;
    this.titleMode = 'Create';
    this.requestForm.controls.req_date.patchValue(new Date());
    if (this.initialPara.req_flag == 1 && (this.initialPara.company_id == 1 || this.initialPara.company_id == 2)) {
      if (this.balanceAmount <= this.totalAmt) {
        this.requestForm.controls.req_amount.patchValue(this.balanceAmount);
      } else {
      //  this.totalAmountZero = true;
      this.totalAmountExceed = true
      }
    }
    else {
      this.requestForm.controls.req_amount.patchValue(this.balanceAmount);
    }
    this.myModal.show();
    if ((this.initialPara.req_flag == 1 || this.initialPara.req_flag == 6) && (this.initialPara.company_id == 1 || this.initialPara.company_id == 2)) {
      if (this.totalAmt <= 0) {
        this.toasterService.pop('error', 'Alert', 'Amount Insufficient');
      }
    }
  }

  /**
  * To edit perticular request until it is in pending status this function gets called.
  * set previous values to the form control using patch values. & set formMode to 2 for edit.
  */
  onEdit(payableRequest: any) {
    this.titleMode = 'Update';
    this.formMode = 2;
    this.currentActiveRequest = payableRequest;
    this.requestForm.patchValue({
      req_date: this.currentActiveRequest['req_date'],
      req_amount: this.currentActiveRequest['req_amount'],
      advanced_agnst_bill: this.currentActiveRequest['advanced_agnst_bill'],
      normal_priority: this.currentActiveRequest['normal_priority'],
      remark: this.currentActiveRequest['remark'],
      invoice_no: this.currentActiveRequest['invoice_no'],
      request_status: this.currentActiveRequest['request_status'],
      spipl_bank_id: this.currentActiveRequest['spipl_bank_id'],
      bank_id: this.currentActiveRequest['to_bank_id'],
    });

    this.balanceAmount = this.balanceAmount + this.currentActiveRequest['req_amount'];
    this.myModal.show();
  }
  /**
  * On create or update request this method gets executed and checks for formMode to called respected service method.
  */

  /** sub_org_id -> contains sub organization id ; emp_id -> contains staff member master id*/
  onSubmit() {
    this.isLoading = true;
    const req_date = this.datePipe.transform(this.requestForm.value.req_date, 'yyyy-MM-dd');
    let data = {
      sub_org_id: String(this.initialPara.sub_org_id),
      emp_id: String(this.initialPara.emp_id),
      record_id: String(this.initialPara.record_id),
      req_date: req_date,
      req_amount: this.requestForm.value.req_amount,
      advanced_agnst_bill: this.requestForm.value.advanced_agnst_bill,
      normal_priority: this.requestForm.value.normal_priority,
      remark: (((this.requestForm.value.remark === null) ? '' : this.requestForm.value.remark)),
      invoice_no: (((this.requestForm.value.invoice_no === null) ? '' : this.requestForm.value.invoice_no)),
      req_flag: String(this.initialPara.req_flag),
      company_id: this.company_id
    }

    if (this.requestForm.value.spipl_bank_id) {
      data['spipl_bank_id'] = this.requestForm.value.spipl_bank_id;
    }

    if (this.requestForm.value.bank_id) {
      let result = this.bank_list.find(item => item.bank_id == this.requestForm.value.bank_id);
      data['beneficiary_bank_name'] = result.bank_name;
      data['beneficiary_account_no'] = result.account_no;
      data['beneficiary_bank_ifsc'] = result.ifsc_code;
      data['beneficiary_branch_name'] = result.branch_name;
      data['to_bank_id'] = this.requestForm.value.bank_id;
    }

    if (this.formMode === 1) {
      if (this.initialPara.port_id == 3 || this.initialPara.port_id == 2) {
        if (this.initialPara.req_flag == 1) {
          data['spipl_bank_id'] = 27
        }
      }

      if (this.requestForm.value.req_amount > 0) {

        this.crudServices.addData<any>(Payables.add_payables_request, data).subscribe((response) => {
          if (response.code == 100) {
            this.generateNotification(response.insertedData[0]);
            this.payableRequestList.push(response.insertedData[0]);
            this.toasterService.pop(response.message, response.message, response.data);
            this.onRefresh();
            this.requestForm.reset();
            this.isLoading = false;
            this.myModal.hide();
          } else {
            this.toasterService.pop(response.message, response.message, response.data);
            this.myModal.hide();
          }
        });
      } else {
        this.toasterService.pop('warning', 'warning', 'Amount not Present');
      }

    } else if (this.formMode === 2 && this.currentActiveRequest) {
      data['id'] = String(this.currentActiveRequest.id);
      data['request_status'] = ((this.requestForm.value.request_status === true) ? '3' : '0');
      // formData.append('id', String(this.currentActiveRequest.id));
      // formData.append('request_status', ((this.requestForm.value.request_status === true) ? '3' : '0'));
      if (this.requestForm.value.req_amount > 0) {
        this.crudServices.updateData<any>(Payables.update_request, data).subscribe((response) => {
          this.payableRequestList.splice(this.payableRequestList.indexOf(this.currentActiveRequest), 1, response.updatedData[0]);
          this.toasterService.pop(response.message, response.message, response.data);
          this.onRefresh();
          this.myModal.hide();
        });
      } else {
        this.toasterService.pop('warning', 'warning', 'Amount not Present');
      }
    }
  }
  /**
  * On modal's close button click this function gets executed & hides popup and reset request forms.
  */
  oncloseModal() {
    this.myModal.hide();
    this.balanceAmount = this.balanceAmountBack;
    this.requestForm.reset();
    this.onRefresh();
  }
  /**
  * On request amount change we need to validate entered amount with balance amount of the record.
  * Only applicable to the organization requests which are related to purchase,LC's etc.
  */
  checkLimit() {
    const enteredAmt = this.requestForm.controls.req_amount.value;

    // if (enteredAmt > this.balanceAmount && this.initialPara.type_sub_org_emp === 1) {

    if (this.initialPara.req_flag != 5) {
      if (this.initialPara.req_flag == 6 && (this.initialPara.company_id == 1 || this.initialPara.company_id == 2)) {
        if (enteredAmt >= this.totalAmt) {
          this.limitErrorMessage = true;
          this.totalAmountExceed = false;
          this.totalAmountZero = false;
          this.requestForm.controls.req_amount.patchValue(null);
        } else {
          this.totalAmountExceed = true;
          this.limitErrorMessage = false;
          this.totalAmountZero = false;
        }
      }
      if (this.initialPara.req_flag == 1 && (this.initialPara.company_id == 1 || this.initialPara.company_id == 2)) {
        if (enteredAmt >= this.totalAmt) {
          this.limitErrorMessage = true;
          this.totalAmountExceed = false;
          this.totalAmountZero = false;
          this.requestForm.controls.req_amount.patchValue(null);
        } else {
          this.totalAmountExceed = true;
          this.limitErrorMessage = false;
          this.totalAmountZero = false;
        }
        if (this.balanceAmount <= this.totalAmt) {
          if (this.totalAmt <= 0) {
            this.totalAmountExceed = false;
            this.totalAmountZero = true;
            this.limitErrorMessage = false;
          }
          else if (enteredAmt > this.balanceAmount) {
            this.limitErrorMessage = true;
            this.totalAmountExceed = false;
            this.totalAmountZero = false;
            this.requestForm.controls.req_amount.patchValue(null);
          } else {
            this.totalAmountExceed = true;
            this.limitErrorMessage = false;
            this.totalAmountZero = false;
          }
        }
        else {
          this.totalAmountExceed = true;
        }

      } else {
        if (enteredAmt > this.balanceAmount) {
          this.limitErrorMessage = true;
          this.requestForm.controls.req_amount.patchValue(null);
        } else {
          this.limitErrorMessage = false;
        }
      }
    }


  }

  //notification--------------------------------------------
  getNotificationName() {


    let name = '';
    if (this.initialPara.req_flag == 1) {
      name = "LOCAL_PAYMENT_REQUEST";
      this.request_name = "Local Purchase";
    }

    else if (this.initialPara.req_flag == 6) {
      name = "VENDOR_PAYMENT_REQUEST";
      this.request_name = "Vendor";
    }

    else if (this.initialPara.req_flag == 5) {
      name = "STAFF_PAYMENT_REQUEST";
      this.request_name = "Staff";
    }

    else if (this.initialPara.req_flag == 4) {
      name = "ILC_PAYMENT_REQUEST";
      this.request_name = "ILC";
    }

    else if (this.initialPara.req_flag == 3) {
      name = "EXPENCE_PAYMENT_REQUEST";
      this.request_name = "Expense";
    }

    else if (this.initialPara.req_flag == 2) {
      name = "FD_PAYMENT_REQUEST";
      this.request_name = "FD";
    } else {
      name = "PAYMENT_REQUEST";
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
  getLocalData() {
    //2023-05-25 -> '2023-07-17' -> VISHAL SHETE
    if(this.initialPara.company_id == 1){
      this.from_date = this.datePipe.transform(this.local_statement_set_date_pvc, 'yyyy-MM-dd')
    }else{
    this.from_date = this.datePipe.transform(this.local_statement_set_date, 'yyyy-MM-dd')
    }
    const today = new Date();
    this.to_date = this.datePipe.transform(today, 'yyyy-MM-dd')
    let creditAmt = 0;

    let spipl_bank_id: number;
    if (this.initialPara.company_id == 1) {
      spipl_bank_id = 24;
    } else if (this.initialPara.company_id == 2) {
      spipl_bank_id = 19;
    } else if (this.initialPara.company_id == 3) {
      spipl_bank_id = 28;
    }
    let res1 = this.crudServices.getOne<any>(Payables.getTransferPayments, { from_date: this.from_date, to_date: this.to_date, import_local_flag: 2, company_id: this.initialPara.company_id });

    let res2 = this.crudServices.getOne<any>(Payables.getCentralPayableLocal, { from_date: this.from_date, to_date: this.to_date, import_local_flag: 2, spipl_bank_id: spipl_bank_id, company_id: this.initialPara.company_id });

    let res3 = this.crudServices.getOne<any>(Payables.getSalesDispatchLCPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, import_local_flag: 2, company_id: this.initialPara.company_id });

    let res4 = this.crudServices.getOne<any>(Payables.getForwardSalesPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.initialPara.company_id, import_local_flag: 2 });

    this.isLoading = true;
    forkJoin([res1, res2, res3, res4]).subscribe(([data1, data2, data3, data4]) => {
      this.isLoading = false
      if (data1.length) { data1.map(item => item.type = "Credit"); }
      if (data2.length) { data2.map(item => item.type = "Debit"); }
      if (data3.length) {
        data3.map(item => item.type = "Credit");
        data3.map(item => item.utr_no = "LC Payment- " + item.utr_no)
      }
      if (data4.length) {
        data4.map(item => {
          if (item.advanceamount > 0 || item.balanceamount > 0) {
            item.type = "Credit";
            item.amount = item.advanceamount ? item.advanceamount : item.balanceamount
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          } else {
            item.type = "Credit";
            item.amount = 0
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          }
        });
      }
      data4 = data4.filter(i => i.amount > 0)
      let results = [];

      if (data1.length) {
        results = [...results, ...data1];
      }
      if (data2.length > 0) {
        results = [...results, ...data2];
      }
      if (data3.length > 0) {
        results = [...results, ...data3];
      }
      if (data4.length > 0) {
        results = [...results, ...data4];
      }

      this.data = results.sort((a, b) => a.date < b.date ? 1 : -1);

      this.data.map(result => {
        if (result.type == 'Credit' && result.amount > 0) {
          creditAmt += result.amount
        } else {
          creditAmt = (creditAmt - result.amount)
        }
        result.opening_balance = creditAmt
        return result
      })
      this.calculateAmount(this.data, this.company_id);
    });
  }



  calculateAmount(data, division) {
    if (division == 1) {
      this.totalAmt = this.pvc_local_statement_value;
    } else {
      this.totalAmt = 0;
    }

    this.totalCredit = 0;
    this.totalDebit = 0;
    for (let item of data) {
      if (item.type == "Credit" && item.amount > 0) {
        this.totalAmt = this.totalAmt + item.amount
        this.totalCredit += item.amount
      } else if (item.type == "Debit") {
        this.totalAmt = this.totalAmt - item.amount
        this.totalDebit += item.amount
      }
    }
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
      let body = {
        notification: {
          "title": `  ${this.notification_details ? this.notification_details.title : ''} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
          "body": `New ${this.request_name} Payment Request of Amount ${data.req_amount} Added  `,
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

  getSpiplBank() {
    this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe((response) => {
      this.spipl_bank = response;
      this.spipl_bank.map(result => result.bankName = result.short_form ? result.bank_name + " ( " + result.short_form + " ) " : result.bank_name)
    });
  }

  checkBank() {
    let from_id = this.requestForm.controls.spipl_bank_id.value;
    let to_id = this.requestForm.controls.bank_id.value;
    if (from_id && to_id) {
      let fromData = this.spipl_bank.find(item => item.id == from_id);
      let toData = this.bank_list.find(item => item.bank_id == to_id);

      if (fromData.account_no.trim() == toData.account_no.trim()) {
        this.toasterService.pop('warning', 'Warning', "From Bank and to bank Account Number Cannot be same");
        this.requestForm.patchValue({
          spipl_bank_id: null,
          bank_id: null
        })
      }

    }

  }





}
