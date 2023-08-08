import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PayablesServices } from '../../payables-service';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { InrCurrencyPipe } from '../../../../shared/currency/currency.pipe';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { Payables } from '../../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';

import { UserDetails } from '../../../login/UserDetails.model';
import { LoginService } from '../../../login/login.service';
import * as moment from 'moment';
import { staticValues } from '../../../../shared/common-service/common-service';
export interface ProcessPaymentList {
  id: number
  paidAmount: number;
  company_id: any;
  paid_date: string;
  ref_no: string;
  neft_rtgs: number;
  account_type: number;
  cheque_no: string;
  beneficiary_bank_name: string;
  beneficiary_account_no: string;
  beneficiary_bank_ifsc: string;
  beneficiary_branch_name: string;
  beneficiary_account_name: string;
  utr_no: string;
  reqAmount: number;
  spipl_bank_id: number;
  sub_org_id: number;
  req_flag: number;
  spiplbank: string;
  bank_address: string;
  account_no: string;
  org_emp_name: string;
  req_date: string;
  emp_id: number;
}


@Component({
  selector: 'app-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss'],
  providers: [DatePipe, ToasterService, InrCurrencyPipe, CrudServices, LoginService],
})
/**
* In this Component user can create application by providing bank details to the requests.
*/
export class ProcessListComponent implements OnInit {
  @ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
  @ViewChild('dt', { static: false }) table: Table;
  
  @Output() disableEvent = new EventEmitter<any>();
  processPaymentList: ProcessPaymentList[];
  isLoading: boolean = false;
  bsRangeValue: any = [];
  cols: any = [];
  filter: any = [];
  selected_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: any; }[];
  addBankDetailsForm: FormGroup;
  beneficiary_bank_name: string;
  beneficiary_account_no: string;
  beneficiary_bank_ifsc: string;
  beneficiary_branch_name: string;
  beneficiary_account_name: string;
  public dateModel = '';
  minDate = new Date(1950, 5, 10);
  maxDate = new Date();
  bsValue: Date = new Date();
  dateFormat: any;
  dateInputFormat = 'Y-m-d';
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  @ViewChild('updateRecordModal', { static: false }) public updateRecordModal: ModalDirective;
  selectedRecord: any;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 10000
    });
  checkedList = [];
  filteredValuess = []
  totalReq: any;
  totalPaid: any;
  popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to reject?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;
  lookup = {};
  supplier_list = [];
  bank_list = [];
  lookupbank = {};
  data: any[];
  selected_date_range: any = [
    new Date(moment().format("YYYY-06-15")),
    new Date(moment().endOf('months').format("YYYY-MM-DD"))
  ];
  user: UserDetails;
  role_id: any;
  datePickerConfig: any = staticValues.datePickerConfigNew;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;
  isPastPayment: boolean = false;
  lookupcompany = {};
  company_list: any = [];
  updateUtrAmount: FormGroup;
  utr_no: any = null;
  /**
  * Initialization of form controls for bank details submission.
      1.beneficiary_bank_name
      2.beneficiary_account_no
      3.beneficiary_bank_ifsc
      4.beneficiary_branch_name
      5.beneficiary_account_name
    On selecion of bank record from table these fields added later to the formdata.
  */
  constructor(private datePipe: DatePipe, private toasterService: ToasterService, private inrCurrencyPipe: InrCurrencyPipe, private crudServices: CrudServices, private loginService: LoginService) {

    this.user = this.loginService.getUserDetails();
    this.role_id = this.user.userDet[0].role_id;

   
    this.addBankDetailsForm = new FormGroup({
      paid_date: new FormControl(this.bsValue, Validators.required),
      ref_no: new FormControl(null),
      neft_rtgs: new FormControl('', Validators.required),
      account_type: new FormControl(null, Validators.required),
      cheque_no: new FormControl(null, Validators.required),
    });

    this.updateUtrAmount = new FormGroup({
      utr_no: new FormControl(null, Validators.required),
      amount: new FormControl(null, Validators.required),
    });
  }
  /**
  * Getting list of payment request which are proccess by first step within date range.
  here we are processiong only todays requests.
  */
  ngOnInit() {

    // const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    // this.bsRangeValue = [new Date(today), new Date(today)];
    this.getCols();
    // this.getData();
  }

  onAction(record, action) {
    if (action == 'Edit') {
      this.selectedRecord = record;
      this.utr_no = record.utr_no;
      this.updateUtrAmount.patchValue({
        utr_no: record.utr_no ? record.utr_no : null,
        amount: record.paidAmount ? record.paidAmount : null
      });
      this.updateRecordModal.show();
    }else if(action == 'Reject'){
      this.updateStatus(2 , record.id , record, record.req_amount)
    }
  }

  updateStatus(request_status: number, id: number, item: any, amount?: number) {
    this.crudServices.updateData<any>(Payables.request_approve, {
      id: id, request_status: request_status,
      record_id: item.id,
      req_flag: item.req_flag
    }).subscribe((response) => {
      if (response.code === '100') {
        this.toasterService.pop(response.message, response.message, response.data);
      }
    });
  }

  getData() {
    // this.data = [];
    this.processPaymentList = []
    let condition = {
      req_date_from:  new Date(moment(this.selected_date_range[0]).format("YYYY-MM-DD")),
      req_date_to: new Date(moment().subtract(1, "days").format("YYYY-MM-DD"))
    }
    this.crudServices.getOne<any>(Payables.pending_process_payment_list, condition).subscribe((response) => {
      if (response.code == '100') {
      if (response.length > 0) {
        //amt = null and utr = null
        this.processPaymentList = response;
        this.isPastPayment = true;
        this.totalReq = response.reduce((prev, next) => prev + Number(next.reqAmount), 0);
        this.totalPaid = response.reduce((prev, next) => prev + Number(next.paidAmount), 0);
        this.processPaymentList.map(result => result.company_id = this.getcompany(result.company_id));
        this.disableEvent.emit({'disable' : true })
        // this.data = response.data;
				// this.pushDropdown(this.data);
				// this.footerTotal(this.data);
      }
      } else {
        //completed 
        condition = {
          req_date_from:  new Date(moment(this.selected_date_range[0]).format("YYYY-MM-DD")),
          req_date_to: new Date(moment().format("YYYY-MM-DD"))
        }
        this.crudServices.getOne<any>(Payables.process_payment_list, condition).subscribe((response) => {  
          if(response.length > 0){
          if (this.role_id == 24) {
            response = response.filter(item => item.spipl_bank_id == 19)
          }
          this.processPaymentList = response;
          this.totalReq = response.reduce((prev, next) => prev + Number(next.reqAmount), 0);
          this.totalPaid = response.reduce((prev, next) => prev + Number(next.paidAmount), 0);
          this.processPaymentList.map(result => result.company_id = this.getcompany(result.company_id));
          // this.setFilter(response);
          this.data = response
          this.disableEvent.emit({'disable' : false }); 
          this.pushDropdown(this.data);
          this.footerTotal(this.data);	
         }         
        });              
      }    
      this.table.reset();
    });
   
  }

  
  getCols(){
  this.cols = [
    { field: '', header: '', sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
    { field: 'company_id', header: 'Company', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'req_date', header: 'Req. Date', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'org_emp_name', header: 'Beneficiary', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'spiplbank', header: 'Bank' , sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null},
    { field: 'invoice_no', header: 'Invoice No.', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'record_id', header: 'Reference ID', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null},
    { field: 'paidAmount', header: 'Paying Amount', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
    { field: 'request_status', header: 'Action', sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
    { field: 'utr_no', header: 'UTR No', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    
  ];
  this.selected_cols = [
    { field: '', header: '', sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
    { field: 'company_id', header: 'Company', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'req_date', header: 'Req. Date', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'org_emp_name', header: 'Beneficiary', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'spiplbank', header: 'Bank' , sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null},
    { field: 'invoice_no', header: 'Invoice No.', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    { field: 'record_id', header: 'Reference ID', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null},
    { field: 'paidAmount', header: 'Paying Amount', sort: false, filter: false, dropdown: [], footer: true, total: 0, type: null },
    { field: 'request_status', header: 'Action', sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
    { field: 'utr_no', header: 'UTR No', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    
  ];
  this.filter =['company_id','org_emp_name','spiplbank','record_id'];
  this.getData();
  }
  @Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"process-list-component-col",
			JSON.stringify(this.selected_cols)
		);
		return this.selected_cols;
	}

	set selectedColumns(val: any[]) {
		this.selected_cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	getColumnPresent(col) {
		if (this.selected_cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
	}
 


  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg.filter(item => item != null && item !== '');
    } else {
      data = this.data && this.data.length > 0 ? this.data.filter(item => item != null && item !== '') : [];
    }
    let filter_cols = this.selected_cols.filter(col => col.filter == true);
    filter_cols.forEach(element => {
      let unique = data.map(item =>
        item[element.field]
      ).filter((value, index, self) =>
        value != null && value !== '' && self.indexOf(value) === index
      );
      let array = [];
      unique.forEach(item => {
        array.push({
          value: item,
          label: item
        });
      });
      element.dropdown = array;
    });
  }



	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.selected_cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			}
		});
	}

	customFilter(value, col, data) {				
		let res = this.table.filter(value, col, data);  	
		this.footerTotal(this.data);		
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.dateFormat))
			this.uploadSuccess.emit(false);
	}
	
	onChange(event, name) {
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

  

  getcompany(company_id) {
    if (company_id == null) {
      return "COMMON";
    } else
      if (company_id == 1) {
        return "PVC";
      } else if (company_id == 2) {
        return "PE & PP";
      } else if (company_id == 3) {
        return "SURISHA";
      }
  }
  /**
  * For getting bank details of organization/employee.
  * and setting exisiting values to the form by using patch value.
  */
  createApp(item) {

    this.addBankDetailsForm.reset();
    this.beneficiary_bank_name = ((item.beneficiary_bank_name !== null) ? item.beneficiary_bank_name : '');
    this.beneficiary_account_no = ((item.beneficiary_account_no !== null) ? item.beneficiary_account_no : '');
    this.beneficiary_bank_ifsc = ((item.beneficiary_bank_ifsc !== null) ? item.beneficiary_bank_ifsc : '');
    this.beneficiary_branch_name = ((item.beneficiary_branch_name !== null) ? item.beneficiary_branch_name : '');
    this.beneficiary_account_name = ((item.beneficiary_account_name !== null) ? item.beneficiary_account_name : '');
    this.selectedRecord = item;
    this.crudServices.getOne<any>(Payables.bank_details_group_by_record, {
      sub_org_id: item.sub_org_id,
      emp_id: item.emp_id
    }).subscribe((response) => {
      if (item.paid_date !== null) {
        this.addBankDetailsForm.patchValue({
          paid_date: new Date(item.paid_date),
          ref_no: item.ref_no,
          neft_rtgs: item.neft_rtgs,
          account_type: item.account_type,
          cheque_no: item.cheque_no,
        });
      } else {
        this.addBankDetailsForm.patchValue({ paid_date: new Date() })
      }
      this.bank_list = response;

      this.myModal.show();
    });
  }
  /**
  * On submit we are creating formdata with form values as well as bank details from global variable which we are setting on radio button click.
  */
  onSubmit() {
    var data = {
      paid_date: this.datePipe.transform(this.addBankDetailsForm.value.paid_date, 'yyyy-MM-dd'),
      ref_no: this.addBankDetailsForm.value.ref_no,
      neft_rtgs: this.addBankDetailsForm.value.neft_rtgs,
      account_type: this.addBankDetailsForm.value.account_type,
      cheque_no: this.addBankDetailsForm.value.cheque_no,
      beneficiary_bank_name: this.beneficiary_bank_name,
      beneficiary_account_no: this.beneficiary_account_no,
      beneficiary_bank_ifsc: this.beneficiary_bank_ifsc,
      beneficiary_branch_name: this.beneficiary_branch_name,
      beneficiary_account_name: this.beneficiary_account_name,
      spipl_bank_id: this.selectedRecord.spipl_bank_id,
      emp_id: this.selectedRecord.emp_id,
      req_flag: this.selectedRecord.req_flag,
      sub_org_id: this.selectedRecord.sub_org_id,
      req_date: this.selectedRecord.req_date,
      id: this.selectedRecord.id,
    }

    if (this.beneficiary_account_name !== null && this.beneficiary_account_no !== null && this.beneficiary_account_name !== undefined && this.beneficiary_account_no !== undefined && this.beneficiary_account_name !== '' && this.beneficiary_account_no !== '') {
      this.crudServices.updateData<any>(Payables.update_process_payment_details, data).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.ngOnInit();
        this.myModal.hide();
      });
    } else {
      this.toasterService.pop('error', 'error', 'Please Select Beneficiary Bank');
    }
  }
  oncloseModal() {
    this.myModal.hide();
    this.updateRecordModal.hide();
  }
  /**
  * On (radio button click) selecting bank we are setting these global variable.
  */
  onBankSelect(item) {
    this.beneficiary_bank_name = item.bank_name;
    this.beneficiary_account_no = item.bank_account_no;
    this.beneficiary_bank_ifsc = item.ifsc_code;
    this.beneficiary_branch_name = item.bank_branch_name;
    this.beneficiary_account_name = item.beneficiary_name;
  }
  /**
  * Checking previously selected bank account details to show radio button as selected.
  */
  checkPastSelected(item) {
    if (item.bank_name === this.beneficiary_bank_name && item.bank_account_no === this.beneficiary_account_no && item.ifsc_code === this.beneficiary_bank_ifsc && item.bank_branch_name === this.beneficiary_branch_name && item.beneficiary_name === this.beneficiary_account_name) {
      return true;
    }
    return false;
  }

  // onChange(checked, item) {
  //   if (checked) {
  //     this.checkedList.push(item);
  //   } else {
  //     this.checkedList.splice(this.checkedList.indexOf(item), 1);
  //   }
  // }

 

  download() {
    if (this.checkedList.length) {
      let html_document = '';
      html_document = html_document + '<!DOCTYPE html>\
      <html>\
      <head>\
        <title></title>\
      </head>\
      <body>';
      for (let item of this.checkedList) {
        let category = '';
        if (item.neft_rtgs === 1) {
          category = 'NEFT';
        } else if (item.neft_rtgs === 2) {
          category = 'RTGS';
        }
        let account_type = '';
        if (item.account_type === 1) {
          account_type = 'CASH CREDIT';
        } else if (item.account_type === 2) {
          account_type = 'CURRENT';
        }

        html_document = html_document + '  <table align="center" cellpadding="0" cellspacing="0" style="width:700px">\
          <tbody>\
            <tr>\
              <td colspan="3">Date:&nbsp; ' + this.datePipe.transform(item.paid_date, 'dd-MM-yyyy') + '</td>\
            </tr>\
            <tr>\
              <td colspan="3">Ref No.&nbsp; ' + item.ref_no + '</td>\
            </tr>\
            <tr>\
              <td colspan="3">NEFT/RTGS:&nbsp; ' + category + '</td>\
            </tr>\
            <tr>\
              <td colspan="3">\
              <p>To,<br />\
              ' + item.spiplbank + ' <br /> ' + item.bank_address + '</p> <br />\
              </td>\
            </tr>\
            <tr>\
              <td colspan="3">Sub: Request for ' + category + ' from our ' + account_type + ' No. ' + item.account_no + '.</td>\
            </tr>\
            <tr>\
              <td colspan="3">Dear Sir,</td>\
            </tr>\
            <tr>\
              <td colspan="3">We kindly request you to debit our account towards under mentioned payments:</td>\
            </tr>\
            <tr>\
              <td colspan="3"><u><strong>Beneficiary&#39;s Details</strong></u></td>\
            </tr>\
            <tr>\
            <table border="1" class="Table">\
            <tbody>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">Name of the Bank &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></p>\
                </td>\
                <td>\
                <p><span style="font-size:13.0pt">=' + item.beneficiary_bank_name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">Branch Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><span style="font-size:13.0pt">=' + item.beneficiary_branch_name + ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">Name of the Beneficiary &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><span><strong><span style="font-size:13.0pt">=' + item.beneficiary_account_name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">Account No. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><span><strong><span style="font-size:13.0pt">=' + item.beneficiary_account_no + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">IFSC Code &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><span><strong><span style="font-size:13.0pt">=' + item.beneficiary_bank_ifsc + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">Amount &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><span><strong><span style="font-size:13.0pt">=' + this.inrCurrencyPipe.transform(item.paidAmount) + '=00 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">In Words &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><span style="font-size:13.0pt">=' + this.inWords(item.paidAmount) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
              </tr>\
              <tr>\
                <td>\
                <p><span style="font-size:13.0pt">Chq.No. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>\
                </td>\
                <td>\
                <p><strong><span style="font-size:13.0pt">= ' + item.cheque_no + ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></p>\
                </td>\
              </tr>\
            </tbody>\
          </table>\
          </tr>\
          </tbody>\
        </table>\
        <br style=\"page-break-after: always; clear:both;\" >\
       ';
      }

      html_document = html_document + ' </body>\
      </html>';

      const converted = htmlDocx.asBlob(html_document, { orientation: 'portrait' });
      saveAs(converted, 'Payment Application-' + new Date() + '.docx');
      this.uncheckAll()
    }


  }

  /**
  * To convert number to word we are using this function.
  */
  inWords(num) {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if ((num = num.toString()).length > 9) { return 'overflow'; }
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) { return; } let str = '';
    str += (n[1] !== '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] !== '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] !== '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] !== '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
  }
  /**
  * To update UTR No. we are using this method.
  */

  update() {
    // let event, item , field;
    const item = this.selectedRecord;
    // if (confirm('Are you sure to update record?')) {
      let newRequest = {};

      if (item.reqAmount > this.updateUtrAmount.value.amount) {
        let amt = item.reqAmount - this.updateUtrAmount.value.amount;
        newRequest = {
          sub_org_id: item.sub_org_id,
          req_date: item.req_date,
          req_amount: amt,
          req_flag: item.req_flag,
          record_id: item.record_id,
          advanced_agnst_bill: item.advanced_agnst_bill,
          normal_priority: item.normal_priority,
          remark: item.remark,
          request_status: item.request_status,
          application_status: item.application_status,
          invoice_no: item.invoice_no,
          added_by: item.added_by,
          added_date: item.added_date,

        }
      }

      let data = {
        utr_no: this.updateUtrAmount.value.utr_no,
        spipl_bank_id: item.spipl_bank_id,
        sub_org_id: item.sub_org_id,
        req_flag: item.req_flag,
        emp_id: item.emp_id,
        req_date: item.req_date,
        application_status: item.application_status,
        id: item.id,
        record_id: item.record_id,
        paidAmount: this.updateUtrAmount.value.amount
      }

      this.crudServices.updateData<any>(Payables.update_utr_no, { data: data, newRequest: newRequest }).subscribe((response) => {
        this.updateUtrAmount.reset();
        this.oncloseModal();
        this.getData();
        this.toasterService.pop(response.message, response.message, response.data);
      });

    // }
  }

  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.filteredValuess = event.filteredValue;
    this.totalReq = this.filteredValuess.reduce((prev, next) => prev + Number(next.reqAmount), 0);
    this.totalPaid = this.filteredValuess.reduce((prev, next) => prev + Number(next.paidAmount), 0);
    this.footerTotal(dt.filteredValue);
  }

  onCheckAll(checked) {
    let arr = [];
    if (this.filteredValuess.length) {
      arr = this.filteredValuess;
    } else {
      arr = this.processPaymentList;
    }


    if (checked) {
      this.inputs.forEach(check => {
        check.nativeElement.checked = true;
      });
      for (const val of arr) {
        // this.item.push(val);
        if (val.application_status == 1 && val.paid_date != null && val.account_type != null && val.cheque_no != null) {
          this.onChange(true, val);
        }

      }

    } else {
      this.inputs.forEach(check => {
        check.nativeElement.checked = false;
      });
      for (const val of arr) {
        // this.item.splice(this.item.indexOf(val), 1);
        this.onChange(false, val);
      }
    }

    // this.onChange(true, this.item);




  }

  // uncheck all checkbox
  uncheckAll() {
    this.checkedList = [];
    this.inputs.forEach(check => {
      check.nativeElement.checked = false;
    });
  }



}
