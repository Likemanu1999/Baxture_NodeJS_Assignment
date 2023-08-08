import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { GenerateSoPvcService } from '../../../shared/generate-doc/generate-so-pvc';
import { CurrencyPipe } from '@angular/common';
import { Calculations } from "../../../shared/calculations/calculations";
import { staticValues, roundAmount, roundQuantity, CommonService } from '../../../shared/common-service/common-service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
  dealOffer,
  SubOrg,
  UsersNotification,
  EmailTemplateMaster
} from '../../../shared/apis-path/apis-path';
import { Table } from "primeng/table";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-deal-launcher',
  templateUrl: './deal-launcher.component.html',
  styleUrls: ['./deal-launcher.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    CrudServices,
    ToasterService,
    PermissionService,
    ExportService,
    AmountToWordPipe,
    CurrencyPipe,
    Calculations,
    CommonService,
    GenerateSoPvcService
  ]
})
export class DealLauncherComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("whatsappModal", { static: false }) public whatsappModal: ModalDirective;

  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  @ViewChild("sendMailModal", { static: false })
  public sendMailModal: ModalDirective;
  selectedCCEmails: any = [];
  page_title: any = "Deal Launcher";
  cols: any = [];
  filter: any = [];
  user: UserDetails;
  notification_id_users = [];
  selectedMobileNo = [];
  data: any[];
  isLoading: boolean;
  whatsapp: boolean;
  checked: any = [];
  currentDate: Date;
  offerList: any;
  selectOffer: string = null;
  selectedOffer: any = null;
  selectedContacts: any;
  selectedEmails: any;
  selectedAction: string = null;
  template: string;
  subject: string;
  from: string;
  footer: string;
  constructor(
    private toasterService: ToasterService,
    private loginService: LoginService,
    private crudServices: CrudServices,
    private exportService: ExportService,
  ) {
    this.user = this.loginService.getUserDetails();
  }

  ngOnInit() {
    this.currentDate = new Date(moment().format("YYYY-MM-DD"));
    this.getCols();
  }

  getStatus(product_type: number) {
    return product_type == 1 ? "PVC" : "PE & PP";
  }

  onAction(event, type, channel) {
    if (type == 'Check_All') {
      if (event) {
        this.checked = (this.table.filteredValue) ? this.table.filteredValue : this.data;
      } else {
        this.checked = [];
      }
    }
    if (type == 'Transfer') {
      if (channel == 'whatsapp') {
        this.selectedContacts = this.checked.map(record => `+${record.country_code} ${record.contact_no}`);
        this.selectedAction = channel;
        this.whatsappModal.show();
      } else if (channel == 'email') {
        this.selectedEmails = this.checked.map(record => record.emailId);
        this.selectedEmails = this.selectedEmails.filter((element, index) => {
          return this.selectedEmails.indexOf(element) === index && element != '';
        });
        this.selectedAction = channel;
        this.getTemplate();
        this.sendMailModal.show();
      }


    }
    if (type == 'offer') {
      this.selectedOffer = event.value;
    }
  }
  getTemplate() {
    this.template = '';
    this.subject = '';
    this.from = '';
    this.footer = '';
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'deal_offer' }).subscribe(response => {
      this.template = response[0].custom_html;
      this.subject = response[0].subject;
      this.from = response[0].from_name;
    })

    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.footer = response[0].custom_html;
    })
  }

  getData() {
    this.data = [];
    this.isLoading = true;
    let payload: any = "";
    this.crudServices.getOne<any>(dealOffer.getDealLauncherData, payload).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.data = res.data;
        } else {
          this.toasterService.pop('error', 'Alert', 'No Data Found..!');
        }
        this.pushDropdown(this.data);
        this.footerTotal(this.data);
      }
      this.table.reset();
    });

    let condition = {
      from_date: new Date(moment().format("YYYY-MM-DD"))
    }

    this.crudServices.getOne<any>(dealOffer.getAll, condition).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.offerList = res.data;
        }
      }
    });
  }

  onFilter(e, dt) {
    this.footerTotal(dt.filteredValue);
  }

  SendMessage() {
    const sendHeads = [this.selectedOffer.offer_id, this.selectedOffer.supplier, this.selectedOffer.grade_name, this.selectedOffer.name, this.selectedOffer.information, this.selectedOffer.sector, this.selectedOffer.quantity, this.selectedOffer.portName, this.selectedOffer.arrival, this.selectedOffer.term, this.selectedOffer.offer_rate, '6:00 PM Today'];   
    if (this.selectedContacts.length) {
      this.crudServices.postRequest<any>(SubOrg.virtualAccUpdateWhatsapp, [{
        "template_name": 'deal_offers_surisha',
        "locale": "en",
        "numbers": this.selectedContacts,
        "params": sendHeads,
        "company_id": 3
      }
      ]).subscribe(res => {
        this.selectOffer = null;
        this.checked = [];
        this.selectedContacts = [];
        this.toasterService.pop('success', 'success', 'Whatsapp Send');
        this.whatsappModal.hide();
      })
    }
  }

  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    let filter_cols = this.cols.filter(col => col.filter == true);
    filter_cols.forEach(element => {
      let unique = data.map(item =>
        item[element.field]
      ).filter((value, index, self) =>
        self.indexOf(value) === index
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

  getColumnPresent(col) {
    if (this.cols.find((ob) => ob.field === col)) {
      return true;
    } else {
      return false;
    }
  }

  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    this.footerTotal(this.data);
  }



  getCols() {
    this.cols = [
      { field: "", header: "", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Check", style: '5%' },
      { field: "person_name", header: "Person Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "sub_org_name", header: "Sub Org", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "emailId", header: "Email ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "contact_no", header: "Contact Number", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "designation", header: "Designation", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "product_tags", header: "Product Tags", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
      { field: "categories", header: "Categories", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '10%' },
    ];

    this.filter = ['sub_org_name', 'person_name', 'product_tags', 'port_name', 'categories'];
    this.getData();
  }


  footerTotal(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    let filter_cols = this.cols.filter(col => col.footer == true);
    filter_cols.forEach(element => {
      if (data.length > 0) {
        let total = data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        element.total = total;
      } else {
        element.total = 0;
      }

    });
  }

  exportData(type) {
    let final_data = null;
    if (this.table.filteredValue == null) {
      final_data = this.data;
    } else {
      final_data = this.table.filteredValue;
    }
    let fileName = this.page_title + ' ' + moment().format('DD-MM-YYYY');
    let exportData = [];
    for (let i = 0; i < final_data.length; i++) {
      let obj = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["field"] != "action") {
          if (this.cols[j]["field"] == "quantity") {
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
          } else {
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
          }
        }
      }
      exportData.push(obj);
    }
    let foot = {};
    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]["field"] != "action") {
        if (this.cols[j]["field"] == "quantity") {
          foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
        } else if (this.cols[j]["field"] == "deal_rate" ||
          this.cols[j]["field"] == "freight_rate") {
          foot[this.cols[j]["header"]] = this.cols[j]["total"];
        } else {
          foot[this.cols[j]["header"]] = "";
        }
      }
    }

    exportData.push(foot);
    if (type == 'Excel') {
      this.exportService.exportExcel(exportData, fileName);
    } else {
      let exportColumns = this.cols.map(function (col) {
        if (col.field != "action") {
          return { title: col.header, dataKey: col.header }
        }
      });
      this.exportService.exportPdf(exportColumns, exportData, fileName);
    }
  }

  closeModal() {
    this.sendMailModal.hide();
  }

  compose_mail() {
    if (this.selectOffer != null) {
        if (this.selectedEmails != null && this.selectedEmails != undefined && this.selectedEmails != '') {
          let to = [];
          let cc = [];
          let attachment = [];
          let html = '';
          if (this.selectedEmails) {
            to = this.selectedEmails;
          }

          if (this.selectedCCEmails) {
            cc = this.selectedCCEmails;
          }

          // let arr = { 'from': this.from, 'to': to, 'cc': cc, 'subject': this.subject, 'html': html6 };

          // this.crudServices.postRequest<any>(Payables.sendEmailPayment, { mail_object: arr }).subscribe(response => {
          //   this.toasterService.pop(response.message, response.message, response.data);
          //   this.sendMailModal.hide();
          // })

        } else {
          this.toasterService.pop('warning', 'warning', 'Enter Email Address ');
        }
    }
  }
}
