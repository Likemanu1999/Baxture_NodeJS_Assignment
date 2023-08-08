import { UserDetails } from './../../../login/UserDetails.model';
import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ExportService } from '../../../../shared/export-service/export-service';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { LoginService } from '../../../login/login.service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import * as moment from "moment";
import { SalesOrders } from '../../../../shared/apis-path/apis-path';
import { staticValues } from '../../../../shared/common-service/common-service';
@Component({
  selector: 'app-sales-order-local-report',
  templateUrl: './sales-order-local-report.component.html',
  styleUrls: ['./sales-order-local-report.component.scss'],
  providers: [PermissionService, CrudServices, ExportService, LoginService]

})
export class SalesOrderLocalReportComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  user: UserDetails;
  links: string[] = [];
  data = [];
  cols: any = [];
  isLoading: boolean = false;
  company_id: any;
  bsRangeValue: Date[];
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
  role_id: any = null;
  filteredValues: any[];
  constructor(private exportService: ExportService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private loginService: LoginService) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.cols = [
      { field: 'id', header: 'Con. ID', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'grade_name', header: 'Grade', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'godown_name', header: 'Godown', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'quantity', header: 'Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: "Sum" },
      { field: 'final_rate', header: 'Rate', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: "Amount", oprations: "Avg" },
      { field: 'total_amount', header: 'Amount', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: "Sum" },
      { field: 'booking_date', header: 'Booking Date', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'customer', header: 'Customer', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'zone', header: 'Zone', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'company_name', header: 'Division', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
    ];
    this.bsRangeValue = [new Date(), new Date()];
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
  }

  ngOnInit() {
    this.getData()
  }

  receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
		
	}
	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}

  getData() {
    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      company_id: (this.role_id == 1) ? null : this.company_id,
      import_local_flag: 2
    }
    this.crudServices.getOne<any>(SalesOrders.getSalesOrders, condition).subscribe((res) => {
      this.data = res['data'];
      this.pushDropdown(this.data);

    });

  }

  onSelect(event, mode) {
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
    // this.pushDropdown(this.data);
    // this.footerTotal(this.data);
  }

  exportData(type) {
    let final_data = null;
    if (this.table.filteredValue == null) {
      final_data = this.data;
    } else {
      final_data = this.table.filteredValue;
    }
    let fileName = 'Sale Order Local' + ' - ' + + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
        } else if (this.cols[j]["field"] == "total_amount") {
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


}
