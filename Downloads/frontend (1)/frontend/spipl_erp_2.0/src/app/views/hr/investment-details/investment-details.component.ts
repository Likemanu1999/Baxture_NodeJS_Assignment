import { JsonPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { environment } from '../../../../environments/environment';
import { HrServices } from '../hr-services';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { actualBudgtedTDS, FileUpload } from '../../../shared/apis-path/apis-path';
import { exit } from 'process';


@Component({
	selector: 'app-investment-details',
	templateUrl: './investment-details.component.html',
	styleUrls: ['./investment-details.component.css'],
	providers: [HrServices, ToasterService, CrudServices]
})

/**
* This Component takes inputs employee id, salary details & form approval access from parent component.
*/
export class InvestmentDetailsComponent implements OnInit {
	@Input() emp_id: number;
	@Input() salaryDetailsData: any;
	@Input() investmentStatusApproval: any;
	investmentForm: FormGroup;
	activeObject: any;
	budgetedDetails: any;
	actualDetails: any;
	public filterQuery = '';
	filterArray = [];
	selected: number;
	currentIndex: number;
	/**
	* This flag we are using for enabling & disabling inputs.
	Budgted=1 , actual=2,,both=3third flag
	*/
	//formOpenFlag: number = 1; // flag for  budgted=1 , actual=2,,both=3third flag
	formOpenFlag: number; // flag for  budgted=1 , actual=2,,both=3third flag
	/**
	* This flag we are using for enabling & disabling input of Budget Amount coloumn.
	*/
	isBudgetedDisabled: boolean = false;
	/**
	* This flag we are using for enabling & disabling input of Actual Amount coloumn.
	*/
	isActualDisabled: boolean = false;

	lic_file: Array<File> = [];
	ppf_file: Array<File> = [];
	nsc_file: Array<File> = [];
	pension_file: Array<File> = [];
	tax_saving_mutual_fund_file: Array<File> = [];
	edu_expense_first_child_file: Array<File> = [];
	edu_expense_secnd_child_file: Array<File> = [];
	fixed_deposite_file: Array<File> = [];
	sukanya_schme_file: Array<File> = [];
	housing_loan_principle_file: Array<File> = [];
	housing_loan_interest_file: Array<File> = [];
	medical_insurance_self_file: Array<File> = [];
	medical_insurance_parent_file: Array<File> = [];
	self_child_edu_loan_interest_file: Array<File> = [];
	hra_deduction_file: Array<File> = [];
	medical_expenditure_file: Array<File> = [];
	other_file: Array<File> = [];
	other_payment_v1_a_file: Array<File> = [];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			positionClass: 'toast-bottom-right',
			tapToDismiss: true,
			timeout: 5000
		});
	serverUrl: any;
	/**
	* This flag we are using for show / hide file inputs.
	*/
	mode: boolean = true; // true-> View Mode , false-> Edit Mode
	currentMode = 'View File';
	constructor(private hrServices: HrServices, private toasterService: ToasterService, private CrudServices: CrudServices) {
		this.serverUrl = environment.serverUrl;
		this.mode = false;
	}
	/**
	* This function checks formOpenFlag and depend on it enable & disable inputs.
	Creating forms for actual & budgeted fields.
	*/
	createForm() {

		this.investmentForm = new FormGroup({
			'b_lic_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_lic_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_lic_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_lic_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_ppf_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_ppf_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_ppf_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_ppf_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),


			'b_nsc_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_nsc_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_nsc_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_nsc_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_pension_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_pension_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_pension_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_pension_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_tax_saving_mutual_fund_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_tax_saving_mutual_fund_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_tax_saving_mutual_fund_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_tax_saving_mutual_fund_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_edu_expense_first_child_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_edu_expense_first_child_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_edu_expense_first_child_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_edu_expense_first_child_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_edu_expense_secnd_child_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_edu_expense_secnd_child_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_edu_expense_secnd_child_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_edu_expense_secnd_child_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_fixed_deposite_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_fixed_deposite_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_fixed_deposite_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_fixed_deposite_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_sukanya_schme_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_sukanya_schme_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_sukanya_schme_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_sukanya_schme_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_housing_loan_principle_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_housing_loan_principle_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_housing_loan_principle_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_housing_loan_principle_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_housing_loan_interest_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_housing_loan_interest_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_housing_loan_interest_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_housing_loan_interest_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_medical_insurance_self_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_medical_insurance_self_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_medical_insurance_self_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_medical_insurance_self_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_medical_insurance_parent_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_medical_insurance_parent_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_medical_insurance_parent_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_medical_insurance_parent_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_self_child_edu_loan_interest_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_self_child_edu_loan_interest_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_self_child_edu_loan_interest_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_self_child_edu_loan_interest_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_hra_deduction_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_hra_deduction_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_hra_deduction_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_hra_deduction_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_medical_expenditure_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_medical_expenditure_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_medical_expenditure_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_medical_expenditure_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_other_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_other_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_other_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_other_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),

			'b_other_payment_v1_a_amt': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'b_other_payment_v1_a_file': new FormControl({ value: '0', disabled: this.isBudgetedDisabled }),
			'a_other_payment_v1_a_amt': new FormControl({ value: '0', disabled: this.isActualDisabled }),
			'a_other_payment_v1_a_file': new FormControl({ value: '0', disabled: this.isActualDisabled }),
		});

	}
	ngOnInit() {
		this.createForm();
	}
	/**
	* Setting pre filled values from salary details data.
	*/
	getDetails(id: number, index: number) {

		this.selected = id;
		this.currentIndex = index;
		this.activeObject = this.salaryDetailsData[this.currentIndex];
		this.formOpenFlag = this.activeObject.tds_form_fill_flag;

		if (this.formOpenFlag == 1) {
			this.isActualDisabled = true;
			this.isBudgetedDisabled = false;
		} else if (this.formOpenFlag == 2) {
			this.isBudgetedDisabled = true;
			this.isActualDisabled = false;
		} else if (this.formOpenFlag == 3) {
			this.isBudgetedDisabled = true;
			this.isActualDisabled = true;
		} else {
			this.isBudgetedDisabled = false;
			this.isActualDisabled = false;
		}
		this.investmentForm.reset();

		this.mode = true;
		this.currentMode = this.mode ? 'Update Files' : 'View Files';
		let bb_lic_amt = 0;
		let bb_ppf_amt = 0;
		let bb_nsc_amt = 0;
		let bb_pension_amt = 0;
		let bb_tax_saving_mutual_fund_amt = 0;
		let aa_lic_amt = 0;
		let aa_ppf_amt = 0;
		let aa_nsc_amt = 0;
		let aa_pension_amt = 0;
		let aa_tax_saving_mutual_fund_amt = 0;

		let bb_edu_expense_first_child_amt = 0;
		let aa_edu_expense_first_child_amt = 0;
		let bb_edu_expense_secnd_child_amt = 0;
		let aa_edu_expense_secnd_child_amt = 0;
		let bb_fixed_deposite_amt = 0;
		let aa_fixed_deposite_amt = 0;
		let bb_sukanya_schme_amt = 0;
		let aa_sukanya_schme_amt = 0;
		let bb_housing_loan_principle_amt = 0;
		let aa_housing_loan_principle_amt = 0;
		let bb_housing_loan_interest_amt = 0;
		let aa_housing_loan_interest_amt = 0;
		let bb_medical_insurance_self_amt = 0;
		let aa_medical_insurance_self_amt = 0;
		let bb_medical_insurance_parent_amt = 0;
		let aa_medical_insurance_parent_amt = 0;
		let bb_self_child_edu_loan_interest_amt = 0;
		let aa_self_child_edu_loan_interest_amt = 0;
		let bb_hra_deduction_amt = 0;
		let aa_hra_deduction_amt = 0;
		let bb_medical_expenditure_amt = 0;
		let aa_medical_expenditure_amt = 0;
		let bb_other_amt = 0;
		let aa_other_amt = 0;
		let bb_other_payment_v1_a_amt = 0;
		let aa_other_payment_v1_a_amt = 0;
		this.budgetedDetails = null;
		this.actualDetails = null;

		if (this.activeObject.budgeted_details !== '' || this.activeObject.budgeted_details !== null) {
			//this.budgetedDetails = JSON.parse(this.activeObject.budgeted_details);
			this.budgetedDetails = this.activeObject.budgeted_details;
			bb_lic_amt = this.budgetedDetails ? this.budgetedDetails.lic_amt : 0;
			bb_ppf_amt = this.budgetedDetails ? this.budgetedDetails.ppf_amt : 0;
			bb_nsc_amt = this.budgetedDetails ? this.budgetedDetails.nsc_amt : 0;
			bb_pension_amt = this.budgetedDetails ? this.budgetedDetails.pension_amt : 0;
			bb_tax_saving_mutual_fund_amt = this.budgetedDetails ? this.budgetedDetails.tax_saving_mutual_fund_amt : 0;
			bb_edu_expense_first_child_amt = this.budgetedDetails ? this.budgetedDetails.edu_expense_first_child_amt : 0;
			bb_edu_expense_secnd_child_amt = this.budgetedDetails ? this.budgetedDetails.edu_expense_secnd_child_amt : 0;
			bb_fixed_deposite_amt = this.budgetedDetails ? this.budgetedDetails.fixed_deposite_amt : 0;
			bb_sukanya_schme_amt = this.budgetedDetails ? this.budgetedDetails.sukanya_schme_amt : 0;
			bb_housing_loan_principle_amt = this.budgetedDetails ? this.budgetedDetails.housing_loan_principle_amt : 0;
			bb_housing_loan_interest_amt = this.budgetedDetails ? this.budgetedDetails.housing_loan_interest_amt : 0;
			bb_medical_insurance_self_amt = this.budgetedDetails ? this.budgetedDetails.medical_insurance_self_amt : 0;
			bb_medical_insurance_parent_amt = this.budgetedDetails ? this.budgetedDetails.medical_insurance_parent_amt : 0;
			bb_self_child_edu_loan_interest_amt = this.budgetedDetails ? this.budgetedDetails.self_child_edu_loan_interest_amt : 0;
			bb_hra_deduction_amt = this.budgetedDetails ? this.budgetedDetails.hra_deduction_amt : 0;
			bb_medical_expenditure_amt = this.budgetedDetails ? this.budgetedDetails.medical_expenditure_amt : 0;
			bb_other_amt = this.budgetedDetails ? this.budgetedDetails.other_amt : 0;
			bb_other_payment_v1_a_amt = this.budgetedDetails ? this.budgetedDetails.other_payment_v1_a_amt : 0;
		}
		if (this.activeObject.actual_details !== '' || this.activeObject.actual_details !== null) {
			//this.actualDetails = JSON.parse(this.activeObject.actual_details);
			this.actualDetails = this.activeObject.actual_details;
			aa_lic_amt = this.actualDetails ? this.actualDetails.lic_amt : 0;
			aa_ppf_amt = this.actualDetails ? this.actualDetails.ppf_amt : 0;
			aa_nsc_amt = this.actualDetails ? this.actualDetails.nsc_amt : 0;
			aa_pension_amt = this.actualDetails ? this.actualDetails.pension_amt : 0;
			aa_tax_saving_mutual_fund_amt = this.actualDetails ? this.actualDetails.tax_saving_mutual_fund_amt : 0;
			aa_edu_expense_first_child_amt = this.actualDetails ? this.actualDetails.edu_expense_first_child_amt : 0;
			aa_edu_expense_secnd_child_amt = this.actualDetails ? this.actualDetails.edu_expense_secnd_child_amt : 0;
			aa_fixed_deposite_amt = this.actualDetails ? this.actualDetails.fixed_deposite_amt : 0;
			aa_sukanya_schme_amt = this.actualDetails ? this.actualDetails.sukanya_schme_amt : 0;
			aa_housing_loan_principle_amt = this.actualDetails ? this.actualDetails.housing_loan_principle_amt : 0;
			aa_housing_loan_interest_amt = this.actualDetails ? this.actualDetails.housing_loan_interest_amt : 0;
			aa_medical_insurance_self_amt = this.actualDetails ? this.actualDetails.medical_insurance_self_amt : 0;
			aa_medical_insurance_parent_amt = this.actualDetails ? this.actualDetails.medical_insurance_parent_amt : 0;
			aa_self_child_edu_loan_interest_amt = this.actualDetails ? this.actualDetails.self_child_edu_loan_interest_amt : 0;
			aa_hra_deduction_amt = this.actualDetails ? this.actualDetails.hra_deduction_amt : 0;
			aa_medical_expenditure_amt = this.actualDetails ? this.actualDetails.medical_expenditure_amt : 0;
			aa_other_amt = this.actualDetails ? this.actualDetails.other_amt : 0;
			aa_other_payment_v1_a_amt = this.actualDetails ? this.actualDetails.other_payment_v1_a_amt : 0;
		}
		this.investmentForm.patchValue({
			b_lic_amt: bb_lic_amt,
			a_lic_amt: aa_lic_amt,
			b_ppf_amt: bb_ppf_amt,
			a_ppf_amt: aa_ppf_amt,
			a_nsc_amt: aa_nsc_amt,
			b_nsc_amt: bb_nsc_amt,
			b_pension_amt: bb_pension_amt,
			a_pension_amt: aa_pension_amt,
			b_tax_saving_mutual_fund_amt: bb_tax_saving_mutual_fund_amt,
			a_tax_saving_mutual_fund_amt: aa_tax_saving_mutual_fund_amt,
			b_edu_expense_first_child_amt: bb_edu_expense_first_child_amt,
			b_edu_expense_secnd_child_amt: bb_edu_expense_secnd_child_amt,
			a_edu_expense_first_child_amt: aa_edu_expense_first_child_amt,
			a_edu_expense_secnd_child_amt: aa_edu_expense_secnd_child_amt,
			b_fixed_deposite_amt: bb_fixed_deposite_amt,
			a_fixed_deposite_amt: aa_fixed_deposite_amt,
			b_sukanya_schme_amt: bb_sukanya_schme_amt,
			a_sukanya_schme_amt: aa_sukanya_schme_amt,
			b_housing_loan_principle_amt: bb_housing_loan_principle_amt,
			a_housing_loan_principle_amt: aa_housing_loan_principle_amt,
			b_housing_loan_interest_amt: bb_housing_loan_interest_amt,
			a_housing_loan_interest_amt: aa_housing_loan_interest_amt,
			b_medical_insurance_self_amt: bb_medical_insurance_self_amt,
			a_medical_insurance_self_amt: aa_medical_insurance_self_amt,
			b_medical_insurance_parent_amt: bb_medical_insurance_parent_amt,
			a_medical_insurance_parent_amt: aa_medical_insurance_parent_amt,
			b_self_child_edu_loan_interest_amt: bb_self_child_edu_loan_interest_amt,
			a_self_child_edu_loan_interest_amt: aa_self_child_edu_loan_interest_amt,
			b_hra_deduction_amt: bb_hra_deduction_amt,
			a_hra_deduction_amt: aa_hra_deduction_amt,
			b_medical_expenditure_amt: bb_medical_expenditure_amt,
			a_medical_expenditure_amt: aa_medical_expenditure_amt,
			b_other_amt: bb_other_amt,
			a_other_amt: aa_other_amt,
			b_other_payment_v1_a_amt: bb_other_payment_v1_a_amt,
			a_other_payment_v1_a_amt: aa_other_payment_v1_a_amt,
		});


		/*  if (this.activeObject.budgeted_details === '' && this.activeObject.actual_details === '') {
		   this.investmentForm.reset();
		 } */


	}
	/**
	*To check which list item is active we are passing id and checking with selected item.
	*/
	isActive(id) {
		return this.selected === id;
	}
	/**
	* To check form status by passing json object and return html.
	*/
	getStatus(item) {
		let status = '<span class="badge badge-primary">Not Filled</span>';
		if (item !== null) {
			const obj = item;
			if (obj.status === 'Pending') {
				status = '<span class="badge badge-warning">Pending</span>';
			} else if (obj.status === 'Rejected') {
				status = '<span class="badge badge-danger">Rejected</span>';
			} else if (obj.status === 'Verified') {
				status = '<span class="badge badge-success">Verified</span>';
			}
		}
		return status;
	}
	/**
	* To store selected files to the variables, we passing file and varibale name in which we are storing file.
	*/
	fileChangeEvent(fileInput: any, controlname: string) {
		this[controlname] = <Array<File>>fileInput.target.files;
	}
	/**
	* Before subission of form we are checking form is verified or not
	if verified showing message user can not change the form,
	else we are creating form data with values and files and post to backend.
	*/
	onSubmit() {
		if (this.investmentForm.dirty) {
			if (this.budgetedDetails !== null && this.budgetedDetails !== '') {
				if (this.formOpenFlag === 1 && this.budgetedDetails.status === 'Verified') {
					this.toasterService.pop('info', 'Info', 'You can not make changes to verified forms.');
					return false;
				}
			}
			if (this.actualDetails !== null && this.actualDetails !== '') {
				if (this.formOpenFlag === 2 && this.actualDetails.status === 'Verified') {
					this.toasterService.pop('info', 'Info', 'You can not make changes to verified forms.');
					return false;
				}
			}

			var formData = {
				//flag: this.formOpenFlag,
				year_ctc_id: this.selected,
				lic_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_lic_amt : this.investmentForm.value.a_lic_amt),
				ppf_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_ppf_amt : this.investmentForm.value.a_ppf_amt),
				nsc_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_nsc_amt : this.investmentForm.value.a_nsc_amt),
				pension_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_pension_amt : this.investmentForm.value.a_pension_amt),
				tax_saving_mutual_fund_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_tax_saving_mutual_fund_amt : this.investmentForm.value.a_tax_saving_mutual_fund_amt),
				edu_expense_first_child_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_edu_expense_first_child_amt : this.investmentForm.value.a_edu_expense_first_child_amt),
				edu_expense_secnd_child_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_edu_expense_secnd_child_amt : this.investmentForm.value.a_edu_expense_secnd_child_amt),
				fixed_deposite_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_fixed_deposite_amt : this.investmentForm.value.a_fixed_deposite_amt),
				sukanya_schme_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_sukanya_schme_amt : this.investmentForm.value.a_sukanya_schme_amt),
				housing_loan_principle_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_housing_loan_principle_amt : this.investmentForm.value.a_housing_loan_principle_amt),
				housing_loan_interest_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_housing_loan_interest_amt : this.investmentForm.value.a_housing_loan_interest_amt),
				medical_insurance_self_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_medical_insurance_self_amt : this.investmentForm.value.a_medical_insurance_self_amt),
				medical_insurance_parent_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_medical_insurance_parent_amt : this.investmentForm.value.a_medical_insurance_parent_amt),
				self_child_edu_loan_interest_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_self_child_edu_loan_interest_amt : this.investmentForm.value.a_self_child_edu_loan_interest_amt),
				hra_deduction_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_hra_deduction_amt : this.investmentForm.value.a_hra_deduction_amt),
				medical_expenditure_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_medical_expenditure_amt : this.investmentForm.value.a_medical_expenditure_amt),
				other_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_other_amt : this.investmentForm.value.a_other_amt),
				other_payment_v1_a_amt: ((this.formOpenFlag === 1) ? this.investmentForm.value.b_other_payment_v1_a_amt : this.investmentForm.value.a_other_payment_v1_a_amt)
			}

			// check form is edited or not.
			const fileData: any = new FormData();

			if (this.lic_file.length > 0) {
				for (let i = 0; i < this.lic_file.length; i++) {
					fileData.append('lifeInsurance', this.lic_file[i], this.lic_file[i]['name']);
				}
			}

			if (this.ppf_file.length > 0) {
				for (let i = 0; i < this.ppf_file.length; i++) {
					fileData.append('ppf_file', this.ppf_file[i], this.ppf_file[i]['name']);
				}
			}

			if (this.nsc_file.length > 0) {
				for (let i = 0; i < this.nsc_file.length; i++) {
					fileData.append('nsc_file', this.nsc_file[i], this.nsc_file[i]['name']);
				}
			}

			if (this.pension_file.length > 0) {
				for (let i = 0; i < this.pension_file.length; i++) {
					fileData.append('pension_file', this.pension_file[i], this.pension_file[i]['name']);
				}
			}

			if (this.tax_saving_mutual_fund_file.length > 0) {
				for (let i = 0; i < this.tax_saving_mutual_fund_file.length; i++) {
					fileData.append('tax_saving_mutual_fund_file', this.tax_saving_mutual_fund_file[i], this.tax_saving_mutual_fund_file[i]['name']);
				}
			}
			if (this.edu_expense_first_child_file.length > 0) {
				for (let i = 0; i < this.edu_expense_first_child_file.length; i++) {
					fileData.append('edu_expense_first_child_file', this.edu_expense_first_child_file[i], this.edu_expense_first_child_file[i]['name']);
				}
			}

			if (this.edu_expense_secnd_child_file.length > 0) {
				for (let i = 0; i < this.edu_expense_secnd_child_file.length; i++) {
					fileData.append('edu_expense_secnd_child_file', this.edu_expense_secnd_child_file[i], this.edu_expense_secnd_child_file[i]['name']);
				}
			}

			if (this.fixed_deposite_file.length > 0) {
				for (let i = 0; i < this.fixed_deposite_file.length; i++) {
					fileData.append('fixed_deposite_file', this.fixed_deposite_file[i], this.fixed_deposite_file[i]['name']);
				}
			}

			if (this.sukanya_schme_file.length > 0) {
				for (let i = 0; i < this.sukanya_schme_file.length; i++) {
					fileData.append('sukanya_schme_file', this.sukanya_schme_file[i], this.sukanya_schme_file[i]['name']);
				}
			}

			if (this.housing_loan_principle_file.length > 0) {
				for (let i = 0; i < this.housing_loan_principle_file.length; i++) {
					fileData.append('housing_loan_principle_file', this.housing_loan_principle_file[i], this.housing_loan_principle_file[i]['name']);
				}
			}


			if (this.housing_loan_interest_file.length > 0) {
				for (let i = 0; i < this.housing_loan_interest_file.length; i++) {
					fileData.append('housing_loan_interest_file', this.housing_loan_interest_file[i], this.housing_loan_interest_file[i]['name']);
				}
			}

			if (this.medical_insurance_self_file.length > 0) {
				for (let i = 0; i < this.medical_insurance_self_file.length; i++) {
					fileData.append('medical_insurance_self_file', this.medical_insurance_self_file[i], this.medical_insurance_self_file[i]['name']);
				}
			}

			if (this.medical_insurance_parent_file.length > 0) {
				for (let i = 0; i < this.medical_insurance_parent_file.length; i++) {
					fileData.append('medical_insurance_parent_file', this.medical_insurance_parent_file[i], this.medical_insurance_parent_file[i]['name']);
				}
			}

			if (this.self_child_edu_loan_interest_file.length > 0) {
				for (let i = 0; i < this.self_child_edu_loan_interest_file.length; i++) {
					fileData.append('self_child_edu_loan_interest_file', this.self_child_edu_loan_interest_file[i], this.self_child_edu_loan_interest_file[i]['name']);
				}
			}

			if (this.hra_deduction_file.length > 0) {
				for (let i = 0; i < this.hra_deduction_file.length; i++) {
					fileData.append('hra_deduction_file', this.hra_deduction_file[i], this.hra_deduction_file[i]['name']);
				}
			}

			if (this.medical_expenditure_file.length > 0) {
				for (let i = 0; i < this.medical_expenditure_file.length; i++) {
					fileData.append('medical_expenditure_file', this.medical_expenditure_file[i], this.medical_expenditure_file[i]['name']);
				}
			}

			if (this.other_file.length > 0) {
				for (let i = 0; i < this.other_file.length; i++) {
					fileData.append('other_file', this.other_file[i], this.other_file[i]['name']);
				}
			}

			if (this.other_payment_v1_a_file.length > 0) {
				for (let i = 0; i < this.other_payment_v1_a_file.length; i++) {
					fileData.append('other_payment_v1_a_file', this.other_payment_v1_a_file[i], this.other_payment_v1_a_file[i]['name']);
				}
			}



			if (fileData.get("lifeInsurance") != null ||
				fileData.get("ppf_file") != null ||
				fileData.get("nsc_file") != null ||
				fileData.get("pension_file") != null ||
				fileData.get("tax_saving_mutual_fund_file") != null ||
				fileData.get("edu_expense_first_child_file") != null ||
				fileData.get("edu_expense_secnd_child_file") != null ||
				fileData.get("fixed_deposite_file") != null ||
				fileData.get("sukanya_schme_file") != null ||
				fileData.get("housing_loan_principle_file") != null ||
				fileData.get("housing_loan_interest_file") != null ||
				fileData.get("medical_insurance_self_file") != null ||
				fileData.get("medical_insurance_parent_file") != null ||
				fileData.get("self_child_edu_loan_interest_file") != null ||
				fileData.get("hra_deduction_file") != null ||
				fileData.get("medical_expenditure_file") != null ||
				fileData.get("other_file") != null ||
				fileData.get("other_payment_v1_a_file") != null) {

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let licFiles = [];
					let licFilesList = res.uploads.lifeInsurance;
					if (licFilesList != null) {
						if (licFilesList.length > 0) {
							for (let i = 0; i < licFilesList.length; i++) {
								licFiles.push(licFilesList[i].location);
							}
							formData['lic_file'] = JSON.stringify(licFiles);
						}
					}

					let ppfFiles = [];
					let ppfFilesList = res.uploads.ppf_file;
					if (ppfFilesList != null) {
						if (ppfFilesList.length > 0) {
							for (let i = 0; i < ppfFilesList.length; i++) {
								ppfFiles.push(ppfFilesList[i].location);
							}
							formData['ppf_file'] = JSON.stringify(ppfFiles);

						}
					}


					let nscFiles = [];
					let nscFilesList = res.uploads.nsc_file;
					if (nscFilesList != null) {
						if (nscFilesList.length > 0) {
							for (let i = 0; i < nscFilesList.length; i++) {
								nscFiles.push(nscFilesList[i].location);
							}
							formData['nsc_file'] = JSON.stringify(nscFiles);

						}
					}

					let pensionFiles = [];
					let pensionFilesList = res.uploads.pension_file;
					if (pensionFilesList != null) {
						if (pensionFilesList.length > 0) {
							for (let i = 0; i < pensionFilesList.length; i++) {
								pensionFiles.push(pensionFilesList[i].location);
							}
							formData['pension_file'] = JSON.stringify(pensionFiles);
						}
					}

					let tax_saving_mutual_fundFiles = [];
					let tax_saving_mutual_fundFilesList = res.uploads.tax_saving_mutual_fund_file;
					if (tax_saving_mutual_fundFilesList != null) {
						if (tax_saving_mutual_fundFilesList.length > 0) {
							for (let i = 0; i < tax_saving_mutual_fundFilesList.length; i++) {
								tax_saving_mutual_fundFiles.push(tax_saving_mutual_fundFilesList[i].location);
							}
							formData['tax_saving_mutual_fund_file'] = JSON.stringify(tax_saving_mutual_fundFiles);
						}
					}

					let edu_expense_first_childFiles = [];
					let edu_expense_first_childFilesList = res.uploads.edu_expense_first_child_file;
					if (edu_expense_first_childFilesList != null) {
						if (edu_expense_first_childFilesList.length > 0) {
							for (let i = 0; i < edu_expense_first_childFilesList.length; i++) {
								edu_expense_first_childFiles.push(edu_expense_first_childFilesList[i].location);
							}
							formData['edu_expense_first_child_file'] = JSON.stringify(edu_expense_first_childFiles);
						}
					}



					let edu_expense_secnd_childFiles = [];
					let edu_expense_secnd_childFilesList = res.uploads.edu_expense_secnd_child_file;
					if (edu_expense_secnd_childFilesList != null) {
						if (edu_expense_secnd_childFilesList.length > 0) {
							for (let i = 0; i < edu_expense_secnd_childFilesList.length; i++) {
								edu_expense_secnd_childFiles.push(edu_expense_secnd_childFilesList[i].location);
							}
							formData['edu_expense_secnd_child_file'] = JSON.stringify(edu_expense_secnd_childFiles);
						}
					}


					let fixed_depositeFiles = [];
					let fixed_depositeFilesList = res.uploads.fixed_deposite_file;
					if (fixed_depositeFilesList != null) {
						if (fixed_depositeFilesList.length > 0) {
							for (let i = 0; i < fixed_depositeFilesList.length; i++) {
								fixed_depositeFiles.push(fixed_depositeFilesList[i].location);
							}
							formData['fixed_deposite_file'] = JSON.stringify(fixed_depositeFiles);
						}
					}



					let sukanya_schmeFiles = [];
					let sukanya_schmeFilesList = res.uploads.sukanya_schme_file;
					if (sukanya_schmeFilesList != null) {
						if (sukanya_schmeFilesList.length > 0) {
							for (let i = 0; i < sukanya_schmeFilesList.length; i++) {
								sukanya_schmeFiles.push(sukanya_schmeFilesList[i].location);
							}
							formData['sukanya_schme_file'] = JSON.stringify(sukanya_schmeFiles);
						}
					}


					let housing_loan_principleFiles = [];
					let housing_loan_principleFilesList = res.uploads.housing_loan_principle_file;
					if (housing_loan_principleFilesList != null) {
						if (housing_loan_principleFilesList.length > 0) {
							for (let i = 0; i < housing_loan_principleFilesList.length; i++) {
								housing_loan_principleFiles.push(housing_loan_principleFilesList[i].location);
							}
							formData['housing_loan_principle_file'] = JSON.stringify(housing_loan_principleFiles);
						}
					}



					let housing_loan_interestFiles = [];
					let housing_loan_interestFilesList = res.uploads.housing_loan_interest_file;
					if (housing_loan_interestFilesList != null) {
						if (housing_loan_interestFilesList.length > 0) {
							for (let i = 0; i < housing_loan_interestFilesList.length; i++) {
								housing_loan_interestFiles.push(housing_loan_interestFilesList[i].location);
							}
							formData['housing_loan_interest_file'] = JSON.stringify(housing_loan_interestFiles);
						}
					}

					let medical_insurance_selfFiles = [];
					let medical_insurance_selfFilesList = res.uploads.medical_insurance_self_file;
					if (medical_insurance_selfFilesList != null) {
						if (medical_insurance_selfFilesList.length > 0) {
							for (let i = 0; i < medical_insurance_selfFilesList.length; i++) {
								medical_insurance_selfFiles.push(medical_insurance_selfFilesList[i].location);
							}
							formData['medical_insurance_self_file'] = JSON.stringify(medical_insurance_selfFiles);
						}
					}

					let medical_insurance_parentFiles = [];
					let medical_insurance_parentFilesList = res.uploads.medical_insurance_parent_file;
					if (medical_insurance_parentFilesList != null) {
						if (medical_insurance_parentFilesList.length > 0) {
							for (let i = 0; i < medical_insurance_parentFilesList.length; i++) {
								medical_insurance_parentFiles.push(medical_insurance_parentFilesList[i].location);
							}
							formData['medical_insurance_parent_file'] = JSON.stringify(medical_insurance_parentFiles);
						}
					}

					let self_child_edu_loan_interestFiles = [];
					let self_child_edu_loan_interestFilesList = res.uploads.self_child_edu_loan_interest_file;
					if (self_child_edu_loan_interestFilesList != null) {
						if (self_child_edu_loan_interestFilesList.length > 0) {
							for (let i = 0; i < self_child_edu_loan_interestFilesList.length; i++) {
								self_child_edu_loan_interestFiles.push(self_child_edu_loan_interestFilesList[i].location);
							}
							formData['self_child_edu_loan_interest_file'] = JSON.stringify(self_child_edu_loan_interestFiles);
						}
					}

					let hra_deductionFiles = [];
					let hra_deductionFilesList = res.uploads.hra_deduction_file;
					if (hra_deductionFilesList != null) {
						if (hra_deductionFilesList.length > 0) {
							for (let i = 0; i < hra_deductionFilesList.length; i++) {
								hra_deductionFiles.push(hra_deductionFilesList[i].location);
							}
							formData['hra_deduction_file'] = JSON.stringify(hra_deductionFiles);
						}
					}


					let medical_expenditureFiles = [];
					let medical_expenditureFilesList = res.uploads.medical_expenditure_file;
					if (medical_expenditureFilesList != null) {
						if (medical_expenditureFilesList.length > 0) {
							for (let i = 0; i < medical_expenditureFilesList.length; i++) {
								medical_expenditureFiles.push(medical_expenditureFilesList[i].location);
							}
							formData['medical_expenditure_file'] = JSON.stringify(medical_expenditureFiles);
						}
					}


					let otherFiles = [];
					let otherFilesList = res.uploads.other_file;
					if (otherFilesList != null) {
						if (otherFilesList.length > 0) {
							for (let i = 0; i < otherFilesList.length; i++) {
								otherFiles.push(otherFilesList[i].location);
							}
							formData['other_file'] = JSON.stringify(otherFiles);
						}
					}



					let other_payment_v1_aFiles = [];
					let other_payment_v1_aFilesList = res.uploads.other_payment_v1_a_file;
					if (other_payment_v1_aFilesList != null) {
						if (other_payment_v1_aFilesList.length > 0) {
							for (let i = 0; i < other_payment_v1_aFilesList.length; i++) {
								other_payment_v1_aFiles.push(other_payment_v1_aFilesList[i].location);
							}
							formData['other_payment_v1_a_file'] = JSON.stringify(other_payment_v1_aFiles);
						}
					}
					let finalData = {
						flag: this.formOpenFlag,
						data: formData
					}
					this.saveData(finalData);

				});

			} else {

				let finalData = {
					flag: this.formOpenFlag,
					data: formData
				}

				this.CrudServices.postRequest<any>(actualBudgtedTDS.addUpdate, finalData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, response.message, response.data);
					}
				});

			}

		} else {
			this.toasterService.pop('info', 'Info', 'You have not made any changes.');
		}
	}

	saveData(formData) {
		this.CrudServices.postRequest<any>(actualBudgtedTDS.addUpdate, formData).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
			}
		});
	}


	showInstruction() {
		this.activeObject = null;
		this.selected = null;
	}
	getFileView(controlname1) {
		let controlname = JSON.parse(controlname1)
		let retstring = '';
		if (controlname !== undefined || controlname !== null || controlname !== '') {
			//if (controlname.length) {
			controlname.forEach(element => {
				retstring += '<a href="' + this.serverUrl + element + '" target="_blank" class="btn btn-sm btn-info"> View file</a><hr>';
			});
		}
		return retstring;
	}
	changeMode() {
		this.mode = !this.mode;
		this.currentMode = this.mode ? 'Update Files' : 'View Files';
	}
	/**
	* This method is used to post status with flags & update salary details object.
	*/
	updateStatus(flag: number, status: string) {
		this.CrudServices.postRequest<any>(actualBudgtedTDS.updateStatus, {
			flag: flag,
			status: status,
			year_ctc_id: this.selected
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.salaryDetailsData.splice(this.currentIndex, 1, response.yrctcRes[0]);
				this.activeObject = response.yrctcRes[0];
				this.getDetails(this.activeObject.id, this.currentIndex);
			}
		});
	}


	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}
}
