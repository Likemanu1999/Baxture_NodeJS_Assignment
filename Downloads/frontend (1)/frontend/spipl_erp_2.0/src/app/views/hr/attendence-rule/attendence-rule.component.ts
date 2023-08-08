import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { HrServices } from '../hr-services';
import { Table } from 'primeng/table';
import { ExportService } from '../../../shared/export-service/export-service';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { AttendanceRule } from '../../../shared/apis-path/apis-path';
import * as moment from 'moment';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
	selector: 'app-attendence-rule',
	templateUrl: './attendence-rule.component.html',
	styleUrls: ['./attendence-rule.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, DatePipe, ToasterService, PermissionService, HrServices, ExportService]
})
/**
* This Component used to define attendance rules.
*/
export class AttendenceRuleComponent implements OnInit {
	ruleForm: FormGroup;
	mode = 'Add';
	box_title = 'Attendenace Rules';
	curr_year: number;
	date = new Date();
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	public intime: Date = new Date();
	public outtime: Date = new Date();
	public late_mark: Date = new Date();
	public early_mark: Date = new Date();
	public first_half_day: Date = new Date();
	public second_half_day: Date = new Date();

	public hstep: number = 1;
	public mstep: number = 1;
	public ismeridian: boolean = false;
	public isEnabled: boolean = true;

	hoursPlaceholder = 'hh';
	minutesPlaceholder = 'mm';
	secondsPlaceholder = 'ss';
	isLoading: boolean = false;
	@ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	formView: boolean = false;
	viewForm: boolean = true;
	@ViewChild('dt', { static: false }) table: Table;
	filteredValuess: any;
	cols: any[];
	rulesList: any;
	exportColumns: { title: any; dataKey: any; }[];
	editMode: boolean = false;
	id: any;
	employee_type: any = staticValues.emp_type_list;

	constructor(
		private crudServices: CrudServices,
		public datepipe: DatePipe,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private hrServices: HrServices,
		private exportService: ExportService) {
		this.ruleForm = new FormGroup({
			'emp_type': new FormControl(null, Validators.required),
			'financial_year': new FormControl(null, Validators.required),
			'in_time': new FormControl(null, Validators.required),
			'out_time': new FormControl(null, Validators.required),
			'late_mark': new FormControl(null, Validators.required),
			'early_mark': new FormControl(null, Validators.required),
			'first_half_day': new FormControl(null, Validators.required),
			'second_half_day': new FormControl(null, Validators.required),
			'yearly_leaves': new FormControl(null, Validators.required),
			'yearly_late': new FormControl(null, Validators.required),
			'yearly_early': new FormControl(null, Validators.required),
		});
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.cols = [
			{ field: 'id', header: 'No.' },
			{ field: 'empType', header: 'Emp. Type' },
			{ field: 'financial_year', header: 'Year' },
			{ field: 'in_time', header: 'In time' },
			{ field: 'out_time', header: 'Out time' },
			{ field: 'late_mark', header: 'Late time' },
			{ field: 'early_mark', header: 'Early time' },
			{ field: 'first_half_day', header: 'First HF Day' },
			{ field: 'second_half_day', header: 'Second HF Day' },
			{ field: 'yearly_leaves', header: 'Leaves' },
			{ field: 'yearly_late', header: 'Late' },
			{ field: 'yearly_early', header: 'Early' }
		];
		this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
	}

	ngOnInit() {
		this.getList();
	}
	/**
	* Getting previously added rules from backend.
	*/
	getList() {
		this.isLoading = true;
		this.curr_year = Number(this.datepipe.transform(this.date, 'yyyy'));

		this.crudServices.getAll<any>(AttendanceRule.getAll).subscribe((response) => {
			this.rulesList = response.data;
			this.filteredValuess = response.data;

			for (let i = 0; i < response.data.length; i++) {
				this.rulesList[i].empType = response.data[i].employee_type.name;
				this.filteredValuess[i].empType = response.data[i].employee_type.name;
			}

			this.isLoading = false;
		});
	}
	/**
	* Posting rule to backend as per edit mode & new mode.
	*/
	onSubmit() {
		const invalid = [];
		const controls = this.ruleForm.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		let formData = {
			emp_type: parseInt(this.ruleForm.value.emp_type),
			financial_year: parseInt(this.ruleForm.value.financial_year),
			in_time: this.getFormatedTime(this.intime),
			out_time: this.getFormatedTime(this.outtime),
			late_mark: this.getFormatedTime(this.late_mark),
			early_mark: this.getFormatedTime(this.early_mark),
			first_half_day: this.getFormatedTime(this.first_half_day),
			second_half_day: this.getFormatedTime(this.second_half_day),
			yearly_leaves: parseInt(this.ruleForm.value.yearly_leaves),
			yearly_late: parseInt(this.ruleForm.value.yearly_late),
			yearly_early: parseInt(this.ruleForm.value.yearly_early)
		};

		console.log(this.ruleForm.value);
		
		if (this.editMode) {
			this.crudServices.updateData<any>(AttendanceRule.update, {
				data: formData,
				condition: {
					id: this.id
				},
				id: this.id,
				message: "Attendance Rule Updated"
			}).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.getList();
					this.onBack();
				}
			});
		} else {
			this.crudServices.addData<any>(AttendanceRule.add, {
				data: formData,
				message: "New Attendance Rule Added"
			}).subscribe((response) => {

				if (response.code === '100') {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getList();
					this.onBack();
				} else {
					this.toasterService.pop(response.message, response.message, "Entry Already Present Or Something Went Wrong!!!");
				}
			});
		}
	}

	timeUpdate(value) {
		let time = moment(value).format("HH:mm:ss");
		return time;
	}

	/**
	* To change time format (00:00:00) while sending data to backend.
	*/
	getFormatedTime(d: Date) {
		let currentHours = '';
		currentHours += '' + ('0' + d.getHours()).slice(-2);
		currentHours += ':' + ('0' + d.getMinutes()).slice(-2);
		currentHours += ':' + ('0' + d.getSeconds()).slice(-2);
		return currentHours;
	}

	onBack() {
		this.formView = false;
		this.viewForm = true;
	}

	onAdd() {
		this.ruleForm.reset();
		this.mode = 'Add';
		this.formView = true;
		this.viewForm = false;
		this.editMode = false;
	}
	public clear(): void {
		this.intime = void 0;
	}
	/**
	* This function is used to filter table.
	*/
	onFilter(event: { filteredValue: any; }, dt: any) {
		this.filteredValuess = event.filteredValue;
	}
	/**
	* Exporting data in pdf by passing filtered values to exportPdf().
	*/
	exportPdf() {
		this.exportService.exportPdf(this.exportColumns, this.filteredValuess, 'rules');
	}
	/**
	* Exporting data in excel by passing filtered values to exportExcel().
	*/
	exportExcel() {
		this.exportService.exportExcel(this.filteredValuess, 'details');
	}
	/**
	* On edit click we are getting data from backend and setting it to form.
	For time input we need to set it separately as per HH:MM:SS format.
	*/
	onEdit(id: any) {
		if (id) {
			this.id = id;
			this.mode = 'Edit';
			this.editMode = true;
			this.formView = true;
			this.viewForm = false;
			this.crudServices.getOne<any>(AttendanceRule.getOne, {
				condition: {
					id: id
				}
			}).subscribe((response) => {
				const res = response.data[0];
				this.setTime('intime', res.in_time);
				this.setTime('outtime', res.out_time);
				this.setTime('late_mark', res.late_mark);
				this.setTime('early_mark', res.early_mark);
				this.setTime('first_half_day', res.first_half_day);
				this.setTime('second_half_day', res.second_half_day);
				this.ruleForm.patchValue({
					emp_type: res.emp_type,
					financial_year: res.financial_year,
					yearly_leaves: res.yearly_leaves,
					yearly_late: res.yearly_late,
					yearly_early: res.yearly_early,
				});
			});
		}
	}
	/**
	On delete rule of perticular id this function is used.
	*/
	onDelete(id: any) {
		if (id) {
			this.crudServices.deleteData<any>(AttendanceRule.delete, {
				data: {
					deleted: 1
				},
				condition: {
					id: id
				},
				id: id,
				message: "Attendance Rule Deleted"
			}).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.getList();
				}
			});
		}
	}
	/**
	To set values to time input on edit as per HH:MM:SS format.
	*/
	setTime(controlName, timeStr): void {
		const fields = timeStr.split(':');
		const hr = fields[0];
		const min = fields[1];
		const sec = fields[2];
		const time = new Date();
		time.setHours(hr);
		time.setMinutes(min);
		time.setSeconds(sec);
		this[controlName] = time;
	}

}
