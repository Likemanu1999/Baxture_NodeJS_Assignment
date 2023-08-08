import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
  SalesReportsNew,
  FreightTracking
} from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";

@Component({
  selector: 'app-freight-tracking',
  templateUrl: './freight-tracking.component.html',
  styleUrls: ['./freight-tracking.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService, ExportService]

})
export class FreightTrackingComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("reviewFreightModal", { static: false }) public reviewFreightModal: ModalDirective;

  popoverTitle: string = 'Warning';
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  popoverMessage2: string = 'Are you sure, you want to Update Freight Request?';
  placement2: string = 'right';
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;
  datePickerConfig = staticValues.datePickerConfigNew;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  page_title: any = "Freight Request Tracking";
  isLoading: boolean = false;
	statusList: any = staticValues.approval_status;
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().endOf('month').format("YYYY-MM-DD"))
  ];
  selected_status: any = this.statusList[0];
  cols: any = [];
  data: any = [];
  filter: any = [];
  loadCrossTypeList: any;
  freightRecord: any;
  remarkForm: FormGroup;
  constructor(
    private toasterService: ToasterService,
    private crudServices: CrudServices,
    private exportService: ExportService,
  ) {
    this.remarkForm = new FormGroup({
			remark: new FormControl(null, Validators.required),
		});
  }

  ngOnInit() {
    this.getCols();
    this.getLoadCrossTypeList();
    this.getData();
  }

  submit(action){ 
    let data = this.freightRecord;
    data.status = (action == 'approve') ? 2 : 3;
    data.approval_remark = this.remarkForm.value.remark;
    data.requested_by = data.requested_id;
    let payload = {
      id: this.freightRecord.id,
      data: data
    };
    this.crudServices.updateData<any>(FreightTracking.update,payload).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          if (action == 'approve') {
            this.toasterService.pop('success', 'Success', 'Freight request approved!');
          } else {
            this.toasterService.pop('success', 'Success', 'Freight request rejected!');
          }
          this.remarkForm.reset();
          this.getData();
          this.getLoadCrossTypeList();
          this.closeModal();
        }
        
      }
    });
  }

  getLoadCrossTypeList() {
    this.crudServices.getAll<any>(SalesReportsNew.getLoadCrossType).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.loadCrossTypeList = res.data;
        }
      }
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

  getData() {
    this.getCols();
    this.data = [];
    this.isLoading = true;
    this.crudServices.getOne<any>(FreightTracking.getFreightRecords, {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      status: this.selected_status.id,
    }).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.data = res.data;
          this.data.map(result => result.total_freight_load_cross = ((result.total_freight || 0.00) + (result.total_load_cross || 0.00)));

          this.pushDropdown(this.data);
          this.footerTotal(this.data);
        }
      }
      this.isLoading = false;
      this.table.reset();
    });
  }

  onAction(freightRecord) {
    this.freightRecord = freightRecord;
    this.reviewFreightModal.show();
  }

  getStatus(status) {
    return this.statusList.find(item => {
      return item.id == status
    }).status;
  }

  getLoadCross(loadCross){
    return this.loadCrossTypeList.find(item => {
      return item.id == loadCross
    }).type;
  }

  getCols() {
    this.cols = [

      { field: "dispatch_id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "invoice_no", header: "Invoice No.", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "status", header: "Status", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "old_quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity"},

      { field: "old_freight_rate", header: "Freight Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "new_freight_rate", header: "Req. Freight Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

      { field: "old_logistic_power", header: "Logistic Power", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "new_logistic_power", header: "Req. Logistic Power", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },

      { field: "load_cross", header: "Load/Cross Type", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "old_load_quantity", header: "Load Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "new_load_quantity", header: "Req. Load Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },

      { field: "old_cross_quantity", header: "Cross Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "new_cross_quantity", header: "Req. Cross Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },

      
      { field: "load_charges", header: "Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "cross_charges", header: "Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

      { field: "total_freight", header: "Total Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "total_load_cross", header: "Total Load/Cross", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

      { field: "total_freight_load_cross", header: "Total Freight + Load/Cross", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

      { field: "req_remark", header: "Req. Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "requested_date", header: "Requested Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "requested_by", header: "Requested By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },

      { field: "approval_remark", header: "Approval Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "modified_date", header: "Approved Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "approve_by", header: "Approved By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },      
    ];
    this.filter = ['customer', 'company_name','requested_by','dispatch_id','invoice_no'];
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
    // this.pushDropdown(this.data);
    this.footerTotal(this.data);
  }

  onFilter(e, dt) {
    // this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }

  onChangeStatus(e) {
    if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				status: e.value.status
			};
			this.getData();
		}
  }

  closeModal() {
    this.reviewFreightModal.hide();
  }

  exportData(type) {
    let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
    let exportData = [];
    let final_data = null;
    if (this.table.filteredValue == null) {
      final_data = this.data;
    } else {
      final_data = this.table.filteredValue;
    }

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
        } else if (this.cols[j]["field"] == "final_rate" ||
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
