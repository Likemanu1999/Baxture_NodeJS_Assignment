import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Consignments, EmailTemplateMaster, salesPurchaseLinking } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';
import { ModalDirective } from 'ngx-bootstrap';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchase-sales-linking',
  templateUrl: './purchase-sales-linking.component.html',
  styleUrls: ['./purchase-sales-linking.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    CrudServices,
    ToasterService,
    PermissionService,
    ExportService
  ],
})
export class PurchaseSalesLinkingComponent implements OnInit {
  @ViewChild("showSalesLinkingModel", { static: false }) public showSalesLinkingModel: ModalDirective;
  @ViewChild("dt", { static: false }) table: Table;

  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  page_title: any = "sales Purchase Linking"
  popoverTitle: string = 'Warning';
  popoverMessage: string = 'Are you sure, you want to Delete ?';
  popoverMessageSoLink: string = 'Are you sure, you want to Proceed ?';
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  placement: string = 'right';
  cancelClicked: boolean = false;

  user: UserDetails;
  role_id: any = null;
  company_id: any = null;
  links: string[] = [];
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  delete_opt: boolean = false;
  isLoading: boolean = false;
  statusList: any = staticValues.sales_purchase_link_status;
  magangementSurishaEmailSales_Company_ID_3: any = staticValues.magangementSurishaEmailSales_Company_ID_3;
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  selected_status: any = this.statusList[0];
  cols: any = [];
  data: any = [];
  filter: any = [];
  so_details: any = [];
  po_details: any = [];
  emailSubject: any;
  emailFooterTemplete: any;
  emailBodyTemplete: any;
  emailFrom: any;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;
  datePickerConfig = staticValues.datePickerConfigNew;
  maxDate: Date = new Date();

  constructor(
    private toasterService: ToasterService,
    private router: Router,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private exportService: ExportService,
    private messagingService: MessagingService
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
  }

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }

  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
  }

  getCols() {
    if (this.selected_status.id == 0) {
      this.cols = [
        { field: "pi_id", header: "PI ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "supplier_name", header: "Supplier", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "pi_no", header: "PI Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "port_name", header: "Port Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "po_quantity", header: "PO Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
        { field: "po_link_bal_qty", header: "PO Balance Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      ]
    } else {
      this.cols = [
        { field: "po_id", header: "PO ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "supplier_name", header: "Supplier", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "so_no", header: "SO Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "buyer_name", header: "Buyer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "proform_invoice_no", header: "PI Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "port_name", header: "Port Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "so_link_qty", header: "Linked Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      ];
    }
    this.filter = ['supplier_name', 'so_no', 'buyer_name', 'pi_no', 'grade_name', 'proform_invoice_no'];
    this.getData();
  }


  async getEmailTemplate() {
    this.emailSubject = undefined;
    this.emailFooterTemplete = undefined;
    this.emailBodyTemplete = undefined;
    let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'surisha order processing' });
    let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
    await forkJoin([headerRed, footer_req]).subscribe(response => {
      if (response[0].length > 0) {
        this.emailBodyTemplete = response[0][0].custom_html;
        this.emailSubject = response[0][0].subject;
        this.emailFrom = response[0][0].from_name;
      }
      if (response[1].length > 0) {
        this.emailFooterTemplete = response[1][0].custom_html;
      }
    })
  }

  getData() {
    this.data = [];
    this.isLoading = true;
    if (this.selected_status.id == 0) {
      this.crudServices.getOne<any>(salesPurchaseLinking.getSupplierWisePurchaseSalesPendingList, {
        from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
        to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
        status: this.selected_status.id
      }).subscribe(res => {
        this.isLoading = false;
        if (res.code === '100') {
          if (res.data.length > 0) {
            this.data = res.data;
            this.pushDropdown(this.data);
            this.footerTotal(this.data);
          }
        }
      });
    } else {
      this.crudServices.getOne<any>(salesPurchaseLinking.getPurchaseSalesLinkedList, {
        from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
        to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
        status: this.selected_status.id
      }).subscribe(res => {
        this.isLoading = false;
        if (res.code === '100') {
          if (res.data.length > 0) {
            this.data = res.data;
            this.pushDropdown(this.data);
            this.footerTotal(this.data);
          }
        }
      });
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
    this.footerTotal(this.data);
  }

  onFilter(e, dt) {
    this.footerTotal(dt.filteredValue);
  }

  onChangeStatus(e) {
    if (e != null && e != undefined) {
      this.selected_status = {
        id: e.value.id,
        name: e.value.name
      };
      this.getCols();
    }
  }
  closeModal() {
    this.showSalesLinkingModel.hide();
  }

  exportData(type) {
    let final_data;
    if (this.table.filteredValue == null) {
      final_data = this.data;
    } else {
      final_data = this.table.filteredValue;
    }

    let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
  onAction(rowData, type, event) {
    if (type == "View") {
      this.getEmailTemplate()
      this.showSalesLinkingModel.show();
      this.po_details = rowData;
      this.so_details = rowData.sales_details;
    }
    if (type == "Sales_Order") {
      this.isLoading = true;
      let so_id = Number(rowData.so_id);
      let po_id = Number(this.po_details.pi_id);
      let so_balance_quantity = Number(rowData.so_link_bal_qty);
      let po_balance_quantity = Number(this.po_details.po_link_bal_qty);
      let so_new_balance_quantity = 0;
      let po_new_balance_quantity = 0;
      let po_link_qty = 0;
      let so_link_qty = 0;

      if (po_balance_quantity > so_balance_quantity) {
        po_new_balance_quantity = po_balance_quantity - so_balance_quantity;
        po_link_qty = so_balance_quantity;
        so_link_qty = so_balance_quantity;
        so_new_balance_quantity = 0;
      } else {
        po_new_balance_quantity = 0;
        so_new_balance_quantity = so_balance_quantity - po_balance_quantity;
        po_link_qty = po_balance_quantity;
        so_link_qty = po_balance_quantity;
      }
      let rel_data = {
        so_id: so_id,
        p_id: po_id,
        po_link_qty: po_link_qty,
        so_link_qty: so_link_qty,
        so_cover_qty: so_link_qty
      };

      let body = {
        data: rel_data,
        so_id: so_id,
        p_id: po_id,
        so_link_bal_qty: Number(so_new_balance_quantity),
        po_link_bal_qty: Number(po_new_balance_quantity)
      };


      rowData['so_link_qty'] = so_link_qty



      this.crudServices.updateData<any>(salesPurchaseLinking.add, body).subscribe(res => {
        if (res.code == '100') {
          this.toasterService.pop('success', 'Alert', 'Updated Successfully');
          this.sendMail(this.po_details, rowData)
          this.getData();
          this.showSalesLinkingModel.hide();
        } else {
          this.toasterService.pop('error', 'Alert', 'something went wrong');
        }
      });
    }
    if (type == "Delete_Link") {
      this.crudServices.deleteData<any>(salesPurchaseLinking.delete, {
        data: rowData,
      }).subscribe(res_del => {
        if (res_del.code === '100') {
          this.toasterService.pop('success', 'Alert', 'Deleted Successfully');

          this.getData();
        } else {
          this.toasterService.pop('error', 'Alert', 'something went wrong');
        }
      });
    }
  }

  sendMail(po, so) {



    if (so.temp_email != null && po.eta != null && so.so_no != undefined && so.so_link_qty != undefined && so.grade_name != undefined) {


      let emails = this.magangementSurishaEmailSales_Company_ID_3

      // if (so.temp_email! = null) {
      //   let mails = so.temp_email.split(',')
      //   for (let mail of mails) {
      //     emails.push(mail)
      //   }
      // }



      let obj = {
        SO_NO: so.so_no,
        QTY: so.so_link_qty + ' ' + so.so_unit_type,
        GRADE: so.grade_name,
        TODAY: moment(so.booking_date).format('DD-MM-YYYY'),
        SUPPLIER: po.supplier_name,
        COUNTRY: po.country_of_origin,
        PORT: po.port_name,
        ETA: moment(po.eta).format('DD-MM-YYYY')
      }

      for (const key in obj) {
        this.emailBodyTemplete = this.emailBodyTemplete.replace(new RegExp('{' + key + '}', 'g'), obj[key]);
      }
      let etd = ''
      if (po.etd != null) {
        etd = `<strong>ETD&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : ${moment(po.etd).format('DD-MM-YYYY')}</strong></span></span></p>`
      }
      const SO_NO = /{SO_NO}/gi;
      this.emailSubject = this.emailSubject.replace(SO_NO, so.so_no);

      const ETD = /{ETD}/gi;
      this.emailBodyTemplete = this.emailBodyTemplete.replace(ETD, etd);



      let emailBody = {

        tomail: emails,
        subject: this.emailSubject,
        bodytext: this.emailBodyTemplete + this.emailFooterTemplete,

      }


      this.crudServices.postRequest<any>(Consignments.sendSurishaMail, emailBody).subscribe((response) => {
        this.toasterService.pop('success', 'SHIPMNENT PLANNING UPDATE  !', ' MAIL SEND SUCCESS!')
      });

    }
  }

}
