import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { staticValues, CommonService, roundAmount } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { YearlyCTCNew, percentage_master, Investment } from '../../../shared/apis-path/apis-path';
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
	selector: 'app-employee-investment',
	templateUrl: './employee-investment.component.html',
	styleUrls: ['./employee-investment.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, CommonService, Calculations]
})

export class EmployeeInvestmentComponent implements OnInit {

	@ViewChild("employeeTDSDetailsModal", { static: false }) public employeeTDSDetailsModal: ModalDirective;
	@ViewChild("changeTDSDateModal", { static: false }) public changeTDSDateModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Employee TDS"
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Please Confirm';
	confirmText: string = 'Approve';
	cancelText: string = 'Reject';
	placement: string = 'left';

	popoverTitle2: string = 'Alert';
	popoverMessage2: string = 'Please Confirm';
	confirmText2: string = 'Confirm';
	cancelText2: string = 'Cancel';

	cancelClicked: boolean = false;

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
	selected_row: any = null;

	datePickerConfig: any = staticValues.datePickerConfig;
	tdsTypeList: any = staticValues.tds_type_list;
	selected_tds_type: any = this.tdsTypeList[0];

	cols: any = [];
	data: any = [];
	filter: any = [];
	empTDSDetails: any = [];
	total_budget_amount: any = 0;
	total_actual_amount: any = 0;

	tds_start_date: any = null;
	tds_end_date: any = null;

	changeTDSDateForm: FormGroup;

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

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private commonService: CommonService,
		private crudServices: CrudServices,
		private calculations: Calculations,
		private router: Router,
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
		this.changeTDSDateForm = new FormGroup({
			budget_actual_flag: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null, Validators.required),
		});
	}

	ngOnInit() {
		this.getFinancialYearList();
	}

	getTDSDate(type) {
		this.crudServices.getOne<any>(percentage_master.getTDSDateTypeWise, {
			type: type
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					if (res.data[0].type_id == 13) {
						this.selected_tds_type = this.tdsTypeList[0];
						this.tds_start_date = moment(res.data[0].from_date).format("DD/MMM/YYYY");
						this.tds_end_date = moment(res.data[0].to_date).format("DD/MMM/YYYY");
					} else if (res.data[0].type_id == 14) {
						this.selected_tds_type = this.tdsTypeList[1];
						this.tds_start_date = moment(res.data[0].from_date).format("DD/MMM/YYYY");
						this.tds_end_date = moment(res.data[0].to_date).format("DD/MMM/YYYY");
					} else {
						this.tds_start_date = null;
						this.tds_end_date = null;
					}
					this.changeTDSDateForm.reset();
					this.changeTDSDateForm.patchValue({
						budget_actual_flag: this.selected_tds_type.id,
						from_date: new Date(this.tds_start_date),
						to_date: new Date(this.tds_end_date)
					});
				} else {
					this.tds_start_date = null;
					this.tds_end_date = null;
				}
			}
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

	getCols() {
		this.getTDSDate(this.selected_tds_type.id);
		this.cols = [
			{ field: "staff_id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "ID", tds_type: null },
			{ field: "emp_name", header: "Employee Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Name", tds_type: null },
			{ field: "annual_ctc", header: "Annual CTC", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: null },
			{ field: "bonus", header: "Bonus", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: null },
			{ field: "additional_bonus", header: "Additional Bonus", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: null },
			{ field: "incentive", header: "Incentive", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: null },
			{ field: "total_investment", header: "Total Investment", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: null },
			{ field: "annual_tds_old", header: "Annual TDS (Old)", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: "Old" },
			{ field: "annual_tds_new", header: "Annual TDS (New)", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: "New" },
			// { field: "monthly_tds", header: "Monthly TDS", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount", tds_type: null },
			{ field: "regime", header: "Regime", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, tds_type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action", tds_type: null },
		];
		this.filter = ['emp_name'];
		this.getData();
	}

	getData() {
		this.isLoading = true;
		this.data = [];
		this.crudServices.getOne<any>(Investment.getAllEmpTDS, {
			financial_year: this.selected_financial_year.financial_year
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.annual_tds_old = this.tdsCalculationOld(element, this.selected_tds_type.id);
						element.annual_tds_new = this.tdsCalculationNew(element, this.selected_tds_type.id);

						if (element.annual_tds_old < element.annual_tds_new) {
							element.right_tds = element.annual_tds_old;
							element.regime = "Old";
						} else {
							element.right_tds = element.annual_tds_new;
							element.regime = "New";
						}

						element.is_budget_approved = false;
						element.is_actual_approved = false;
						if (element.total_budget_0 == 0) {
							element.is_budget_approved = true;
						}
						if (element.total_actual_0 == 0) {
							element.is_actual_approved = true;
						}

						element.is_tick = false;
						if (element.regime == "Old" && this.selected_tds_type.id == 0 && element.is_budget_approved) {
							element.is_tick = true;
						}
						if (element.regime == "Old" && this.selected_tds_type.id == 1 && element.is_actual_approved) {
							element.is_tick = true;
						}
						if (element.regime == "New" && this.selected_tds_type.id == 0 && element.is_new_tds == 1) {
							element.is_tick = true;
						}
						if (element.regime == "New" && this.selected_tds_type.id == 1 && element.is_new_tds == 1) {
							element.is_tick = true;
						}
					});
					// this.data = res.data.filter(x => x.annual_tds > 0 && x.relieving_date == null);
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
		});
	}

	tdsCalculationOld(tdsDetails, type) {
		tdsDetails.other_income = 0;
		tdsDetails.actual_rent_paid = (type == 0) ? Number(tdsDetails.budget_80gg) : Number(tdsDetails.actual_80gg);
		tdsDetails.total_investment = 0;
		if (type == 0) {
			tdsDetails.total_investment = (
				Number(tdsDetails.budget_80c_others) +
				Number(tdsDetails.budget_80c_home) +
				Number(tdsDetails.budget_80d) +
				Number(tdsDetails.budget_80ccd) +
				Number(tdsDetails.budget_80g) +
				Number(tdsDetails.budget_80gg) +
				Number(tdsDetails.budget_10_5) +
				Number(tdsDetails.budget_others)
			);
		} else {
			tdsDetails.total_investment = (
				Number(tdsDetails.actual_80c_others) +
				Number(tdsDetails.actual_80c_home) +
				Number(tdsDetails.actual_80d) +
				Number(tdsDetails.actual_80ccd) +
				Number(tdsDetails.actual_80g) +
				Number(tdsDetails.actual_80gg) +
				Number(tdsDetails.actual_10_5) +
				Number(tdsDetails.actual_others)
			);
		}
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
		tdsDetails.lowest_actual_lta = 0;

		tdsDetails.lowest_budget_lta = Math.min(...[
			tdsDetails.lta,
			Number(tdsDetails.budget_10_5)
		]);

		tdsDetails.lowest_actual_lta = Math.min(...[
			tdsDetails.lta,
			Number(tdsDetails.actual_10_5)
		]);

		let final_lta = 0;

		if (type == 0) {
			final_lta = tdsDetails.lowest_budget_lta;
		} else {
			final_lta = tdsDetails.lowest_actual_lta;
		}

		tdsDetails.allowances_10 = (tdsDetails.total_hra + (tdsDetails.child_edu_allowance / 12) + final_lta);

		tdsDetails.deduction_16 = (
			tdsDetails.standard_deduction +
			tdsDetails.other_pt +
			tdsDetails.feb_pt
		);

		tdsDetails.total_gross_income = (tdsDetails.gross_salary + tdsDetails.other_income);

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

		if (type == 0) {
			tdsDetails.total_income = (
				tdsDetails.total_gross_income - (
					(tdsDetails.allowances_10 + tdsDetails.deduction_16) +
					tdsDetails.total_budget_80c_others +
					tdsDetails.total_budget_80c_home +
					tdsDetails.total_budget_80d +
					Number(tdsDetails.budget_80ccd) +
					Number(tdsDetails.budget_80g)
				)
			);
		} else {
			tdsDetails.total_income = (
				tdsDetails.total_gross_income - (
					(tdsDetails.allowances_10 + tdsDetails.deduction_16) +
					tdsDetails.total_actual_80c_others +
					tdsDetails.total_actual_80c_home +
					tdsDetails.total_actual_80d +
					Number(tdsDetails.actual_80ccd) +
					Number(tdsDetails.actual_80g)
				)
			);
		}

		let slab_1 = 0;
		let slab_2 = 0;
		let slab_3 = 0;
		let slab_4 = 0;

		if (tdsDetails.total_income <= 250000) {
			slab_1 = 0;
		} else {
			if (tdsDetails.total_income > 250000 && tdsDetails.total_income <= 500000) {
				slab_2 = tdsDetails.total_income - 250000;
			} else {
				slab_2 = 250000;
			}
			if (tdsDetails.total_income > 500000 && tdsDetails.total_income <= 1000000) {
				slab_3 = tdsDetails.total_income - 500000;
			} else {
				slab_3 = 500000;
			}
			if (tdsDetails.total_income > 1000000) {
				slab_4 = tdsDetails.total_income - 1000000;
			}
		}

		let tax_1 = roundAmount(slab_1 * 0);
		let tax_2 = roundAmount(slab_2 * (5 / 100));
		let tax_3 = roundAmount(slab_3 * (20 / 100));
		let tax_4 = roundAmount(slab_4 * (30 / 100));

		tdsDetails.tax_on_total_income = tax_1 + tax_2 + tax_3 + tax_4;

		if (tdsDetails.total_income > 5000000 && tdsDetails.total_income < 10000000) {
			tdsDetails.surcharge = tdsDetails.tax_on_total_income * 0.1;
		} else if (tdsDetails.total_income > 10000000) {
			tdsDetails.surcharge = tdsDetails.tax_on_total_income * 0.15;
		} else {
			tdsDetails.surcharge = 0;
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
		// tdsDetails.monthly_tds = roundAmount(tdsDetails.annual_tds / 11);

		return tdsDetails.annual_tds;
	}

	tdsCalculationNew(tdsDetails, type) {
		tdsDetails.other_income = 0;

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

		tdsDetails.deduction_16 = tdsDetails.standard_deduction;

		tdsDetails.total_gross_income = (tdsDetails.gross_salary + tdsDetails.other_income);

		tdsDetails.total_income = tdsDetails.total_gross_income - tdsDetails.deduction_16;

		let slab_1 = 0;
		let slab_2 = 0;
		let slab_3 = 0;
		let slab_4 = 0;
		let slab_5 = 0;
		let slab_6 = 0;

		if (tdsDetails.total_income <= 300000) {
			slab_1 = 0;
		} else if (tdsDetails.total_income > 300000 && tdsDetails.total_income <= 600000) {
			slab_2 = roundAmount((tdsDetails.total_income - 300000) * (5 / 100));
		} else if (tdsDetails.total_income > 600000 && tdsDetails.total_income < 900000) {
			slab_3 = 15000 + roundAmount((tdsDetails.total_income - 600000) * (10 / 100));
		} else if (tdsDetails.total_income > 900000 && tdsDetails.total_income <= 1200000) {
			slab_4 = 45000 + roundAmount((tdsDetails.total_income - 900000) * (15 / 100));
		} else if (tdsDetails.total_income > 1200000 && tdsDetails.total_income <= 1500000) {
			slab_5 = 90000 + roundAmount((tdsDetails.total_income - 1200000) * (20 / 100));
		} else if (tdsDetails.total_income > 1500000) {
			slab_6 = 150000 + roundAmount((tdsDetails.total_income - 1500000) * (30 / 100));
		}
		tdsDetails.tax_on_total_income = (
			slab_1 +
			slab_2 +
			slab_3 +
			slab_4 +
			slab_5 +
			slab_6
		);

		if (tdsDetails.total_income > 5000000 && tdsDetails.total_income < 10000000) {
			tdsDetails.surcharge = tdsDetails.tax_on_total_income * 0.1;
		} else if (tdsDetails.total_income > 10000000) {
			tdsDetails.surcharge = tdsDetails.tax_on_total_income * 0.15;
		} else {
			tdsDetails.surcharge = 0;
		}

		tdsDetails.tax_with_surcharge = tdsDetails.tax_on_total_income + tdsDetails.surcharge;

		// if (tdsDetails.tax_with_surcharge < 12500) {
		// 	tdsDetails.rebate_87a = tdsDetails.tax_with_surcharge;
		// } else {
		// 	tdsDetails.rebate_87a = 0;
		// }

		tdsDetails.rebate_87a = 0;

		if (tdsDetails.total_income < 700000) {
			if ((slab_2 + slab_3) < 32500) {
				tdsDetails.rebate_87a = (slab_2 + slab_3);
			} else {
				tdsDetails.rebate_87a = 32500;
			}
		}

		tdsDetails.tax_after_rebate_87a = tdsDetails.tax_with_surcharge - tdsDetails.rebate_87a;

		if (tdsDetails.tax_after_rebate_87a < 0) {
			tdsDetails.tax_after_rebate_87a = 0;
		}
		tdsDetails.education_cess = roundAmount(tdsDetails.tax_after_rebate_87a * (4 / 100));

		tdsDetails.annual_tds = roundAmount(tdsDetails.tax_after_rebate_87a + tdsDetails.education_cess);
		tdsDetails.monthly_tds = roundAmount(tdsDetails.annual_tds / 11);

		return tdsDetails.annual_tds;
	}

	onAction(item, type, value) {
		if (type == 'Date') {
			this.changeTDSDateForm.reset();
			this.changeTDSDateForm.patchValue({
				budget_actual_flag: this.selected_tds_type.id,
				from_date: new Date(this.tds_start_date),
				to_date: new Date(this.tds_end_date)
			});
			this.changeTDSDateModal.show();
		}
		if (type == 'Budget_Actual_Flag') {
			this.getTDSDate(value);
		}
		if (type == 'View_Profile') {
			// this.router.navigate(['hr/view-staff', item.staff_id]);
			this.router.navigate([]).then(result => window.open('#/hr/view-staff/' + item.staff_id, '_blank'));
		}
		if (type == 'View') {
			this.selected_row = item;
			this.empTDSDetails = [];
			this.total_budget_amount = 0;
			this.total_actual_amount = 0;
			this.crudServices.getOne<any>(Investment.getEmpTDSDetails, {
				financial_year: this.selected_financial_year.financial_year,
				emp_id: item.staff_id
			}).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						res.data.forEach(element => {
							this.total_budget_amount += Number(element.budget_amount);
							this.total_actual_amount += Number(element.actual_amount);
						});
						this.empTDSDetails = res.data;
						this.employeeTDSDetailsModal.show();
					}
				}
			});
		}
		if (type == 'Apply_New') {
			this.updateTds(item, "New");
		}
		if (type == 'Status') {
			let data = null;
			if (Number(item.actual_amount) > 0) {
				data = {
					budget_status: value,
					actual_status: value,
				};
			} else {
				data = {
					budget_status: value
				};
			}
			let body = {
				data: data,
				id: item.id
			};
			this.crudServices.updateData<any>(Investment.updateInvestmentStatus, body).subscribe(res_update1 => {
				if (res_update1.code == '100') {
					this.empTDSDetails = [];
					this.total_budget_amount = 0;
					this.total_actual_amount = 0;
					if (value == 1) {
						this.updateTds(item, "Old");
					} else {
						this.crudServices.getOne<any>(Investment.getEmpTDSDetails, {
							financial_year: item.financial_year,
							emp_id: item.emp_id
						}).subscribe(res => {
							this.isLoading = false;
							if (res.code == '100') {
								if (res.data.length > 0) {
									res.data.forEach(element => {
										this.total_budget_amount += Number(element.budget_amount);
										this.total_actual_amount += Number(element.actual_amount);
									});
									this.empTDSDetails = res.data;
									this.getCols();
								}
							}
						});
					}
				}
			});
		}
	}

	updateTds(item, tax_type) {
		this.crudServices.getOne<any>(Investment.getAllEmpTDS, {
			financial_year: item.financial_year,
			emp_id: item.emp_id
		}).subscribe(res_tds => {
			if (res_tds.code == '100') {
				if (res_tds.data.length > 0) {
					let annual_tds_old = this.tdsCalculationOld(res_tds.data[0], this.selected_tds_type.id);
					let annual_tds_new = this.tdsCalculationNew(res_tds.data[0], this.selected_tds_type.id);
					let monthly_tds_old = roundAmount(annual_tds_old / 11);
					let monthly_tds_new = roundAmount(annual_tds_new / 11);
					this.crudServices.updateData<any>(Investment.updateEmpMonthlyAnnuallyTDS, {
						annual_tds: (tax_type == "Old") ? annual_tds_old : annual_tds_new,
						monthly_tds: (tax_type == "Old") ? monthly_tds_old : monthly_tds_new,
						financial_year: item.financial_year,
						emp_id: item.emp_id,
						ignore_tds_month: null
					}).subscribe(res_update2 => {
						if (res_update2.code == '100') {
							this.crudServices.getOne<any>(Investment.getEmpTDSDetails, {
								financial_year: item.financial_year,
								emp_id: item.emp_id
							}).subscribe(res => {
								this.isLoading = false;
								if (res.code == '100') {
									if (res.data.length > 0) {
										res.data.forEach(element => {
											this.total_budget_amount += Number(element.budget_amount);
											this.total_actual_amount += Number(element.actual_amount);
										});
										this.empTDSDetails = res.data;
										this.getCols();
									}
								}
							});
						}
					});
				}
			}
		});
	}

	submitChangeTDSDateForm() {
		let data = {
			from_date: moment(this.changeTDSDateForm.value.from_date).format("YYYY-MM-DD"),
			to_date: moment(this.changeTDSDateForm.value.to_date).format("YYYY-MM-DD"),
			percent_value: 0
		};
		let type_id = null;
		if (this.changeTDSDateForm.value.budget_actual_flag == 0) {
			type_id = 13;
		} else if (this.changeTDSDateForm.value.budget_actual_flag == 1) {
			type_id = 14;
		} else {
			type_id = null;
		}
		this.crudServices.updateData<any>(Investment.updateTDSDate, {
			data: data,
			type_id: type_id
		}).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop("success", "Success", this.selected_tds_type.name + " TDS Date Changed Successfully");
				this.changeTDSDateModal.hide();
				this.getCols();
			}
		});
	}

	onChangeTDSType(e) {
		if (e != null && e != undefined) {
			this.selected_tds_type = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		this.cols.forEach(element => {
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

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		this.cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			}
		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.page_title + ' (' + this.selected_financial_year + ')';
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
