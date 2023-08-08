
import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, CommonService, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from '../../../shared/calculations/calculations';
import { MonthlySalaryNew } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from 'moment';

@Component({
	selector: 'app-third-party-payroll',
	templateUrl: './third-party-payroll.component.html',
	styleUrls: ['./third-party-payroll.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		PermissionService,
		LoginService,
		ToasterService,
		ExportService,
		CommonService,
		Calculations
	],
})

export class ThirdPartyPayrollComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Third Party Payroll";
	monthPickerConfig: any = staticValues.monthPickerConfig;
	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];
	maxDate: any = new Date();
	selected_month: any = moment().format("MMM-YYYY");

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private fb: FormBuilder,
		private commonService: CommonService,
		private calculations: Calculations,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: 'emp_id', header: 'Emp ID', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'emp_name', header: 'Employee Name', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'uan_no', header: 'uan_no', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'total_days', header: 'total_days', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'total_half_day', header: 'total_half_day', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'total_late', header: 'total_late', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'total_absent', header: 'total_absent', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'total_present', header: 'total_present', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'total_wfh', header: 'total_wfh', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'monthly_ctc', header: 'monthly_ctc', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'fixed_gross_salary', header: 'fixed_gross_salary', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'fixed_basic', header: 'fixed_basic', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'fixed_da', header: 'fixed_da', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'basic', header: 'basic', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'da', header: 'da', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'hra', header: 'hra', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'lta', header: 'lta', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'child_edu_allowance', header: 'child_edu_allowance', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'special_allowance', header: 'special_allowance', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'gross_salary', header: 'gross_salary', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'pt', header: 'pt', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'employee_pf', header: 'employee_pf', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'employer_pf', header: 'employer_pf', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'employee_esi', header: 'employee_esi', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'employer_esi', header: 'employer_esi', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'tds', header: 'tds', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'total_deduction', header: 'total_deduction', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'final_salary', header: 'final_salary', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'arrear_plus', header: 'arrear_plus', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'arrear_minus', header: 'arrear_minus', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'net_salary', header: 'net_salary', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		this.filter = ['emp_id', 'emp_name', 'uan_no'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		let month = moment(this.selected_month).format('MM');
		let year = moment(this.selected_month).format('YYYY');
		this.crudServices.getOne<any>(MonthlySalaryNew.getThirdPartyMonthlySalary, {
			year: year,
			month: month
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.footerTotal(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
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
				element.total = total;
			}
		});
	}

	onOpenCalendar(container) {
		container.monthSelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
		container.setViewMode('month');
	}

	exportData(type) {
		let fileName = "Monthly Salary Report (" + moment(this.selected_month).format('MMM-YYYY') + ")";
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["type"] == "Amount") {
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
