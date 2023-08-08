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
	selector: 'app-salary-manager',
	templateUrl: './salary-manager.component.html',
	styleUrls: ['./salary-manager.component.scss'],
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

export class SalaryManagerComponent implements OnInit {

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
	page_title: any = "Salary Manager";
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
		{ field: 'id', header: 'Salary ID', permission: true },
		{ field: 'emp_id', header: 'Emp ID', permission: true },
		{ field: 'emp_name', header: 'Name', permission: true },
		{ field: 'net_salary', header: 'Net Salary', permission: true },
		{ field: 'total_month_days', header: 'Present Days', permission: true },
		{ field: 'total_absent', header: 'Absent Days', permission: true },
		{ field: 'arrear_plus', header: 'Arrears (+)', permission: true },
		{ field: 'arrear_plus_rmk', header: 'Arrears (+) Remark', permission: true },
		{ field: 'arrear_deduction', header: 'Arrears (-)', permission: true },
		{ field: 'arrear_deduction_rmk', header: 'Arrears (-) Remark', permission: true },
		{ field: 'tds', header: 'TDS', permission: true },
		{ field: 'bonus', header: 'Bonus', permission: true },
		{ field: 'performance_bonus', header: 'Performance Bonus', permission: true },
		{ field: 'incentive', header: 'Incentive', permission: true },
		{ field: 'incentive_tds', header: 'Incentive TDS', permission: true }
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

	salaryProcessDone() {
		let month = moment(this.selected_month).format('MM');
		let year = moment(this.selected_month).format('YYYY');
		this.crudServices.updateData<any>(MonthlySalaryNew.salaryProcessDone, {
			year: year,
			month: month
		}).subscribe(res => {
			if (res.code == "100") {
				this.getMonthlySalary();
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
		this.crudServices.getOne<any>(MonthlySalaryNew.getMonthlySalaryNew, {
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

			if (this.role_id == 1 || this.role_id == 3) {
				if (moment().format("MM") == moment(this.selected_month).format("MM")) {
					this.enableSalaryProcessButton = false;
				} else {
					this.enableSalaryProcessButton = true;
				}
			} else {
				this.enableSalaryProcessButton = false;
			}
		});
	}

	createEmployeeSalary(element) {
		let all_month_salary = [];
		let year_arr = element.financial_year.split('-');
		let year = Number(year_arr[0]);

		let monthly_ctc = this.calculations.getRoundValue(Number(element.annual_ctc) / 12);
		let employer_pf = this.calculations.getRoundValue(Number(element.employer_pf) / 12);

		let last_date = moment(element.appointment_date).endOf('month').format("YYYY-MM-DD");
		let diff = moment(last_date).diff(moment(element.appointment_date), 'days', true);

		let data = this.createMonthSalary(
			1,
			element.emp_id,
			element.id,
			element.financial_year,
			monthly_ctc,
			moment(element.appointment_date).format("MM"),
			diff,
			null
		);
		all_month_salary.push(data);

		this.months.forEach(month => {
			if ((month.id == '01') || (month.id == '02') || (month.id == '03')) {
				year = Number(year_arr[1]);
			}
			let start_date = moment(year + "-" + month.id + "-01").format("YYYY-MM-DD");
			let total_days_in_month = moment(start_date).daysInMonth();

			if (Number(element.join_year) < Number(year_arr[0])) {
				let data = this.createMonthSalary(
					1,
					element.emp_id,
					element.id,
					element.financial_year,
					monthly_ctc,
					month.id,
					total_days_in_month,
					null
				);
				all_month_salary.push(data);
			} else {
				if (moment(start_date).isAfter(element.appointment_date) || (moment(start_date).isSame(element.appointment_date))) {
					let data = this.createMonthSalary(
						1,
						element.emp_id,
						element.id,
						element.financial_year,
						monthly_ctc,
						month.id,
						total_days_in_month,
						null
					);
					all_month_salary.push(data);
				}
			}
		});
		this.crudServices.addData<any>(MonthlySalaryNew.addData, {
			data: all_month_salary,
			emp_id: element.emp_id,
			annual_ctc_id: element.id
		}).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop(res.message, "Success", res.data);
				this.getMonthlySalary();
			} else {
				this.toasterService.pop('error', 'Error', 'Something Went Wrong');
			}
		});
	}

	createMonthSalary(flag, emp_id, annual_ctc_id, financial_year, monthly_ctc, month, present_days, item) {
		let year_arr = financial_year.split('-');
		let year = Number(year_arr[0]);

		if ((month == '01') || (month == '02') || (month == '03')) {
			year = Number(year_arr[1]);
		}

		let total_days = moment(year + "-" + month, "YYYY-MM").daysInMonth();
		let pt = 0;

		if (item == null) {
			pt = (month == '02') ? 300 : 200;
		} else {
			pt = Number(item.pt);
		}

		let fixed_basic = Math.ceil((monthly_ctc * 30) / 100);
		let fixed_da = Math.ceil((monthly_ctc * 5) / 100);
		let basic = Math.ceil((fixed_basic * present_days) / total_days);
		let salary_for_pf_employer_cont = Math.ceil(monthly_ctc - ((fixed_basic + fixed_da) * 40) / 100);
		let employer_pf = (salary_for_pf_employer_cont < 15000) ? Math.ceil((salary_for_pf_employer_cont * 13) / 100) : Math.ceil((15000 * 13) / 100);
		let da = Math.ceil((fixed_da * present_days) / total_days);
		let hra = Math.ceil(((basic + da) * 40) / 100);
		let fixed_gross_salary = monthly_ctc - employer_pf;
		let child_edu_allowance = Math.ceil((2400 * present_days) / total_days);
		let total_salary_of_month = Math.ceil((fixed_gross_salary * present_days) / total_days);
		let lta = Math.ceil((((total_salary_of_month * 10) / 100) * present_days) / total_days);
		let special_allowance = total_salary_of_month - (basic + da + hra + lta + child_edu_allowance);
		let gross_salary = (basic + da + hra + lta + child_edu_allowance + special_allowance);
		let employee_pf_sum = basic + da + lta + child_edu_allowance + special_allowance;
		let employee_pf = (employee_pf_sum < 15000) ? Math.ceil((employee_pf_sum * 12) / 100) : Math.ceil((15000 * 12) / 100);
		let employee_esi = (gross_salary < 21000) ? Math.ceil((gross_salary * 0.75) / 100) : 0;
		let employer_esi = (gross_salary < 21000) ? Math.ceil((gross_salary * 3.25) / 100) : 0;
		let tds = Number(item.tds);
		let arrear_plus = Number(item.arrear_plus);
		let arrear_minus = Number(item.arrear_minus);
		let total_deduction = Number(pt + employee_pf + employee_esi + tds + arrear_minus);
		let final_salary = Number(gross_salary - total_deduction);
		let bonus = Number(item.bonus);
		let incentive = Number(item.incentive);
		let incentive_tds = Number(item.incentive_tds);
		let performance_bonus = Number(item.performance_bonus);

		let final_salary_2 = (final_salary + arrear_plus + bonus + incentive + incentive_tds + performance_bonus);
		let net_salary = Math.ceil(final_salary_2);

		let data = {
			emp_id: emp_id,
			annual_ctc_id: annual_ctc_id,
			financial_year: financial_year,
			year: year,
			month: month,
			total_days: total_days,
			monthly_ctc: monthly_ctc,
			employer_pf: employer_pf,
			fixed_gross_salary: fixed_gross_salary,
			fixed_basic: fixed_basic,
			fixed_da: fixed_da,
			basic: basic,
			da: da,
			hra: hra,
			lta: lta,
			child_edu_allowance: child_edu_allowance,
			special_allowance: special_allowance,
			gross_salary: gross_salary,
			pt: pt,
			employee_pf: employee_pf,
			employee_esi: employee_esi,
			employer_esi: employer_esi,
			tds: tds,
			total_deduction: total_deduction,
			final_salary: final_salary,
			arrear_plus: arrear_plus,
			arrear_plus_remark: null,
			arrear_minus: arrear_minus,
			arrear_minus_remark: null,
			net_salary: net_salary,
			bonus: bonus,
			incentive: incentive,
			incentive_tds: incentive_tds,
			performance_bonus: performance_bonus
		};
		return data;
	}

	viewEmployee(emp_id) {
		this.router.navigate(['hr/view-staff', emp_id]);
	}

	async onClickEmployee(item) {
		this.calculateAllEmployeesSalary = false;
		if (moment().format("MM") == moment(this.selected_month).format("MM")) {
			this.toasterService.pop('error', 'Alert', 'Select Previous Month');
		} else if (item.status == 1) {
			this.toasterService.pop('error', 'Alert', 'Salary is already updated');
		}
		else {
			this.calculateSalary(item, true);
		}
	}

	async calculateSalary(item, is_checked) {
		let annual_paid_leaves = Number(item.annual_paid_leaves);
		let total_days_in_month = moment(this.selected_month).daysInMonth();

		let first_day_of_month = moment(this.selected_month).startOf('month').format('YYYY-MM-DD');
		let last_day_of_month = moment(this.selected_month).endOf('month').format('YYYY-MM-DD');
		let start_date = first_day_of_month;
		let end_date = last_day_of_month;

		if (moment(item.appointment_date).isAfter(moment(first_day_of_month))) {
			start_date = moment(item.appointment_date).format('YYYY-MM-DD');
		}
		if (moment(item.relieving_date).isBefore(moment(last_day_of_month)) || moment(item.relieving_date).isSame(moment(last_day_of_month))) {
			end_date = moment(item.relieving_date).format('YYYY-MM-DD');
		}

		if ((item.employee_type_id == 1) || (item.employee_type_id == 2) || (item.employee_type_id == 3)) {
			this.crudServices.getOne<any>(Attendance.getEmpMonthStatus, {
				emp_id: item.emp_id,
				start_date: start_date,
				end_date: end_date
			}).subscribe(async res => {
				if (res.code == '100') {
					if (res.data.length > 0) {

						let present = Number(res.data[0].present);
						let late = Number(res.data[0].late);
						let early = Number(res.data[0].early);
						let half_day = Number(res.data[0].half_day);
						let late_early = Number(res.data[0].late_early);
						let personal_leave = Number(res.data[0].personal_leave);
						let official_leave = Number(res.data[0].official_leave);
						let full_holiday = Number(res.data[0].full_holiday);
						let half_holiday = Number(res.data[0].half_holiday);
						let paid_leaves = 0;
						let unpaid_leaves = 0;
						let balance_paid_leaves = Number(res.data[0].balance_paid_leaves);

						if (moment(item.pl_start_date).isBefore(moment())) {
							if (moment(this.selected_month).format('MM') == "01") {
								balance_paid_leaves += 12;
							}
						}

						let total_present = present;
						let total_absent = personal_leave;

						let extra_late_early = Number(late_early) * 0.50;

						let total_late = late + extra_late_early;
						let total_early = early + extra_late_early;

						if (total_late <= 3) {
							total_present += total_late;
						} else {
							total_present += 3;
							let unpaid_late = (total_late - 3);
							let total_paid_late = unpaid_late * 0.75;
							total_present += total_paid_late;
							let total_unpaid_late = unpaid_late * 0.25;
							total_absent += total_unpaid_late;
						}

						if (total_early <= 3) {
							total_present += total_early;
						} else {
							total_present += 3;
							let unpaid_early = (total_early - 3);
							let total_paid_early = unpaid_early * 0.75;
							total_present += total_paid_early;
							let total_unpaid_early = unpaid_early * 0.25;
							total_absent += total_unpaid_early;
						}

						let total_half_day = half_day * 0.5;
						total_present += total_half_day;
						total_absent += total_half_day;

						let total_full_holiday = 1 * full_holiday;
						total_present += total_full_holiday;

						let total_half_holiday = 0.5 * half_holiday;
						total_present += total_half_holiday;

						total_present += official_leave;

						if (balance_paid_leaves > 0) {
							if (total_absent <= balance_paid_leaves) {
								balance_paid_leaves -= total_absent;
								paid_leaves = total_absent;
								unpaid_leaves = 0;
							} else {
								paid_leaves = balance_paid_leaves;
								unpaid_leaves = total_absent - balance_paid_leaves;
							}
						}

						total_present += paid_leaves;

						if (item.department_id == 1) {
							total_present += 2;
						} else {
							total_present += 1;
						}

						if (total_present > total_days_in_month) {
							total_present = total_days_in_month;
							total_present -= unpaid_leaves;
						} else if (total_present < total_days_in_month) {
							let diff = total_days_in_month - total_present;
							if (balance_paid_leaves > 0) {
								total_present += diff;
								balance_paid_leaves -= diff;
								paid_leaves += diff;
							} else {
								unpaid_leaves += diff;
							}
						}

						let data = this.createMonthSalary(
							2,
							item.emp_id,
							item.annual_ctc_id,
							item.financial_year,
							item.monthly_ctc,
							moment(this.selected_month).format('MM'),
							total_present,
							item
						);

						data['total_present'] = total_present;
						data['total_late'] = total_late;
						data['total_early'] = total_early;
						data['total_half_day'] = half_day;
						data['total_wfh'] = official_leave;
						data['total_absent'] = total_absent;
						data['total_paid_leaves'] = paid_leaves;
						data['total_unpaid_leaves'] = unpaid_leaves;
						data['balance_paid_leaves'] = balance_paid_leaves;
						data['is_calculated'] = (is_checked) ? 1 : 0;
						data['status'] = 0;

						await this.crudServices.updateData<any>(MonthlySalaryNew.updateData, {
							data: data,
							id: item.id
						}).subscribe(res => {
							if (res.code == '100') {
								this.toasterService.pop(res.message, "Success", res.data);
								this.getMonthlySalary();
							} else {
								this.toasterService.pop('error', 'Error', 'Something Went Wrong');
							}
						});
					}
				}
			});
		} else {
			let onfield_total_present = total_days_in_month;

			if (moment(item.appointment_date).isAfter(moment(first_day_of_month))) {
				let end = moment(first_day_of_month).endOf('month').format('YYYY-MM-DD');
				onfield_total_present = moment(end).diff(moment(item.appointment_date), 'days') + 1;
			}

			let data = this.createMonthSalary(
				2,
				item.emp_id,
				item.annual_ctc_id,
				item.financial_year,
				item.monthly_ctc,
				moment(this.selected_month).format('MM'),
				onfield_total_present,
				item
			);

			data['total_present'] = onfield_total_present;
			data['total_late'] = 0;
			data['total_early'] = 0;
			data['total_half_day'] = 0;
			data['total_wfh'] = 0;
			data['total_absent'] = 0;
			data['total_paid_leaves'] = 0;
			data['balance_paid_leaves'] = 0;
			data['is_calculated'] = (is_checked) ? 1 : 0;
			data['status'] = 0;

			await this.crudServices.updateData<any>(MonthlySalaryNew.updateData, {
				data: data,
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, "Success", res.data);
					this.getMonthlySalary();
				} else {
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				}
			});
		}
	}

	onChangeSalaryDetails(value, item, type) {
		if (value != null || value != undefined) {
			let data = {
				[type]: value
			};
			this.crudServices.updateData<any>(MonthlySalaryNew.updateData, {
				data: data,
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.getMonthlySalary();
				} else {
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				}
			});
		}
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
				'Total Salary': total_salary_of_month,
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
