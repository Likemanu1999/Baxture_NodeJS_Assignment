import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
import { UserDetails } from '../../../login/UserDetails.model';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { EmailTemplateMaster, LocalPurchase, Payables, SubOrg } from '../../../../shared/apis-path/apis-path';
import { ModalDirective } from 'ngx-bootstrap';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import * as moment from "moment";
import { staticValues } from '../../../../shared/common-service/common-service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-past-payments-list',
  templateUrl: './past-payments-list.component.html',
  styleUrls: ['./past-payments-list.component.scss'],
  providers: [DatePipe, ExportService, PermissionService, LoginService, CrudServices, ToasterService],
  encapsulation: ViewEncapsulation.None
})
export class PastPaymentsListComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];

  @ViewChild("sendMailModal", { static: false })
  public sendMailModal: ModalDirective;
  @ViewChild('UpdateUtrModal', { static: false }) public UpdateUtrModal: ModalDirective;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });


  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'right';
  public closeOnOutsideClick: boolean = true;
  statusList: any = staticValues.Utr_Payment;
  selected_status: any = this.statusList[1];
  tomailtext: string;
  tomail = [];
  ccmailtext: string;
  ccMail = [];
  footer: string;
  from: string;
  subject: string;
  template: string;

  _selectedColumns: any[];
  isLoading: boolean = false;
  pastPaymentList: any[];
  cols: { field: string; header: string; style: string }[];
  lookup = {};
  supplier_list = [];
  lookup_bank = {};
  Bank_list = [];
  lookup_category = {};
  category_list = [];
  lookup_beneficiary_bank_name = {};
  beneficiary_bank_name_list = [];
  bsRangeValue = [];
  fromdate: string;
  todate: string;
  // fromDate: Date;
  // toDate: Date;
  utr_no : number = null;
  added_date: string;
  approved_date: string;
  proceed_date: string;
  paid_date: string;
  totalPaidAmt: number;
  filteredValuess: any[];
  export_purchase_list = [];
  exportColumns: { title: any; dataKey: any; }[];
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  excel_download: boolean = false;
  pdf_download: boolean = false;
  user: UserDetails;
  links: string[] = [];
  checkedList: any;
  email = [];
  invoice_no: any;
  isLoaderEmail: boolean;
  numbers = [];
  mail: boolean;
  whatsapp: boolean;
  sub_org: any;
  emp: string;
  whatsap_send: boolean;
  mail_send: boolean;
  complete_list: boolean;
  delete_payable: boolean;
  company_id: any;
  company: { label: string; id: number; }[];
  currentYear: number;
  date = new Date();
  approveArr = [];
  lookup_approve = {};
  lookupReq = {};
  requestArr = [];
  // fromDate:any;
  // todate:any;
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  currenRecord: any;
  utrForm: FormGroup;





  constructor(private datePipe: DatePipe, private exportService: ExportService, private permissionService: PermissionService, private crudServices: CrudServices,
    private toasterService: ToasterService,
    private loginService: LoginService, private datepipe: DatePipe) {

    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.excel_download = (this.links.indexOf('Excel Export Past Payment') > -1);
    this.pdf_download = (this.links.indexOf('Pdf past Payment List') > -1);
    this.mail_send = (this.links.indexOf('Payment Details Mail') > -1);
    this.whatsap_send = (this.links.indexOf('Payment Details Whatsapp') > -1);
    this.complete_list = (this.links.indexOf('Past Payment Complete List') > -1);
    this.delete_payable = (this.links.indexOf('Past Payment Delete') > -1);

    this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }];
    this.company_id = this.user.userDet[0].company_id;

    this.cols = [
      { field: 'id', header: 'Req.No.', style: '100px' },
      { field: 'record_id', header: 'Reference ID', style: '200px' },
      { field: 'category', header: 'Category.', style: '200px' },
      { field: 'org_emp_name', header: 'Beneficiary', style: '200px' },
      { field: 'spiplbank', header: 'Bank', style: '200px' },
      { field: 'paid_amount', header: 'Paid Amount', style: '200px' },
      { field: 'paid_date', header: 'Paid Date', style: '200px' },
      { field: 'added_by_name', header: 'Request By', style: '200px' },
      { field: 'added_date', header: 'Added Date', style: '200px' },
      { field: 'approved_by_name', header: 'Approve By', style: '200px' },
      { field: 'approved_date', header: 'Approve Date', style: '200px' },
      { field: 'utr_no', header: 'UTR No', style: '200px' },
      { field: 'proceed_date', header: 'Proceed Date', style: '200px' },
      { field: 'advanced_agnst_bill', header: 'Payment Type', style: '200px' },
      { field: 'normal_priority', header: 'Priority', style: '200px' },
      { field: 'beneficiary_bank_name', header: 'Beneficiary Bank Name', style: '200px' },
      { field: 'beneficiary_account_no', header: 'Beneficiary Account Number', style: '200px' },
      { field: 'beneficiary_bank_ifsc', header: 'Beneficiary Bank IFSC', style: '200px' },
      { field: 'cheque_no', header: 'Cheque No', style: '200px' },
      { field: 'remark', header: 'Remark', style: '200px' },
      { field: 'ref_no', header: 'Ref No', style: '200px' },
      { field: 'neft_rtgs', header: 'NEFT/RTGS', style: '200px' },
    ];

    this.utrForm = new FormGroup({

      'utr': new FormControl(null, Validators.required),
      'paidAmount': new FormControl(null, Validators.required)
    });
    
    if (localStorage.getItem('selected_col_past_payment')) {
      this._selectedColumns = JSON.parse(localStorage.getItem('selected_col_past_payment'));
    } else {
      this._selectedColumns = this.cols;
    }

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    this.bsRangeValue = [this.selected_date_range[0], this.selected_date_range[1]];

    // if (this.datepipe.transform(this.date, 'MM') > '03') {
    //   this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    // } else {
    //   this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    // }



  }

  onchangeDate() {
    if (this.bsRangeValue[0]) {
      this.fromdate = this.datePipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
      this.todate = this.datePipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
      this.getPastPaymentList();
    }
  }

  receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.bsRangeValue = dateValue.range;
		
	}
	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}

  onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.onchangeDate();
		}
	}

  ngOnInit() {

    // this.fromdate = '';
    // this.todate = '';
    // this.getPastPaymentList();
    this.fromdate = this.selected_date_range[0],
      this.todate = this.selected_date_range[1]
  }

  getPastPaymentList() {
    this.isLoading = true;
    this.totalPaidAmt = 0;
    let listType = 0;

    if (this.complete_list == false) {
      listType = 1;
    }
    this.crudServices.getOne<any>(Payables.past_payment_list, {
      paid_date_from: this.fromdate,
      paid_date_to: this.todate,
      listType: listType,
      company_id: this.company_id,
      status: this.selected_status.id
    }).subscribe(response => {

      this.isLoading = false;

      if (response.length) {

        this.pastPaymentList = response.map(item => {
          item.categoryName = item.category
          item.category = item.category + ' (' + item.record_id + ') ';
          item.added_date = this.datePipe.transform(item.added_date, 'dd-MM-yyyy')
          item.approved_date = this.datePipe.transform(item.approved_date, 'dd-MM-yyyy')
          item.proceed_date = this.datePipe.transform(item.proceed_date, 'dd-MM-yyyy')
          item.paid_date = this.datePipe.transform(item.paid_date, 'dd-MM-yyyy')
          item.normal_priority = this.getPriorityText(item.normal_priority)
          item.neft_rtgs = this.getNeftRtgsText(item.neft_rtgs)
          item.advanced_agnst_bill = this.getRequestText(item.advanced_agnst_bill)
          return item
        });
        this.filteredValuess = response;

        this.totalPaidAmt = response.reduce((sum, item) => sum + item.paid_amount, 0);



        for (let item, i = 0; item = response[i++];) {
          // this.totalPaidAmt = this.totalPaidAmt + item.paid_amount;
          if (!(item.org_emp_name in this.lookup)) {
            this.lookup[item.org_emp_name] = 1;
            this.supplier_list.push({ 'org_emp_name': item.org_emp_name });
          }

          if (!(item.spiplbank in this.lookup_bank)) {
            this.lookup_bank[item.spiplbank] = 1;
            this.Bank_list.push({ 'spiplbank': item.spiplbank });
          }

          if (!(item.categoryName in this.lookup_category)) {
            this.lookup_category[item.categoryName] = 1;
            this.category_list.push({ 'categoryName': item.categoryName });
          }

          if (!(item.added_by_name in this.lookupReq)) {
            this.lookupReq[item.added_by_name] = 1;
            this.requestArr.push({ 'added_by_name': item.added_by_name });
          }

          if (!(item.approved_by_name in this.lookup_approve)) {
            this.lookup_approve[item.approved_by_name] = 1;
            this.approveArr.push({ 'approved_by_name': item.approved_by_name });
          }


          if (!(item.beneficiary_bank_name in this.lookup_beneficiary_bank_name)) {
            this.lookup_beneficiary_bank_name[item.beneficiary_bank_name] = 1;
            this.beneficiary_bank_name_list.push({ 'beneficiary_bank_name': item.beneficiary_bank_name });
          }
        }

      }




    });

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

  getNeftRtgsText(val) {
    if (val === 1) {
      return 'NEFT';
    } else if (val === 2) {
      return 'RTGS';
    }
  }

  update() {
    
        let newRequest = {};
        newRequest = {
          sub_org_id: this.currenRecord.sub_org_id,
          req_date: this.currenRecord.req_date,
          // req_amount: this.utrForm.value.paidAmount,
          req_flag: this.currenRecord.req_flag,
          record_id: this.currenRecord.record_id,
          advanced_agnst_bill: this.currenRecord.advanced_agnst_bill,
          normal_priority: this.currenRecord.normal_priority,
          remark: this.currenRecord.remark,
          request_status: this.currenRecord.request_status,
          application_status: this.currenRecord.application_status,
          invoice_no: this.currenRecord.invoice_no,
          added_by: this.currenRecord.added_by,
          added_date: this.currenRecord.added_date,
          paid_date: this.currenRecord.req_date
        }
      

      let data = {
        utr_no: this.utrForm.value.utr,
        spipl_bank_id: this.currenRecord.spipl_bank_id,
        sub_org_id: this.currenRecord.sub_org_id,
        req_flag: this.currenRecord.req_flag,
        emp_id: this.currenRecord.emp_id,
        req_date: this.currenRecord.req_date,
        application_status: this.currenRecord.application_status,
        id: this.currenRecord.id,
        record_id: this.currenRecord.record_id,
        paidAmount: this.utrForm.value.paidAmount
      }

      console.log('Are you sure to update record?',this.currenRecord , newRequest );
      this.crudServices.updateData<any>(Payables.update_utr_no, { data: data, newRequest: newRequest }).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
      });
    // }
  }

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


  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
  }

  convert(date) {
    if (date) {
      return this.datePipe.transform(date, 'yyyy-MM-dd');
    } else {
      return '';
    }
  }


  onRefresh() {
    this.bsRangeValue = [];
    this.fromdate = '';
    this.todate = '';
    this.getPastPaymentList();
  }



  // call on each filter set local storage for colums
  @Input() get selectedColumns(): any[] {
    localStorage.setItem('selected_col_past_payment', JSON.stringify(this._selectedColumns));
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }

  getColumnPresent(name) {
    if (this._selectedColumns.find(ob => ob['field'] === name)) {
      return true;
    } else {
      return false;
    }
  }

  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.totalPaidAmt = 0;
    this.filteredValuess = event.filteredValue;
    this.totalPaidAmt = this.filteredValuess.reduce((sum, item) => sum + item.paid_amount, 0);
  }


  // data exported for pdf excel download
  exportData() {

    let arr = [];
    const foot = {};
    if (this.filteredValuess !== undefined && this.filteredValuess.length) {
      arr = this.filteredValuess;
    } else {
      arr = this.pastPaymentList;
    }
    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < this._selectedColumns.length; j++) {
        export_data[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];

      }
      this.export_purchase_list.push(export_data);


    }

    for (let j = 0; j < this._selectedColumns.length; j++) {
      if (this._selectedColumns[j]['field'] === 'paid_amount') {
        foot[this._selectedColumns[j]['header']] = this.totalPaidAmt;

      } else {
        foot[this._selectedColumns[j]['header']] = '';
      }
    }

    this.export_purchase_list.push(foot);



  }

  // download doc ,pdf , excel

  exportPdf() {
    this.export_purchase_list = [];
    this.exportData();
    this.exportColumns = this._selectedColumns.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(this.exportColumns, this.export_purchase_list, 'Payment-History');
  }

  exportExcel() {
    this.export_purchase_list = [];
    this.exportData();
    this.exportService.exportExcel(this.export_purchase_list, 'Payment-History');
  }

  UpdateUtr(item) {
    this.currenRecord = item;
    this.UpdateUtrModal.show();
  }

  openMail(item) {
    this.email = [];
    this.invoice_no = item.invoice_no;
    this.sub_org = item.sub_org_master != null ? item.sub_org_master.sub_org_name : '';
    this.emp = item.emp != null ? `${item.emp.first_name}  ${item.emp.last_name}` : '';
    this.mail = true;
    this.crudServices.getOne<any>(SubOrg.getSubOrgByContactEmail, { supplier_id: item.sub_org_id }).subscribe(res => {
      if (res) {

        this.email = res.email;
        // for (let email of res) {
        //   if (email.org_contact_emails != null) {
        //     for (let mail of email.org_contact_emails) {
        //       this.email.push(mail.email_id);
        //     }
        //   }
        // }
      }



    })
    this.checkedList = item;
    this.getTemplate();

    this.sendMailModal.show();

  }

  openWhatsapp(item) {
    this.numbers = [];
    this.whatsapp = true;
    this.sub_org = item.sub_org_master != null ? item.sub_org_master.sub_org_name : '';
    this.emp = item.emp != null ? `${item.emp.first_name}  ${item.emp.last_name}` : '';
    this.invoice_no = item.invoice_no;
    this.crudServices.getOne<any>(SubOrg.getSubOrgByContactEmail, { supplier_id: item.sub_org_id }).subscribe(res => {
      if (res) {

        this.numbers = res.number;
        // for (let email of res) {
        //   if (email.org_contact_emails != null) {
        //     for (let mail of email.org_contact_emails) {
        //       this.email.push(mail.email_id);
        //     }
        //   }
        // }
      }
      // if (res) {

      //     for (let contact of res) {
      //       if (contact.org_contact_numbers != null) {
      //         for (let numbers of contact.org_contact_numbers) {
      //           this.numbers.push(numbers.contact_no);
      //         }
      //       }

      //   }
      // }
    })
    this.checkedList = item;

    this.sendMailModal.show();

  }

  // set mail variable for to and cc
  mailto(check, val) {
    this.tomailtext = '';
    if (check) {
      this.tomail.push(val);
    } else {
      this.tomail.splice(this.tomail.indexOf(val), 1);
    }

    for (let i = 0; i < this.tomail.length; i++) {
      this.tomailtext = this.tomailtext + this.tomail[i] + ',';
    }
  }
  ccmail(check, val) {
    this.ccmailtext = '';
    if (check) {
      this.ccMail.push(val);
    } else {
      this.ccMail.splice(this.ccMail.indexOf(val), 1);
    }

    for (let i = 0; i < this.ccMail.length; i++) {
      this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
    }

  }

  ccmailvalue($e) {
    this.ccmailtext = $e.target.value;
  }

  tomailvalue($e) {
    this.tomailtext = $e.target.value;
  }

  // close all open modal with data clear
  closeModal() {
    //	this.backToList();
    this.tomail = [];
    this.ccMail = [];
    this.ccmailtext = '';
    this.tomailtext = '';
    this.checkedList = undefined;

    this.email = [];
    this.numbers = [];
    this.whatsapp = false;
    this.mail = false;


    this.sendMailModal.hide();
    this.sub_org = '';
    this.emp = '';

    //this.getPastPaymentList();

  }

  getTemplate() {
    this.template = '';
    this.subject = '';
    this.from = '';
    this.footer = '';
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Payment Done Mail' }).subscribe(response => {

      this.template = response[0].custom_html;
      this.subject = response[0].subject;
      this.from = response[0].from_name;
    })

    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.footer = response[0].custom_html;

    })
  }

  compose_mail() {
    if (this.checkedList != undefined) {
      this.isLoaderEmail = true;

      if (this.mail) {
        if (this.tomailtext != null && this.tomailtext != undefined && this.tomailtext != '') {
          let to = [];
          let cc = [];
          let attachment = [];
          let html = '';
          if (this.tomailtext) {
            to = this.tomailtext.split(",");
          }

          if (this.ccmailtext) {
            cc = this.ccmailtext.split(",");
          }

          const re = /{SUB_ORG}/gi;

          if (this.sub_org != '') {
            this.subject = this.subject.replace(re, this.sub_org);

          }

          if (this.emp != '') {
            this.subject = this.subject.replace(re, this.emp);

          }



          const PAID_AMT = /{PAID_AMT}/gi;
          const PAID_DATE = /{PAID_DATE}/gi;
          const UTR_NO = /{UTR_NO}/gi;
          const INVOICE_NO = /{INVOICE_NO}/gi;
          let html2 = this.template.replace(PAID_AMT, this.checkedList.paid_amount);
          let html3 = html2.replace(PAID_DATE, this.checkedList.paid_date);
          let html4 = html3.replace(UTR_NO, this.checkedList.utr_no);
          let html5 = html4.replace(INVOICE_NO, this.invoice_no);




          let html6 = '';

          html6 = html5 + this.footer;


          let arr = { 'from': this.from, 'to': to, 'cc': cc, 'subject': this.subject, 'html': html6 };

          this.crudServices.postRequest<any>(Payables.sendEmailPayment, { mail_object: arr }).subscribe(response => {
            this.isLoaderEmail = false;
            this.toasterService.pop(response.message, response.message, response.data);
            this.closeModal();
          })



        } else {
          this.toasterService.pop('warning', 'warning', 'Enter Email Address ');
        }
      }


      if (this.whatsapp) {
        if (this.tomailtext != null && this.tomailtext != undefined && this.tomailtext != '') {
          let to = [];

          if (this.tomailtext) {
            to = this.tomailtext.split(",");
          }

          let sendHeads = [this.checkedList.paid_amount, this.checkedList.utr_no]


          this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [
            {
              "template_name": "payment_request_common",
              "locale": "en",
              "numbers": to,
              "params": sendHeads
            }
          ]).subscribe(res => {
            this.toasterService.pop('success', 'success', 'Sent');
            this.closeModal();

          })



        } else {
          this.toasterService.pop('warning', 'warning', 'Enter Numbers ');
        }
      }


    }
  }

  onDelete(item) {

    this.crudServices.deleteData<any>(Payables.deleteRequest, { id: item.id, req_flag: item.req_flag, record_id: item.record_id }).subscribe(response => {
      this.toasterService.pop(response.message, response.message, response.data);
      this.getPastPaymentList();

    })
  }
}
