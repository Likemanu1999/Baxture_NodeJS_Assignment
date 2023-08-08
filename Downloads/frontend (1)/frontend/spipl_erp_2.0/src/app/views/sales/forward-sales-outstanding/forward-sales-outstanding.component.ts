import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { GenerateSoPvcService } from '../../../shared/generate-doc/generate-so-pvc';
import { CurrencyPipe } from '@angular/common';
import { Calculations } from "../../../shared/calculations/calculations";
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Table } from "primeng/table";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { SalesOrders } from '../../../shared/apis-path/apis-path';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';


@Component({
  selector: 'app-forward-sales-outstanding',
  templateUrl: './forward-sales-outstanding.component.html',
  styleUrls: ['./forward-sales-outstanding.component.scss'],
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
export class ForwardSalesOutstandingComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("creditAmountModal", { static: false }) public creditAmountModal: ModalDirective;

  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 10000
  });

  popoverTitle: string = 'Warning';
  page_title: any = "Forward Sales Outstanding";
  role_id: any = null;
  company_id: any = null;
  links: string[] = [];
  cols: any = [];
  filter: any = [];
  user: UserDetails;
  notification_id_users = []
  selected_date_range: any = [
    new Date(moment().startOf('months').format("YYYY-01-DD")),
    new Date(moment().endOf('months').format("YYYY-MM-DD"))
  ];
  data: any[];
  isLoading: boolean;
  datePickerConfig: any = staticValues.datePickerConfigNew;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;
  creditAmountForm: FormGroup;
  selected_deal: any = null;
  isEdit: boolean = false;
  maxDate: Date = new Date();
  statusList = staticValues.billing_status;
  selected_status = this.statusList[0];
  constructor(
    private toasterService: ToasterService,
    private router: Router,
    private loginService: LoginService,
    private crudServices: CrudServices,
    private exportService: ExportService,
  ) {
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
    this.links = this.user.links;
  }

  ngOnInit() {
    this.getCols();
    this.initForm();
  }

  
	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

  getData() {
    this.data = [];
    this.isLoading = true;

    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      status: this.selected_status.id,
    }
    this.crudServices.getOne<any>(SalesOrders.getAdvancePayments, condition).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {

        if (res.data.length > 0) {
          this.data = res.data;
        }

        this.pushDropdown(this.data);
        this.footerTotal(this.data);
      }
      this.table.reset();
    });
  }

  onFilter(e, dt) {
    // this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }

  initForm() {
    this.creditAmountForm = new FormGroup({
      total_order_amount: new FormControl(0, Validators.required),
      received_amount: new FormControl(0, Validators.required),
      credit_amount: new FormControl(0, Validators.required),
      remaining_amount: new FormControl(0, Validators.required),
      received_date: new FormControl(null,Validators.required)
    });
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
        if (item) {
          array.push({
            value: item,
            label: item
          });
        }
      });
      element.dropdown = array;
    });
  }


  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }

  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
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
      { field: "so_id", header: "SO ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
      { field: "companyName", header: "Company", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
      { field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, style: '7%' },
      { field: "order_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'amount', style: '7%' },
      { field: "balance_received", header: "Balance Received", sort: false, filter: false, dropdown: [], footer: true, total: 0, type: 'amount', style: '7%' },
      { field: "remaining_amount", header: "Remaining Amount", sort: false, filter: false, dropdown: [], footer: true, total: 0, type: 'amount', style: '7%' },
      { field: "status", header: "Status", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null , style: '7%' },
      { field: "is_forward", header: "Deal Type", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '5%' },
      { field: "added_by_name", header: "Advance Added By", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, style: '10%' },
      { field: "added_date", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'date', style: '7%' },
    ];

    this.filter = ['added_by_name', 'customer', 'so_id', 'invoice_no'];
    this.getData();
  }

  getCompanyName(id) {
    if (id == 1) {
      return 'PVC'
    } else if (id == 2) {
      return 'PE&PP'
    } else {
      return 'SURISHA'
    }
  }

  getStatus(id){
    if (id == 1) {
      return 'Completed'
    } else if (id == 0) {
      return 'Pending'
    }
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
    let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
}
