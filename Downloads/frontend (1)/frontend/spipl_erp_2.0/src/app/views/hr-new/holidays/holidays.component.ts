import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { HolidayType, StaffMemberMaster, newHoliday } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-holidays',
	templateUrl: './holidays.component.html',
	styleUrls: ['./holidays.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class HolidaysComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "List of Staff";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to update?';
	popoverMessage2: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.active_status;
	yearPickerConfig: any = staticValues.yearPickerConfig;
	selected_year: Date = new Date();

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	max_date: any = new Date();
	holidaysList: any = [];
	cols: any = [];
	data: any = [];
	filter: any = [];
	holidayForm: FormGroup;
	id: any = null;

	constructor(
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private fb: FormBuilder
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
		this.getHolidaysList();
		this.initForm();
		this.getCols();
	}

	getHolidaysList() {
		this.crudServices.getAll<any>(HolidayType.getAll).subscribe(res => {
			this.holidaysList = res.data;
		});
	}

	initForm() {
		this.holidayForm = this.fb.group({
			date: new FormControl(null, Validators.required),
			holiday_id: new FormControl(null, Validators.required),
			remark: new FormControl(null)
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "Emp ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "name", header: "Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "date", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		this.filter = ['name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(newHoliday.getOne, {
			year: moment(this.selected_year).format("YYYY")
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
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
		if (type == 'Edit') {
			this.router.navigate(['hr-new/edit-staff-member', rowData.id]);
		}
		if (type == 'Delete') {
			this.crudServices.deleteData<any>(StaffMemberMaster.delete, {
				id: rowData.id
			}).subscribe(res => {
				this.getData();
				this.toasterService.pop(res.message, 'Success', res.data);
			});
		}
	}

	onSubmit() {
		// 
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.page_title + ' - ' + moment(this.selected_year).format("YYYY");
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
