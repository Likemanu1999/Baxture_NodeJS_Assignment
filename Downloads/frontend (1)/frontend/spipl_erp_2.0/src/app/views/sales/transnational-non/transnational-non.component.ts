import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ElementRef, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, CommonService, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { TransnationalSales, CommonApis, FileUpload, CourrierMaster } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { GeneratePdfService } from '../../sales/generate-pdf.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
@Component({
  selector: 'app-transnational-non',
  templateUrl: './transnational-non.component.html',
  styleUrls: ['./transnational-non.component.scss'],
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
    GeneratePdfService
  ],
})
export class TransnationalNonComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("courrierModal", { static: false }) public courrierModal: ModalDirective;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  page_title: any = "Transnational NON List"
  popoverTitle: string = 'Warning';
  popoverMessage1: string = 'Are you sure, you want to delete?';
  popoverMessage2: string = 'Are you sure, you want to change Status?';
  popoverMessage3: string = 'Are you sure, you want to proceed for Payment?';
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  placement: string = 'left';
  cancelClicked: boolean = false;

  user: UserDetails;
  role_id: any = null;
  company_id: any = null;
  links: string[] = [];
  cols = [];
  filter = [];
  datePickerConfig: any = staticValues.datePickerConfig;

  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  delete_opt: boolean = false;
  isLoading: boolean = false;
  maxDate: any = new Date();
  selected_date_range: any = [
    // new Date(moment().subtract(30, 'days').format("YYYY-MM-DD")),
    // new Date(moment().format("YYYY-MM-DD"))
  ];
  data = [];
  n_id: any;
  courrierList: any;
  docket_no: any;
  courrier_name: any;
  constructor(private toasterService: ToasterService,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private pdfService: GeneratePdfService,
    private crudServices: CrudServices,
    private exportService: ExportService,
    private amountToWord: AmountToWordPipe,
    private currencyPipe: CurrencyPipe,

  ) {
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
    this.links = this.user.links;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.delete_opt = perms[3];
  }

  ngOnInit() {
    this.getCols();
    this.getData();
    this.getCourrierDt();

  }

  getCols() {

    this.cols = [
      { field: "id", header: "Sr No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "bank_name", header: "Bank", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "invoice_number", header: "Invoice Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'doc' },
      { field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "unit_type", header: "Unit", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "amount", header: "amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "currency", header: "Currency", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "lc_no", header: "LC Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "lc_date", header: "LC Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
    ];
    this.filter = ['customer', 'grade_name', 'port_name', 'bank_name'];


  }

  getData() {
    this.crudServices.getOne<any>(TransnationalSales.getDataNon, {}).subscribe(res => {
      this.data = res;
      this.pushDropdown(res);
    })

  }

  getCourrierDt() {
    this.crudServices.getAll<any>(CourrierMaster.getAll).subscribe(res => {
      this.courrierList = res
    })
  }


  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    this.pushDropdown(this.data);
    this.footerTotal(this.data);
  }

  onFilter(e, dt) {

    this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
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
        element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
      }

    });
  }

  generateNonCopy(item) {
    let fileData = new FormData();
    this.pdfService.generateNONCopy(item).then(async (pdfObj) => {
      let pdfOBjFromData = pdfObj;
      await pdfMake.createPdf(pdfOBjFromData).getBlob((pdf_data) => {
        if (pdf_data) {
          fileData.append('generated_non_copy', pdf_data, `Non.pdf`);
          this.pdfFileUpload(fileData, item)
          this.getData();
        }
      });
    })
  }

  pdfFileUpload(fileData, details) {
    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
      let path = res.uploads.generated_non_copy[0].location;
      if (path) {
        this.crudServices.updateData(TransnationalSales.updateNonData, { id: details.id, data: { generated_non_doc: path, generated_doc_date: new Date() } }).subscribe((result) => {
          this.toasterService.pop('success', ' Generated!', 'NON Generated!')

        });
      }
    });
  }

  addDocket(item) {
    this.n_id = item.id;
    this.docket_no = item.docket_no;
    this.courrier_name = item.courrier_name;
    this.courrierModal.show();
  }

  submitDocket() {
    let data = {
      docket_no: this.docket_no,
      courrier_name: this.courrier_name,

    }

    this.crudServices.updateData(TransnationalSales.updateNonData, { id: this.n_id, data: data }).subscribe((result) => {
      this.toasterService.pop('success', ' success!', 'Data Updated!')
      this.n_id = '';
      this.courrierModal.hide();
      this.getData();

    });
  }

  closeModal() {
    this.n_id = '';
    this.courrierModal.hide();
  }


}
