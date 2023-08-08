import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalDirective } from "ngx-bootstrap";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { staticValues, CommonService } from "../../../shared/common-service/common-service";
import { CrudServices } from '../../../shared/crud-services/crud-services';
import {
	ValueStore,
	Attendance,
	MonthlySalaryNew,
	YearlyCTCNew,
	FileUpload,
	CommonApis,
	MonthlySalary
} from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from "../../login/login.service";
import { Calculations } from '../../../shared/calculations/calculations';
import { UserDetails } from '../../login/UserDetails.model';
import { SalarySlipPdfService } from '../../../shared/salary-slip-pdf/salary-slip-pdf.service';
import * as moment from "moment";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-salary-view',
	templateUrl: './salary-view.component.html',
	styleUrls: ['./salary-view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ExportService,
		ToasterService,
		PermissionService,
		LoginService,
		CrudServices,
		CommonService,
		Calculations,
		SalarySlipPdfService
	]
})

export class SalaryViewComponent implements OnInit {

	monthPickerConfig: any = staticValues.monthPickerConfig;
	isLoading: boolean = false;
	staff_member_id: any = null;
	enableCalculateButton: boolean = false;
	selected_month: any = moment().format("MMM-YYYY");
	selected_month_sheet: any = moment().format("MMM-YYYY");
	selected_financial_year: any = null;
	financial_year_list: any = [];
	minDate: any = new Date("2021-08-01");
	maxDate: any = new Date();
	links: any = [];
	page_title: any = "Salary View";
	selectedTab: any = "Monthly_Salary";
	role_id: any = null;
	statusList: any = staticValues.yes_no_status;
	selected_status: any = this.statusList[2];

	calculateAllEmployeesSalary: boolean = false;
	enableSalaryProcessButton: boolean = false;

	public popoverTitle: string = "Please Confirm";
	public popoverMessage: string = "Are you sure, Salary Process is Done?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Confirm";
	public cancelText: string = "Cancel";
	public placement: string = "bottom";
	public closeOnOutsideClick: boolean = true;

	months: any = [
		{ id: '04', name: 'April' },
		{ id: '05', name: 'May' },
		{ id: '06', name: 'June' },
		{ id: '07', name: 'July' },
		{ id: '08', name: 'August' },
		{ id: '09', name: 'September' },
		{ id: '10', name: 'October' },
		{ id: '11', name: 'November' },
		{ id: '12', name: 'December' },
		{ id: '01', name: 'January' },
		{ id: '02', name: 'February' },
		{ id: '03', name: 'March' }
	];

	cols: any = [
		{ field: 'id', header: '#ID', permission: true },
		{ field: 'emp_id', header: 'EMP ID', permission: true },
		{ field: 'emp_name', header: 'Name', permission: true },
		{ field: 'uan_no', header: 'UAN', permission: true },
		{ field: 'pan_no', header: 'PAN NO', permission: true },
		{ field: 'appointment_date', header: 'Appointment Date', permission: true },
		{ field: 'dob', header: 'DOB', permission: true },
		{ field: 'emp_state_name', header: 'STATE', permission: true },
		{ field: 'total_days', header: 'Total Days', permission: true },
		{ field: 'total_half_day', header: 'Half Days', permission: true },
		{ field: 'total_late', header: 'Late Coming', permission: true },
		{ field: 'total_absent', header: 'Leaves', permission: true },
		{ field: 'total_present', header: 'Present Days', permission: true },
		{ field: 'total_wfh', header: 'WFH', permission: true },
		{ field: 'monthly_ctc', header: 'CTC Salary', permission: true },
		{ field: 'fixed_gross_salary', header: 'Fixed Gross', permission: true },
		{ field: 'fixed_basic', header: 'Fixed Basic', permission: true },
		{ field: 'fixed_da', header: 'Fixed DA', permission: true },
		{ field: 'basic', header: 'Basic', permission: true },
		{ field: 'da', header: 'DA', permission: true },
		{ field: 'hra', header: 'HRA', permission: true },
		{ field: 'lta', header: 'LTA', permission: true },
		{ field: 'child_edu_allowance', header: 'Child Education Allowance', permission: true },
		{ field: 'special_allowance', header: 'Special Allowance', permission: true },
		{ field: 'gross_salary', header: 'Gross', permission: true },
		{ field: 'pt', header: 'PT', permission: true },
		{ field: 'employer_pf', header: 'Employer PF', permission: true },
		{ field: 'employee_pf', header: 'Employer PF', permission: true },
		{ field: 'employee_esi', header: 'Employee ESI', permission: true },
		{ field: 'employer_esi', header: 'Employer ESI', permission: true },
		{ field: 'tds', header: 'Monthly TDS', permission: true },
		{ field: 'total_deduction', header: 'Total Deduction', permission: true },
		{ field: 'final_salary', header: 'Final Salary', permission: true },
		{ field: 'arrear_plus', header: 'Arrears (+)', permission: true },
		{ field: 'arrear_minus', header: 'Arrears (-)', permission: true },
		{ field: 'net_salary', header: 'Net Salary', permission: true }
	];
	filter: any = ['emp_name'];
	data: any = [];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private commonService: CommonService,
		private crudServices: CrudServices,
		private calculations: Calculations,
		private router: Router,
		private salarySlipPdfService: SalarySlipPdfService
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.role_id = user.userDet[0].role_id;
		this.links = user.links;
		this.selected_financial_year = this.commonService.getCurrentFinancialYear();
	}

	ngOnInit() {
		this.getFinancialYearList();
		this.getMonthlySalary();
	}

	getFinancialYearList() {
		this.crudServices.getAll<any>(YearlyCTCNew.getFinancialYears).subscribe(res => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.financial_year_list = res.data;
				}
			}
		});
	}

	getMonthlySalary() {
		let diff = moment().startOf('month').diff(moment(this.selected_month), 'months', true);

		if (diff == 1) {
			this.enableCalculateButton = true;
		} else {
			this.enableCalculateButton = false;
		}

		if (this.role_id == 1) {
			this.enableCalculateButton = true;
		}

		let month = moment(this.selected_month).format('MM');
		let year = moment(this.selected_month).format('YYYY');
		this.crudServices.getOne<any>(MonthlySalaryNew.viewCalculated, {
			year: year,
			month: month,
			status: this.selected_status.id
		}).subscribe(res_sal => {
			if (res_sal.code == '100') {
				this.data = res_sal.data;
			} else {
				this.data = [];
				this.toasterService.pop('error', 'Error', 'Something Went Wrong');
			}
		});
	}

	onOpenCalendar(container) {
		container.monthSelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
		container.setViewMode('month');
	}

	exportExcel(type) {
		let exportData = [];
		let title = null;
		title = "Monthly Salary Report (" + moment(this.selected_month).format('MMM-YYYY') + ")";
		this.data.forEach((element, index) => {
			let total_salary_of_month = this.calculations.getRoundValue(element.fixed_gross_salary * (element.total_present / element.total_days));
			let data = {
				'Sr.No.': (index + 1),
				'Name of Employee': element.emp_name,
				'UAN': element.uan_no,
				'Total Days': element.total_days,
				'Half Days': element.total_half_day,
				'Late Coming': element.total_late,
				'Leaves': element.total_absent,
				'Present Days': element.total_present,
				'WFH': element.total_wfh,
				'CTC Salary': element.monthly_ctc,
				'Fixed Gross': element.fixed_gross_salary,
				'Fixed Basic': element.fixed_basic,
				'Fixed DA': element.fixed_da,
				'Basic': element.basic,
				'DA': element.da,
				'HRA': element.hra,
				'LTA': element.lta,
				'Child Education Allowance': element.child_edu_allowance,
				'Special Allowance': element.special_allowance,
				'Gross': element.gross_salary,
				'PT': element.pt,
				'Employee PF': element.employee_pf,
				'Employer PF': element.employer_pf,
				'Employee ESI': element.employee_esi,
				'Employer ESI': element.employer_esi,
				'Monthly TDS': element.tds,
				'Total Deductions': element.total_deduction,
				'Final Salary': element.final_salary,
				'Arrears (+)': element.arrear_plus,
				'Arrears (-)': element.arrear_minus,
				'Net Salary': element.net_salary
			};
			exportData.push(data);
		});
		this.exportService.exportExcel(exportData, title);
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getMonthlySalary();
		}
	}
}
