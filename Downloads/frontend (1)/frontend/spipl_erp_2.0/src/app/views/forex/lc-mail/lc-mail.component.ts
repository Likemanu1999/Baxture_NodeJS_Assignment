import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { EmailTemplateMaster, NonNegotiable, PortMaster, ProformaInvoice } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-lc-mail',
  templateUrl: './lc-mail.component.html',
  styleUrls: ['./lc-mail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices

  ]
})
export class LcMailComponent implements OnInit {
  cols: { field: string; header: string; style: string; }[];
  @ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
  bsRangeValue: any = [];
  date = new Date();
  currentYear: number;
  list = [];
  checkedList = [];

  mailList = [];

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });


  @ViewChild("sendMailModal", { static: false })
  public sendMailModal: ModalDirective;
  tomailtext: string;
  tomail = [];
  ccmailtext: string;
  ccMail = [];
  footer: string;
  from: string;
  subject: string;
  template: string;
  fromInvoiceDate: string;
  toInvoiceDate: string;
  port_list = [];
  port: any;
  globalList = [];
  email = [];
  isLoaderEmail: boolean;

  constructor(private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe, private crudServices: CrudServices) {

    this.cols = [
      { field: 'id', header: 'Id', style: '60' },
      { field: 'port_name', header: 'Port Name', style: '200' },
      { field: 'proform_invoice_date', header: 'PI  Date', style: '200' },
      { field: 'bank_lc_no', header: 'Bank Lc/TT Number', style: '200' },
      { field: 'proform_invoice_no', header: 'Invoice Number', style: '200' }
    ];


    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }

    this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
      this.port_list = response;
      this.port = this.port_list[0].id;
      //	console.log(response);
    })

  }

  ngOnInit() {

  }

  getData() {
    this.list = [];
    this.crudServices.getOne<any>(ProformaInvoice.getPiForLcMail, { fromdate: this.fromInvoiceDate, todate: this.toInvoiceDate }).subscribe(response => {
      console.log(response, 'DEBUG_VIEW');
      this.list = response.data;
      this.globalList = response.data;

    })
  }

  onDateChange(event) {
    if (event == null) {
      this.fromInvoiceDate = '';
      this.toInvoiceDate = '';
    }

    if (event) {
      this.fromInvoiceDate = event[0];
      this.toInvoiceDate = event[1];
    }

    this.getData();
  }

  onSelectPort($e) {
    this.list = this.globalList;
    this.port = $e;

    if (this.port && this.port != null) {
      this.list = this.list.filter(data => data.destination_port_id == this.port);
    } else {
      this.list = this.globalList;
    }
  }
  onCheckAll(checked) {
    let arr = [];
    arr = this.list;

    if (checked) {
      this.inputs.forEach(check => {
        check.nativeElement.checked = true;
      });
      for (const val of arr) {
        // this.item.push(val);
        this.onChange(true, val);
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


  onChange(checked, item) {
    if (checked) {
      this.checkedList.push(item);

    } else {
      this.checkedList.splice(this.checkedList.indexOf(item), 1);

    }
    console.log(this.checkedList);
  }

  sendMail() {
    this.email = [];
    let status = false;
    if (this.checkedList.length > 0) {
      for (let i = 0; i < this.checkedList.length; i++) {
        if (this.checkedList[0].destination_port_id == this.checkedList[i].destination_port_id) {
          status = true;
        } else {
          status = false;
          break;
        }

      }
    }
    console.log(status);
    if (status && this.checkedList.length) {
      this.getTemplate();
      this.email = this.checkedList[0].cha_email;
      this.mailList = this.checkedList;
      // const files = JSON.parse( this.mailList[i]['letter_of_credit']['lc_copy_path']);
      this.sendMailModal.show();
    } else {
      this.toasterService.pop('warning', 'warning', 'Please select Proper LC  ');
      this.uncheckAll();
    }
  }

  // set mail variable for to and cc
  mailto(check, val) {
    // console.log(check);
    this.tomailtext = '';
    if (check) {
      this.tomail.push(val);
    } else {
      this.tomail.splice(this.tomail.indexOf(val), 1);
    }

    for (let i = 0; i < this.tomail.length; i++) {
      this.tomailtext = this.tomailtext + this.tomail[i] + ',';
    }
    // console.log(this.tomail);
  }
  ccmail(check, val) {
    // console.log(check);
    this.ccmailtext = '';
    if (check) {
      this.ccMail.push(val);
    } else {
      this.ccMail.splice(this.ccMail.indexOf(val), 1);
    }

    // console.log( this.ccMail);
    for (let i = 0; i < this.ccMail.length; i++) {
      this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
    }

  }

  ccmailvalue($e) {
    this.ccmailtext = $e.target.value;
    //  console.log(this.ccmailtext);
  }

  tomailvalue($e) {
    this.tomailtext = $e.target.value;
    // console.log(this.tomailtext);
  }

  // close all open modal with data clear
  closeModal() {
    //	this.backToList();
    this.tomail = [];
    this.ccMail = [];
    this.ccmailtext = '';
    this.tomailtext = '';
    this.checkedList = [];
    this.mailList = [];
    this.sendMailModal.hide();
    this.uncheckAll();
  }

  // uncheck all checkbox

  uncheckAll() {
    this.mailList = [];
    this.checkedList = [];
    this.inputs.forEach(check => {
      check.nativeElement.checked = false;
    });
  }

  getTemplate() {
    this.template = '';
    this.subject = '';
    this.from = '';
    this.footer = '';
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'LC Mail' }).subscribe(response => {
      this.template = response[0].custom_html;
      this.subject = response[0].subject;
      this.from = response[0].from_name;
    })

    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.footer = response[0].custom_html;

    })
  }

  compose_mail() {
    if (this.checkedList.length > 0) {
      this.isLoaderEmail = true;
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
        for (let i = 0; i < this.mailList.length; i++) {
          const re = /{LC_NO}/gi;
          this.subject = this.subject.replace(re, this.mailList[i].letter_of_credit.bank_lc_no);
          if (this.mailList[i]['letter_of_credit']['lc_copy_path'] != null) {
            const files = JSON.parse(this.mailList[i]['letter_of_credit']['lc_copy_path']);
            for (let j = 0; j < files.length; j++) {
              const test = files[j].split('/');
              attachment.push({ 'filename': test[4], 'path': files[j] });
            }
          }
        }
        console.log(attachment);
        let html2 = '';
        html2 = this.template + this.footer;
        let arr = { 'from': this.from, 'to': to, 'cc': cc, 'subject': this.subject, 'html': html2, 'attachments': attachment };
        console.log(arr);
        this.crudServices.postRequest<any>(NonNegotiable.sendEmailLc, { mail_object: arr }).subscribe(response => {
          this.isLoaderEmail = false;
          this.toasterService.pop(response.message, response.message, response.data);
          this.closeModal();
        })
      } else {
        this.toasterService.pop('warning', 'warning', 'Enter Email Address ');
      }
    }
  }
  docArray(doc) {
    return JSON.parse(doc);
  }
  fileName(value) {
    const test = value.split('/');
    return test[4];

  }
}