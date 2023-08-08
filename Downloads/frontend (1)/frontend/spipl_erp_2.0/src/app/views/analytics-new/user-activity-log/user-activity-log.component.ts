import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew, ReportRemark, UserActivity } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";



@Component({
	selector: 'app-user-activity-log',
	templateUrl: './user-activity-log.component.html',
	styleUrls: ['./user-activity-log.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class UserActivityLogComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('viewDataModel', { static: false }) public viewDataModel: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "User Activity Log";
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
	datePickerConfig: any = staticValues.datePickerConfigNew;
	reports_name: any = staticValues.reports_name;
	remarkForm: any = FormGroup;
	selected_date_range: any = [
		new Date(moment().subtract(3, 'days').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	misData: any = [];
	filter: any = [];
	pdf_excell: any = [];
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	maxDate: any = new Date();
	isRange: any;
	object: any = {};

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

	}

	ngOnInit() {
		this.getData();

		// Form for remarks
		this.remarkForm = new FormGroup({
			remark: new FormControl(null),
			dispatchBilling_id: new FormControl(null),
			mis_id: new FormControl(null),
		})
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
		this.crudServices.getOne<any>(UserActivity.getAll, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');
				}
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: 'user_name', header: 'User Name', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'activity', header: 'Activity', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'row_id', header: 'Row Id', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'ip_address', header: 'IP Address', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'table_name', header: 'Table Name', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'added_date', header: 'Date/Time', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: 'data', header: 'Data', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "view" },
		];
		this.filter = ['user_name', 'activity','row_id'];
		this.pushDropdown(this.data);
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


	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		//this.pushDropdown(this.data);
	}

	onFilter(e, dt) {
		this.pushDropdown(dt.filteredValue);
	}

	onAction(item, type) {
		if (type == 'View') {
			this.object = null;
			if (item.data != null || item.data != undefined) {
				this.object = this.flatten(JSON.parse(item.data))
				for (var key in this.object) {
					if (key.includes('copy') || key.includes('token') || key.includes('password')) {
						delete this.object[key]
					}
				}
				this.viewDataModel.show();
			}
			else {
				this.toasterService.pop('error', 'Alert', 'No Data Found..!');
			}
		}
	}

	flatten(obj) {
		const result = {};
		if (obj != null && obj != undefined) {
			for (const key of Object.keys(obj)) {
				if (typeof obj[key] === 'object') {
					const nested = this.flatten(obj[key]);
					for (const nestedKey of Object.keys(nested)) {
						result[`${nestedKey}`] = nested[nestedKey];
					}
				} else {
					result[key] = obj[key];
				}
			}
		}
		return result;
	}

	closeModal() {
		this.viewDataModel.hide();

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

}
