import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, roundAmount, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesLoadCrossReports } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
@Component({
	selector: 'app-load-cross-report',
	templateUrl: './load-cross-report.component.html',
	styleUrls: ['./load-cross-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService],
})

export class LoadCrossReportComponent implements OnInit {

	@ViewChild("datesModal", { static: false }) public datesModal: ModalDirective;
	@ViewChild("transporterDetailsModal", { static: false }) public transporterDetailsModal: ModalDirective;
	@ViewChild("addOtherAmountModal", { static: false }) public addOtherAmountModal: ModalDirective;
	@ViewChild("chargesListModal", { static: false }) public chargesListModal: ModalDirective;
	@ViewChild("addChargesModal", { static: false }) public addChargesModal: ModalDirective;
	@ViewChild("dt1", { static: false }) table1: Table;
	@ViewChild("dt2", { static: false }) table2: Table;
	@ViewChild("dt3", { static: false }) table3: Table;
	@ViewChild("dt4", { static: false }) table4: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Load/Cross Report"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to approve?';
	popoverMessage2: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;
	monthPickerConfig = staticValues.monthPickerConfig;
	datePickerConfig = staticValues.datePickerConfig;

	selected_date: any = null;
	selected_month: any = new Date();
	selected_financial_year: any = moment().format('YYYY') + '-' + moment().add(1, 'y').format('YYYY');
	financial_year_list: any = [];
	godown_types: any = staticValues.godown_types;
	selected_godown_type: any = 1;
	selected_tab: any = 0;
	isEdit: boolean = false;
	showModal: boolean = false;
	viewChargesModal: boolean = false;
	selected_godown_id: any = null;

	transportersDates: any = [];
	stockTransferDates: any = [];

	addOtherAmountForm: FormGroup;
	addChargesForm: FormGroup;

	cols1: any = [];
	data1: any = [];
	filter1: any = [];

	cols2: any = [];
	data2: any = [];
	filter2: any = [];

	cols3: any = [];
	data3: any = [];
	filter3: any = [];

	cols4: any = [];
	data4: any = [];
	filter4: any = [];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];
	}

	ngOnInit() {
		this.initForm();
		this.getFinancialYearList();
		this.getVerifyReport();
	}

	initForm() {
		this.addOtherAmountForm = new FormGroup({
			godown_id: new FormControl(null, Validators.required),
			amount: new FormControl(null, Validators.required),
			remark: new FormControl(null)
		});

		this.addChargesForm = new FormGroup({
			id: new FormControl(null),
			godown_id: new FormControl(null, Validators.required),
			date: new FormControl(new Date(), Validators.required),
			confirmed_charges: new FormControl(null, Validators.required),
			is_knock_off: new FormControl(null),
			remark: new FormControl(null)
		});
	}

	getFinancialYearList() {
		this.crudServices.getAll<any>(SalesLoadCrossReports.getFinancialYears).subscribe((response) => {
			if (response.code == "100") {
				let arr = [];
				response.data.forEach(element => {
					let next_year = moment(element.year + "-04-01").add(1, 'y').format('YYYY');
					let obj = {
						label: "Apr " + element.year + ' - ' + "Mar " + next_year,
						value: element.year + '-' + next_year
					};
					arr.push(obj);
				});
				this.financial_year_list = arr;
			}
		});
	}

	getCols() {
		this.cols1 = [
			{ field: "godown_id", header: "#", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "load_quantity", header: "Load Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "load_charges", header: "Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_load_charges", header: "Total Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cross_charges", header: "Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cross_quantity", header: "Cross Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_cross_charges", header: "Total Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_quantity", header: "Total Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_charges", header: "Total Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter1 = ['godown_name'];

		this.cols2 = [
			{ field: "godown_id", header: "#", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "load_quantity", header: "Load Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "load_charges", header: "Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_load_charges", header: "Total Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cross_charges", header: "Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cross_quantity", header: "Cross Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_cross_charges", header: "Total Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_quantity", header: "Total Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_other_amount", header: "Other Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "total_charges", header: "Grand Total", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "total_confirmed_charges", header: "LCR", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "total_knock_off_charges", header: "Knock Off", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Quantity" },
			{ field: "total_pending_charges", header: "LCP", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter2 = ['godown_name'];


		this.cols3 = [
			{ field: "id", header: "#", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "date", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "confirmed_charges", header: "Confirmed Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "knock_off_amount", header: "Knock Off Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter3 = ['remark'];

		this.cols4 = [
			{ field: "transporter_id", header: "#", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "transporter", header: "Transporter", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_no", header: "Truck No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "date", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "load_quantity", header: "Load Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "load_charges", header: "Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_load_charges", header: "Total Load Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cross_charges", header: "Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cross_quantity", header: "Cross Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_cross_charges", header: "Total Cross Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_quantity", header: "Total Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_charges", header: "Total Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" }
		];
		this.filter4 = ['transporter', 'truck_no'];
	}

	getVerifyReport() {
		this.data1 = [];
		this.isLoading = true;
		let from_date = null;
		let to_date = null;
		if (this.selected_date == null && this.selected_month == null) {
			let year = this.selected_financial_year.split("-");
			from_date = moment(year[0] + "-04-01").format('YYYY-MM-DD');
			to_date = moment(year[1] + "-03-31").format('YYYY-MM-DD');
		} else {
			if (this.selected_date == null) {
				from_date = moment(this.selected_month).startOf('month').format('YYYY-MM-DD');
				to_date = moment(this.selected_month).endOf('month').format('YYYY-MM-DD');
			} else {
				from_date = moment(this.selected_date).format('YYYY-MM-DD');
				to_date = moment(this.selected_date).format('YYYY-MM-DD');
			}
		}
		this.crudServices.getOne<any>(SalesLoadCrossReports.getVerifyReport, {
			from_date: from_date,
			to_date: to_date,
			type: this.selected_godown_type
		}).subscribe(res => {
			this.isLoading = false;
			this.getCols();
			if (res.code == "100") {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.load_quantity = roundQuantity(element.load_quantity);
						element.load_charges = roundAmount(element.load_charges);
						element.total_load_charges = roundAmount(element.total_load_charges);
						element.cross_charges = roundAmount(element.cross_charges);
						element.cross_quantity = roundQuantity(element.cross_quantity);
						element.total_cross_charges = roundAmount(element.total_cross_charges);
						element.total_quantity = roundQuantity(element.total_quantity);
						element.total_charges = roundAmount(element.total_charges);
					});
					this.data1 = res.data.filter(x => x.total_charges > 0);
					this.pushDropdown(this.data1);
					this.footerTotal(this.data1);
				}
			}
			if (this.table1 != null && this.table1 != undefined) {
				this.table1.reset();
			}
		});
	}

	getPaymentReport() {
		this.data2 = [];
		this.isLoading = true;
		let from_date = null;
		let to_date = null;
		if (this.selected_date == null && this.selected_month == null) {
			let year = this.selected_financial_year.split("-");
			from_date = moment(year[0] + "-04-01").format('YYYY-MM-DD');
			to_date = moment(year[1] + "-03-31").format('YYYY-MM-DD');
		} else {
			if (this.selected_date == null) {
				from_date = moment(this.selected_month).startOf('month').format('YYYY-MM-DD');
				to_date = moment(this.selected_month).endOf('month').format('YYYY-MM-DD');
			} else {
				from_date = moment(this.selected_date).format('YYYY-MM-DD');
				to_date = moment(this.selected_date).format('YYYY-MM-DD');
			}
		}
		this.crudServices.getOne<any>(SalesLoadCrossReports.getPaymentReport, {
			from_date: from_date,
			to_date: to_date,
			type: this.selected_godown_type
		}).subscribe(res => {
			this.isLoading = false;
			this.getCols();
			if (res.code == "100") {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.load_quantity = roundQuantity(element.load_quantity);
						element.load_charges = roundAmount(element.load_charges);
						element.total_load_charges = roundAmount(element.total_load_charges);
						element.cross_charges = roundAmount(element.cross_charges);
						element.cross_quantity = roundQuantity(element.cross_quantity);
						element.total_cross_charges = roundAmount(element.total_cross_charges);
						element.total_quantity = roundQuantity(element.total_quantity);
						element.total_other_amount = roundAmount(element.total_other_amount);
						element.total_confirmed_charges = roundAmount(element.total_confirmed_charges);
						element.total_knock_off_charges = roundQuantity(element.total_knock_off_charges);
						let total_charges = Number(element.total_charges) + Number(element.total_other_amount);
						let total_pending_charges = total_charges - (Number(element.total_confirmed_charges) + Number(element.total_knock_off_charges));
						element.total_charges = roundAmount(total_charges);
						element.total_pending_charges = roundAmount(total_pending_charges);
					});
					this.data2 = res.data;
					this.pushDropdown(this.data2);
					this.footerTotal(this.data2);
				}
			}
			if (this.table2 != null && this.table2 != undefined) {
				this.table2.reset();
			}
		});
	}

	viewCharges(item) {
		this.data3 = [];
		this.isLoading = true;
		let year = this.selected_financial_year.split("-");
		let from_date = moment(year[0] + "-04-01").format('YYYY-MM-DD');
		let to_date = moment(year[1] + "-03-31").format('YYYY-MM-DD');
		this.selected_godown_id = item.godown_id;
		this.crudServices.getOne<any>(SalesLoadCrossReports.getConfirmedCharges, {
			godown_id: item.godown_id,
			from_date: from_date,
			to_date: to_date,
			stock_type: this.selected_godown_type,
			charges_type: 2
		}).subscribe(res => {
			this.isLoading = false;
			this.showModal = true;
			this.viewChargesModal = false;
			if (res.data.length > 0) {
				res.data.forEach(element => {
					element.date = moment(element.date).format("DD-MMM-YYYY");
				});
				this.data3 = res.data;
				this.getCols();
				this.pushDropdown(this.data3);
				this.footerTotal(this.data3);
			} else {
				this.chargesListModal.show();
			}
			if (this.table3 != null && this.table3 != undefined) {
				this.table3.reset();
			}
		});
	}

	getTransporterDetails(godown_id) {
		this.data4 = [];
		this.isLoading = true;
		let from_date = null;
		let to_date = null;
		if (this.selected_date == null && this.selected_month == null) {
			let year = this.selected_financial_year.split("-");
			from_date = moment(year[0] + "-04-01").format('YYYY-MM-DD');
			to_date = moment(year[1] + "-03-31").format('YYYY-MM-DD');
		} else {
			if (this.selected_date == null) {
				from_date = moment(this.selected_month).startOf('month').format('YYYY-MM-DD');
				to_date = moment(this.selected_month).endOf('month').format('YYYY-MM-DD');
			} else {
				from_date = moment(this.selected_date).format('YYYY-MM-DD');
				to_date = moment(this.selected_date).format('YYYY-MM-DD');
			}
		}
		this.crudServices.getOne<any>(SalesLoadCrossReports.getGodownDetails, {
			from_date: from_date,
			to_date: to_date,
			type: this.selected_godown_type,
			godown_id: godown_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.showModal = true;
					let final_arr = [];
					let object_arr = this.groupBy(res.data, 'date');
					var main_arr = Object.entries(object_arr);

					main_arr.forEach(([key, value]) => {
						let arr = Object.entries(value);
						let child_arr = [];
						let date = null;
						let total_load_charges = 0;
						let total_cross_charges = 0;
						let total_charges = 0;

						let total_load_quantity = 0;
						let total_cross_quantity = 0;
						let total_quantity = 0;

						arr.forEach(element => {
							element[1].load_quantity = roundQuantity(element[1].load_quantity);
							element[1].load_charges = roundAmount(element[1].load_charges);
							element[1].total_load_charges = roundAmount(element[1].total_load_charges);
							element[1].cross_charges = roundAmount(element[1].cross_charges);
							element[1].cross_quantity = roundQuantity(element[1].cross_quantity);
							element[1].total_cross_charges = roundAmount(element[1].total_cross_charges);
							element[1].total_quantity = roundQuantity(element[1].total_quantity);
							element[1].total_charges = roundAmount(element[1].total_charges);

							date = element[1].date;
							total_load_charges += roundAmount(element[1].total_load_charges);
							total_cross_charges += roundAmount(element[1].total_cross_charges);
							total_charges += roundAmount(element[1].total_charges);

							total_load_quantity += Number(element[1].load_quantity);
							total_cross_quantity += Number(element[1].cross_quantity);
							total_quantity += Number(element[1].total_quantity);

							child_arr.push(element[1]);
						});
						final_arr.push({
							data_arr: child_arr
						});
						final_arr.push({
							footer: [
								{
									date: date,
									total_load_charges: total_load_charges,
									total_cross_charges: total_cross_charges,
									total_charges: total_charges,
									total_load_quantity: total_load_quantity,
									total_cross_quantity: total_cross_quantity,
									total_quantity: total_quantity
								}
							]
						});
					});
					this.data4 = final_arr;
					this.getCols();
					this.transporterDetailsModal.show();
				}
			}
			if (this.table4 != null && this.table4 != undefined) {
				this.table4.reset();
			}
		});
	}

	getApprovalDates() {
		this.crudServices.getOne<any>(SalesLoadCrossReports.getApprovalDates, {
			type: 1
		}).subscribe((response) => {
			if (response.code == "100") {
				this.transportersDates = response.data;
				this.crudServices.getOne<any>(SalesLoadCrossReports.getApprovalDates, {
					type: 2
				}).subscribe((response) => {
					if (response.code == "100") {
						this.stockTransferDates = response.data;
						this.datesModal.show();
					}
				});
			}
		});
	}

	pushDropdown(arg) {
		let final_data = null;
		let final_cols = null;

		if (this.showModal) {
			final_cols = this.cols3;
			if (arg) {
				final_data = arg;
			} else {
				final_data = this.data3;
			}
			let filter_cols = final_cols.filter(col => col.filter == true);

			filter_cols.forEach(element => {
				let unique = final_data.map(item =>
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
		} else {
			final_cols = (this.selected_tab == 1) ? this.cols2 : this.cols1;
			if (arg) {
				final_data = arg;
			} else {
				final_data = (this.selected_tab == 1) ? this.data2 : this.data1;
			}
			let filter_cols = final_cols.filter(col => col.filter == true);
			filter_cols.forEach(element => {
				let unique = final_data.map(item =>
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

	customFilter(value, col, data) {
		let res = this.table2.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal((this.selected_tab == 1) ? this.data2 : this.data1);
	}

	dateFilter(value, col) {
		let date = (value) ? moment(value).format('YYYY-MM-DD') : null;
		let res = this.table2.filter(date, col, 'equals');
		// this.pushDropdown(this.data);
		this.footerTotal((this.selected_tab == 1) ? this.data2 : this.data1);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	footerTotal(arg) {
		let final_data = null;
		let final_cols = null;
		if (this.showModal) {
			if (this.viewChargesModal) {
				if (arg) {
					final_data = arg;
				} else {
					final_data = this.data3;
				}
				final_cols = this.cols3;
				let filter_cols = final_cols.filter(col => col.footer == true);
				filter_cols.forEach(element => {
					let total = final_data.map(item =>
						item[element.field]
					).reduce((sum, item) => sum + item);
					element.total = total;
				});
				this.chargesListModal.show();
			} else {
				let data = null;
				if (arg) {
					data = arg;
				} else {
					data = this.data4;
				}
				final_cols = this.cols4;
				let filter_cols = final_cols.filter(col => col.footer == true);
				filter_cols.forEach(element => {
					let total = data.map(item =>
						item[element.field]
					).reduce((sum, item) => sum + item);
					element.total = total;
				});
				this.transporterDetailsModal.show();
			}
		} else {
			final_cols = (this.selected_tab == 1) ? this.cols2 : this.cols1;
			if (arg) {
				final_data = arg;
			} else {
				final_data = (this.selected_tab == 1) ? this.data2 : this.data1;
			}
			let filter_cols = final_cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = final_data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
		}
	}

	onAction(item, type, event) {
		if (type == 'Dates') {
			this.getApprovalDates();
		}
		if (type == "Financial_Year") {
			this.selected_date = null;
			this.selected_month = null;
			this.getVerifyReport();
		}
		if (type == 'Month') {
			this.selected_date = null;
			this.getVerifyReport();
		}
		if (type == 'Godown') {
			this.getVerifyReport();
		}
		if (type == 'Tab') {
			this.selected_tab = event.index;
			if (event.index == 1) {
				this.getPaymentReport()
			} else {
				this.getVerifyReport()
			}
		}
		if (type == "Details") {
			if (this.selected_tab == 0) {
				this.getTransporterDetails(item.godown_id);
			}
		}
		if (type == "View_Charges") {
			this.viewCharges(item);
		}
		if (type == "Add_Other") {
			this.addOtherAmountForm.reset();
			this.addOtherAmountForm.patchValue({
				godown_id: item.godown_id
			});
			this.addOtherAmountModal.show();
		}
		if (type == "Add_Charges") {
			this.isEdit = false;
			this.chargesListModal.hide();
			this.addChargesModal.show();
			this.addChargesForm.patchValue({
				godown_id: this.selected_godown_id
			});
		}
		if (type == "Edit_Charges") {
			this.crudServices.getOne<any>(SalesLoadCrossReports.getPaymentDetails, {
				id: item.id
			}).subscribe(res => {
				if (res.code == "100") {
					if (res.data.length > 0) {
						this.addChargesForm.patchValue({
							id: res.data[0].id,
							is_knock_off: (res.data[0].is_knock_off == 1) ? true : false,
							confirmed_charges: (res.data[0].is_knock_off == 1) ? res.data[0].knock_off_amount : res.data[0].confirmed_charges,
							date: res.data[0].date,
							remark: res.data[0].remark
						});
						this.isEdit = true;
						this.chargesListModal.hide();
						this.addChargesModal.show();
					}
				}
			});
		}
		if (type == "Approve") {
			let is_approved = (item.is_approved == 0) ? 1 : 0;
			this.approveGodown(is_approved, item.godown_id);
		}
		if (type == 'Date') {
			this.selected_date = item.date;
			this.selected_month = null;
			this.selected_godown_type = item.type;
			this.getVerifyReport();
			this.datesModal.hide();
		}
	}

	onOpenCalendar(container) {
		container.monthSelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
		container.setViewMode('month');
	}

	groupBy(arr, property) {
		return arr.reduce(function (memo, x) {
			if (!memo[x[property]]) {
				memo[x[property]] = [];
			}
			memo[x[property]].push(x);
			return memo;
		}, {});
	}

	closeModal() {
		this.isEdit = false;
		this.showModal = false;
		this.viewChargesModal = false;
		this.selected_godown_id = null;
		this.datesModal.hide();
		this.transporterDetailsModal.hide();
		this.addOtherAmountForm.reset();
		this.addOtherAmountModal.hide();
		this.chargesListModal.hide();
		this.addChargesForm.reset();
		this.addChargesModal.hide();
	}

	closeAddChargesModal() {
		this.addChargesForm.reset();
		this.addChargesModal.hide();
		this.chargesListModal.show();
	}

	approveGodown(is_approved, godown_id) {
		let from_date = null;
		let to_date = null;
		if (this.selected_date == null && this.selected_month == null) {
			let year = this.selected_financial_year.split("-");
			from_date = moment(year[0] + "-04-01").format('YYYY-MM-DD');
			to_date = moment(year[1] + "-03-31").format('YYYY-MM-DD');
		} else {
			if (this.selected_date == null) {
				from_date = moment(this.selected_month).startOf('month').format('YYYY-MM-DD');
				to_date = moment(this.selected_month).endOf('month').format('YYYY-MM-DD');
			} else {
				from_date = moment(this.selected_date).format('YYYY-MM-DD');
				to_date = moment(this.selected_date).format('YYYY-MM-DD');
			}
		}
		this.crudServices.updateData<any>(SalesLoadCrossReports.verifyReport, {
			type: this.selected_godown_type,
			from_date: from_date,
			to_date: to_date,
			godown_id: godown_id,
			is_approved: is_approved
		}).subscribe(res => {
			if (res.code == "100") {
				this.getVerifyReport();
			}
		});
	}

	submitOtherAmountForm(charges_type) {
		let data = {
			godown_id: this.addOtherAmountForm.value.godown_id,
			date: moment().format("YYYY-MM-DD"),
			other_amount: Number(this.addOtherAmountForm.value.amount),
			confirmed_charges: 0,
			knock_off_amount: 0,
			financial_year: this.selected_financial_year,
			remark: this.addOtherAmountForm.value.remark,
			is_knock_off: 0,
			stock_type: this.selected_godown_type,
			charges_type: charges_type
		};
		this.updateCharges(data, "Other");
	}

	updateCharges(data, type) {
		if (this.isEdit) {
			this.crudServices.getOne<any>(SalesLoadCrossReports.updateOtherConfirmedCharges, {
				data: data,
				id: this.addOtherAmountForm.value.id
			}).subscribe(res => {
				if (res.code == "100") {
					this.afterUpdateCharges(1);
				}
			});
		} else {
			this.crudServices.getOne<any>(SalesLoadCrossReports.addOtherConfirmedCharges, {
				data: data
			}).subscribe(res => {
				if (res.code == "100") {
					this.toasterService.pop('success', 'Success', "Charges Added Successfully");
					if (type == "Other") {
						this.closeModal();
						this.getPaymentReport();
					} else {
						this.afterUpdateCharges(2);
					}
				}
			});
		}
	}

	submitChargesForm() {
		let confirmed_charges = 0;
		let knock_off_amount = 0;
		let is_knock_off = (this.addChargesForm.value.is_knock_off) ? 1 : 0;
		if (is_knock_off == 1) {
			confirmed_charges = 0;
			knock_off_amount = Number(this.addChargesForm.value.confirmed_charges);
		} else {
			confirmed_charges = Number(this.addChargesForm.value.confirmed_charges);
			knock_off_amount = 0;
		}
		let data = {
			godown_id: this.addChargesForm.value.godown_id,
			date: moment(this.addChargesForm.value.date).format("YYYY-MM-DD"),
			other_amount: 0,
			confirmed_charges: confirmed_charges,
			knock_off_amount: knock_off_amount,
			financial_year: this.selected_financial_year,
			remark: this.addChargesForm.value.remark,
			is_knock_off: is_knock_off,
			stock_type: this.selected_godown_type,
			charges_type: 2
		};
		this.updateCharges(data, "Charges");
	}

	afterUpdateCharges(charges_type) {
		this.addChargesForm.reset();
		this.addChargesModal.hide();
		this.data3 = [];
		this.isLoading = true;
		let year = this.selected_financial_year.split("-");
		let from_date = moment(year[0] + "-04-01").format('YYYY-MM-DD');
		let to_date = moment(year[1] + "-03-31").format('YYYY-MM-DD');
		this.crudServices.getOne<any>(SalesLoadCrossReports.getConfirmedCharges, {
			godown_id: this.selected_godown_id,
			from_date: from_date,
			to_date: to_date,
			stock_type: this.selected_godown_type,
			charges_type: charges_type
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == "100") {
				this.showModal = true;
				this.viewChargesModal = false;
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.date = moment(element.date).format("DD-MMM-YYYY");
					});
					this.data3 = res.data;
					this.getCols();
					this.pushDropdown(this.data3);
					this.footerTotal(this.data3);
				} else {
					this.chargesListModal.show();
				}
			}
			if (this.table4 != null && this.table4 != undefined) {
				this.table4.reset();
			}
		});
	}

	exportData(type) {
		let fileName = "";
		let exportData = [];
		let final_data = [];
		let final_cols = [];

		if (this.showModal) {
			final_data = this.data3;
			final_cols = this.cols3;
			fileName = "Godown Transporter Details";
		} else {
			final_data = (this.selected_tab == 1) ? this.data2 : this.data1;
			final_cols = (this.selected_tab == 1) ? this.cols2 : this.cols1;
			let godown_type = (this.selected_godown_type == 1) ? "Transporters" : "Stock Transfer";
			let date = (this.selected_date == null) ? this.selected_month : this.selected_date;
			if (this.selected_tab == 0) {
				fileName = "Verify Charges Report (" + godown_type + ") - " + moment(date).format("DD-MMM-YYYY");
			} else {
				fileName = "Payment Report (" + godown_type + ") - " + moment(date).format("DD-MMM-YYYY");
			}
		}

		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < final_cols.length; j++) {
				if (final_cols[j]["field"] != "action") {
					if (final_cols[j]["field"] == "quantity") {
						obj[final_cols[j]["header"]] = final_data[i][final_cols[j]["field"]] + " MT";
					} else {
						obj[final_cols[j]["header"]] = final_data[i][final_cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < final_cols.length; j++) {
			if (final_cols[j]["field"] != "action") {
				if (final_cols[j]["field"] == "load_quantity" ||
					final_cols[j]["field"] == "cross_quantity" ||
					final_cols[j]["field"] == "total_quantity" ||
					final_cols[j]["field"] == "total_knock_off_charges") {
					foot[final_cols[j]["header"]] = final_cols[j]["total"] + " MT";
				} else if (final_cols[j]["field"] == "load_charges" ||
					final_cols[j]["field"] == "total_load_charges" ||
					final_cols[j]["field"] == "cross_charges" ||
					final_cols[j]["field"] == "total_cross_charges" ||
					final_cols[j]["field"] == "total_charges" ||
					final_cols[j]["field"] == "total_charges" ||
					final_cols[j]["field"] == "total_confirmed_charges" ||
					final_cols[j]["field"] == "total_other_amount" ||
					final_cols[j]["field"] == "total_pending_charges"
				) {
					foot[final_cols[j]["header"]] = final_cols[j]["total"];
				} else {
					foot[final_cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);

		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = final_cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

}
