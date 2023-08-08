import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { AdminControl, PlastIndia, SalesReturn } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-plast-india',
	templateUrl: './plast-india.component.html',
	styleUrls: ['./plast-india.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class PlastIndiaComponent implements OnInit {

	@ViewChild("viewDetailsModal", { static: false }) public viewDetailsModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	page_title: any = "Plast India";
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];
	selected_row: any = null;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getAll<any>(PlastIndia.getAllData).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data.map(x => {
						x.is_worked_with_parmar_label = (x.is_worked_with_parmar == 1) ? "Yes" : "No";
						x.is_heard_about_parmar_label = (x.is_heard_about_parmar == 1) ? "Yes" : "No";
						x.is_receive_updates_label = (x.is_receive_updates == 1) ? "Yes" : "No";
						return x;
					});
					// this.data = res.data;
					this.pushDropdown(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "user_id", header: "User ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "company_name", header: "Company Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "person_name", header: "Person Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "designation", header: "Designation", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "email", header: "Email", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "mobile_no", header: "Mobile No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "user_type", header: "User Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "added_date", header: "Date/Time", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'Date_Time', width: "100px" },
			{ field: "products", header: "Products", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "monthly_consumption", header: "Monthly Consumption", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "is_worked_with_parmar_label", header: "Worked With Parmar", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "liked_about_parmar", header: "Liked About Parmar", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "is_heard_about_parmar_label", header: "Heard About Parmar", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "experience", header: "Experience", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "improvement", header: "Need To Improve", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "is_receive_updates_label", header: "Receive Updates", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "employee_name", header: "Attend By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
		];
		this.filter = ['user_id', 'company_name', 'person_name', 'designation', 'email', 'mobile_no', 'user_type'];
		this.getData();
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
		this.pushDropdown(this.data);
	}

	onFilter(e, dt) {
		// 
	}

	onAction(rowData, type, event) {
		if (type == 'View') {
			let final_data = [];
			for (let j = 0; j < this.cols.length; j++) {
				let obj = {
					key: this.cols[j]["header"],
					value: rowData[this.cols[j]["field"]]
				};
				final_data.push(obj);
			};
			this.selected_row = final_data;
			this.viewDetailsModal.show();
		}
	}

	exportData(type) {
		let final_data = (this.table.filteredValue == null) ? this.data : this.table.filteredValue;
		let fileName = this.page_title;
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] == "quantity") {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
				} else {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] == "quantity") {
				foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
			} else if (this.cols[j]["field"] == "final_rate") {
				foot[this.cols[j]["header"]] = this.cols[j]["total"];
			} else {
				foot[this.cols[j]["header"]] = "";
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				return { title: col.header, dataKey: col.header }
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

}
