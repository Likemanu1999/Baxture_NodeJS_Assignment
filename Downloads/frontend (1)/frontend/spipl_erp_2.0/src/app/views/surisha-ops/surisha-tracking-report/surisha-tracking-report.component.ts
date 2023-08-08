import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from 'moment';
import { SurishaSalePurchase } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-surisha-tracking-report',
	templateUrl: './surisha-tracking-report.component.html',
	styleUrls: ['./surisha-tracking-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, LoginService, CrudServices, DatePipe]
})
export class SurishaTrackingReportComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table;
	selected_date_range: any = [];
	selected_status: any;
	minDate: any = new Date();
	maxDate: any = new Date();
	isRange: any;
	cols: any = [];
	data: any = [];
	isLoading: boolean;
	filter: string[];
	page_title: any = "Surisha Sale Purchase Tracking Report"
	date = new Date();
	currentYear: number;


	constructor(
		private loginService: LoginService,
		private exportService: ExportService,
		private crudServices: CrudServices,
		public datepipe: DatePipe
	) {
		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.selected_date_range = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "so_no", header: "SO No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "booking_date", header: "So Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "buyer", header: "Buyer", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "signed", header: "Signed", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'html' },
			{ field: "", header: "Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "addedby", header: "RM", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "sector", header: "Sector", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "quantity", header: "Qty", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_amount", header: "Basic PI Total", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "received_amount", header: "Advance Rcv", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "balance_amount", header: "Bal Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "status", header: "PI Payment Status", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'html' },
			{ field: "proform_invoice_no", header: "Supplier PI No", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "invoice_no", header: "Supplier Invoice No", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "etd", header: "ETD", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Date' },
			{ field: "arrival_date", header: "ETA", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'html' },
			{ field: "gap", header: "GAP", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "bl_no", header: "BL Number", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "shipping_line", header: "Shipping Line", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "", header: "Remark", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },

		];
		this.filter = ['buyer', 'port_name', 'addedby', 'grade_name', 'sector', 'proform_invoice_no', 'status', 'invoice_no', 'bl_no', 'shipping_line'];

		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SurishaSalePurchase.surishaSalePurchaseTrack, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")

		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {

				res.data.map(item => {
					item.signed = item.so_sign_copy != null ? item.so_sign_copy_date != null ? `<span class="badge badge-pill badge-primary">Date : ${moment(item.so_sign_copy_date).format('DD-MM-YYYY')}</span>` : 'YES' : 'NO';
					if (item.pi_flag == 1) {
						item.status = `<div class="badge badge-pill badge-primary">LC</div><br>`
						if (item.bank_lc_no) {
							item.status += `<div style ="font-size:8px" >LC NO-${item.bank_lc_no}</div><br>`
						}
						if (item.payment_status == 1) {
							item.status += `<div class="badge badge-pill badge-success">LC Remited - ${moment(item.payment_paid_date).format('DD-MM-YYYY')}</div><br>`
						} else {
							item.status += `<div class="badge badge-pill badge-danger">Payment Pending</div>`
						}

					}

					if (item.pi_flag == 2) {
						item.status = `<div class="badge badge-pill badge-primary">TT</div><br>`
						if (item.nonlc_swift_ref_no) {
							item.status += `TT NO -${item.nonlc_swift_ref_no}`
						}
						if (item.payment_status == 1) {
							item.status += `<div class="badge badge-pill badge-danger"> Remited - ${moment(item.payment_paid_date).format('DD-MM-YYYY')}</div>`
						} else {
							item.status += `<div class="badge badge-pill badge-danger">Payment Pending</div>`
						}
					}

					if (item.arrival) {
						item.arrival_date = ''
						for (let val of item.arrival) {
							console.log(val[1]);

							item.arrival_date += `<div>${moment(val[0]).format('DD-MM-YYYY')} <span style="color : blue">(Updated on ${moment(val[1]).format('DD-MM-YYYY HH:mm:ss')})</span></div>`
						}

					}

					if (item.dispatch_date != null) {
						const booking = moment(item.booking_date);
						const dispatch = moment(item.dispatch_date);

						const noOfDays = Math.abs(dispatch.diff(booking, 'days'));


						if (noOfDays > 60) {
							item.gap = 60 - noOfDays
						} else if (noOfDays < 60) {
							item.gap = 60 - noOfDays
						}
					} else {
						// const booking = moment(item.booking_date);
						// const today = moment();

						// const noOfDays = Math.abs(today.diff(booking, 'days'));


						// if(noOfDays > 60) {
						//   item.gap =   60 - noOfDays
						// } else if(noOfDays < 60) {
						//   item.gap = 60 - noOfDays
						// }

						item.gap = 'Not Dispatch'

					}
					return item
				})

				this.data = res.data;
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
	}


	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
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

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
			let filter_cols = this.cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
		}
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
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
					if (this.cols[j]["type"] == "Quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
					} if (this.cols[j]["type"] == "html") {
						obj[this.cols[j]["header"]] = this.convertToPlain(final_data[i][this.cols[j]["field"]]);
					}
					else {
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
				} else if (this.cols[j]["field"] == "base_amount" ||
					this.cols[j]["field"] == "received_amount" || this.cols[j]["field"] == "balance_amount") {
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

	convertToPlain(html) {

		// Create a new div element
		var tempDivElement = document.createElement("div");

		// Set the HTML content with the given value
		tempDivElement.innerHTML = html;

		// Retrieve the text property of the element 
		return tempDivElement.textContent || tempDivElement.innerText || "";
	}

	onFilter(e, dt) {
		this.footerTotal(dt.filteredValue);
	}


}
