import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { staticValues, CommonService, roundAmount, } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { YearlyCTCNew, MonthlySalaryNew, percentage_master, Investment, DepartmentMaster } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-annual-ctc',
	templateUrl: './annual-ctc.component.html',
	styleUrls: ['./annual-ctc.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, CommonService, Calculations]
})

export class AnnualCtcComponent implements OnInit {

	@ViewChild("createPiModal", { static: false }) public createPiModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Annual CTC"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	popoverMessage3: string = 'Are you sure, you want to Renew Deal?';
	popoverMessage4: string = 'Are you sure, you want to Reverse Payment?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	months: any = [
		{ id: '04', name: 'April', order: 1 },
		{ id: '05', name: 'May', order: 2 },
		{ id: '06', name: 'June', order: 3 },
		{ id: '07', name: 'July', order: 4 },
		{ id: '08', name: 'August', order: 5 },
		{ id: '09', name: 'September', order: 6 },
		{ id: '10', name: 'October', order: 7 },
		{ id: '11', name: 'November', order: 8 },
		{ id: '12', name: 'December', order: 9 },
		{ id: '01', name: 'January', order: 10 },
		{ id: '02', name: 'February', order: 11 },
		{ id: '03', name: 'March', order: 12 }
	];

	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;
	isEdit: boolean = false;

	financial_year_list: any = [];
	selected_financial_year: any = null;
	selected_department_list: any = null;
	statusList: any = staticValues.company_list;
	selected_status: any = this.statusList[0].id;

	cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];
	department: any = []; 
	selected_department: any = []; 


	yearlyCTCForm: FormGroup;

	basic_per: any = 0;
	da_per: any = 0;
	hra_per: any = 0;
	employer_pf_per: any = 0;
	lta_per: any = 0;
	child_edu_allow_per: any = 0;
	employee_pf_per: any = 0;
	esi_employee_per: any = 0;
	esi_employer_per: any = 0;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private commonService: CommonService,
		private crudServices: CrudServices,
		private calculations: Calculations
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
		this.role_id = user.userDet[0].role_id;
	}
	
	ngOnInit() {
		this.getAllDepartment();
		this.getFinancialYearList();
		this.getPercentage();
		this.getNewMonthsLeft();
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.yearlyCTCForm = new FormGroup({
			id: new FormControl(null),
			emp_id: new FormControl(null, Validators.required),
			financial_year: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null, Validators.required),
			annual_ctc: new FormControl(null, Validators.required),
			basic: new FormControl(null, Validators.required),
			da: new FormControl(null, Validators.required),
			hra: new FormControl(null, Validators.required),
			lta: new FormControl(null, Validators.required),
			child_edu_allowance: new FormControl(null, Validators.required),
			special_allowance: new FormControl(null, Validators.required),
			feb_pt: new FormControl(null, Validators.required),
			other_pt: new FormControl(null, Validators.required),
			employee_pf: new FormControl(null, Validators.required),
			employer_pf: new FormControl(null, Validators.required),
			// standard_deduction
			// tds
			bonus: new FormControl(null, Validators.required),
			incentive: new FormControl(null, Validators.required)
			// net_salary
		});
	}

	getFinancialYearList() {
		this.crudServices.getAll<any>(YearlyCTCNew.getFinancialYears).subscribe(res => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.financial_year_list = res.data;
					this.selected_financial_year = this.financial_year_list[0];
					this.getCols();
				}
			}
		});
	}

	getAllDepartment(){
		this.crudServices.getAll<any>(DepartmentMaster.getAll).subscribe(res => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.department = res.data
					this.selected_department = res.data[0]
				}
			}
		});
	}

	getPercentage() {
		this.crudServices.getAll<any>(percentage_master.getAllDataByCurrentDate).subscribe(res => {
			if (res.length > 0) {
				this.basic_per = 0;
				this.da_per = 0;
				this.hra_per = 0;
				this.employer_pf_per = 0;
				this.lta_per = 0;
				this.child_edu_allow_per = 0;
				this.employee_pf_per = 0;
				this.esi_employee_per = 0;
				this.esi_employer_per = 0;

				res.forEach(element => {
					if (element.percentage_type.type == 'Basic') {
						this.basic_per = element.percent_value;
					}
					if (element.percentage_type.type == 'DA') {
						this.da_per = element.percent_value;
					}
					if (element.percentage_type.type == 'HRA') {
						this.hra_per = element.percent_value;
					}
					if (element.percentage_type.type == 'Employer PF') {
						this.employer_pf_per = element.percent_value;
					}
					if (element.percentage_type.type == 'LTA') {
						this.lta_per = element.percent_value;
					}
					if (element.percentage_type.type == 'Child Education') {
						this.child_edu_allow_per = element.percent_value;
					}
					if (element.percentage_type.type == 'Employee PF') {
						this.employee_pf_per = element.percent_value;
					}
					if (element.percentage_type.type == 'ESI Employee') {
						this.esi_employee_per = element.percent_value;
					}
					if (element.percentage_type.type == 'ESI Employer') {
						this.esi_employer_per = element.percent_value;
					}
				});
			}
		})
	}

	getNewMonthsLeft() {
		let new_months = [];
		this.crudServices.getOne<any>(MonthlySalaryNew.getNewMonthsLeft, {
			financial_year: (this.selected_financial_year) ? this.selected_financial_year.financial_year : this.commonService.getCurrentFinancialYear()
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						let zero = "";
						if (Number(element.month) < 10) {
							zero = "0";
						}
						let month_id = zero + element.month;
						new_months.push({ id: month_id });
					});

					let newArray = this.months.filter(function (o1) {
						return new_months.some(function (o2) {
							return o1.id === o2.id;
						})
					});
					this.months = newArray;
				}
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "staff_id", header: "ID", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "emp_name", header: "Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "annual_ctc", header: "Annual CTC", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "basic", header: "Basic", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "da", header: "DA", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "hra", header: "HRA", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "lta", header: "LTA", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "child_edu_allowance", header: "Child Edu Allowance", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "special_allowance", header: "Special Allowance", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "employee_pf", header: "Employee PF", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "employer_pf", header: "Employer PF", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "feb_pt", header: "Feb PT", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "other_pt", header: "Other PT", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "bonus", header: "Bonus", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "incentive", header: "Incentive", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "additional_bonus", header: "Additional Bonus", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "tds", header: "TDS", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
		];
		this.filter = ['emp_name','department'];
		this.getData();
	}

	getData() {
		this.isLoading = true;
		this.data = [];
		this.crudServices.getOne<any>(YearlyCTCNew.getAllYearlyCTC, {
			financial_year: (this.selected_financial_year) ? this.selected_financial_year.financial_year : this.commonService.getCurrentFinancialYear(),
			division : (this.selected_status.id) ? this.selected_status.id : this.selected_status ,
			department: this.selected_department.id 
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.enable_ctc_edit = true;
						// if (moment(element.appointment_date).isAfter(moment("2022-06-01"))) {
						// 	element.enable_ctc_edit = true;
						// } else {
						// 	element.enable_ctc_edit = false;
						// }
					});
					this.data = res.data;
				}
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

		let month_id = moment(element.appointment_date).format("MM");
		// let month_obj = this.months.find(x => x.id == month_id);
		// let emp_joining_year = moment(element.appointment_date).format("YYYY");
		// let emp_joining_month = moment(element.appointment_date).format("MM");
		// let new_date = emp_joining_year + "-" + emp_joining_month + "-15";
		// let mid_date = moment(new_date).format("YYYY-MM-DD");
		let months_left_arr = null;
		let ignore_tds_month = null;

		// if (moment(element.appointment_date).isAfter(moment(mid_date))) {
		// 	months_left_arr = this.months.filter(x => x.order > month_obj.order);
		// 	if (element.tds > 0) {
		// 		ignore_tds_month = emp_joining_month;
		// 	} else {
		// 		ignore_tds_month = null;
		// 	}
		// } else {
		// 	months_left_arr = this.months.filter(x => x.order >= month_obj.order);
		// 	ignore_tds_month = null;
		// }

		let total_months_left = null; // months_left_arr.length;

		this.months.forEach(month => {
			if ((month.id == '01') || (month.id == '02') || (month.id == '03')) {
				year = Number(year_arr[1]);
			}
			let start_date = moment(year + "-" + month.id + "-01").format("YYYY-MM-DD");
			let total_days_in_month = moment(start_date).daysInMonth();

			if (Number(element.join_year) < Number(year_arr[0])) {
				let data = this.createMonthSalary(
					element.emp_id,
					element.id,
					element.financial_year,
					monthly_ctc,
					month.id,
					total_days_in_month,
					element,
					Number(month.order),
					total_months_left,
					ignore_tds_month
				);
				all_month_salary.push(data);
			} else {
				if (moment(start_date).isAfter(element.appointment_date) || (moment(start_date).isSame(element.appointment_date))) {
					let data = this.createMonthSalary(
						element.emp_id,
						element.id,
						element.financial_year,
						monthly_ctc,
						month.id,
						total_days_in_month,
						element,
						Number(month.order),
						total_months_left,
						ignore_tds_month
					);
					all_month_salary.push(data);
				} else {
					let data = this.createMonthSalary(
						element.emp_id,
						element.id,
						element.financial_year,
						monthly_ctc,
						month.id,
						total_days_in_month,
						element,
						Number(month.order),
						total_months_left,
						ignore_tds_month
					);
					all_month_salary.push(data);
				}
			}
		});
		const unique_month_salary = Array.from(new Set(all_month_salary.map(a => a.month)))
			.map(month => {
				return all_month_salary.find(a => a.month === month)
			});

		this.crudServices.addData<any>(MonthlySalaryNew.addData, {
			data: unique_month_salary,
			emp_id: element.emp_id,
			annual_ctc_id: element.id
		}).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop(res.message, "Success", res.data);
			} else {
				this.toasterService.pop('error', 'Error', 'Something Went Wrong');
			}
		});
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	createMonthSalary(emp_id, annual_ctc_id, financial_year, monthly_ctc, month, present_days, item, month_order, months_left, ignore_tds_month) {
		let year_arr = financial_year.split('-');
		let year = Number(year_arr[0]);

		if ((month == '01') || (month == '02') || (month == '03')) {
			year = Number(year_arr[1]);
		}

		let total_days = moment(year + "-" + month, "YYYY-MM").daysInMonth();

		let pt = 0;
		if (month == '02') {
			pt = Number(item.feb_pt);
		} else {
			pt = Math.ceil(Number(item.other_pt / 11))
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

		let tds = Math.ceil(Number(item.tds) / 11);

		let total_deduction = (pt + employee_pf + employee_esi + tds);

		let net_salary = gross_salary - total_deduction;

		net_salary = Math.ceil(net_salary);

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
			final_salary: net_salary,
			arrear_plus: 0,
			arrear_plus_remark: null,
			arrear_minus: 0,
			arrear_minus_remark: null,
			net_salary: net_salary,
			bonus: 0,
			incentive: 0,
			incentive_tds: 0,
			performance_bonus: 0,
			month_order
		};
		return data;
	}

	calculateAnnualSalary(value) {
		if (value != null && value != undefined) {

			let annual_ctc = Number(value);
			let bonus = 0; // roundAmount(annual_ctc / 12);

			let basic = roundAmount(annual_ctc * this.basic_per / 100);
			let da = roundAmount(annual_ctc * this.da_per / 100);
			let hra = roundAmount((basic + da) * this.hra_per / 100);
			let salary_for_employer_pf = annual_ctc - ((da + basic) * (0.4));
			let employer_pf = 0;
			if (salary_for_employer_pf < (15000 * 12)) {
				employer_pf = roundAmount(salary_for_employer_pf * this.employer_pf_per / 100);
			} else {
				employer_pf = roundAmount((15000 * 12) * this.employer_pf_per / 100);
			}
			let monthly_salary = (annual_ctc - employer_pf);
			let lta = roundAmount(monthly_salary * this.lta_per / 100);
			let child_edu_allowance = this.child_edu_allow_per * 12;
			let special_allowance = monthly_salary - (basic + da + hra + lta + child_edu_allowance);
			let grossSalary = basic + da + hra + lta + child_edu_allowance + special_allowance;
			let esi_employee = 0;
			let esi_employer = 0;
			if (grossSalary < 252000) {
				esi_employee = grossSalary * (this.esi_employee_per / 100);
				esi_employer = grossSalary * (this.esi_employer_per / 100);
			}
			let employee_pf = 0;
			if (grossSalary < (15000 * 12)) {
				employee_pf = roundAmount(grossSalary * this.employee_pf_per / 100);
			} else {
				employee_pf = roundAmount((15000 * 12) * this.employee_pf_per / 100);
			}

			let obj = {
				annual_ctc: annual_ctc,
				basic: roundAmount(Number(basic)),
				da: roundAmount(Number(da)),
				hra: roundAmount(Number(hra)),
				lta: roundAmount(Number(lta)),
				child_edu_allowance: roundAmount(Number(child_edu_allowance)),
				special_allowance: roundAmount(Number(special_allowance)),
				feb_pt: 300,
				other_pt: 2200,
				employee_pf: roundAmount(Number(employee_pf)),
				employer_pf: roundAmount(Number(employer_pf)),
				standard_deduction: 50000,
				tds: 0,
				bonus: bonus,
				incentive: 0,
				net_salary: 0
			};

			return obj;
		}
	}

	calculateActualSalary(value, feb_pt, other_pt, bonus) {
		if (value != null && value != undefined) {
			let actual_ctc = Number(value);
			let basic = roundAmount(actual_ctc * this.basic_per / 100);
			let da = roundAmount(actual_ctc * this.da_per / 100);
			let hra = roundAmount((basic + da) * this.hra_per / 100);
			let salary_for_employer_pf = actual_ctc - ((da + basic) * (0.4));
			let employer_pf = 0;
			if (salary_for_employer_pf < (15000 * 12)) {
				employer_pf = roundAmount(salary_for_employer_pf * this.employer_pf_per / 100);
			} else {
				employer_pf = roundAmount((15000 * 12) * this.employer_pf_per / 100);
			}
			let monthly_salary = (actual_ctc - employer_pf);
			let lta = roundAmount(monthly_salary * this.lta_per / 100);
			let child_edu_allowance = this.child_edu_allow_per * 12;
			let special_allowance = monthly_salary - (basic + da + hra + lta + child_edu_allowance);
			let grossSalary = basic + da + hra + lta + child_edu_allowance + special_allowance;
			let esi_employee = 0;
			let esi_employer = 0;
			if (grossSalary < 252000) {
				esi_employee = grossSalary * (this.esi_employee_per / 100);
				esi_employer = grossSalary * (this.esi_employer_per / 100);
			}
			let employee_pf = 0;
			if (grossSalary < (15000 * 12)) {
				employee_pf = roundAmount(grossSalary * this.employee_pf_per / 100);
			} else {
				employee_pf = roundAmount((15000 * 12) * this.employee_pf_per / 100);
			}

			let obj = {
				actual_ctc: actual_ctc,
				basic: roundAmount(Number(basic)),
				da: roundAmount(Number(da)),
				hra: roundAmount(Number(hra)),
				lta: roundAmount(Number(lta)),
				child_edu_allowance: roundAmount(Number(child_edu_allowance)),
				special_allowance: roundAmount(Number(special_allowance)),
				employee_pf: roundAmount(Number(employee_pf)),
				employer_pf: roundAmount(Number(employer_pf)),
				standard_deduction: 50000
			};
			if (feb_pt != null) {
				obj['feb_pt'] = feb_pt;
			}
			if (other_pt != null) {
				obj['other_pt'] = other_pt;
			}
			if (bonus != null) {
				obj['bonus'] = bonus;
			}
			return obj;
		}
	}


	calculateTDS(tdsDetails) {
		tdsDetails.other_income = 0;
		tdsDetails.actual_rent_paid = Number(tdsDetails.budget_80gg);
		tdsDetails.total_budget_investment = 0;
		tdsDetails.gross_salary = 0;
		tdsDetails.excess_rent_10 = 0;

		tdsDetails.total_budget_investment = (
			Number(tdsDetails.budget_80c_others) +
			Number(tdsDetails.budget_80c_home) +
			Number(tdsDetails.budget_80d) +
			Number(tdsDetails.budget_80ccd) +
			Number(tdsDetails.budget_80g) +
			Number(tdsDetails.budget_80gg) +
			Number(tdsDetails.budget_10_5) +
			Number(tdsDetails.budget_others)
		);

		tdsDetails.gross_salary = (
			tdsDetails.basic +
			tdsDetails.da +
			tdsDetails.hra +
			tdsDetails.lta +
			tdsDetails.child_edu_allowance +
			tdsDetails.special_allowance +
			tdsDetails.bonus +
			tdsDetails.additional_bonus +
			tdsDetails.incentive
		);

		tdsDetails.excess_rent_10 = (
			tdsDetails.actual_rent_paid - ((tdsDetails.basic + tdsDetails.da) * (10 / 100))
		);
		tdsDetails.basic_da_40 = ((tdsDetails.basic + tdsDetails.da) * (40 / 100));

		if (tdsDetails.excess_rent_10 < 0) {
			tdsDetails.excess_rent_10 = 0;
		}

		if (tdsDetails.basic_da_40 < 0) {
			tdsDetails.basic_da_40 = 0;
		}

		tdsDetails.total_hra = Math.min(...[
			tdsDetails.actual_rent_paid,
			tdsDetails.hra,
			tdsDetails.excess_rent_10,
			tdsDetails.basic_da_40
		]);

		tdsDetails.lowest_budget_lta = 0;

		tdsDetails.lowest_budget_lta = Math.min(...[
			tdsDetails.lta,
			Number(tdsDetails.budget_10_5)
		]);

		let final_budget_lta = tdsDetails.lowest_budget_lta;

		tdsDetails.allowances_10 = (tdsDetails.total_hra + (tdsDetails.child_edu_allowance / 12) + final_budget_lta);

		tdsDetails.deduction_16 = (
			tdsDetails.standard_deduction + tdsDetails.feb_pt + tdsDetails.other_pt
		);

		tdsDetails.net_salary = (
			tdsDetails.gross_salary - tdsDetails.allowances_10 - tdsDetails.deduction_16
		);

		tdsDetails.total_gross_income = (tdsDetails.net_salary + tdsDetails.other_income);

		tdsDetails.total_budget_80c_others = 0;
		tdsDetails.total_budget_80c_home = 0;

		if (tdsDetails.budget_80c_others < 150000) {
			tdsDetails.total_budget_80c_others = Number(tdsDetails.budget_80c_others);
		} else {
			tdsDetails.total_budget_80c_others = 150000;
		}
		if (tdsDetails.budget_80c_home < 200000) {
			tdsDetails.total_budget_80c_home = Number(tdsDetails.budget_80c_home);
		} else {
			tdsDetails.total_budget_80c_home = 200000;
		}

		tdsDetails.total_actual_80c_others = 0;
		tdsDetails.total_actual_80c_home = 0;

		if (tdsDetails.actual_80c_others < 150000) {
			tdsDetails.total_actual_80c_others = Number(tdsDetails.actual_80c_others);
		} else {
			tdsDetails.total_actual_80c_others = 150000;
		}
		if (tdsDetails.actual_80c_home < 200000) {
			tdsDetails.total_actual_80c_home = Number(tdsDetails.actual_80c_home);
		} else {
			tdsDetails.total_actual_80c_home = 200000;
		}

		tdsDetails.total_budget_80d = Number(tdsDetails.budget_80d);
		tdsDetails.total_actual_80d = Number(tdsDetails.actual_80d);

		tdsDetails.total_income = 0;

		tdsDetails.total_income = (
			tdsDetails.total_gross_income - (
				tdsDetails.total_budget_80c_others +
				tdsDetails.total_budget_80c_home +
				tdsDetails.total_budget_80d +
				Number(tdsDetails.budget_80ccd) +
				Number(tdsDetails.budget_80g)
			)
		);
		tdsDetails.tax_on_total_income = 0;
		if (tdsDetails.total_income < 250000) {
			tdsDetails.tax_on_total_income = 0;
		} else if (tdsDetails.total_income > 250000 && tdsDetails.total_income < 500000) {
			tdsDetails.tax_on_total_income = roundAmount((tdsDetails.total_income - 250000) * (5 / 100));
		} else if (tdsDetails.total_income > 500000 && tdsDetails.total_income < 1000000) {
			tdsDetails.tax_on_total_income = 12500 + roundAmount((tdsDetails.total_income - 500000) * (20 / 100));
		} else if (tdsDetails.total_income > 1000000) {
			tdsDetails.tax_on_total_income = 12500 + 100000 + roundAmount((tdsDetails.total_income - 1000000) * (30 / 100));
		}

		if (tdsDetails.total_income < 10000000) {
			tdsDetails.surcharge = 0;
		} else {
			tdsDetails.surcharge = tdsDetails.tax_on_total_income * 0.1;
		}

		tdsDetails.tax_with_surcharge = tdsDetails.tax_on_total_income + tdsDetails.surcharge;

		if (tdsDetails.tax_with_surcharge < 12500) {
			tdsDetails.rebate_87a = tdsDetails.tax_with_surcharge;
		} else {
			tdsDetails.rebate_87a = 0;
		}

		tdsDetails.tax_after_rebate_87a = tdsDetails.tax_with_surcharge - tdsDetails.rebate_87a;
		tdsDetails.education_cess = roundAmount(tdsDetails.tax_after_rebate_87a * (4 / 100));

		tdsDetails.annual_tds = roundAmount(tdsDetails.tax_after_rebate_87a + tdsDetails.education_cess);
		tdsDetails.monthly_tds = roundAmount(tdsDetails.annual_tds / 11);
		return tdsDetails;
	}

	onChangeValue(e, row, type) {
		if (type == 'update_tds') {
			if (row.annual_ctc > 0) {
				let obj = this.calculateAnnualSalary(row.annual_ctc);
				let financial_year = this.selected_financial_year.financial_year;
				let fy = financial_year.split('-');
				obj['emp_id'] = row.staff_id;
				obj['financial_year'] = financial_year;
				obj['from_date'] = fy[0] + "-04-01";
				obj['to_date'] = fy[1] + "-03-31";
				obj['tds'] = Number(row.tds);
				let total_months = 0;
				let fy_start_date = fy[0] + "-04-01";
				let fy_end_date = fy[1] + "-03-31";
				if (moment(row.appointment_date).isAfter(moment(fy_start_date))) {
					let diff = moment(fy_end_date).diff(moment(row.appointment_date), 'months', true);
					total_months = Math.ceil(diff);
				} else {
					total_months = 12;
				}
				let monthly_ctc = Number(row.annual_ctc) / 12;
				let actual_ctc = monthly_ctc * Number(total_months);

				if (actual_ctc > 0) {
					let objNew = this.calculateActualSalary(actual_ctc, row.feb_pt, row.other_pt, row.bonus);
					objNew['emp_id'] = row.staff_id;
					objNew['financial_year'] = financial_year;
					objNew['annual_ctc'] = Number(row.annual_ctc);
					objNew['is_new_tds'] = 0;
					this.updateRow(row.id, obj, row, false, financial_year, objNew);
				}
			}
		}
		if (type == 'annual_ctc') {
			if (e != null && e != undefined) {
				let obj = this.calculateAnnualSalary(e);
				let financial_year = this.selected_financial_year.financial_year;
				let fy = financial_year.split('-');
				obj['emp_id'] = row.staff_id;
				obj['financial_year'] = financial_year;
				obj['from_date'] = fy[0] + "-04-01";
				obj['to_date'] = fy[1] + "-03-31";
				obj['tds'] = Number(row.tds);

				let total_months = 0;
				let fy_start_date = fy[0] + "-04-01";
				let fy_end_date = fy[1] + "-03-31";
				if (moment(row.appointment_date).isAfter(moment(fy_start_date))) {
					let diff = moment(fy_end_date).diff(moment(row.appointment_date), 'months', true);
					total_months = Math.ceil(diff);
				} else {
					// let diff = moment(fy_end_date).diff(moment(), 'months', true);
					total_months = 12;//Math.ceil(diff) + 1;
				}
				let monthly_ctc = Number(e) / 12;
				let actual_ctc = monthly_ctc * Number(total_months);

				let objNew = null;
				if (actual_ctc > 0) {
					objNew = this.calculateActualSalary(actual_ctc, obj.feb_pt, obj.other_pt, obj.bonus);
					objNew['emp_id'] = row.staff_id;
					objNew['financial_year'] = financial_year;
					objNew['annual_ctc'] = Number(e);
					objNew['is_new_tds'] = 0;
				}

				if (row.id == null) {
					let body = {
						data: obj,
						tds_data: objNew
					};
					this.isLoading = true;
					this.crudServices.addData<any>(YearlyCTCNew.addData, body).subscribe(res_y_a => {
						if (res_y_a.code == '100') {
							let id = res_y_a.data;
							this.crudServices.getOne<any>(Investment.getAllEmpTDS, {
								financial_year: financial_year,
								emp_id: row.staff_id
							}).subscribe(res_tds => {
								if (res_tds.code == '100') {
									if (res_tds.data.length > 0) {
										let tds_details = this.calculateTDS(res_tds.data[0]);
										this.crudServices.updateData<any>(YearlyCTCNew.updateData, {
											data: {
												tds: Math.ceil(Number(tds_details.annual_tds))
											},
											tds_data: {
												annual_tds: Math.ceil(Number(tds_details.annual_tds)),
												monthly_tds: Math.ceil(Number(tds_details.monthly_tds))
											},
											emp_id: row.staff_id,
											financial_year: financial_year,
											id: id,
											is_update_tds: true
										}).subscribe(res_y_u => {
											if (res_y_u.code == '100') {
												this.crudServices.getOne<any>(YearlyCTCNew.getOneYearlyCTC, {
													id: id
												}).subscribe(res_y => {
													if (res_y.code == '100') {
														this.toasterService.pop(res_y_a.message, res_y_a.message, res_y_a.data);
														this.getFinancialYearList();
														this.getData();
														this.createEmployeeSalary(res_y.data[0]);
													}
												});
											}
										});
									}
								}
							});
						} else {
							this.toasterService.pop(res_y_a.message, res_y_a.message, 'Something Went Wrong!!');
						}
					});
				} else {
					this.updateRow(row.id, obj, row, true, financial_year, objNew);
				}
			}
		} else if (type == 'feb_pt') {
			if (e != null && e != undefined) {
				let objNew = {
					feb_pt: e
				};
				this.updateRow(row.id, {
					feb_pt: e
				}, null, false, null, objNew);
			}
		} else if (type == 'other_pt') {
			if (e != null && e != undefined) {
				let objNew = {
					other_pt: e
				};
				this.updateRow(row.id, {
					other_pt: e
				}, null, false, null, objNew);
			}
		} else if (type == 'bonus') {
			if (e != null && e != undefined) {
				let objNew = {
					bonus: e
				};
				this.updateRow(row.id, {
					bonus: e
				}, null, false, null, objNew);
			}
		} else if (type == 'incentive') {
			if (e != null && e != undefined) {
				let objNew = {
					incentive: e
				};
				this.updateRow(row.id, {
					incentive: e
				}, null, false, null, objNew);
			}
		} else if (type == 'additional_bonus') {
			if (e != null && e != undefined) {
				let objNew = {
					additional_bonus: e
				};
				this.updateRow(row.id, {
					additional_bonus: e
				}, null, false, null, objNew);
			}
		}
	}

	updateRow(id, data, row, is_ctc_updated, financial_year, tds_data) {
		let body = {
			data: data,
			tds_data: tds_data,
			id: id,
			emp_id: row.staff_id,
			financial_year: financial_year
		};
		this.crudServices.updateData<any>(YearlyCTCNew.updateData, body).subscribe(res_y_u => {
			if (res_y_u.code == '100') {
				this.crudServices.getOne<any>(Investment.getAllEmpTDS, {
					financial_year: financial_year,
					emp_id: row.staff_id
				}).subscribe(res_tds => {
					if (res_tds.code == '100') {
						if (res_tds.data.length > 0) {
							let tds_details = this.calculateTDS(res_tds.data[0]);
							this.crudServices.updateData<any>(YearlyCTCNew.updateData, {
								data: {
									tds: Math.ceil(Number(tds_details.annual_tds))
								},
								tds_data: {
									annual_tds: Math.ceil(Number(tds_details.annual_tds)),
									monthly_tds: Math.ceil(Number(tds_details.monthly_tds))
								},
								emp_id: row.staff_id,
								financial_year: financial_year,
								id: id
							}).subscribe(res_y_g => {
								if (res_y_g.code == '100') {
									this.crudServices.getOne<any>(YearlyCTCNew.getOneYearlyCTC, {
										id: id
									}).subscribe(res_y => {
										if (res_y.code == '100') {
											this.toasterService.pop(res_y.message, res_y.message, "Row Updated Successfully");
											this.getData();
											if (is_ctc_updated) {
												this.createEmployeeSalary(res_y.data[0]);
											}
										}
									});
								}
							});
						}
					}
				});
			} else {
				this.toasterService.pop(res_y_u.message, res_y_u.message, 'Something Went Wrong!!');
			}
		});
	}

	onAction(item, type) {
		if (type == 'Financial_Year') {
			this.getData();
		}
		if (type == 'Delete') {
			this.crudServices.deleteData<any>(YearlyCTCNew.deleteData, {
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, res.message, res.data);
					this.getFinancialYearList();
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.message, 'Something Went Wrong!!');
				}
			});
		}
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.page_title + ' (' + this.selected_financial_year.financial_year + ')';
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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
