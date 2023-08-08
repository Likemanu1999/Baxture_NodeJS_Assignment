import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Table } from 'primeng/table';
import { environment } from '../../../../environments/environment';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { allFD } from '../../../shared/apis-path/apis-path';


@Component({
  selector: 'app-quarterly-fd-report',
  templateUrl: './quarterly-fd-report.component.html',
  styleUrls: ['./quarterly-fd-report.component.scss'],
  providers: [PermissionService, ExportService, DatePipe, CrudServices],
  encapsulation: ViewEncapsulation.None
})
export class QuarterlyFdReportComponent implements OnInit {

  serverUrl: string;
  user: UserDetails;
  links: string[] = [];
  allFDs: any = [];
  subscription: Subscription;
  isLoading: boolean;
  cols: { field: string; header: string; filter: boolean, dropdown: any }[];
  bsRangeValue: Date[];
  fromDate: string;
  toDate: string;
  daysDiff: number;
  entireTotalAmt: number;
  filteredValuess: any[];
  export_data: any[];
  exportColumns = [];
  add_opt: boolean = false;
  view_opt: boolean = false;
  edit_opt: boolean = false;
  del_opt: boolean = false;
  excel_export: boolean = false;
  pdf_export: boolean = false;
 

  @ViewChild("dt", { static: false }) table: Table;

  constructor(
    private loginService: LoginService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private permissionService: PermissionService,
    private crudServices: CrudServices
  ) {

    this.serverUrl = environment.serverUrl;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.excel_export = (this.links.indexOf('Excel Quarter FD Report') > -1);
    this.pdf_export = (this.links.indexOf('PDF Quarter FD Report') > -1);

    this.cols = [
      { field: 'fd_make_date', header: 'FD Date', filter: false, dropdown: [] },
      { field: 'fd_no', header: 'FD No', filter: false, dropdown: [] },
      { field: 'bank_name', header: 'Bank', filter: true, dropdown: [] },
      { field: 'fd_amt', header: 'FD Amount', filter: false, dropdown: [] },
      { field: 'fd_maturity_date', header: 'Maturity Date', filter: false, dropdown: [] },
      { field: 'fd_in_days', header: 'FD Days', filter: false, dropdown: [] },
      { field: 'roi', header: 'Rate Int%', filter: false, dropdown: [] },
      { field: 'gross_interest', header: 'Gross Interest', filter: false, dropdown: [] },
      { field: 'tds_percent', header: 'TDS Per%', filter: false, dropdown: [] },
      { field: 'tds_amt', header: 'TDS Amount', filter: false, dropdown: [] },
      { field: 'net_interest', header: 'Net Interest', filter: false, dropdown: [] },
      { field: 'total_amt', header: 'Total Amount', filter: false, dropdown: [] },

    ]
  }

  ngOnInit() {
    this.getAllFds();
  }

  getAllFds() {
    this.allFDs = [];
    this.isLoading = true;
    this.subscription = this.crudServices.getOne<any>(allFD.getAll, {}).subscribe(res => { 
      this.isLoading = false;
      if (res.length > 0) {
        this.allFDs = res;
        let openFdAmt = 0;
        let closeFdAmt = 0;
          this.entireTotalAmt = res.reduce((prev, curr) => {
          openFdAmt = openFdAmt + curr['fd_amt'];
          return openFdAmt;
        }, 0);
        this.pushDropdown(this.allFDs)
      }
      this.calculateDays()      
    })
  } 
   // head filter for fromdate - todate called at start
  onSelect($e) {
    if ($e == null) {
      this.fromDate = '';
      this.toDate = '';
    } else {
      this.fromDate = this.convert($e[0]);
      this.toDate = this.convert($e[1]);
    }
    this.getAllFds();
  }

  convert(date) {
    if (date) {
      return this.datePipe.transform(date, 'yyyy-MM-dd');
    } else {
      return '';
    }
  }


  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  calculateDays() {
    if (this.fromDate !== undefined && this.fromDate !== '' && this.toDate !== undefined && this.toDate !== '') {

      const qfromdt = new Date(this.fromDate);
      const fromQuarterDate = moment(this.fromDate);
      const qtodt = new Date(this.toDate);
      const toQuarterDate = moment(this.toDate);
      this.daysDiff = 0;
      this.allFDs.forEach(element => {
        const fdmkdt = new Date(element.fd_make_date);
        const fdmaturitydt = new Date(element.fd_maturity_date);
        
        const fdReleaseDate = moment(element.fd_maturity_date);
        const fdMakingDate = moment(element.fd_make_date);

        if (fdmkdt < qfromdt && fdmaturitydt < qtodt) {
          this.daysDiff = Math.abs(fdReleaseDate.diff(fromQuarterDate, 'days'));

        } else if (fdmkdt > qfromdt && fdmaturitydt > qtodt) {
          this.daysDiff = Math.abs(toQuarterDate.diff(fdMakingDate, 'days'));
        } else if (fdmkdt < qfromdt && fdmaturitydt > qtodt) {
          this.daysDiff = Math.abs(toQuarterDate.diff(fromQuarterDate, 'days'));
        } else if (fdmkdt > qfromdt && fdmaturitydt < qtodt) {
          this.daysDiff = Math.abs(fdReleaseDate.diff(fdMakingDate, 'days'));
        } else {
          this.daysDiff = Math.abs(fdReleaseDate.diff(fdMakingDate, 'days'));
        }




      });
      this.calculateDetails();
    }

  }

  calculateDetails() {
    const arr = [];
    this.allFDs.forEach(element => {
      const fdAmt = element.fd_amt;
      const tds_per = element.tds_percent;
      const rateOfInterest = element.roi;
      const noOfDays = this.daysDiff;
      const grossInterest = (((fdAmt * (rateOfInterest / 100)) / 365) * noOfDays).toFixed(2);
      const tdsAmt = (Number(grossInterest) * (tds_per / 100)).toFixed(2);
      const netInterest = Number(grossInterest) - Number(tdsAmt);
      const totalAmt = Number(fdAmt) + Number(netInterest);
      element.gross_interest = Number(grossInterest);
      element.tds_amt = Number(tdsAmt).toFixed(2);
      element.net_interest = Number(netInterest.toFixed(2));
      element.total_amt = totalAmt.toFixed(2);
      arr.push(element)
    });
    this.allFDs = arr;

  }

  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    // this.allFDs = [];
    this.entireTotalAmt = 0;

    this.filteredValuess = event.filteredValue;
    // this.allFDs =  this.filteredValuess;
    if (this.filteredValuess.length > 0) {
      let openFdAmt = 0;
      let closeFdAmt = 0;
      this.entireTotalAmt = this.filteredValuess.reduce((prev, curr) => {
        if (curr['fd_release_date'] == null) {
          openFdAmt = openFdAmt + curr['fd_amt'];
          return openFdAmt;
        } else {
          closeFdAmt = closeFdAmt + curr['fd_amt'];
          return closeFdAmt;
        }
      }, 0);
    }



  }

  onRefresh() {
    this.fromDate = '';
    this.toDate = '';
    this.bsRangeValue = [];
    this.getAllFds();
  }


  exportData() {
    let total = 0;
    this.export_data = [];
    let arr = [];
    let count = 0;
    if (this.filteredValuess !== undefined && this.filteredValuess !== []) {
      arr = this.filteredValuess;
    } else {
      arr = this.allFDs
    }


    for (const fd of arr) {
      count++;
      const export_list = {
        'FD Date': fd.fd_make_date,
        'FD No': fd.fd_no,
        'Bank': fd.bank_name,
        'FD Amount': fd.fd_amt,
        'Maturity Date': fd.fd_maturity_date,
        'FD Days': fd.fd_in_days,
        'Rate Int%': fd.rate_of_interest,
        'Gross Interest': fd.gross_interest,
        'TDS Per%': fd.tds_per,
        'TDS Amount': fd.tds_amt,
        'Net Interest': fd.net_interest,
        'Total Amount': fd.total_amt

      };
      this.export_data.push(export_list);
      total = total + fd.fd_amt;
    }

    const foot = {
      'FD Date': 'Total Amount',
      'FD Amount': total
    };
    this.export_data.push(foot);
  }


  exportPdf() {
    this.exportData();

    for (let col of this.cols) {

      this.exportColumns.push({ title: col.header, dataKey: col.header });

    }

    this.exportService.exportPdf(this.exportColumns, this.export_data, 'FD-List');
  }



  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(this.export_data, 'FD-List');
  }

  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.allFDs;
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


  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    this.pushDropdown(this.allFDs);
    // this.footerTotal(this.data);
  }
}
