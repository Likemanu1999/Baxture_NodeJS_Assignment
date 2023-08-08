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

@Component({
	selector: 'app-sales-history-new',
	templateUrl: './sales-history-new.component.html',
	styleUrls: ['./sales-history-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SalesHistoryNewComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Sales History Report";
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
	datePickerConfig: any = staticValues.datePickerConfigNew;
	companyList: any = staticValues.company_list_new;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_company: any = this.companyList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	data1: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	maxDate: any = new Date();
	isRange: any;
	options: any;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.update_discount_status = (this.links.find(x => x == 'update_discount_status') != null) ? true : false;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {

		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
		this.data1 = {
			labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
			datasets: [
				{
					label: 'First Dataset',
					data: [65, 59, 80, 81, 56, 55, 40],
					fill: false,
					borderColor: documentStyle.getPropertyValue('--blue-500'),
					tension: 0.4
				},
				{
					label: 'Second Dataset',
					data: [28, 48, 40, 19, 86, 27, 90],
					fill: false,
					borderColor: documentStyle.getPropertyValue('--pink-500'),
					tension: 0.4
				}
			]
		};
		this.options = {
			maintainAspectRatio: false,
			aspectRatio: 0.6,
			plugins: {
				legend: {
					labels: {
						color: textColor
					}
				}
			},
			scales: {
				x: {
					ticks: {
						color: textColorSecondary
					},
					grid: {
						color: surfaceBorder,
						drawBorder: false
					}
				},
				y: {
					ticks: {
						color: textColorSecondary
					},
					grid: {
						color: surfaceBorder,
						drawBorder: false
					}
				}
			}
		};


		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sub_org_name", header: "Customer Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "state_name", header: "State", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "d_quantity", header: "Sold Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "main_grade", header: "Main Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "added_date", header: "SO Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
		];
		this.filter = ['con_id', 'sub_org_name', 'state_name', 'main_grade', 'grade_name', 'godown_name','division_label'];
		this.getData();
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
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Analytics.getSalesHistory, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: this.selected_company.id
		}).subscribe(res => {
			console.log(res.data);
			
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					
				}
				this.footerTotal(this.data);
			}
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
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
			}
			else{
				element.total = 0;
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
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "d_quantity") {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "d_quantity") {
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

}
