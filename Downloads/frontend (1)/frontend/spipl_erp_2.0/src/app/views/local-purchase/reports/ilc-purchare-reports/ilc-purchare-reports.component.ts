import { UserDetails } from './../../../login/UserDetails.model';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import * as moment from 'moment';
import { NonPayments } from '../../../../shared/apis-path/apis-path';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-ilc-purchare-reports',
  templateUrl: './ilc-purchare-reports.component.html',
  styleUrls: ['./ilc-purchare-reports.component.scss'],
  encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		ToasterService,
		ExportService,
		CrudServices

	]
})
export class IlcPurchareReportsComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  user: UserDetails;
  links: string[] = [];
  data:any=[];
  cols:any=[];
  isLoading: boolean = false;
  company_id: any;
  bsRangeValue: Date[];
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  role_id: any = null;
  filteredValues: any[];
  constructor(private exportService: ExportService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private loginService: LoginService) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.cols = [
      { field: 'daysLeft', header: 'Days Remaining', style: '200px',sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null,oprations: null   },
      { field: 'SupplierName', header: 'Supplier', style: '200px',sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null,oprations: null   },
      { field: 'ilc_bank_no', header: 'ILC Bank NO', style: '200px',sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null,oprations: null   },
      { field: 'PaymentDueDate', header: 'Due date ', style: '200px',sort: true,filter: false, dropdown: [], footer: false, total: 0, type: null,oprations: null    },   
      { field: 'Amount', header: 'Amount', style: '200px',sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: "Sum" },
      { field: 'BankName', header: 'Bank Name', style: '200px',sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null,oprations: null  },
      { field: 'InvoiceNo', header: 'Invoice No.', style: '200px',sort: true, filter: false, dropdown: [], footer: false, total: 0, type:null,oprations: null },
     
  ];
    this.bsRangeValue = [new Date(), new Date()];
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
  }

  ngOnInit() {
    this.getData()
  }



  getData() {
    let condition = {
      from_date: this.selected_date_range[0],
      to_date: this.selected_date_range[1],
      // company_id: (this.role_id == 1) ? null : this.company_id,
    }
    this.crudServices.getOne(NonPayments.ilcPaymentList,condition).pipe(map((result:any) =>{
     return result.map(ele=>{
        ele.daysLeft=this.countDaysLeft(ele.PaymentDueDate);
        return ele;
      })
    })).
    subscribe((result)=>{
        this.data=result;
        this.pushDropdown(this.data);
      console.log(result,"test")
    })

  }

  onSelect(event,mode) {
    this.getData()
  }

  //AVG OF FILTER TABLE DATA 
  getAVGOf(arraySource, field) {
    if (this.filteredValues) {
      return this.filteredValues.reduce(function (x, y) { return x + Number(y[field]); }, 0) / this.filteredValues.length;
    } else {
      return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0) / arraySource.length;
    }
  }
  //SUM OF FILTER TABLE DATA 
  getSumOf(arraySource, field) {
    if (this.filteredValues) {
      return this.filteredValues.reduce(function (x, y) { return x + Number(y[field]); }, 0);
    }
    else {
      return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
    }
  }

  onFilter(event, dt) {
    this.filteredValues = [];
    this.filteredValues = event.filteredValue;
  }

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		this.pushDropdown(this.data);
		// this.footerTotal(this.data);
	}

  exportData(type) {
		console.log(type)
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = 'ILC Report' + ' - ' +  + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
				} else if (this.cols[j]["field"] == "total_amount" ) {
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

//count ====
  countDaysLeft(from_date) {
		let dayCount = 30;
		let startDate = new Date(from_date);
		let endDate = new Date();
		let days = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);
		let total_days = Number(days);
    console.log(total_days,"total_days")
		if (total_days >= dayCount) {
			return  	 dayCount - total_days;
		} else {
			return "";
		}
	}


}
