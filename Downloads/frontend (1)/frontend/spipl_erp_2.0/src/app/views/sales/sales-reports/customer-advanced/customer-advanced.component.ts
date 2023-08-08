import { MiddlewarePayments, SalesOrders } from './../../../../shared/apis-path/apis-path';
import { UserDetails } from './../../../login/UserDetails.model';
import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { DatePipe } from "@angular/common";
import { Table } from "primeng/table";
import { SubOrg } from "../../../../shared/apis-path/apis-path";
import { CrudServices } from "../../../../shared/crud-services/crud-services";
import { ExportService } from "../../../../shared/export-service/export-service";
import { LoginService } from "../../../login/login.service";
import { PermissionService } from "../../../../shared/pemission-services/pemission-service";
import { Router } from '@angular/router';



@Component({
  selector: 'app-customer-advanced',
  templateUrl: './customer-advanced.component.html',
  styleUrls: ['./customer-advanced.component.scss'],
  providers: [DatePipe, ToasterService, LoginService, CrudServices, PermissionService]
})


export class CustomerAdvancedComponent implements OnInit {
  bsRangeValue: any; //DatePicker range Value
  @ViewChild("mf", { static: false }) table: ElementRef;
  user: UserDetails;
  isLoading = false;
  maxDate: Date = new Date(); // date range will not greater  than today
  links: any;
  cols: any = [];
  selectedColumns: any = [];
  data: any = [];

  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  company_id: any;
  constructor(public datePipe: DatePipe, private router: Router, private permissionService: PermissionService, private loginService: LoginService, public crudServices: CrudServices, toasterService: ToasterService) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.company_id = this.user.userDet[0].company_id;
    if (this.user.userDet[0].role_id != 1 && this.user.userDet[0].role_id == 5) {
    }
  }


  ngOnInit() {
    this.getAllSubOrg();
    this.cols = [
      { field: "sub_org_name", header: "Customer Name", permission: true },
      { field: "location_vilage", header: "Location", permission: true },
      { field: "extra_suspense", header: "Suspense", permission: true },
      { field: "extra_import", header: "Import Advance", permission: true },
      { field: "extra_local", header: "Local Advance", permission: true },
      { field: "product_type", header: "Company", permission: true },
      { field: "zone_name", header: "Markrting Person", permission: true },
    ];
    this.selectedColumns = this.cols;
  }

  getAllSubOrg() {
    this.crudServices.getOne(SubOrg.getadvancedPaymentCustomers, { product_type: this.company_id }).subscribe((result) => {
      this.data = result['data'];
    });
  }

  setFinanceYear() {
    let date = new Date();
    let nextyr
    let currentYear
    if (new Date().getMonth() >= 3) {
      nextyr = new Date(date.getFullYear() + 1, 2, 31);
      currentYear = new Date(date.getFullYear(), 3, 1)
    } else {
      nextyr = new Date(date.getFullYear(), 2, 31);
      currentYear = new Date(date.getFullYear() - 1, 3, 1)
    }
    this.bsRangeValue = [
      new Date(currentYear),
      new Date(nextyr),
    ];
  }

  update(event, sub_org_id, column_name, item) {
    let data = {}
    data[column_name] = Number(event.target.value);
    let body = {
      payment_data: data,
      sub_org_id: Number(sub_org_id)
    }

    this.crudServices.updateData(SubOrg.addExtraAdvancePayment, body).subscribe(result => {
      this.getAllSubOrg();
    });
  }

  // test() {

  //   let data = {
  //     "bank_acc_no": "018463700002055",
  //     "virtual_acc_no": "PARM86PJAPZL0323",
  //     "amount": 2500000,
  //     "payment_type": 1,
  //     "payment_date": "2022-04-29",
  //     "transaction_id": "N119221171645395",
  //     "utr_no": "N119221171645395",
  //     "remark": "SUSHILA PARMAR INTERNATIONAL PVT LT",
  //     "status": "active",
  //     "bank_id": 19,
  //     "remitterName": "SUSHILA PARMAR INTERNATIONAL PVT LT",
  //     "ifscCode": "HDFC0000240",
  //     "productCode": "Fund Trans"
  //   }

  //   this.crudServices.addData(MiddlewarePayments.add, data).subscribe((result) => {
  //   })
  // }


}
