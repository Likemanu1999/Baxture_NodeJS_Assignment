import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Table } from 'primeng/table';
import { CentralizeCommunication } from '../../../shared/apis-path/apis-path';
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import * as moment from 'moment';


@Component({
  selector: 'app-centralize-communication',
  templateUrl: './centralize-communication.component.html',
  styleUrls: ['./centralize-communication.component.scss'],
  providers: [CrudServices, ToasterService]
})
export class CentralizeCommunicationComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000,
  });
  checked: boolean = true;

  page_title: any = "Centralize Communication";
  data: any;
  filter: any = [];
  cols: any = [];
  isLoading: boolean = false;
  datePickerConfig: any = staticValues.datePickerConfig;
  selected_date_range: any = [
    new Date(moment().format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  toggle: boolean = true

  constructor(
    private crudServices: CrudServices,
    private toasterService: ToasterService) { }

  ngOnInit() {
    this.getCols();
  }
  getCols() {

    if (this.toggle) {
      this.cols = [
        { field: "chat_id", header: "Chat Id", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "order_id", header: "Order Id", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "status", header: "Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "sent_from", header: "Sent From", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "sent_to", header: "Sent To", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "template_name", header: "Template Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "created_date", header: "Created Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      ];
      this.filter = ['status', 'sent_from', 'sent_to', 'created_date'];
      this.getWhatsappData();
    }
    else if (!this.toggle) {
      this.cols = [
        { field: "id", header: "Id", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "from", header: "From", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "to", header: "To", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
        { field: "subject", header: "Subject", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "attachment", header: "Attachment", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
        { field: "added_at", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" }
      ];
      this.filter = ['from', 'to', 'subject', 'added_at'];
      this.getEmailData();
    }
  }
  switch() {
    if (this.toggle == true) {
      this.toggle = false
      this.getCols()
    } else if (this.toggle == false) {
      this.toggle = true
      this.getCols()
    }
  }
  getWhatsappData() {
    this.isLoading = true;
    this.crudServices.getOne<any>(CentralizeCommunication.getWhatsappReport, {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
    }).subscribe((res: any) => {
      if (res.status == 200) {
        this.isLoading = false;
        if (res.data.length > 0) {
          this.data = res.data
          this.pushDropdown(this.data);
          this.footerTotal(this.data);
        }
        else {
          this.toasterService.pop('error', 'Alert', 'No Data Found..!');
        }
      }
    })
  }
  getEmailData() {
    this.isLoading = true;
    this.crudServices.getOne<any>(CentralizeCommunication.getEmailReport, {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
    }).subscribe((res: any) => {
      if (res.status == 200) {
        this.isLoading = false;
        if (res.data.length > 0) {
          this.data = res.data
          this.pushDropdown(this.data);
          this.footerTotal(this.data);
        }
        else {
          this.toasterService.pop('error', 'Alert', 'No Data Found..!');
        }
      }
    })

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
}