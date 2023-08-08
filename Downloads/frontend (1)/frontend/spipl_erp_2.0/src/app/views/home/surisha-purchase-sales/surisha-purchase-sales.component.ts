import { ActivatedRoute, Router } from "@angular/router";
import { Component, ElementRef, EventEmitter, OnInit, ViewChild, } from "@angular/core";
import { GradeMaster, DashboardNew, newHoliday, ProductMaster, SubOrg, surishaDashboard } from "../../../shared/apis-path/apis-path";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from "@angular/common";
import { LoginService } from "../../login/login.service";
import { MessagingService } from "../../../service/messaging.service";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { UserDetails } from "../../login/UserDetails.model";
import { forkJoin } from "rxjs";
import { staticValues } from "../../../shared/common-service/common-service";
import * as moment from "moment";
import { Table } from "primeng/table";

@Component({
  selector: 'app-surisha-purchase-sales',
  templateUrl: './surisha-purchase-sales.component.html',
  styleUrls: ['./surisha-purchase-sales.component.scss'],
  providers: [
    DatePipe,
    ToasterService,
    LoginService,
    CrudServices,
    PermissionService,
    MessagingService
  ]
})
export class SurishaPurchaseSalesComponent implements OnInit {

  public popoverTitle: string = "Warning";
  public popoverMessage: string = "Are you sure, you want to Change?";
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = "Yes";
  public cancelText: string = "No";
  public placement: string = "left";
  public closeOnOutsideClick: boolean = true;
  user: UserDetails;
  isLoading = false;
  is_holiday: any = false;
  holiday: any = [];
  private toasterService: ToasterService;
  bsRangeValue: any = []; //DatePicker range Value
	datePickerConfig = staticValues.datePickerConfigNew;
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("dt2", { static: false }) table2: Table;
  @ViewChild("dt3", { static: false }) table3: Table;

  maxDate: Date = new Date(); // date range will not greater  than today
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  links: any;
  purchaseData: any = []
  salesData: any = []
  p_cols: any = []
  s_cols: any = []
  link_cols: any = []
  salePurchaseLinkData: any[];
  purchase_lc_issue: any;
  purchase_lc_pending: any;
  purchase_lc_remit: any;
  date = new Date();
  currentYear: number;
  purchase_tt_pending: any;
  purchase_tt_done: any;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
  
  constructor(public datePipe: DatePipe,
    toasterService: ToasterService,
    private router: Router,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public crudServices: CrudServices,
    public messagingService: MessagingService, public datepipe: DatePipe) {
    //   var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    // var firstDay = new Date(y, m, 1);
    // var lastDay = new Date(y, m + 1, 0);
    // this.bsRangeValue = [];
    if (this.loginService.getUserDetails()) {
      this.user = this.loginService.getUserDetails();
      this.links = this.user.links;

      this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
      this.bsRangeValue = [new Date(moment().startOf('month').format("YYYY-MM-DD")),
      new Date(moment().format("YYYY-MM-DD"))]
      // if (this.datepipe.transform(this.date, 'MM') > '03') {
      //   this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      // } else {
      //   this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
      // }

    }
  }

  ngOnInit() {
    this.getCols();
    this.getDataPurchase();
    this.getSalesData();
    this.getLinkData();
    this.getPurchaseSummary();
  }

  getCols() {
    this.p_cols = [

      { field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' }
    ]

    this.s_cols = [
      { field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' }
    ]

    this.link_cols = [
      { field: "sub_org_name", header: "Supplier ", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "proform_invoice_no", header: "Invoice Number", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "po_quantity", header: "Total PI quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "so_qauntity", header: "Total SO quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "balance_quantity", header: "Balance PI Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "so_no", header: "So No", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null }
    ]
  }

  receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.bsRangeValue = dateValue.range;
		
	}
	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue))
		this.uploadSuccess.emit(false);
	}
	
  getDataPurchase() {
    this.purchaseData = [];

    this.crudServices.getOne<any>(surishaDashboard.surishaPurchasePortWise, {
      from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
      to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD")

    }).subscribe(res => {
      this.purchaseData = res.data
      this.pushDropdown(res.data, this.p_cols)
      this.footerTotal(res.data, this.p_cols)

    });
  }

  getSalesData() {
    this.salesData = [];

    this.crudServices.getOne<any>(surishaDashboard.surishaSalePortWise, {
      from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
      to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD")

    }).subscribe(res => {
      this.salesData = res.data
      this.pushDropdown(res.data, this.s_cols)
      this.footerTotal(res.data, this.s_cols)

    });
  }

  getLinkData() {
    this.salePurchaseLinkData = [];

    this.crudServices.getOne<any>(surishaDashboard.SurishasalePurchaseLinking, {
      from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
      to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD")

    }).subscribe(res => {
      this.salePurchaseLinkData = res.data;
      this.pushDropdown(res.data, this.link_cols)
      this.footerTotal(res.data, this.link_cols)

    });
  }
  getPurchaseSummary() {
    this.crudServices.getOne<any>(surishaDashboard.purchaseSummary, {
      from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
      to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD")

    }).subscribe(res => {
      this.purchase_lc_issue = res.data.lc_issue_result;
      this.purchase_lc_pending = res.data.lc_pending_result;
      this.purchase_lc_remit = res.data.lc_remit_result;
      this.purchase_tt_pending = res.data.tt_pending_result;
      this.purchase_tt_done = res.data.tt_done_result;


    });

  }

  pushDropdown(arg, cols) {
    let data = arg;
    if (data.length > 0) {
      let filter_cols = cols.filter(col => col.filter == true);
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
  }

  footerTotal(arg, cols) {
    let data = arg;


    if (data.length > 0) {
      let filter_cols = cols.filter(col => col.footer == true);
      filter_cols.forEach(element => {
        let total = data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        element.total = total;
      });
    }
  }

  customFilter(value, col, data, table) {

    if (table == 'purchase') {
      let res = this.table.filter(value, col, data);

    }

    if (table == 'sale') {
      let res = this.table2.filter(value, col, data);

    }

    if (table == 'link') {
      let res = this.table3.filter(value, col, data);

    }


  }

  onFilter(event, table) {

    let data = event.filteredValue;
    if (table == 'purchase') {

      this.footerTotal(data, this.p_cols);
    }

    if (table == 'sale') {

      this.footerTotal(data, this.s_cols);
    }

    if (table == 'link') {

      this.footerTotal(data, this.link_cols);
    }
  }

  onDateChange(event) {
    this.getDataPurchase();
    this.getSalesData();
    this.getLinkData();
    this.getPurchaseSummary();
  }




}
