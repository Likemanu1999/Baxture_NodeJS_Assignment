import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	SalesReportsNew,
	DispatchBilling,
	Notifications,
	FileUpload,
	UsersNotification,
	Analytics
} from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";
import { DatePipe } from '@angular/common';
import { element } from 'protractor';

@Component({
	selector: 'app-sales-purchase-average-new',
	templateUrl: './sales-purchase-average-new.component.html',
	styleUrls: ['./sales-purchase-average-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SalesPurchaseAverageNewComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Sales Purchase Average Report";
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure you want to Change Discount Status?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	update_discount_status: boolean = false;
	isLoading: boolean = false;
	datePickerConfig: any = staticValues.datePickerConfig;
	companyList: any = staticValues.company_list_new;
	selected_date_range: any = [];
	selected_company: any;
	cols: any = [];
	data: any = [];
	filter: any = [];
	sale_total_qty: any;
	purchase_tot_qty: any;
	sales_average_rate: number;
	purchase_avg_rate: number;
	filterValuess = [];
	currentYear: number;
	date = new Date();
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	maxDate: any = new Date();
	isRange: any;
	footerTotalData: any = [];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
		private datepipe: DatePipe
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.update_discount_status = (this.links.find(x => x == 'update_discount_status') != null) ? true : false;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.selected_company = staticValues.company_list_new.find(item => item.id == this.user.userDet[0].company_id);

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
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "main_grade", header: "Main Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "local_purchase_qty", header: "Local Purchase Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "local_purchase_rate", header: "Local Purchase Average Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: "local_MOU_quantity", header: "Local MOU Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "mou_purchase_rate", header: "MOU Purchase Average Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: "local_sales_quantity", header: "Local Sales Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "local_sales_average_rate", header: "Local Sales Average Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: "mou_sales_quantity", header: "MOU Sales Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "mou_sales_average_rate", header: "MOU Sales Average Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: "import_sales_quantity", header: "Import Sales Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "import_sales_average_rate", header: "Import Sales Average Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: "import_purchase_qty", header: "Import Purchase Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "import_purchase_avg_rate", header: "Import Purchase Average Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
		];
		this.filter = ['godown_name', 'main_grade'];
		this.getData();
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
		let data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Analytics.getSalesPurchaseAverage, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: this.selected_company.id
		}).subscribe(res => {
			let sales_data = res.data.sales_data;
			let purchase_data = res.data.purchase_data;
			let local_sales_data = res.data.local_sales_result;
			let import_sales_data = res.data.import_sales_result;
			let import_purchase_data = res.data.import_purchase

			for (let val of purchase_data) {
				let index = data.findIndex(item => item.godown_id == val.godown_id && item.main_grade_id == val.main_grade_id)

				if (index > -1) {
					if (val.deal_type == 1) {
						data[index].local_MOU_quantity += roundQuantity(val.local_purchase_qty);
						data[index].local_purchase_qty = data[index].local_purchase_qty ? data[index].local_purchase_qty : 0;
						data[index].mou_purchase_rate = data[index].mou_purchase_rate ? (data[index].mou_purchase_rate + val.local_purchase_rate) / 2 : val.local_purchase_rate;
					} else {
						data[index].local_MOU_quantity = data[index].local_MOU_quantity ? data[index].local_MOU_quantity : 0;
						data[index].local_purchase_qty += roundQuantity(val.local_purchase_qty);
						data[index].local_purchase_rate = data[index].local_purchase_rate ? (data[index].local_purchase_rate + val.local_purchase_rate) / 2 : val.local_purchase_rate;
					}
					data[index].purchase_amount = val.purchase_amount;
				} else {
					if (val.deal_type == 1) {
						val.local_MOU_quantity = roundQuantity(val.local_purchase_qty);
						val.local_purchase_qty = 0;
						val.mou_purchase_rate = val.local_purchase_rate;
						val.local_purchase_rate = 0;
					} else {
						val.local_purchase_qty = roundQuantity(val.local_purchase_qty);
						val.local_MOU_quantity = 0
						val.mou_purchase_rate = 0;
					}
					data.push(val);
				}

			}

			this.data = data;
						
			for (let val of local_sales_data) {
				let index = data.findIndex(item => item.godown_id == val.godown_id && item.main_grade_id == val.main_grade_id)

				if (index > -1) {
					if (val.stock_type == 2 || val.stock_type == null) {
						data[index].mou_sales_quantity = (data[index].mou_sales_quantity || 0 ) +  roundQuantity(val.local_sales_quantity);
						data[index].local_sales_quantity = data[index].local_sales_quantity ? data[index].local_sales_quantity : 0;
						data[index].mou_sales_average_rate = data[index].mou_sales_average_rate ? (data[index].mou_sales_average_rate + val.local_sales_average_rate) / 2 : val.local_sales_average_rate;
					} else if (val.stock_type == 1){
						data[index].local_sales_quantity = (data[index].local_sales_quantity || 0) + roundQuantity(val.local_sales_quantity);
						data[index].local_sales_average_rate =  data[index].local_sales_average_rate ? (data[index].local_sales_average_rate + val.local_sales_average_rate) / 2 : val.local_sales_average_rate;
						data[index].mou_sales_quantity = data[index].mou_sales_quantity ? data[index].mou_sales_quantity : 0;
					}
					data[index].local_sale_amount = val.local_sale_amount;
				} else {
					if (val.stock_type == 2 || val.stock_type == null) {
						val.mou_sales_quantity = roundQuantity(val.local_sales_quantity);
						val.local_sales_quantity = 0;
						val.mou_sales_average_rate = val.local_sales_average_rate;
						val.local_sales_average_rate = 0;
					} else  if (val.stock_type == 1 ){
						val.local_sales_quantity = roundQuantity(val.local_sales_quantity);	
						val.mou_sales_quantity = 0
						val.mou_sales_average_rate = 0;
					}
					data.push(val);
				}
			}
			console.log(data);
			
			this.data = data;
			for (let val of import_sales_data) {
				let index = this.data.findIndex(item => item.godown_id == val.godown_id && item.main_grade_id == val.main_grade_id)

				if (index > -1) {
					this.data[index].import_sales_quantity = roundQuantity(val.import_sales_quantity);
					this.data[index].import_sales_average_rate = val.import_sales_average_rate;
					this.data[index].import_sale_amount = val.import_sale_amount;
				} else {
					val.import_sales_quantity = roundQuantity(val.import_sales_quantity)
					this.data.push(val)
				}

			}

			for (let val of import_purchase_data) {
				let index = this.data.findIndex(item => item.godown_id == val.godown_id && item.main_grade_id == val.main_grade_id)

				if (index > -1) {
					this.data[index].import_purchase_qty = roundQuantity(val.import_purchase_qty);
					this.data[index].import_purchase_avg_rate = val.import_purchase_avg_rate;
					this.data[index].import_pur_amount = val.import_pur_amount;
				} else {
					val.import_purchase_qty = roundQuantity(val.import_purchase_qty)
					this.data.push(val)
				}

			}
			
			this.filterValuess = this.data
			this.pushDropdown(this.data);
			this.footerTotal(this.data);
			console.log('footerTotal : PRIOR : ', this.data);
			this.isLoading = false;
			this.table.reset();
		});
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
					item[element.field] ? item[element.field] : 0
				).reduce((sum, item) => sum + item);

				let length = 0;
				data.map(item =>
					length = item[element.field] ? (length + 1) : (length + 0) 
				);

				if (element.type == "Avg") {
					element.total = (length && total) ? total / (length) : total;
				} else if (element.type == "Quantity")	 {
					element.total = roundQuantity(total);
				}
				else {
					element.total = total;
				}
				this.footerTotalData[element.field] = element.total
			} else {
				element.total = 0;
				this.footerTotalData[element.field] = 0
			}
		});
		
		console.log(this.footerTotalData)
	}

	getAverageOf(arraySource, quantity, amount) {
		let totQty = 0
		let totAmount = 0

		for (let val of arraySource) {

			if (val[quantity]) {
				totQty += val[quantity];
				totAmount++;
			}
		}
		let average = totQty / totAmount;
		return Number.isNaN(average) ? 0 : roundQuantity(average);
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.filterValuess = dt.filteredValue
		this.footerTotal(dt.filteredValue);
	}

	onAction(item, type) {
		if (type == 'View') {
			// 
		}
	}

	onChangeCompany(e) {
		if (e != null && e != undefined) {
			this.selected_company = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	exportData(type) {
		let fileName = this.selected_company.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.filterValuess.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "sales_quantity" || this.cols[j]["field"] == "purchase_quantity") {
						obj[this.cols[j]["header"]] = this.filterValuess[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.filterValuess[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "local_purchase_qty" || this.cols[j]["field"] == "local_sales_quantity" || this.cols[j]["field"] == "import_sales_quantity" || this.cols[j]["field"] == "import_purchase_qty") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "local_purchase_rate") {
					foot[this.cols[j]["header"]] = this.getAverageOf(this.filterValuess, 'local_purchase_qty', 'purchase_amount');
				} else if (this.cols[j]["field"] == "local_sales_average_rate") {
					foot[this.cols[j]["header"]] = this.getAverageOf(this.filterValuess, 'local_sales_quantity', 'local_sale_amount');
				} else if (this.cols[j]["field"] == "import_sales_average_rate") {
					foot[this.cols[j]["header"]] = this.getAverageOf(this.filterValuess, 'import_sales_quantity', 'import_sale_amount');
				} else if (this.cols[j]["field"] == "import_purchase_avg_rate") {
					foot[this.cols[j]["header"]] = this.getAverageOf(this.filterValuess, 'import_purchase_qty', 'import_pur_amount');

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
