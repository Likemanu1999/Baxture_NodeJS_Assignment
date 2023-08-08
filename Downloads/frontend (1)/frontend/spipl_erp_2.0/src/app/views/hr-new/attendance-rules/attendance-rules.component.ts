import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { AttendanceRule } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-attendance-rules',
	templateUrl: './attendance-rules.component.html',
	styleUrls: ['./attendance-rules.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class AttendanceRulesComponent implements OnInit {

	@ViewChild("addAttendanceRuleModal", { static: false }) public addAttendanceRuleModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Attendance Rules";
	popoverTitle: string = 'Please Confirm';
	popoverMessage: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Reject';
	placement: string = 'left';
	cancelClicked: boolean = false;
	emp_type_list: any = staticValues.emp_type_list;
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	attendanceRuleForm: FormGroup;
	cols: any = [];
	data: any = [];
	filter: any = [];
	id: any = null;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private fb: FormBuilder,
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
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.attendanceRuleForm = this.fb.group({
			emp_type: new FormControl(null, Validators.required),
			financial_year: new FormControl(null, Validators.required),
			in_time: new FormControl(null, Validators.required),
			out_time: new FormControl(null, Validators.required),
			late_mark: new FormControl(null, Validators.required),
			early_mark: new FormControl(null, Validators.required),
			first_half_day: new FormControl(null, Validators.required),
			second_half_day: new FormControl(null, Validators.required),
			yearly_leaves: new FormControl(null, Validators.required),
			yearly_late: new FormControl(null, Validators.required),
			yearly_early: new FormControl(null, Validators.required)
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "employee_type", header: "Employee Type", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "financial_year", header: "Financial Year", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "in_time", header: "In Time", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "out_time", header: "Out Time", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "late_mark", header: "Late Mark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "early_mark", header: "Early Mark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "first_half_day", header: "First Half Day", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "second_half_day", header: "Second Half Day", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "yearly_leaves", header: "Leaves", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "yearly_late", header: "Late", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "yearly_early", header: "Early", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		this.filter = ['employee_type'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getAll<any>(AttendanceRule.getAll).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.map(x => {
						x.employee_type = x.employee_type.name;
					});
					this.data = res.data;
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
	}

	onAction(rowData, type, event) {
		if (type == 'Add') {
			this.attendanceRuleForm.reset();
			this.addAttendanceRuleModal.show();
		}
		if (type == 'Edit') {
			this.id = rowData.id;
			this.crudServices.getOne<any>(AttendanceRule.getOne, {
				condition: {
					id: rowData.id
				}
			}).subscribe((res) => {
				this.attendanceRuleForm.patchValue({
					emp_type: res.data[0].emp_type,
					financial_year: res.data[0].financial_year,
					yearly_leaves: res.data[0].yearly_leaves,
					yearly_late: res.data[0].yearly_late,
					yearly_early: res.data[0].yearly_early,
					in_time: this.setTime(res.data[0].in_time),
					out_time: this.setTime(res.data[0].out_time),
					late_mark: this.setTime(res.data[0].late_mark),
					early_mark: this.setTime(res.data[0].early_mark),
					first_half_day: this.setTime(res.data[0].first_half_day),
					second_half_day: this.setTime(res.data[0].second_half_day),
				});
				this.addAttendanceRuleModal.show();
			});
		}
		if (type == 'Delete') {
			this.crudServices.deleteData<any>(AttendanceRule.delete, {
				data: {
					deleted: 1
				},
				condition: {
					id: rowData.id
				},
				id: rowData.id,
				message: "Attendance Rule Deleted"
			}).subscribe((res) => {
				this.toasterService.pop(res.message, res.message, res.data);
				if (res.code === '100') {
					this.getData();
				}
			});
		}
	}

	onSubmit() {
		let data = {
			emp_type: Number(this.attendanceRuleForm.value.emp_type),
			financial_year: Number(this.attendanceRuleForm.value.financial_year),
			in_time: this.getFormatedTime(this.attendanceRuleForm.value.in_time),
			out_time: this.getFormatedTime(this.attendanceRuleForm.value.out_time),
			late_mark: this.getFormatedTime(this.attendanceRuleForm.value.late_mark),
			early_mark: this.getFormatedTime(this.attendanceRuleForm.value.early_mark),
			first_half_day: this.getFormatedTime(this.attendanceRuleForm.value.first_half_day),
			second_half_day: this.getFormatedTime(this.attendanceRuleForm.value.second_half_day),
			yearly_leaves: Number(this.attendanceRuleForm.value.yearly_leaves),
			yearly_late: Number(this.attendanceRuleForm.value.yearly_late),
			yearly_early: Number(this.attendanceRuleForm.value.yearly_early)
		};
		if (this.id != null) {
			this.crudServices.updateData<any>(AttendanceRule.update, {
				data: data,
				condition: {
					id: this.id
				},
				id: this.id,
				message: "Attendance Rule Updated"
			}).subscribe((res) => {
				this.toasterService.pop(res.message, res.message, res.data);
				if (res.code === '100') {
					this.closeModal();
					this.getData();
				}
			});
		} else {
			this.crudServices.addData<any>(AttendanceRule.add, {
				data: data,
				message: "New Attendance Rule Added"
			}).subscribe((res) => {
				if (res.code === '100') {
					this.toasterService.pop(res.message, res.message, res.data);
					this.closeModal();
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.message, "Entry Already Present Or Something Went Wrong!!!");
				}
			});
		}
	}

	getFormatedTime(d: Date) {
		let currentHours = '';
		currentHours += '' + ('0' + d.getHours()).slice(-2);
		currentHours += ':' + ('0' + d.getMinutes()).slice(-2);
		currentHours += ':' + ('0' + d.getSeconds()).slice(-2);
		return currentHours;
	}

	setTime(timeStr) {
		const fields = timeStr.split(':');
		const hr = fields[0];
		const min = fields[1];
		const sec = fields[2];
		const time = new Date();
		time.setHours(hr);
		time.setMinutes(min);
		time.setSeconds(sec);
		return time;
	}

	closeModal() {
		this.id = null;
		this.attendanceRuleForm.reset();
		this.addAttendanceRuleModal.hide();
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.page_title;
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
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
