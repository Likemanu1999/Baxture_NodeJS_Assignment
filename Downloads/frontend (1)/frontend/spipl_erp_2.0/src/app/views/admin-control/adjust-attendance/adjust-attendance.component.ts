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
import { AdminControl, SalesReturn } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-adjust-attendance',
	templateUrl: './adjust-attendance.component.html',
	styleUrls: ['./adjust-attendance.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class AdjustAttendanceComponent implements OnInit {

	@ViewChild("adjustAttendanceModal", { static: false }) public adjustAttendanceModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Adjust Attendance";
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	max_date: any = new Date();

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.billing_status;
	attendanceStatusList: any = staticValues.attendance_status_new;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().add(1, 'days').format("YYYY-MM-DD"))
	];

	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];
	adjustAttendanceForm: FormGroup;

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
		this.initForm();
	}

	initForm() {
		this.adjustAttendanceForm = new FormGroup({
			date: new FormControl(null, Validators.required),
			status: new FormControl(null, Validators.required)
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getAll<any>(AdminControl.getAttendanceEmployees).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
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
			{ field: "", header: "", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Check", width: "100px" },
			{ field: "emp_id", header: "Emp ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "emp_name", header: "Emp Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "dept_name", header: "Department Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
		];
		this.filter = ['emp_id', 'emp_name', 'dept_name'];
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
				if (item) {
					array.push({
					  value: item,
					  label: item
					});
				  }
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
		if (type == 'Check') {
			// 
		}
		if (type == 'Check_All') {
			if (event) {
				this.checked = (this.table.filteredValue) ? this.table.filteredValue : this.data;
			} else {
				this.checked = [];
			}
		}
		if (type == 'Adjust_Attendance') {
			this.adjustAttendanceForm.reset();
			this.adjustAttendanceModal.show();
		}
		if (type == 'View') {
			// 
		}
	}

	submitAdjustAttendanceForm() {
		let from_date = moment(this.adjustAttendanceForm.value.date[0]).format("YYYY-MM-DD");
		let to_date = moment(this.adjustAttendanceForm.value.date[1]).format("YYYY-MM-DD");
		let status = Number(this.adjustAttendanceForm.value.status);

		let emp_punching_codes = this.checked.map(x => x.machine_id);
		let body = {
			from_date: from_date,
			to_date: to_date,
			status: status,
			emp_punching_code: emp_punching_codes
		};
		this.crudServices.updateData<any>(AdminControl.updateEmployeeAttendance, body).subscribe(res => {
			if (res.code === '100') {
				this.toasterService.pop('success', 'Success', "Attendance Updated Successfully");
				this.adjustAttendanceForm.reset();
				this.adjustAttendanceModal.hide();
				this.getCols();
			}
		});
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
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
				if (this.cols[j]["field"] == "quantity") {
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
