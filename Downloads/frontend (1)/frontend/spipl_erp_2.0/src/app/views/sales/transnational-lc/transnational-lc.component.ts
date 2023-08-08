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
import { TransnationalSales, CommonApis, FileUpload } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import * as moment from "moment";

@Component({
  selector: 'app-transnational-lc',
  templateUrl: './transnational-lc.component.html',
  styleUrls: ['./transnational-lc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    CrudServices,
    ToasterService,
    PermissionService,
    ExportService,
    AmountToWordPipe,
    CurrencyPipe,
    Calculations,
    CommonService
  ],
})
export class TransnationalLcComponent implements OnInit {
  @ViewChild("lcModal", { static: false }) public lcModal: ModalDirective;
  @ViewChild("nonModal", { static: false }) public nonModal: ModalDirective;
  @ViewChild("dt", { static: false }) table: Table;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  page_title: any = "Transnational LC List"
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

  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];

  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  delete_opt: boolean = false;
  isLoading: boolean = false;
  maxDate: any = new Date();
  data = [];
  lcForm: FormGroup;
  lc_id: any;
  bankList = [];
  lcdocs: File[] = [];
  dealList = [];
  nonForm: FormGroup;
  dealArr: FormArray;
  non_list = [];
  constructor(
    private toasterService: ToasterService,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private exportService: ExportService,
    private amountToWord: AmountToWordPipe,
    private currencyPipe: CurrencyPipe,
    private fb: FormBuilder,
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

    this.lcForm = new FormGroup({
      lc_copy: new FormControl(null),
      lc_no: new FormControl(null, Validators.required),
      lc_date: new FormControl(null, Validators.required),
      tolerance: new FormControl(null),
      additional_set_doc: new FormControl(null),
      lc_issue_bank: new FormControl(null),
    });

    this.nonForm = this.fb.group({
      invoice_number: new FormControl(null, Validators.required),
      invoice_date: new FormControl(null, Validators.required),
      grade_name: new FormControl(null),
      customer: new FormControl(null),
      rate: new FormControl(null),
      total: new FormControl(null),
      dealArr: this.fb.array([])
    });
  }

  getCols() {

    this.cols = [
      { field: "id", header: "Sr No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "bank_name", header: "Bank Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "lc_no", header: "LC Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'doc' },
      { field: "lc_date", header: "LC Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
    ];
    this.filter = ['customer', 'grade_name'];

    //this.getData();

  }

  getData() {
    this.crudServices.getOne<any>(TransnationalSales.getDataLC, {}).subscribe(res => {
      this.data = res;
      //this.pushDropdown(res);
    })

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

  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    this.pushDropdown(this.data);
    this.footerTotal(this.data);
  }

  onFilter(e, dt) {

    this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }
  onAction(item, type) {
    if (type == 'Edit') {
      this.lc_id = item.id;
      this.dealList = item.dealList;
      if (item.dealList) {
        this.bankList = item.dealList[0].sub_org_master.org_bank_masters;
      }

      this.lcForm.patchValue({
        lc_no: item.lc_no,
        lc_date: item.lc_date,
        lc_issue_bank: item.lc_issue_bank,
        tolerance: item.tolerance,
        additional_set_doc: item.additional_set_doc,
      });
      this.lcModal.show();
    } else if (type == 'Delete') {
      this.crudServices.deleteData(TransnationalSales.delete, {
        id: item.id
      }).subscribe(res => {
        if (res['code'] == '100') {
          this.toasterService.pop('success', 'Success', 'Order Deleted');
          this.getData();
        }
      });
    }



  }

  onFileChange(event: any) {
    this.lcdocs = <Array<File>>event.target.files;
  }


  onSubmitLc() {

    let data = {
      lc_date: moment(this.lcForm.value.lc_date).format('DD-MM-YYYY'),
      lc_no: this.lcForm.value.lc_no,
      lc_issue_bank: this.lcForm.value.lc_issue_bank,
      tolerance: this.lcForm.value.tolerance,
      additional_set_doc: this.lcForm.value.additional_set_doc,
    }
    let fileData: any = new FormData();
    const document: Array<File> = this.lcdocs;
    if (document.length > 0) {
      for (let i = 0; i < document.length; i++) {
        fileData.append('transnational_lc_copy', document[i], document[i]['name']);
      }

      this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {


        let filesList = [];
        let files = [];


        if (res.uploads.transnational_lc_copy) {
          filesList = res.uploads.transnational_lc_copy;
          for (let i = 0; i < filesList.length; i++) {
            files.push(filesList[i].location);
          }
          //	data['be_copy'] = JSON.stringify(fileDealDocs1);

        }


        if (files.length > 0) {
          data['lc_copy'] = JSON.stringify(files);

        }

        this.crudServices.updateData(TransnationalSales.updateDataLC, { data: data, id: this.lc_id }).subscribe(res => {

          if (res['code'] == '100') {

            this.closeModal()
            this.toasterService.pop('success', 'Success', 'LC Updated Successfully');
            //this.generateSalesOrder(res['data']);
          }
        });





      })
    } else {
      this.crudServices.updateData(TransnationalSales.updateDataLC, { data: data, id: this.lc_id }).subscribe(res => {
        if (res['code'] == '100') {
          this.closeModal()
          this.toasterService.pop('success', 'Success', 'LC Updated Successfully');
          //this.generateSalesOrder(res['data']);
        }
      });
    }


  }


  onSubmitNon() {
    let relArr = this.nonForm.value.dealArr
    let data = {
      invoice_date: this.nonForm.value.invoice_date,
      invoice_number: this.nonForm.value.invoice_number,
      quantity: relArr.reduce((sum, item) => sum + Number(item.quantity_remain), 0),
      lc_id: relArr[0].lc_id,
    }
    this.crudServices.addData(TransnationalSales.addDataNON, { data: data, relArr: relArr }).subscribe(res => {
      if (res['code'] == '100') {
        this.closeModal()
        this.toasterService.pop('success', 'Success', 'NON Added Successfully');
        //this.generateSalesOrder(res['data']);
      }
    });
  }
  closeModal() {
    this.lcModal.hide();
    this.lcForm.reset();
    this.dealList = [];
    this.lc_id = null;
    this.getData();
    this.nonModal.hide();
    this.nonForm.reset();
  }

  addNon(data) {

    this.dealArr = this.nonForm.get('dealArr') as FormArray;
    this.dealArr.clear();
    this.non_list = data.transnational_nons.map(item => {
      item.amount = Number(item.quantity) * Number(data.dealList[0].rate);
      return item;
    });

    //this.non_list =data.transnational_nons;
    if (data.dealList) {

      for (let val of data.dealList) {
        let qty_utilize = val.transnational_rel_non_lcs.reduce((sum, deal) => sum + deal.quantity, 0);
        let remain = Number(val.quantity) - Number(qty_utilize)
        this.dealArr.push(this.fb.group({
          con_id: new FormControl(val.id),
          quantity: new FormControl(val.quantity),
          quantity_remain: new FormControl(remain),
          lc_id: new FormControl(data.id),
          customer: new FormControl(data.customer),
          grade_name: new FormControl(data.grade_name),
          rate: new FormControl(val.rate),
          total: new FormControl(val.rate * val.quantity),


        }))
      }
    }
    this.nonModal.show();
  }
}
