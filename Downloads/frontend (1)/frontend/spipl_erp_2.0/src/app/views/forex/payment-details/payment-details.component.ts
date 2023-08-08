import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';


import { ExportService } from '../../../shared/export-service/export-service';
import { UtilizationService } from '../utilisation-chart/utilization-service';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { fdLinkPaymentDet, SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import * as moment from 'moment';
import { staticValues } from '../../../shared/common-service/common-service';




@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    UtilizationService,
    ExportService,
    DatePipe,
    CrudServices
  ]
})
export class PaymentDetailsComponent implements OnInit {

  @ViewChild('paymentDueDateUpdate', { static: false }) public paymentDueDateUpdate: ModalDirective;
  @ViewChild('myModalPending', { static: false }) public myModalPending: ModalDirective;

  cols: { field: string; header: string; }[];
  @ViewChild('dt', { static: false }) table: Table;
  PaymentDueDate: string;

  public today = new Date();

  payment_due_date: string;
  payment_list = [];
  global_payment_list = [];
  isLoading: boolean = false;
  filteredValuess: any[];
  filter: any = [];
  amount: number;
  supp_charge: number;
  conf_charge: number;
  total_amount: number;
  exportColumns: any[];
  export_list: any[];
  user: UserDetails;
  links: string[] = [];
  pdf_download: boolean;
  excel_download: boolean;
  bsRangeValue: Date[];
  toPaymentDueDate: any;
  fromPaymentDueDate: any;
  lookup_supplier = {};
  supplier_list = [];
  lookup_bank = {};
  bank_list = [];
  lookup_currency = {};
  currency = [];

  lookup_tag = {};
  tag_arr = [];

  lookup_funding_bank = {};
  funding_bank_list = [];

  editPaymentDate: any;
  editPaymentStatus: any;
  editnid: any;
  editPiid: any;
  editPaymentTerm: any;

  ilc_amount = 0;
  ilc_total_amount = 0;
  total_hedge_amt = 0;
  total_unhedge_amt = 0;
  hedegAmount = 0;
  currentYear: number;
  date = new Date();
  paymentDateUpdate: FormGroup

  fdlinkList = [];

  tot_balanceAfterHedge: any;

  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  invoice_amount: any;

  datePickerConfig: any = staticValues.datePickerConfigNew;
  statusList: any = [];
  selected_date_range: any = [
    new Date(moment().subtract(60, 'days').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];


  fileData: FormData = new FormData();
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;
  maxDate: Date;


  constructor(
    private loginService: LoginService,
    private utilizationService: UtilizationService,
    private toasterService: ToasterService,
    private exportService: ExportService,
    public datepipe: DatePipe,
    private crudServices: CrudServices
  ) {

    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {

      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

    } else {

      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

    }
    //this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    this.pdf_download = (this.links.indexOf('pdf download') > -1);
    this.excel_download = (this.links.indexOf('excel download') > -1);


    this.cols = [
      { field: 'PaymentDueDate', header: 'Payment Due Date' },
      { field: 'tag', header: 'Type' },
      { field: 'SupplierName', header: 'Supplier Name' },
      { field: 'BankName', header: 'Bank Name' },
      { field: 'Doc Ref. No.', header: 'Doc Ref. No.' },
      { field: 'InvoiceNo', header: 'Invoice Number' },
      { field: 'Amount', header: 'Amount' },
      { field: 'CurrencyName', header: 'Currency' },
      { field: 'SupplierCharges', header: 'Supplier Charges' },
      { field: 'ConfirmationCharges', header: 'Confirmation Charges' },
      { field: 'fundingBank', header: 'Funding Bank' },
      { field: 'Total', header: 'Total' },
      { field: 'Hedge_Amount', header: 'Hedge Amount' },
      { field: 'UnHedge_Amount', header: 'UnHedge Amount' },
      { field: 'hedge_array', header: 'Hedge Details' },
      { field: 'StatusPayment', header: 'Payment Status' },
    ];

    this.fromPaymentDueDate = this.convert(this.bsRangeValue[0]);
    this.toPaymentDueDate = this.convert(this.bsRangeValue[1]);

    this.initForm();

  }

  initForm() {

    this.paymentDateUpdate = new FormGroup({
      'payment_due_date': new FormControl(null),
    });

  }


  ngOnInit() {
    //  this.getPaymentList();
    //this.bank_list.push({ 'BankName':'INDUSIND BANK' });

    this.crudServices.postRequest<any>(SpiplBankMaster.bankType, { bank_type: 1 }).subscribe((response) => {
      for (let elem_bank of response) {
        this.bank_list.push({ 'BankName': elem_bank.bank_name });
      }
    });
  }




  onClick(item) {
    console.log(item, "itemitem");
    this.invoice_amount = item.Amount;
    let cond = {};
    if (item.nid != null) {
      cond = { n_id: item.nid };
      this.fdlinkservice(cond)
    } else if (item.bex_id != null) {
      cond = { bill_of_exchange_id: item.bex_id };
      this.fdlinkservice(cond)
    } else if (item.nonlcswiftdetid != null) {
      cond = { nonlc_id: item.nonlcswiftdetid };
      this.fdlinkservice(cond)
    }
    this.myModalPending.show();
  }

  fdlinkservice(cond) {
    this.crudServices.postRequest<any>(fdLinkPaymentDet.getFdDetails, cond).subscribe((response) => {
      console.log(response, "fdlinkdet");
      this.fdlinkList = response;
    });
  }



  // onSubmit($e) {
  //   this.isLoading = true;
  //   this.payment_list = [];
  //   if ($e == null) {
  //     this.fromPaymentDueDate = '';
  //     this.toPaymentDueDate = '';
  //   } else {
  //     this.fromPaymentDueDate = this.convert($e[0]);
  //     this.toPaymentDueDate = this.convert($e[1]);
  //   }

  //   this.getPaymentList();
  // }



  // multiselect filter
  onchange(event, name) {
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

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }

  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
  }

  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
  }




  getPaymentList() {
    this.payment_list = [];
    this.filteredValuess = [];
    this.amount = 0;
    this.ilc_amount = 0;
    this.supp_charge = 0;
    this.conf_charge = 0;
    this.total_amount = 0;
    this.total_hedge_amt = 0;
    this.total_unhedge_amt = 0;
    this.isLoading = true;
    // this.bank_list=[];

    this.fromPaymentDueDate = moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      this.toPaymentDueDate = moment(this.selected_date_range[1]).format("YYYY-MM-DD"),

      // console.log(this.fromPaymentDueDate);
      this.utilizationService.getPaymentList('', this.fromPaymentDueDate, this.toPaymentDueDate, '')
        .subscribe(response => {


          // this.isLoading = false;
          if (response.length > 0) {
            // console.log(response);
            this.getData(response);
          } else {
            this.payment_list = [];
            this.filteredValuess = [];
            this.amount = 0;
            this.ilc_amount = 0;
            this.supp_charge = 0;
            this.conf_charge = 0;
            this.total_amount = 0;
            this.total_hedge_amt = 0;
            this.total_unhedge_amt = 0;
          }
          this.isLoading = false;
        });

  }


  getData(response) {
    // this.isLoading = false;


    console.log(response, "getData");
    this.filteredValuess = response;
    let amount = 0;
    let ilc_amount = 0;
    this.ilc_amount = 0;
    let supplier_charge = 0;
    let confirmation_charge = 0;
    let hedegAmount = 0;
    this.amount = 0;
    this.supp_charge = 0;
    this.conf_charge = 0;
    this.total_amount = 0;
    this.ilc_total_amount = 0;
    this.total_hedge_amt = 0;
    this.total_unhedge_amt = 0;
    this.tot_balanceAfterHedge = 0;


    for (let i = 0; i < response.length; i++) {

      let StatusPayment = response[i]['StatusPayment'];
      response[i]['payment_status_flag'] = this.getStatus(response[i]['StatusPayment'])

      if (response[i]['Amount']) {
        if (response[i]['tag'] == "ILC") {
          ilc_amount = Number(response[i]['Amount']);
          this.ilc_amount = this.ilc_amount + ilc_amount;
        } else {
          amount = Number(response[i]['Amount']);
          this.amount = this.amount + amount;
        }

      }

      if (response[i]['SupplierCharges']) {
        supplier_charge = Number(response[i]['SupplierCharges']);
        this.supp_charge = this.supp_charge + supplier_charge;
      } else {
        supplier_charge = 0;
      }

      if (response[i]['ConfirmationCharges']) {
        confirmation_charge = Number(response[i]['ConfirmationCharges']);
        this.conf_charge = this.conf_charge + confirmation_charge;
      } else {
        confirmation_charge = 0;
      }

      if (response[i]['hedegAmount']) {
        hedegAmount = Number(response[i]['hedegAmount']);
        this.hedegAmount = this.hedegAmount + hedegAmount;
      }

      this.tot_balanceAfterHedge = this.tot_balanceAfterHedge +
        ((amount + supplier_charge + confirmation_charge) - hedegAmount);


      if (StatusPayment == 11) //Only Intrest Paid  And Principle Amount Carry Forward
      {
        this.total_amount = this.total_amount + supplier_charge + confirmation_charge;
        response[i]['Total'] = supplier_charge + confirmation_charge;

        this.total_hedge_amt = this.total_hedge_amt + hedegAmount;
        this.total_unhedge_amt = this.total_unhedge_amt + ((supplier_charge + confirmation_charge) - Number(response[i]['hedegAmount']));
        // response[i]['Hedge_Amount'] = hedegAmount;
        // response[i]['UnHedge_Amount'] = hedegAmount;

        console.log(this.total_amount, "Total : Roll Over")
      } else {
        if (response[i]['tag'] == "ILC") {
          this.ilc_total_amount = this.ilc_total_amount + ilc_amount + supplier_charge + confirmation_charge;
          response[i]['Total'] = ilc_amount + supplier_charge + confirmation_charge;
          this.total_hedge_amt = 0;
          this.total_unhedge_amt = 0;
          console.log(this.total_amount, "Total :ILC")
        } else {
          this.total_amount = this.total_amount + amount + supplier_charge + confirmation_charge;
          response[i]['Total'] = amount + supplier_charge + confirmation_charge;

          this.total_hedge_amt = this.total_hedge_amt + hedegAmount;
          this.total_unhedge_amt = this.total_unhedge_amt + (Number(amount + supplier_charge + confirmation_charge) - hedegAmount);
          console.log(this.total_amount, "Total :LC")


        }

      }

      if (!(response[i].SupplierName in this.lookup_supplier)) {
        this.lookup_supplier[response[i].SupplierName] = 1;
        this.supplier_list.push({ 'SupplierName': response[i].SupplierName });
      }

      if (!(response[i].BankName in this.lookup_bank)) {
        this.lookup_bank[response[i].BankName] = 1;
        console.log(this.bank_list, "before");
        this.bank_list.push({ 'BankName': response[i].BankName });
        console.log(this.bank_list, "after");
      }

      if (!(response[i].fundingBank in this.lookup_funding_bank)) {
        this.lookup_funding_bank[response[i].fundingBank] = 1;
        this.funding_bank_list.push({ 'fundingBank': response[i].fundingBank });
      }


      if (!(response[i].CurrencyName in this.lookup_currency)) {
        this.lookup_currency[response[i].CurrencyName] = 1;
        this.currency.push({ 'CurrencyName': response[i].CurrencyName });
      }

      if (!(response[i].tag in this.lookup_tag)) {
        this.lookup_tag[response[i].tag] = 1;
        this.tag_arr.push({ 'tag': response[i].tag });
      }

    }


    this.global_payment_list = response;
    this.payment_list = response;
    this.filteredValuess = response;



    console.log(this.bank_list, this.hedegAmount,
      this.amount,
      this.supp_charge,
      this.conf_charge, "nehaconneha")

  }


  // data exported for pdf excel download
  exportData() {
    this.export_list = [];
    let arr = [];
    const foot = {};
    if (this.filteredValuess === undefined) {
      arr = this.payment_list;
    } else {
      arr = this.filteredValuess;
    }

    for (let i = 0; i < arr.length; i++) {
      const exportList = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]['field'] === 'StatusPayment') {
          exportList[this.cols[j]['header']] = this.getStatus(arr[i][this.cols[j]['field']]);
        } else if (this.cols[j]['field'] === 'Hedge_Amount') {
          exportList[this.cols[j]['header']] = arr[i]['hedegAmount']
        } else if (this.cols[j]['field'] === 'UnHedge_Amount') {
          exportList[this.cols[j]['header']] = ((arr[i]['Amount'] + arr[i]['SupplierCharges'] + arr[i]['ConfirmationCharges']) - arr[i]['hedegAmount'])
        } else {
          exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
        }

      }



      this.export_list.push(exportList);

    }

    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]['field'] === 'Amount') {
        foot[this.cols[j]['header']] = "USD :" + this.amount + " , INR:" + this.ilc_amount;
      } else if (this.cols[j]['field'] === 'SupplierCharges') {
        foot[this.cols[j]['header']] = this.supp_charge;
      } else if (this.cols[j]['field'] === 'ConfirmationCharges') {
        foot[this.cols[j]['header']] = this.conf_charge;
      } else if (this.cols[j]['field'] === 'Total') {
        foot[this.cols[j]['header']] = (this.amount + this.supp_charge + this.conf_charge);
      } else if (this.cols[j]['field'] === 'Hedge_Amount') {
        foot[this.cols[j]['header']] = this.hedegAmount;
      } else if (this.cols[j]['field'] === 'UnHedge_Amount') {
        foot[this.cols[j]['header']] = (this.tot_balanceAfterHedge ? this.tot_balanceAfterHedge : 0);
      } else {
        foot[this.cols[j]['header']] = '';
      }
    }

    this.export_list.push(foot);

  }

  // download doc ,pdf , excel

  exportPdf() {
    this.exportData();
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(this.exportColumns, this.export_list, 'Payment-List');
  }

  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(this.export_list, 'Payment-List');
  }



  convert(str) {
    if (str) {
      const date = new Date(str),
        mnth = ('0' + (date.getMonth() + 1)).slice(-2),
        day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }


  // on your component class declare
  onFilter(event, dt) {
    console.log(event.filteredValue, "DEBUG_VIEW");
    this.filteredValuess = [];
    this.hedegAmount = 0;
    this.amount = 0;
    this.supp_charge = 0;
    this.conf_charge = 0;
    this.total_amount = 0;
    this.ilc_amount = 0;
    this.total_hedge_amt = 0;
    this.total_unhedge_amt = 0;
    this.tot_balanceAfterHedge = 0;
    this.filteredValuess = event.filteredValue;



    // console.log( this.filteredValuess);
    for (let i = 0; i < this.filteredValuess.length; i++) {
      if (this.filteredValuess[i]['Amount']) {
        if (this.filteredValuess[i]['tag'] == "ILC") {
          this.ilc_amount = this.ilc_amount + Number(this.filteredValuess[i]['Amount']);

        } else {
          this.amount = this.amount + Number(this.filteredValuess[i]['Amount']);
        }

      }
      if (this.filteredValuess[i]['SupplierCharges']) {
        this.supp_charge = this.supp_charge + Number(this.filteredValuess[i]['SupplierCharges']);
      }
      if (this.filteredValuess[i]['ConfirmationCharges']) {
        this.conf_charge = this.conf_charge + Number(this.filteredValuess[i]['ConfirmationCharges']);
      }
      this.total_amount = this.total_amount + this.filteredValuess[i]['Total'];
      this.total_hedge_amt = this.total_hedge_amt + this.filteredValuess[i]['hedegAmount'];
      this.hedegAmount = this.hedegAmount + this.filteredValuess[i]['hedegAmount'];
      this.tot_balanceAfterHedge = this.tot_balanceAfterHedge + ((Number(this.filteredValuess[i]['Amount']) + Number(this.filteredValuess[i]['SupplierCharges']) + Number(this.filteredValuess[i]['ConfirmationCharges'])) - this.filteredValuess[i]['hedegAmount'])
      this.total_unhedge_amt = this.total_unhedge_amt + this.filteredValuess[i]['balanceAfterHedge'];



      //this.total_amount = this.total_amount + this.ilc_amount + this.amount + this.supp_charge + this.conf_charge;
    }

    console.log(this.hedegAmount,
      this.amount,
      this.supp_charge,
      this.conf_charge, this.tot_balanceAfterHedge, "nehacon")

  }


  getStatus(status) {
    switch (Number(status)) {
      case 0: {
        return 'Pending';
        break;
      }
      case 1: {
        return 'Remitted ';
        break;
      }

      case 11: {
        return 'Roll over taken';
        break;
      }

      case 2: {
        return ' Roll Over';
        break;
      }
      case 3: {
        return 'Roll over remit';
        break;
      }


      default: {
        return '';
        break;
      }
    }
  }


  onEditPaymentDate(PaymentDueDate, StatusPayment, nid, pi_id, payment_term_id) {
    console.log(PaymentDueDate, StatusPayment, nid, pi_id, "PaymentStatus");
    this.editPaymentDate = PaymentDueDate;
    this.editPaymentStatus = StatusPayment;
    this.editnid = nid;
    this.editPiid = pi_id;
    this.editPaymentTerm = payment_term_id;

    this.paymentDueDateUpdate.show();
  }

  onPaymentDateUpdate() {

    console.log(this.paymentDateUpdate.value.payment_due_date, this.editPaymentStatus, this.editnid, this.editPiid, this.editPaymentTerm, "UpdatePAy");


    this.utilizationService.updatePaymentDate(this.paymentDateUpdate.value.payment_due_date, this.editPaymentStatus, this.editnid, this.editPiid,
      this.editPaymentTerm).subscribe((response) => {

        this.toasterService.pop(response.message, 'Success', response.data);
        this.paymentDueDateUpdate.hide();

        this.getPaymentList();

      });
  }


  closeModal() {
    this.myModalPending.hide();
  }

}
