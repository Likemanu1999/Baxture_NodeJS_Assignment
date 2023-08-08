import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { GenerateSoPvcService } from '../../../shared/generate-doc/generate-so-pvc';
import { CurrencyPipe } from '@angular/common';
import { Calculations } from "../../../shared/calculations/calculations";
import { staticValues, roundAmount, roundQuantity, CommonService } from '../../../shared/common-service/common-service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
  dealOffer,
  UsersNotification,
  materialArrivalChart
} from '../../../shared/apis-path/apis-path';
import { Table } from "primeng/table";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'app-material-arrival-chart',
  templateUrl: './material-arrival-chart.component.html',
  styleUrls: ['./material-arrival-chart.component.scss'],
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
export class MaterialArrivalChartComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;

  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 10000
  });
  popoverTitle: string = 'Warning';
  popoverMessage: string = 'Are you sure, you want to delete?';
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  placement: string = 'right';
  cancelClicked: boolean = false;
  page_title: any = "Material Arrival Chart";
  role_id: any = null;
  company_id: any = null;
  links: string[] = [];
  cols: any = [];
  filter: any = [];
  user: UserDetails;
  notification_id_users = []
  selected_date_range: any = [
    new Date(moment().startOf('months').format("YYYY-MM-DD")),
    new Date(moment().endOf('months').format("YYYY-MM-DD"))
  ];
  data: any[];
  isLoading: boolean;
  datePickerConfig: any = staticValues.datePickerConfigNew;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;

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
  }

  getData() {
    this.data = [];
    this.isLoading = true;

    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
    }
    this.crudServices.getOne<any>(materialArrivalChart.getmaterialArrivalDet, condition).subscribe(res => {
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
      { field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
      { field: "supplier", header: "Suppilier", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
      { field: "arrival", header: "ETA", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
      { field: "offer_end", header: "ETD", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Date", style: '15%' },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", style: '7%' },
      { field: "portName", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '7%' },
    ];

    this.filter = ['supplier', 'grade_name', 'portName'];
    this.getData();
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


  onAction(item: any, type: string) {

  }


}
