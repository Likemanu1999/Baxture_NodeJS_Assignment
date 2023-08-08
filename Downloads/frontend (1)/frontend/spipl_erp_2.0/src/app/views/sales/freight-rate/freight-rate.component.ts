import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnChanges, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { FreightRate, ReportRemark } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-freight-rate',
	templateUrl: './freight-rate.component.html',
	styleUrls: ['./freight-rate.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class FreightRateComponent implements OnInit, AfterViewInit, OnChanges {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('remarkModel', { static: false }) public remarkModel: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "Freight Rate";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	drop_down: boolean = false;
	maxDate: any = new Date();
	freight_rate_condition = staticValues.freight_Rate_condition
	selected_condition: any;
	selected_filter: any;
	datePickerConfig: any = staticValues.datePickerConfigNew;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	misData: any = [];
	filter: any = [];
	SFR: any;
	DFR: any;
	S_D: any;
	D_S: any;
	flag: boolean;
	total_SFR: any;
	total_DFR: any;
	// 
	tot_dfr1: any;
	tot_dfr2: any;
	tot_sfr1: any;
	tot_sfr2: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.selected_condition = this.freight_rate_condition[0].name;
		this.selected_filter = {
			"id": this.freight_rate_condition[0].id,
			"name": this.freight_rate_condition[0].name
		}
	}

	ngOnInit() {
		this.flag = true;
		this.tot_dfr1 = 0;
		this.tot_dfr2 = 0;
		this.tot_sfr1 = 0;
		this.tot_sfr2 = 0;
		this.getData('empty');
	}

	ngOnChanges() {
		this.flag = false;
	}
	ngAfterViewInit() {
		this.flag = false;

	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getData(filter_data) {
		if (filter_data == "All") {
			this.selected_condition = "All"
		}

		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			filter: this.selected_condition
		}

		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(FreightRate.freightRateResult, condition).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
					if (this.selected_condition == "All") {
						this.SFR_DFR(this.data);
					}

				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');
					// No Data Found - Toaster
				}
			}
			this.table.reset();
		});
	}

	onSelect(event, mode) {
	}


	getCols() {
		this.cols = [
			{ field: 'invoice_no', header: 'Invoice No', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'customer', header: 'Customer', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'company_name', header: 'Division', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'quantity', header: 'Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: 'final_rate', header: 'Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'dispatch_freight_rate', header: 'Dispatch Freight Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: 'sales_freight_rate', header: 'Sales Freight Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: 'import_lcoal_flag', header: 'Type', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Type" },
		];
		this.filter = ['invoice_no', 'customer', 'company_name', 'quantity', 'rate', 'dispatch_freight_rate', 'dispatch_freight_rate'];
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

				if (element.type == "Amount") {
					element.total = roundQuantity(total);
				} else if (element.type == "Quantity") {
					element.total = roundQuantity(total);

				}
				else {
					element.total = total;
				}

			}

		});
	}

	SFR_DFR(data) {
		if (data.length > 0) {
			this.total_SFR = 0;
			this.total_DFR = 0;
			this.tot_dfr1 = 0;
			this.tot_sfr1 = 0;
			this.tot_dfr2 = 0;
			this.tot_sfr2 = 0;

			data.forEach(item => {
				if (item.dispatch_freight_rate != null && item.sales_freight_rate != null && item.dispatch_freight_rate > item.sales_freight_rate) {
					this.tot_dfr1 = this.tot_dfr1 + item.dispatch_freight_rate;
					this.tot_sfr1 = this.tot_sfr1 + item.sales_freight_rate

				} else if (item.dispatch_freight_rate != null && item.sales_freight_rate != null && item.dispatch_freight_rate < item.sales_freight_rate) {
					this.tot_dfr2 = this.tot_dfr2 + item.dispatch_freight_rate;
					this.tot_sfr2 = this.tot_sfr2 + item.sales_freight_rate
				}

			})
			this.D_S = 0;
			this.S_D = 0;
			this.D_S = `Extra : ${roundQuantity(this.tot_dfr1 - this.tot_sfr1)}`;
			this.S_D = `Saved : ${roundQuantity(this.tot_sfr2 - this.tot_dfr2)}`;

		}
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
	}

	onFilter(e, dt) {
		this.footerTotal(dt.filteredValue);
	}
	
	oncloseModal() {
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
			final_data[i].import_lcoal_flag = final_data[i].import_lcoal_flag == 1 ? "Import" : "Local";
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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
				if (this.cols[j]["field"] == "order_quantity" || this.cols[j]["field"] == "dispatch_quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "final_rate") {
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

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_filter = {
				id: e.value.id,
				name: e.value.name
			};
			this.selected_condition = e.value.name;
			this.getData('empty');
		}

	}

}

