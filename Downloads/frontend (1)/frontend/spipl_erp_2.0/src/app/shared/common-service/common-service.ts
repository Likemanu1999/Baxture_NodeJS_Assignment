import * as moment from "moment";

import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";

import { CommonApis } from '../../shared/apis-path/apis-path';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { FormGroup } from '@angular/forms';
import { Injectable } from "@angular/core";
import { ToasterConfig } from "angular2-toaster";
import { environment } from "../../../environments/environment";
import { throwError } from "rxjs";

@Injectable()

export class CommonService {

	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	constructor(private http: HttpClient,
		private crudServices: CrudServices
	) {
		// 
	}

	getFromKey(key: string) {
		return this.http.post<any>(
			environment.serverUrl + 'api/masters/getAllValueStore',
			{
				key: key
			},
		).pipe(catchError(this.handleError), tap(resData => {
		}));
	}

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError('Something bad happened; please try again later.');
	}

	getMoneyIndianFormat(x: string) {
		let lastThree = x.substr(x.length - 3);
		const otherNumbers = x.substring(0, x.length - 3);
		if (otherNumbers !== '') {
			lastThree = ',' + lastThree;
		}
		const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
		return res;
	}

	excelMail(obj) {
		this.crudServices.getOne<any>(CommonApis.sendExcelMail, {
			excel_data: obj.excel_data,
			mail_subject: obj.mail_subject,
			mail_body: obj.mail_body,
			mail_to: [obj.mail_to],
		}).subscribe(res => {
			// 
		});
	};

	salarySlipPasswordGenerate(pan, dob) {
		let pan_new = pan.substring(0, 5); // First 5 Letters of PAN Number
		let dob_new = moment(dob).format('DDMMYY'); // DOB in DDMMYY Format
		return (pan_new + dob_new);
	};

	getPOFinancialYear() {
		let fiscalyear = "";
		let today = new Date();
		if ((today.getMonth() + 1) <= 3) {
			fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear().toString().substring(2, 4)
		} else {
			fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1).toString().substring(2, 4)
		}
		return fiscalyear;
	}

	getCurrentFinancialYear() {
		let fiscalyear = "";
		let today = new Date();
		if ((today.getMonth() + 1) <= 3) {
			fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
		} else {
			fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
		}
		return fiscalyear;
	}

	getFinancialYearDates(value) {
		let financial_year_date = "";
		let date = new Date(value);
		if ((date.getMonth() + 1) <= 3) {
			financial_year_date = (date.getFullYear() - 1) + "-04-01" + "=" + date.getFullYear() + "-03-31";
		} else {
			financial_year_date = date.getFullYear() + "-04-01" + "=" + (date.getFullYear() + 1) + "-03-31";
		}
		return financial_year_date;
	}

	getDateFinancialYear(value) {
		let fiscalyear = "";
		let date = new Date(value);
		if ((date.getMonth() + 1) <= 3) {
			fiscalyear = (date.getFullYear() - 1) + "-" + date.getFullYear()
		} else {
			fiscalyear = date.getFullYear() + "-" + (date.getFullYear() + 1)
		}
		return fiscalyear;
	}

	get_po_financial_year(booking_date) {
		let fiscalyear = "";
		let date = new Date(booking_date);
		if ((date.getMonth() + 1) <= 3) {
			fiscalyear = (date.getFullYear() - 1) + "-" + date.getFullYear().toString().substring(2, 4)
		} else {
			fiscalyear = date.getFullYear() + "-" + (date.getFullYear() + 1).toString().substring(2, 4)
		}
		return fiscalyear;
	}

	tdsCalculationFinal(tdsDetails, type) {
		tdsDetails.other_income = 0;
		tdsDetails.actual_rent_paid = 0;

		if (tdsDetails.regime == "Old") {
			tdsDetails.actual_rent_paid = (type == 0) ? Number(tdsDetails.budget_80gg) : Number(tdsDetails.actual_80gg);
		}

		tdsDetails.total_investment = 0;
		if (tdsDetails.regime == "Old") {
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

		tdsDetails.excess_rent_10 = 0;
		tdsDetails.basic_da_40 = 0;
		tdsDetails.total_hra = 0;
		tdsDetails.allowances_10 = 0;

		if (tdsDetails.regime == "Old") {
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
		}

		tdsDetails.deduction_16 = 0;

		if (tdsDetails.regime == "Old") {
			tdsDetails.deduction_16 = (
				tdsDetails.standard_deduction +
				tdsDetails.other_pt +
				tdsDetails.feb_pt
			);
		} else {
			tdsDetails.deduction_16 = tdsDetails.standard_deduction;
		}

		// tdsDetails.net_salary = (
		// 	tdsDetails.gross_salary - (tdsDetails.allowances_10 + tdsDetails.deduction_16)
		// );

		// tdsDetails.total_gross_income = (tdsDetails.net_salary + tdsDetails.other_income);

		tdsDetails.total_gross_income = (tdsDetails.gross_salary + tdsDetails.other_income);

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

		if (tdsDetails.regime == "Old") {
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
		} else {
			tdsDetails.total_income = tdsDetails.total_gross_income - tdsDetails.deduction_16;
		}

		tdsDetails.tax_on_total_income = 0;
		tdsDetails.annual_tds = 0;

		if (tdsDetails.regime == "Old") {
			let slab_1 = 0;
			let slab_2 = 0;
			let slab_3 = 0;
			let slab_4 = 0;

			if (tdsDetails.total_income <= 250000) {
				slab_1 = 0;
			} else {
				slab_1 = 250000;
			}
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

			let tax_1 = roundAmount(slab_1 * 0);
			let tax_2 = roundAmount(slab_2 * (5 / 100));
			let tax_3 = roundAmount(slab_3 * (20 / 100));
			let tax_4 = roundAmount(slab_4 * (30 / 100));

			tdsDetails.tax_on_total_income = tax_1 + tax_2 + tax_3 + tax_4;
		} else {
			tdsDetails.slab_1 = 0;
			tdsDetails.slab_2 = 0;
			tdsDetails.slab_3 = 0;
			tdsDetails.slab_4 = 0;
			tdsDetails.slab_5 = 0;
			tdsDetails.slab_6 = 0;
			if (tdsDetails.total_income <= 300000) {
				tdsDetails.slab_1 = 0;
			} else if (tdsDetails.total_income > 300000 && tdsDetails.total_income <= 600000) {
				tdsDetails.slab_2 = roundAmount((tdsDetails.total_income - 300000) * (5 / 100));
			} else if (tdsDetails.total_income > 600000 && tdsDetails.total_income < 900000) {
				tdsDetails.slab_3 = 15000 + roundAmount((tdsDetails.total_income - 600000) * (10 / 100));
			} else if (tdsDetails.total_income > 900000 && tdsDetails.total_income <= 1200000) {
				tdsDetails.slab_4 = 45000 + roundAmount((tdsDetails.total_income - 900000) * (15 / 100));
			} else if (tdsDetails.total_income > 1200000 && tdsDetails.total_income <= 1500000) {
				tdsDetails.slab_5 = 90000 + roundAmount((tdsDetails.total_income - 1200000) * (20 / 100));
			} else if (tdsDetails.total_income > 1500000) {
				tdsDetails.slab_6 = 150000 + roundAmount((tdsDetails.total_income - 1500000) * (30 / 100));
			}
			tdsDetails.tax_on_total_income = (
				tdsDetails.slab_1 +
				tdsDetails.slab_2 +
				tdsDetails.slab_3 +
				tdsDetails.slab_4 +
				tdsDetails.slab_5 +
				tdsDetails.slab_6
			);
		}

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
		tdsDetails.monthly_tds = roundAmount(tdsDetails.annual_tds / 11);

		console.log(tdsDetails);

		return tdsDetails;
	}

};

export function ConfirmedValidator(controlName: string, matchingControlName: string) {
	return (formGroup: FormGroup) => {
		const control = formGroup.controls[controlName];
		const matchingControl = formGroup.controls[matchingControlName];
		if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
			return;
		}
		if (control.value !== matchingControl.value) {
			matchingControl.setErrors({ confirmedValidator: true });
		} else {
			matchingControl.setErrors(null);
		}
	}
}

export const searchInArray = (arr, searchItem) => {
	for (var j = 0; j < arr.length; j++) {
		if (arr[j].length > 0) {
			for (var i = 0; i < arr[j].length; i++) {
				var str = arr[j][i]["text"] + "";
				if (str.indexOf(searchItem) !== -1) {
					return j;
				}
			}
		}
	}
};

export const searchInDeepArray = (arr, searchItem) => {
	for (var j = 0; j < arr.length; j++) {
		if (arr[j].length > 0) {
			for (var i = 0; i < arr[j].length; i++) {
				if (Array.isArray(arr[j][i]["text"]) && arr[j][i]["text"].length > 0) {
					for (var k = 0; k < arr[j][i]["text"].length; k++) {
						var str = arr[j][i]["text"][k]["text"] + "";
						if (str.indexOf(searchItem) !== -1) {
							return k;
						}
					}
				}
			}
		}
	}
};

export const insertToArray = (arr, item, index) => {
	arr.splice(index + 1, 0, item);
	return arr;
};

export const toasterConfig = (seconds) => {
	return new ToasterConfig({
		tapToDismiss: false,
		timeout: seconds
	});
};

export const roundQuantity = (value) => {
	let qty = 0;
	if (value != null || value != undefined) {
		qty = Number(value);
	}
	return Number(Number(qty).toFixed(3));
}

export const roundAmount = (value) => {
	// let round_decimal = Number(value.toFixed(1));
	// let split = round_decimal.toString().split('.');
	// let final_value = 0;
	// if (Number(split[1]) < 50) {
	// 	final_value = Math.floor(round_decimal);
	// } else {
	// 	final_value = Math.ceil(round_decimal);
	// }
	let final_value = Math.round(Number(value));
	return Number(final_value);
}

export const staticValues = {
	// for sales pi discussed with manoj 01-07-2023
	gst_no: '27AAFCP3570L1Z2',

	pan_no: 'AAFCP3570L',
	//30866944-22159017 : unable to trakc the amount : 24-07-2023
	// pvc_local_statement_temp_value: 30866944,

	//137136987: FRESH ILC ISSUED : 24-07-2023 : VISHAL SHETE
	pvc_local_statement_temp_value: 0,
	local_statement_set_date_pvc: '2023-05-25',
	local_statement_set_date: '2023-05-25',

	default_button: `<a id="default_button" class="btn btn-outline-dark btn-sm action-btn mb-1 mr-1" 
	data-toggle="tooltip" data-placement="top" title="Default Title" (click)="defaultClick('Default')">
		<i class="fa fa-download"></i>
	</a>`,

	consignment_limit: 3,
	datePickerConfig: {
		dateInputFormat: 'YYYY-MM-DD',
		customTodayClass: 'today',
		containerClass: 'theme-blue'
	},
	datePickerConfigNew: {
		dateInputFormat: 'DD-MMM-YYYY',
		rangeInputFormat: 'DD-MMM-YYYY',
		containerClass: 'theme-blue'
	},
	datePickerConfigProfile: {
		dateInputFormat: 'DD-MMM-YYYY',
		containerClass: 'theme-blue'
	},
	monthPickerConfig: {
		dateInputFormat: 'MMM-YYYY',
		containerClass: 'theme-blue'
	},

	yearPickerConfig: {
		dateInputFormat: 'YYYY',
		startingDay: 1,
		customTodayClass: 'today',
		minMode: 'year',
		containerClass: 'theme-blue'
	},

	dayPickerconfig: {
		dateInputFormat: 'DD',
		startingDay: 1,
		customTodayClass: 'today',
		minMode: 'day',
		containerClass: 'theme-blue'
	},

	monthYearPickerconfig: {
		dateInputFormat: 'YYYY',
		showWeek: false,
		startView: "months",
		minViewMode: "months",
		containerClass: 'theme-blue',
		isAnimated: true
	},

	date_range_arr: [
		{ range: "Current Month", id: 1 },
		{ range: "Last Month", id: 2 },
		{ range: "Last 2 Months", id: 3 },
		{ range: "Last 3 Months", id: 4 },
		{ range: "Last 6 Months", id: 5 },
		{ range: "Last Quarter", id: 6 },
		{ range: "Last FY" + ` ( ${moment().year() - 1} - ${moment().format("YY")} )`, id: 7 },
		{ range: "Last FY Q1" + ` ( ${moment().year() - 1} - ${moment().format("YY")} )`, id: 8 },
		{ range: "Last FY Q2" + ` ( ${moment().year() - 1} - ${moment().format("YY")} )`, id: 9 },
		{ range: "Last FY Q3" + ` ( ${moment().year() - 1} - ${moment().format("YY")} )`, id: 10 },
		{ range: "Last FY Q4" + ` ( ${moment().year() - 1} - ${moment().format("YY")} )`, id: 11 }
	],
	emp_type_list: [
		{
			id: 1,
			name: "Employee"
		},
		{
			id: 2,
			name: "Office Boy"
		},
		{
			id: 3,
			name: "Maid"
		},
		{
			id: 4,
			name: "On Field Employee"
		},
		{
			id: 5,
			name: "Godown Keeper"
		},
		{
			id: 6,
			name: "Management"
		},
		{
			id: 7,
			name: "Sales & Marketing"
		}
	],


	property_status_list: [
		{
			id: 0,
			name: "N/A"
		},
		{
			id: 1,
			name: "Yes"
		},
		{
			id: 2,
			name: "Pending"
		}
	],
	bank_account_types: [
		{
			id: 1,
			name: "Saving Account"
		},
		{
			id: 2,
			name: "Current Account"
		}
	],
	godown_types: [
		{
			id: 1,
			name: "Transporters"
		},
		{
			id: 2,
			name: "Stock Transfer"
		}
	],
	holiday_types: [
		{
			id: 1,
			name: "Full Day"
		},
		{
			id: 2,
			name: "Half Day"
		}
	],
	personal_leave_type: [
		{
			id: 3,
			name: "Half-Day"
		},
		{
			id: 4,
			name: "Leave"
		},
	],
	leave_types: [
		{
			id: 1,
			name: "Late Check-In"
		},
		{
			id: 2,
			name: "Early Check-Out"
		},
		{
			id: 3,
			name: "Half-Day"
		},
		// {
		// 	id: 4,
		// 	name: "Leave"
		// },
		// {
		// 	id: 5,
		// 	name: "Work From Home"
		// },
		{
			id: 6,
			name: "Maternity Leave"
		},
		{
			id: 7,
			name: "Godown Visit"
		},
		{
			id: 8,
			name: "Banking/Taxation/PF"
		},
		{
			id: 9,
			name: "Other - Official Work"
		},
		{
			id: 10,
			name: "Client Visit"
		}
	],
	extensions_types: [
		{
			id: 1,
			name: "Staff"
		},
		{
			id: 2,
			name: "Others"
		}
	],
	currencies: [
		{
			id: 0,
			name: "INR"
		},
		{
			id: 1,
			name: "USD"
		},
		{
			id: 2,
			name: "AED"
		}
	],
	delivery_terms: [
		{
			id: 1,
			name: "Delivered"
		},
		{
			id: 2,
			name: "Ex-Godown"
		}
	],
	delivery_term: [
		{
			id: 1,
			name: "Delivered"
		},
		{
			id: 2,
			name: "Ex-Godown (Self-Delivery)"
		},
		{
			id: 3,
			name: "Ex-Godown (Arranged by SPIPL)"
		}
	],
	chq_status: [
		{
			id: 0,
			name: "Cheque Not Needed"
		},
		{
			id: 1,
			name: "Cheque Needed"
		},
		{
			id: 2,
			name: "Post Dated Cheque (PDC)"
		}
	],
	title: [
		{
			id: 1,
			name: "Mr"
		},
		{
			id: 2,
			name: "Miss"
		},
		{
			id: 3,
			name: "Mrs"
		}
	],
	tax_regime: [
		{
			id: 0,
			name: "Old Regime"
		},
		{
			id: 1,
			name: "New Regime"
		}
	],
	gender: [
		{
			id: 1,
			name: "Male"
		},
		{
			id: 2,
			name: "Female"
		},
		{
			id: 3,
			name: "Other"
		}
	],
	blood_groups: [
		{
			value: 'O+',
			label: 'O+'
		},
		{
			value: 'A+',
			label: 'A+'
		},
		{
			value: 'B+',
			label: 'B+'
		},
		{
			value: 'AB+',
			label: 'AB+'
		},
		{
			value: 'O-',
			label: 'O-'
		},
		{
			value: 'A-',
			label: 'A-'
		},
		{
			value: 'B-',
			label: 'B-'
		},
		{
			value: 'AB-',
			label: 'AB-'
		},
	],
	marital_status: [
		{
			id: 1,
			name: "Single"
		},
		{
			id: 2,
			name: "Married"
		},
		{
			id: 3,
			name: "Widowed"
		},
		{
			id: 4,
			name: "Divorced"
		},
		{
			id: 5,
			name: "Separated"
		}
	],
	active_status: [
		{
			id: 1,
			name: "Active"
		},
		{
			id: 0,
			name: "Inactive"
		},
		{
			id: null,
			name: "All"
		}
	],
	payment_types: [
		{
			id: 1,
			name: "Credit"
		},
		{
			id: 2,
			name: "Advance by RTGS"
		},
		{
			id: 4,
			name: "Advance by LC"
		},
		{
			id: 5,
			name: "LC (Regular)"
		},
		{
			id: 3,
			name: "Partial"
		}
	],

	payment_types_surisha: [
		{
			id: 2,
			name: "RTGS"
		},
		{
			id: 4,
			name: "LC"
		},
		{
			id: 3,
			name: "Partial"
		}
	],

	payment_types_import_sales: [
		{
			id: 2,
			name: "RTGS"
		},
		{
			id: 4,
			name: "LC"
		}
	],

	payment_types_high_seas: [
		{
			id: 1,
			name: "Credit"
		},
		{
			id: 2,
			name: "Advance by RTGS"
		},
		{
			id: 4,
			name: "Advance by LC"
		},
		{
			id: 5,
			name: "LC (Regular)"
		},
		{
			id: 3,
			name: "Partial"
		},
		{
			id: 6,
			name: "TT"
		}
	],
	payment_types_transnational: [

		{
			id: 5,
			name: "LC "
		},
		{
			id: 6,
			name: "TT"
		},

	],
	yes_no_status: [
		{
			id: 0,
			name: "SPIPL"
		},
		{
			id: 1,
			name: "Third Party"
		},
		{
			id: 3,
			name: "All"
		}
	],
	dispatch_new_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 2,
			name: "Confirm"
		},
		{
			id: 4,
			name: "Complete"
		},
		{
			id: 5,
			name: "All"
		}
	],
	sales_deals_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Completed"
		}
	],
	approve_status: [
		{
			id: null,
			name: "All"
		},
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Approved"
		},
		{
			id: 2,
			name: "Rejected"
		}
	],
	tds_type_list: [
		{
			id: 0,
			name: "Budget"
		},
		{
			id: 1,
			name: "Actual"
		}
	],
	prime_non_prime: [
		{
			id: 1,
			name: "Prime"
		},
		{
			id: 2,
			name: "Non-Prime"
		},
		{
			id: 3,
			name: "Utility"
		}
	],
	dispatch_report_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Complete"
		}
	],
	approval_status: [
		{
			id: 1,
			status: "Pending"
		},
		{
			id: 2,
			status: "Approved"
		},
		{
			id: 3,
			status: "Rejected"
		},
		{
			id: 4,
			status: "All"
		}
	],
	payment_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Complete"
		}
	],
	Utr_Payment: [
		{
			id: 0,
			name: "Failed"
		},
		{
			id: 1,
			name: "Completed"
		}
	],
	report_types: [
		{
			id: 1,
			name: "Zone Wise"
		},
		{
			id: 2,
			name: "State Wise"
		},
		{
			id: 3,
			name: "Product Wise"
		}
	],
	consignment_status: [
		{
			id: 3,
			name: "All"
		},
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 2,
			name: "Confirm"
		},
		{
			id: 1,
			name: "Complete"
		},
		{
			id: 4,
			name: "Auto-Cancel"
		},
		{
			id: 5,
			name: "Manual-Cancel"
		}
	],
	loading_crossing: [
		{
			id: 0,
			name: "Self-Loading"
		},
		{
			id: 1,
			name: "Loading"
		},
		{
			id: 2,
			name: "Crossing"
		},
		{
			id: 3,
			name: "Both"
		}
	],
	transition_type: [
		{
			id: 0,
			name: 'Regular',
		},
		{
			id: 1,
			name: 'Bill To - Ship To',
		},
		{
			id: 2,
			name: 'Bill From - Dispatch From',
		},
		{
			id: 3,
			name: 'Both'
		}
	],
	charges_types: [
		{
			id: 1,
			name: "Percent (%)"
		},
		{
			id: 2,
			name: "Amount"
		}
	],
	company_list: [
		{
			id: 0,
			name: "All"
		},
		{
			id: 1,
			name: "PVC"
		},
		{
			id: 2,
			name: "PE & PP"
		},
		{
			id: 3,
			name: "SURISHA"
		},
		{
			id: 4,
			name: "SAR"
		}
	],
	company_list_new: [
		{
			id: null,
			name: "All"
		},
		{
			id: 1,
			name: "PVC"
		},
		{
			id: 2,
			name: "PE & PP"
		},
		{
			id: 3,
			name: "SURISHA"
		}
	],
	companies: [
		{
			id: 1,
			name: "PVC"
		},
		{
			id: 2,
			name: "PE & PP"
		},
		{
			id: 3,
			name: "SURISHA"
		}
	],
	lc_days_list: [
		{
			value: 30,
			label: "30 Days"
		},
		{
			value: 45,
			label: "45 Days"
		},
		{
			value: 60,
			label: "60 Days"
		},
		{
			value: 90,
			label: "90 Days"
		},
		{
			value: 120,
			label: "120 Days"
		},
		{
			value: 180,
			label: "180 Days"
		}
	],
	short_damage_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Completed"
		}
	],
	commission_status_new: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Approved"
		},
		{
			id: 2,
			name: "Completed"
		}
	],
	commission_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 2,
			name: "Approved"
		},
		{
			id: 1,
			name: "Completed"
		}
	],
	billing_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Complete"
		},
		{
			id: 2,
			name: "All"
		},
	],
	sales_orders_status_spipl: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 4,
			name: "Complete"
		},
		{
			id: 5,
			name: "Auto-Cancelled"
		},
		{
			id: 6,
			name: "Manual-Cancel"
		},
		{
			id: 7,
			name: "Renewed"
		},
		{
			id: 8,
			name: "Extended"
		},
		{
			id: 9,
			name: "All"
		}
	],
	sales_orders_status_ssurisha: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Approved"
		},
		{
			id: 4,
			name: "Complete"
		},
		{
			id: 5,
			name: "Auto-Cancelled"
		},
		{
			id: 6,
			name: "Manual-Cancel"
		},
		{
			id: 7,
			name: "Renewed"
		},
		{
			id: 8,
			name: "Extended"
		},
		{
			id: 9,
			name: "All"
		},
	],
	fp_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 4,
			name: "Complete"
		},
		{
			id: 5,
			name: "Cancelled"
		},
		{
			id: 7,
			name: "All"
		},
	],
	finance_p_status: [
		{
			id: 4,
			name: "All"
		},
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Complete"
		},
		{
			id: 2,
			name: "Cancelled"
		},
	],
	org_contact_type: [
		{
			id: 1,
			name: "Email"
		},
		{
			id: 2,
			name: "Mobile"
		}
	],
	sales_purchase_link_status: [
		{
			id: 0,
			name: 'Pending'
		},
		{
			id: 1,
			name: 'Linked'
		}
	],
	finance_status: [
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Approved"
		},
		{
			id: 3,
			name: "Dispatched"
		},
		{
			id: 4,
			name: "Complete"
		},
		{
			id: 5,
			name: "Cancelled"
		},
		{
			id: 6,
			name: "Renewed"
		},
		{
			id: 7,
			name: "All"
		},
	],
	fp_dispatch_status: [
		{
			id: 3,
			name: "All"
		},
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Complete"
		},

		{
			id: 2,
			name: "Cancel"
		}
	],
	dispatch_status: [
		{
			id: 3,
			name: "All"
		},
		{
			id: 0,
			name: "Pending"
		},
		{
			id: 1,
			name: "Complete"
		},
		{
			id: 2,
			name: "Confirmed"
		},
		{
			id: 4,
			name: "To Be Confirmed"
		},
		{
			id: 5,
			name: "Sales Return"
		},
		{
			id: 6,
			name: "Billing Approved"
		},
		{
			id: 7,
			name: "Loading Done"
		}
	],
	state_flag_tds: [
		{
			id: 1,
			name: "State"
		},
		{
			id: 2,
			name: "Company"
		},
		{
			id: 3,
			name: "Indivisual"
		}
	],
	month_year_tds: [
		{
			id: 0,
			name: "Select"
		},
		{
			id: 1,
			name: "Month"
		},
		{
			id: 2,
			name: "Year"
		},
		{
			id: 3,
			name: "Quarter"
		},
		{
			id: 4,
			name: "Half Year"
		}
	],
	actual_budgted: [
		{
			id: 1,
			name: "Budgted"
		},
		{
			id: 2,
			name: "Actual"
		}
	],
	godown_type: [
		{
			id: 1,
			name: "Head Godown"
		},
		{
			id: 2,
			name: "Bond Godown"
		},
		{
			id: 3,
			name: "Local Purchase"
		},
		{
			id: 4,
			name: "CFS Godown"
		},
		{
			id: 5,
			name: "External Godown"
		}
	],
	all_or_allocate: [
		{
			id: 1,
			name: "All Godown"
		},
		{
			id: 0,
			name: "Allocated Godown"
		}
	],
	zone_goodwn: [
		{
			id: 1,
			name: "Godown Person"
		},
		{
			id: 2,
			name: "Marketing Person"
		}
	],
	product_type_list: [
		{
			id: 1,
			name: "PVC"
		},
		{
			id: 2,
			name: "PE & PP"
		},
		{
			id: 3,
			name: "SURISHA"
		},
		{
			id: 4,
			name: "IT_DB_CLEAN"
		}

	],
	increment_type: [
		{
			id: 1,
			name: "%",
			description: "Rate (%)"
		},
		{
			id: 2,
			name: "Rs.",
			description: "Amount (Rs.)"

		},
	],

	month_year_payment: [
		{
			id: 0,
			name: "Select"
		},
		{
			id: 1,
			name: "Monthly"
		},
		{
			id: 2,
			name: "Yearly"
		},
		{
			id: 3,
			name: "Quarterly"
		},
		{
			id: 4,
			name: "Half Year"
		}
	],

	rent_aggrement_purpose: [
		{
			id: 1,
			name: "flat"
		},
		{
			id: 2,
			name: "property"
		},
		{
			id: 3,
			name: "godown"
		},
		{
			id: 4,
			name: "commercial"
		},
		{
			id: 5,
			name: "other"
		},




	],
	time_slab: [
		{
			id: 1,
			name: "Monthly"
		},
		{
			id: 2,
			name: "Quarterly"
		},
		{
			id: 3,
			name: "Yearly"
		}
	],
	sales_average_report_type: [
		{
			id: 1,
			name: "ZONE WISE"
		},
		{
			id: 2,
			name: "STATE WISE"
		},
		{
			id: 3,
			name: "PRODUCT WISE"
		},
	],
	bg_sblc_type: [
		{
			id: 1,
			name: "Bank Guarantee"
		},
		{
			id: 2,
			name: "SBLC"
		}
	],
	price_list_period: [
		{
			id: 1,
			name: "Latest"
		},
		{
			id: 2,
			name: "All"
		}
	],
	payable_req_flag: [
		{
			'LOCAL': 1,
			'LICENSE_DUTY': 2,
			'EXPENSE': 3,
			'ILCPI': 4,
			'STAFF': 5,
			'VENDOR': 6,
			'FD': 7
		}
	],
	other_payment_type: [
		{
			id: 6,
			name: "Vendor"
		},
		{
			id: 8,
			name: "Contra"
		},
		{
			id: 9,
			name: "Mutual Fund"
		},
		{
			id: 10,
			name: "Property"
		},
		{
			id: 11,
			name: "Shares"
		},
		{
			id: 12,
			name: "Other"
		},
		{
			id: 13,
			name: "Donation"
		},
		{
			id: 14,
			name: "Rent"
		}
	],
	import_type: [
		{
			id: 1,
			name: "SELF"
		},
		{
			id: 2,
			name: "HighSeas"
		},
		{
			id: 3,
			name: "Indent"
		},
		{
			id: 4,
			name: "Forward"
		},
		{
			id: 5,
			name: "Transnational"
		}
	],
	attendance_status: [
		{
			value: 0,
			label: "Absent"
		},
		{
			value: 1,
			label: "Present"
		},
		{
			value: 2,
			label: "Late"
		},
		{
			value: 3,
			label: "Early"
		},
		{
			value: 4,
			label: "Half Day 1"
		},
		{
			value: 5,
			label: "Half Day 2"
		},
		{
			value: 6,
			label: "Late/Early"
		}
	],
	attendance_status_new: [
		{
			value: 1,
			label: "Present"
		}
	],
	advance_months: [
		{
			value: 1,
			label: "1"
		},
		{
			value: 2,
			label: "2"
		},
		{
			value: 3,
			label: "3"
		},
		{
			value: 4,
			label: "4"
		},
		{
			value: 5,
			label: "5"
		},
		{
			value: 6,
			label: "6"
		},
		{
			value: 7,
			label: "7"
		},
		{
			value: 8,
			label: "8"
		},
		{
			value: 9,
			label: "9"
		},
		{
			value: 10,
			label: "10"
		},
		{
			value: 11,
			label: "11"
		},
	],

	magangementSSurishaWhatsappNumbersLocal: ['9511913075', '7249393335', '9823222023', '8956139358'],
	zone_type: [
		{
			id: 1,
			name: "East"
		},
		{
			id: 2,
			name: "West"
		},
		{
			id: 3,
			name: "North"
		},
		{
			id: 4,
			name: "South"
		},
		{
			id: 5,
			name: "Demo Zone"
		}

	],

	flag_type: [
		{
			id: 1,
			name: "Import"
		},
		{
			id: 2,
			name: "Local"
		}
	],
	new_grade_flag_type: [
		{
			id: null,
			name: "All"
		},
		{
			id: 1,
			name: "Import"
		},
		{
			id: 2,
			name: "Local"
		}
	],

	job_reference_status: [
		{
			id: 0,
			name: "Pending",
			text_color: "text-warning",
			btn: "btn-warning"
		},
		{
			id: 1,
			name: "Round-1",
			text_color: "text-primary",
			btn: "btn-primary"
		},
		{
			id: 2,
			name: "Round-2",
			text_color: "text-primary",
			btn: "btn-primary"
		},
		{
			id: 3,
			name: "Selected",
			text_color: "text-success",
			btn: "btn-success"
		},
		{
			id: 4,
			name: "Rejected",
			text_color: "text-danger",
			btn: "btn-danger"
		}
	],

	reports_name: [
		{
			id: 1,
			name: "Sales Register Report",
		},
		{
			id: 2,
			name: "Purchase Register Local"
		},
		{
			id: 3,
			name: "Purchase Register Import"
		},
		{
			id: 4,
			name: "Freight Stock Transfer"
		},
		{
			id: 5,
			name: "Freight Inward Register"
		},
		{
			id: 6,
			name: "Freight Outward Register"
		},
		{
			id: 7,
			name: "Local Purchase Short Damage"
		},
		{
			id: 8,
			name: "Sales Short Damage"
		},
		{
			id: 9,
			name: "Sales Discount Report"
		},
		{
			id: 10,
			name: "Import Clearance Report"
		}

	],
	Expences_TYPE: [
		{
			id: 1,
			name: "CHA"
		},
		{
			id: 2,
			name: "FOB"
		},
		{
			id: 3,
			name: "Shipment"
		},
		{
			id: 4,
			name: "Storage"
		},
		{
			id: 5,
			name: "Terminal"
		},
	],


	rentTypeCharge: [
		{
			id: 1,
			name: "TDS"
		},
		{
			id: 2,
			name: "GST"
		},
		{
			id: 3,
			name: "No Charge"
		},
		// {
		// 	id:3,
		// 	name:"TDS + GST"
		// },
	],
	freight_Rate_condition: [
		{
			id: 0,
			name: "All"
		},
		{
			id: 1,
			name: "Equal To"
		},
		{
			id: 2,
			name: "Dispatch > Sales"
		},
		{
			id: 3,
			name: "Dispatch < Sales"
		}
	],
	buying_trends_options: [
		{
			id: 0,
			name: "Grade Wise"
		},
		{
			id: 1,
			name: "Zone Wise"
		},
		{
			id: 2,
			name: "State Wise"
		}
	],

	magangementSPIPLWhatsappNumbersLocal: ['8956139358', '8956139358', '9372723935', '9372303009', '9637996527', '9960999187'],
	magangementSSurishaWhatsappNumbersSales: ['9511913075', '7249393335', '9823222023'],
	magangementSPIPLWhatsappNumbersSales: ['9372723935', '8806038486', '9823532231', '9637996527', '8600009342', '8530276336', '8956139358', '8956139358'],

	magangementSurishaWhatsappNumbersSales_Company_ID_3: ['9822500076'], // company id 3
	magangementSurishaEmailSales_Company_ID_3: ['JOVITO@PARMARGLOBAL.COM'], // company id 3
	marketing_role_ids: [5, 33, 34, 46]

};

export const INVENTORY_TYPE = [
	{
		id: 1,
		name: "Container"
	},
	{
		id: 2,
		name: "Ex-Bond"
	},
	{
		id: 3,
		name: "Local Purchase Lifting"
	},
	{
		id: 4,
		name: "Stock Transfer"
	},
	{
		id: 5,
		name: "Sales Return"
	},
	{
		id: 6,
		name: "Sales Consignment"
	},
	{
		id: 7,
		name: "Sales Dispatch"
	},
	{
		id: 8,
		name: "Short (Lifting)"
	},
	{
		id: 9,
		name: "Damage (Lifting)"
	},
	{
		id: 10,
		name: "Short (Container)"
	},
	{
		id: 11,
		name: "Damage (Container)"
	},
	{
		id: 12,
		name: "Short (Stock Transfer)"
	},
	{
		id: 13,
		name: "Damage (Stock Transfer)"
	},
	{
		id: 14,
		name: "Short (Ex Bond)"
	},
	{
		id: 15,
		name: "Damage (Ex Bond)"
	}
];



export const ATTENDANCE_COLORS = {
	present: {
		primary: '#28a745',
		secondary: '#28a745',
	},
	absent: {
		primary: '#FFFFFF',
		secondary: '#FFFFFF',
	},
	leave: {
		primary: '#dc3545',
		secondary: '#dc3545',
	},
	late: {
		primary: '#ffc107',
		secondary: '#ffc107',
	},
	early: {
		primary: '#17a2b8',
		secondary: '#17a2b8',
	},
	half_day: {
		primary: '#343a40',
		secondary: '#343a40',
	},
	time_in_out: {
		primary: '#1266F1',
		secondary: '#1266F1',
	},
	holiday: {
		primary: '#F93154',
		secondary: '#F93154',
	},
	sunday: {
		primary: '#FFFFFF',
		secondary: '#FFFFFF',
	},
	saturday: {
		primary: '#20C997',
		secondary: '#20C997',
	}
};