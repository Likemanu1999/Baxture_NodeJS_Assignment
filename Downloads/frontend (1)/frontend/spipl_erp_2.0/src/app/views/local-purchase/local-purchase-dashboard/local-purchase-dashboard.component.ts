import { ActivatedRoute, Router } from "@angular/router";
import { Component, ElementRef, OnInit, ViewChild, } from "@angular/core";
import { Dashboard, DashboardNew, GradeMaster, localPurchaseDashboard, newHoliday, ProductMaster, SubOrg } from "../../../shared/apis-path/apis-path";
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
  selector: 'app-local-purchase-dashboard',
  templateUrl: './local-purchase-dashboard.component.html',
  styleUrls: ['./local-purchase-dashboard.component.scss'],
  providers: [
		DatePipe,
		ToasterService,
		LoginService,
		CrudServices,
		PermissionService,
		MessagingService
	]
})
export class LocalPurchaseDashboardComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("dt2", { static: false }) table2: Table;
  datePickerConfig = staticValues.datePickerConfig;
  company = [{id:1 , label : 'PVC' },{ id:2 , label: 'PE/PP' }]
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

	private toasterService: ToasterService;
	bsRangeValue: any = []; //DatePicker range Value
  // @ViewChild("dt", { static: false }) table: Table;
  // @ViewChild("dt2", { static: false }) table2: Table;
  // @ViewChild("dt3", { static: false }) table3: Table;

	maxDate: Date = new Date(); // date range will not greater  than today
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
  links: any;

  date = new Date();
	currentYear: number;
  total_deals: any;
  total_supplier: any;
  total_manufacturer: any;
  lifting_pending: any;
  lifting_done: any;
  payment_pending: any;
  payment_done: any;
  selectedCompany: any;
  productList: any;
  selectedProduct: any;
  average_rate_supplier: any;
  avg_rate_manufacturer: any;
  cols1: any[];
  data1: any[];
  data2: any[];
  cols2: any[];
  avgSupplier: any = 0;
  avgManufacturer: any = 0;
 

  constructor(public datePipe: DatePipe,
		toasterService: ToasterService,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public crudServices: CrudServices,
		public messagingService: MessagingService,   public datepipe: DatePipe) { 
      if (this.loginService.getUserDetails()) {
        this.user = this.loginService.getUserDetails();
        this.links = this.user.links;
       // this.selectedCompany = (this.user.userDet[0].role_id == 1) ? null : this.user.userDet[0].company_id;
        this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
        if (this.datepipe.transform(this.date, 'MM') > '03') {
          this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
        } else {
          this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
        }
      
      }
    }

  ngOnInit() {
    this.getProductsList();
    this.getCols()
  //this.getTotalCount()
  }

  onDateChange(event) {
    this.getTotalCount()
    this.getAvgReport()
  }

  getCols() {
    this.cols1 =  [
    
      { field: "sub_org_name", header: "Supplier", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "qauntity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "average_rate_supplier", header: "Rate", sort: true, filter: false , dropdown: [], footer: true, total: 0, type: 'Amount' }
    ]

    this.cols2 =  [
    
      { field: "sub_org_name", header: "Supplier", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "qauntity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "avg_rate_manufacturer", header: "Rate", sort: true, filter: false , dropdown: [], footer: true, total: 0, type: 'Amount' }
    ]

   
  }

  getTotalCount() {
    this.isLoading = true
   this.crudServices.postRequest<any>(localPurchaseDashboard.localPurchaseSummary , {
    from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
    to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD"),
    product_id : this.selectedProduct,
    company_id : this.selectedCompany
   }).subscribe(response => {
    console.log(response.data);
    this.isLoading = false
    if(response.data) {
      this.total_deals = response.data.total_deals
      this.total_supplier = response.data.total_supplier
      this.total_manufacturer = response.data.total_manufacturer
      this.lifting_pending = response.data.lifting_pending
      this.lifting_done = response.data.lifting_done
      this.average_rate_supplier = response.data.average_rate_supplier != null ? response.data.average_rate_supplier : 0
      this.avg_rate_manufacturer = response.data.avg_rate_manufacturer != null ? response.data.avg_rate_manufacturer : 0
   
    }
   })
  }

  getAvgReport() {
    this.isLoading = true
    let response1 = this.crudServices.getOne<any>(localPurchaseDashboard.getSupplierWiseAverage, {
      from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
      to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD"),
      product_id : this.selectedProduct,
      company_id : this.selectedCompany
		})

    let response2 = this.crudServices.getOne<any>(localPurchaseDashboard.getManufacturerAvg, {
      from_date: moment(this.bsRangeValue[0]).format("YYYY-MM-DD"),
      to_date: moment(this.bsRangeValue[1]).format("YYYY-MM-DD"),
      product_id : this.selectedProduct,
      company_id : this.selectedCompany
		})

    forkJoin([response1, response2]).subscribe(([result1, result2]) => {
      this.isLoading = false
      if(result1.data) {
        this.data1 = result1.data
        console.log(this.data1 , 'DATA1');
        
        this.pushDropdown(this.data1, this.cols1)
        this.footerTotal(this.data1, this.cols1)
        this.calculateAvg (this.data1 , 'supplier')
      }
      if(result2.data) {
        this.data2 = result2.data
        console.log(this.data2 , 'DATA2');
        this.pushDropdown(this.data2, this.cols2)
        this.footerTotal(this.data2, this.cols2)
        this.calculateAvg (this.data2 , 'manufacturer')
      }
    })
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


  getProductsList() {
		this.crudServices.getOne(ProductMaster.getOneDataByField, {
			company_id: this.selectedCompany
		}).subscribe(res => {
			this.productList = res;
		
			
		});
	}

  
	//ON SELECT SPECIFIC PRODUCT 
	onChangeProduct(product) {
		this.selectedProduct = product.id;
		this.getTotalCount();
    this.getAvgReport()
	}


	// //ON SELECT SPECIFIC COMAPANY 
	onChangeCompany(company) {
    this.selectedProduct = null;
    if(company) {
      this.selectedCompany = company.id;
    }
	
    
    this.getProductsList()
		this.getTotalCount()
    this.getAvgReport()
	}

  calculateAvg(data , table) {
    if (table == 'supplier') {
      let total_qty = data.reduce((sum ,item) => sum + item.qauntity,0 )
      let total_avg = data.reduce((sum ,item) => sum + (item.average_rate_supplier * item.qauntity),0 )
     this.avgSupplier = total_avg/ total_qty
     
    }

    if (table == 'manufacturer') {
      let total_qty = data.reduce((sum ,item) => sum + item.qauntity,0 )
      let total_avg = data.reduce((sum ,item) => sum + (item.avg_rate_manufacturer * item.qauntity),0 )
      this.avgManufacturer =total_avg/ total_qty
      
     }

    
  }

  onFilter(event, table) {

    let data = event.filteredValue;
    if (table == 'supplier') {

      this.footerTotal(data, this.cols1);
      this.calculateAvg (data , table)
    }

    if (table == 'manufacturer') {

      this.footerTotal(data, this.cols2);
      this.calculateAvg (data , table)
    }

 
  }

  customFilter(value, col, data, table) {

    if (table == 'supplier') {
      let res = this.table.filter(value, col, data);

    }

    if (table == 'manufacturer') {
      let res = this.table2.filter(value, col, data);

    }


  }

}
