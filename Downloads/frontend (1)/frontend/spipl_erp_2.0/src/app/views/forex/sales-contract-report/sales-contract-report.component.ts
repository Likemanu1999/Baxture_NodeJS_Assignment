import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { SupplierDealService } from '../foreign-supplier-deal/supplier-deal-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { AddGradeService, AddGradeList } from '../add-grade-port/add-grade-service';
import { DatePipe } from '@angular/common';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-sales-contract-report',
  templateUrl: './sales-contract-report.component.html',
  styleUrls: ['./sales-contract-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    LoginService,
    SupplierDealService,
    ExportService,
    AddGradeService,
    DatePipe
  ]
})
export class SalesContractReportComponent implements OnInit {

  @ViewChild('dt', { static: false }) table: Table;
  isLoading = false;

  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  user: UserDetails;
  links: string[] = [];
  serverUrl: string;
  sales_list = [];
  public filterQuery = '';
  filterArray = [];
  export_cols: { field: string; header: string; }[];
  exportColumns: { title: string; dataKey: string; }[];
  export_data = [];
  cols: { field: string; header: string; }[];
  lookup_supplier = {};
  supplier_list = [];
  lookup_month = {};
  month_list = [];
  lookup_year = {};
  year_list = [];
  filteredValuess: any[];
  total_qty: number;
  total_rate: number;
  avg_rate: string;
  total_amt: number;
  deal_dt: string;
  export_list: any[];
  pdf_download: boolean;
  excel_download: boolean;

  public today = new Date();
  currentYear: number;
  currdate = new Date();

  bsRangeValue2: any = [];

  fromDate: any;
  toDate: any;


  constructor(private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private exportService: ExportService,
    public datepipe: DatePipe,
    private addGradeService: AddGradeService) {
    this.serverUrl = environment.serverUrl;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.pdf_download = (this.links.indexOf('PDF sales report') > -1);
    this.excel_download = (this.links.indexOf('Excel sales report') > -1);


    this.cols = [
      { field: 'sub_org_name', header: 'Supplier Name' },
      { field: 'deal_dt', header: 'Deal Date' },
      { field: 'shipment_month', header: 'Shipment Month' },
      { field: 'shipment_year', header: 'Shipment Year' },
      { field: 'quantity', header: 'Quantity' },
      { field: 'rate', header: 'Rate' },
      { field: 'amount', header: 'Amount' },

    ];

    this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
    if (this.datepipe.transform(this.currdate, 'MM') > '03') {

      this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

    } else {

      this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

    }



  }

  ngOnInit() {
    this.fromDate = this.bsRangeValue2[0];
    this.toDate = this.bsRangeValue2[1];

    this.getSaleAverageReport();
  }



  getSaleAverageReport() {
    this.isLoading = true;
    this.sales_list = [];
    this.total_qty = 0;
    this.total_rate = 0;
    this.avg_rate = '';
    this.total_amt = 0;

    this.addGradeService.get_ga_sales_report(this.fromDate, this.toDate)
      .subscribe(
        (response) => {

          console.log(response, "salesdealreport");
          this.isLoading = false;
          this.sales_list = response;
          this.filteredValuess = response;

          this.total_qty = this.sales_list.reduce((sum, item) => sum + item.quantity, 0);
          this.total_rate = this.sales_list.reduce((sum, item) => sum + item.rate, 0);

          this.total_amt = this.sales_list.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
          this.avg_rate = (this.total_amt / this.total_qty).toFixed(2);

          for (let item, i = 0; item = this.sales_list[i++];) {
            const name = item.sub_org_name;
            const month = item.shipment_month;
            const year = item.shipment_year;
            if (!(name in this.lookup_supplier)) {
              this.lookup_supplier[name] = 1;
              this.supplier_list.push({ 'sub_org_name': name });
            }

            if (!(month in this.lookup_month)) {
              this.lookup_month[month] = 1;
              this.month_list.push({ 'shipment_month': month });
            }

            if (!(year in this.lookup_year)) {
              this.lookup_year[year] = 1;
              this.year_list.push({ 'shipment_year': year });
            }
          }






        }

      );
  }


  // multiselect filter
  onchange(event, name) {
    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }

      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
  }


  convert(date) {
    if (date) {
      return this.datepipe.transform(date, 'yyyy-MM-dd');
    } else {
      return '';
    }
  }



  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.total_qty = 0;
    this.total_rate = 0;
    this.avg_rate = '';
    this.total_amt = 0;
    this.filteredValuess = event.filteredValue;
    this.total_qty = this.filteredValuess.reduce((sum, item) => sum + item.quantity, 0);
    this.total_rate = this.filteredValuess.reduce((sum, item) => sum + item.rate, 0);

    this.total_amt = this.filteredValuess.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
    this.avg_rate = (this.total_amt / this.total_qty).toFixed(2);
  }



  // data exported for pdf excel download
  exportData() {
    this.export_list = [];
    let arr = [];
    const foot = {};
    if (this.filteredValuess === undefined) {
      arr = this.sales_list;
    } else {
      arr = this.filteredValuess;
    }

    for (let i = 0; i < arr.length; i++) {
      const exportList = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]['field'] === 'amount') {
          exportList[this.cols[j]['header']] = arr[i]['rate'] * arr[i]['quantity'];
        } else {
          exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
        }

      }

      this.export_list.push(exportList);

    }

    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]['field'] === 'amount') {
        foot[this.cols[j]['header']] = this.total_amt;
      } else if (this.cols[j]['field'] === 'rate') {
        foot[this.cols[j]['header']] = this.avg_rate;
      } else if (this.cols[j]['field'] === 'quantity') {
        foot[this.cols[j]['header']] = this.total_qty;
      } else {
        foot[this.cols[j]['header']] = '';
      }

    }

    this.export_list.push(foot);

  }

  // download doc ,pdf , excel

  exportPdf() {
    this.exportData();
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(this.exportColumns, this.export_list, 'Sale-Contract-Report');
  }

  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(this.export_list, 'Sale-Contract-Report');
  }


  getMonth(month: Number) {
    switch (month) {
      case 1: {
        return 'January';
        break;
      }
      case 2: {
        return 'February';
        break;
      }
      case 3: {
        return 'March';
        break;
      }
      case 4: {
        return 'April';
        break;
      }
      case 5: {
        return 'May';
        break;
      }
      case 6: {
        return 'June';
        break;
      }
      case 7: {
        return 'July';
        break;
      }
      case 8: {
        return 'August';
        break;
      }
      case 9: {
        return 'September';
        break;
      }
      case 10: {
        return 'October';
        break;
      }
      case 11: {
        return 'November';
        break;
      }
      case 12: {
        return 'December';
        break;
      }

    }
  }


  onSubmit($e) {

    this.fromDate = this.convert($e[0]);
    this.toDate = this.convert($e[1]);
    this.getSaleAverageReport();

  }
}
