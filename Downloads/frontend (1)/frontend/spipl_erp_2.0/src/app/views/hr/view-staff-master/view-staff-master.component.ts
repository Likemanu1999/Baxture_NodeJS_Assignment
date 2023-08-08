import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { ActivatedRoute, Params } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
import { ModalDirective } from "ngx-bootstrap";
import { DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';
import * as moment from "moment";
import { Subject } from 'rxjs';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { environment } from '../../../../environments/environment';
import { Calculations } from "../../../shared/calculations/calculations";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { GenerateDocsService } from './generate-docs.service';
import {
	staticValues,
	ConfirmedValidator,
	CommonService,
	roundAmount,
	ATTENDANCE_COLORS
} from '../../../shared/common-service/common-service';
import {
	YearlyCTCNew,
	MonthlySalaryNew,
	Leaves,
	Advance,
	StaffMemberMaster,
	StaffDocuments,
	TelephoneExtensions,
	Attendance,
	ExpenseCategoryMaster,
	ExpenseMaster,
	Investment,
	percentage_master,
	FileUpload,
	AdvanceInstallments,
	EmployeeForm16
} from '../../../shared/apis-path/apis-path';
import { PayableParameter, PayableParameterModel } from '../../../shared/payable-request/payable-parameter.model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-view-staff-master',
	templateUrl: './view-staff-master.component.html',
	styleUrls: ['./view-staff-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		PermissionService,
		LoginService,
		ToasterService,
		ExportService,
		GenerateDocsService,
		DatePipe,
		CommonService,
		InrCurrencyPipe,
		Calculations
	],
})

export class ViewStaffMasterComponent implements OnInit {

	@ViewChild("changePasswordModal", { static: false }) public changePasswordModal: ModalDirective;
	@ViewChild("changeProfilePhotoModal", { static: false }) public changeProfilePhotoModal: ModalDirective;
	@ViewChild("updateAttendanceModal", { static: false }) public updateAttendanceModal: ModalDirective;
	@ViewChild("addLeaveModal", { static: false }) public addLeaveModal: ModalDirective;
	@ViewChild("updateYearlyCTCModal", { static: false }) public updateYearlyCTCModal: ModalDirective;
	@ViewChild("advanceModal", { static: false }) public advanceModal: ModalDirective;
	@ViewChild("advanceInstallmentsModal", { static: false }) public advanceInstallmentsModal: ModalDirective;
	@ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;

	public popoverTitle1: string = "Please Confirm";
	public popoverMessage1: string = "";
	public popoverTitle2: string = "Warning";
	public popoverMessage2: string = "Are you sure, you want to Delete?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Confirm";
	public cancelText: string = "Cancel";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	datePickerConfig: any = staticValues.datePickerConfig;
	datePickerConfigProfile: any = staticValues.datePickerConfigProfile;
	leaveTypesList: any = staticValues.leave_types;
	personalleaveTypesList:any = staticValues.personal_leave_type;
	yearPickerConfig: any = staticValues.yearPickerConfig;
	attendanceStatusList: any = staticValues.attendance_status;
	advanceMonths: any = staticValues.advance_months;

	isLoading: boolean = false;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	months: any = [];

	editStaffLink: any;
	add_advance: boolean = false;
	updatePermission: boolean = false;
	profileUpdate: boolean = false;
	add_yearly_ctc: boolean = false;
	show_salary_breakup_pdf: boolean = false;
	send_breakup_on_mail: boolean = false;
	investmentStatusApproval: boolean = false;
	edit_yearly_ctc: boolean = false;
	delete_yearly_ctc: boolean = false;
	generate_appointment_letter: boolean = false;
	generate_relieving_letter: boolean = false;
	user: UserDetails;
	links: string[] = [];

	view: CalendarView = CalendarView.Month;
	viewDate: Date = new Date();
	refresh = new Subject<void>();
	events: CalendarEvent[] = [];

	login_id: number;
	role_id: number;
	id: number;
	data: any = [];
	relieving_date: any = null;
	employee_docs: any = [];
	default_photo: any = "../../../assets/img/default_image1.png";
	min_date: any = new Date();
	isEditYearlyCTC: boolean = false;
	enableProfileView: boolean = false;
	view_only_profile: boolean = false;
	enableInvestmentSubmit: boolean = false;
	activeInvestment: boolean = false;
	lastDate: any = null;
	active_investment_tab: any = 'Instructions';
	currentFinancialYear: any = this.commonService.getCurrentFinancialYear();
	financialYearList: any = [];

	yearlyCTCForm: FormGroup;
	attendanceForm: FormGroup;
	leaveForm: FormGroup;
	passwordForm: FormGroup;
	profilePhotoForm: FormGroup;
	fileData: FormData = new FormData();
	investmentFormNew: FormGroup;
	tdsCalculatorForm: FormGroup;
	advanceForm: FormGroup;
	editYearlyCTC: boolean = false;
	enableDownloadSalarySlip: boolean = false;
	addExpenseForm: FormGroup;
	bsValue: Date = new Date();
	dateInputFormat = 'Y-m-d';
	expenseFilesToUpload: Array<File> = [];
	expenseList: any = [];
	tdsDetails: any;

	empMonthStatus: any = {};
	percentDetails: any = [];
	income_tax_sections: any = [];
	category: any;
	salaryDetails: any;

	leave_id: any = null;
	editLeave: boolean = false;
	showPaymentList: boolean = false;
	investmentFlag: boolean = false;
	enableBudget: boolean = false;
	enableActual: boolean = false;
	editable: boolean = false;
	selected_financial_year: any = null;
	selectedFinancialYear: any = null;
	financial_year_list: any = [];
	investmentTypeList: any = [];
	investment_documents: any = [];
	advance_installments: any = [];

	basic_per: any = 0;
	da_per: any = 0;
	hra_per: any = 0;
	employer_pf_per: any = 0;
	lta_per: any = 0;
	child_edu_allow_per: any = 0;
	employee_pf_per: any = 0;
	esi_employee_per: any = 0;
	esi_employer_per: any = 0;
	total_annual_investment_budget: any = 0;
	total_annual_investment_actual: any = 0;

	leaves_cols: any = [
		{ field: "id", header: "id", permission: true },
		{ field: "from_date", header: "From Date", permission: true },
		{ field: "to_date", header: "To Date", permission: true },
		{ field: "duration", header: "Total Days", permission: true },
		{ field: "leave_category", header: "Category", permission: true },
		{ field: "leave_type", header: "Type", permission: true },
		{ field: "reason", header: "Reason", permission: true },
		{ field: "status", header: "Status", permission: true }
	];
	leaves_data: any = [];

	annual_ctc_cols: any = [
		{ field: "financial_year", header: "Financial Year", permission: true },
		{ field: "yearly_ctc", header: "Yearly CTC", permission: true },
		{ field: "basic", header: "Basic", permission: true },
		{ field: "da", header: "DA", permission: true },
		{ field: "hra", header: "HRA", permission: true },
		{ field: "lta", header: "LTA", permission: true },
		{ field: "child_edu_allowance", header: "Child Edu Allowance", permission: true },
		{ field: "special_allowance", header: "Special Allowance", permission: true },
		{ field: "employee_pf", header: "Employee PF", permission: true },
		{ field: "employer_pf", header: "Employer PF", permission: true },
		{ field: "pt", header: "PT", permission: true },
		{ field: "bonus", header: "Bonus", permission: true },
		{ field: "incentive", header: "Incentive", permission: true },
	];
	annual_ctc_data: any = [];

	monthly_ctc_cols: any = [
		{ field: "month_name", header: "Month", permission: true },
		{ field: "net_salary", header: "Net Payables", permission: true },
		{ field: "basic", header: "Basic", permission: true },
		{ field: "da", header: "DA", permission: true },
		{ field: "hra", header: "HRA", permission: true },
		{ field: "lta", header: "LTA", permission: true },
		{ field: "child_edu_allowance", header: "Child Edu Allowance", permission: true },
		{ field: "special_allowance", header: "Special Allowance", permission: true },
		{ field: "arrear_plus", header: "Arrear (+)", permission: true },
		{ field: "arrear_deduction", header: "Arrear (-)", permission: true },
		{ field: "gross_salary", header: "Gross Salary", permission: true },
		{ field: "net_salary", header: "Net Salary", permission: true },
		{ field: "pf", header: "Employee PF", permission: true },
		{ field: "employer_pf", header: "Employer PF", permission: true },
		{ field: "pt", header: "PT", permission: true },
		{ field: "tds", header: "TDS", permission: true },
		{ field: "bonus", header: "Bonus", permission: true },
		{ field: "incentive", header: "Incentive", permission: true },
		{ field: "performance_bonus", header: "Performance Bonus", permission: true },
	];
	monthly_ctc_data: any = [];

	advance_cols: any = [
		{ field: "id", header: "id", type: null },
		{ field: "financial_year", header: "Financial Year", type: null },
		{ field: "advance_amount", header: "Amount", type: "Amount" },
		{ field: "advance_date", header: "Date", type: "Date" },
		{ field: "start_date", header: "Start Date", type: "Date" },
		{ field: "end_date", header: "End Date", type: "Date" },
		{ field: "action", header: "Action", type: "Action" },
	];
	advance_data: any = [];

	empForm16List: any = [];

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(
		private route: ActivatedRoute,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private toasterService: ToasterService,
		private crudServices: CrudServices,
		private generateDocs: GenerateDocsService,
		private fb: FormBuilder,
		private commonService: CommonService,
		private calculations: Calculations
	) {
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.login_id = this.user.userDet[0].id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;

		this.route.params.subscribe((params: Params) => {
			this.id = params['id'];
		});

		if (this.login_id == this.id) {
			this.enableProfileView = true;
			this.view_only_profile = false;
		} else {
			if (this.login_id == 17 || this.login_id == 22 || this.login_id == 147) {
				this.enableProfileView = false;
				this.view_only_profile = true;
			} else {
				if (this.role_id == 1 || this.role_id == 3) {
					this.enableProfileView = true;
					this.view_only_profile = false;
				} else {
					this.enableProfileView = false;
					this.view_only_profile = false;
				}
			}
		}

		this.editStaffLink = '/hr/add-staff/' + this.id;
		this.updatePermission = (this.links.indexOf('update attendance') > -1);
		this.profileUpdate = (this.links.indexOf('profile_update') > -1);
		this.investmentStatusApproval = (this.links.indexOf('Investment Approval Access') > -1);
		this.show_salary_breakup_pdf = (this.links.indexOf('View Salary Breakup Pdf') > -1);
		this.send_breakup_on_mail = (this.links.indexOf('Send Salary Breakup On Mail') > -1);
		this.add_yearly_ctc = (this.links.indexOf('Add Yearly CTC') > -1);
		this.edit_yearly_ctc = (this.links.indexOf('Edit Yearly CTC') > -1);
		this.delete_yearly_ctc = (this.links.indexOf('Delete Yearly CTC') > -1);
		this.add_advance = (this.links.indexOf('add_advance') > -1);
		this.generate_appointment_letter = (this.links.indexOf('generate_appointment_letter') > -1);
		this.generate_relieving_letter = (this.links.indexOf('generate_relieving_letter') > -1);
	}

	ngOnInit() {
		this.initForm();
		this.getEmployeeDetails();
		this.getFinancialYearList();
		this.getPercentage();
		this.getIncomeTaxSections();

		this.getExpenseCategory();
		this.getExpenseList();
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
			employee_pf: new FormControl(null, Validators.required),
			employer_pf: new FormControl(null, Validators.required),
			feb_pt: new FormControl(null, Validators.required),
			other_pt: new FormControl(null, Validators.required),
			bonus: new FormControl(null, Validators.required),
			incentive: new FormControl(null, Validators.required)
		});

		this.attendanceForm = new FormGroup({
			date: new FormControl(null, Validators.required),
			status: new FormControl(null, Validators.required),
			remark: new FormControl(null, Validators.required),
		});

		this.leaveForm = new FormGroup({
			leave_category: new FormControl(null, Validators.required),
			leave_type: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null, Validators.required),
			reason: new FormControl(null, Validators.required)
		});

		this.passwordForm = this.fb.group({
			new_password: new FormControl(null, [Validators.required]),
			confirm_new_password: new FormControl(null, [Validators.required])
		}, {
			validator: ConfirmedValidator('new_password', 'confirm_new_password')
		});

		this.profilePhotoForm = this.fb.group({
			profile_photo: new FormControl(null, [Validators.required])
		});

		this.addExpenseForm = new FormGroup({
			expense_date: new FormControl(this.bsValue, Validators.required),
			category_id: new FormControl(null, Validators.required),
			amount: new FormControl(null, Validators.required),
			service_provider: new FormControl(null, Validators.required),
			description: new FormControl(null, Validators.required),
			expense_copy: new FormControl(null),
		});

		this.investmentFormNew = this.fb.group({
			emp_id: new FormControl(null),
			financial_year: new FormControl(null),
			investment_tds: this.fb.array([])
		});

		this.tdsCalculatorForm = this.fb.group({
			annual_ctc: new FormControl(null),
			bonus: new FormControl(null),
			incentive: new FormControl(null),
			standard_deduction: new FormControl(null),
			income_other_source: new FormControl(null),
			hra: new FormControl(null),
			section_80c: new FormControl(null),
			section_80ccd: new FormControl(null),
			section_80d: new FormControl(null),
			section_80g: new FormControl(null),
			section_others: new FormControl(null),
			annual_tds: new FormControl(null),
			monthly_tds: new FormControl(null)
		});

		this.advanceForm = this.fb.group({
			emp_id: new FormControl(null, Validators.required),
			financial_year: new FormControl(null, Validators.required),
			total_salary_left: new FormControl(null),
			actual_salary: new FormControl(null),
			advance_date: new FormControl(null),
			advance_amount: new FormControl(null, [Validators.required, Validators.min(1)]),
			start_date: new FormControl(null),
			monthly_deduction: new FormControl(null, Validators.required),
			months: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(11)])
		});
	}

	getEmployeeDetails() {
		this.crudServices.getOne<any>(StaffMemberMaster.getOne, {
			id: this.id
		}).subscribe(res => {
			this.data = res.data[0];
			this.data.user_profile_photo = this.data.profile_photo ? this.data.profile_photo : this.default_photo;
			this.data.full_name = this.data.title + '. ' + this.data.first_name + ' ' + this.data.last_name;
			this.data.job_profile = this.data.job_profile_master.profile_name;
			this.data.qualification = this.data.qualification_master.name;
			this.data.state = this.data.state_master.name;
			this.data.city = this.data.city_master.name;
			this.data.department = this.data.department_master.dept_name;
			this.data.role = this.data.role_master.role_name;
			this.data.employee_type = this.data.employee_type.name;
			this.data.telephone_extension = null;

			if (this.data.relieving_date != null) {
				this.relieving_date = this.data.relieving_date;
			}

			let start_date = moment(this.data.appointment_date).startOf('month').format("YYYY-MM-DD");
			let end_date = moment((this.data.relieving_date == null) ? new Date() : this.data.relieving_date).endOf('month').format("YYYY-MM-DD");
			var total_months = moment(end_date).diff(moment(start_date), 'months');
			var years = Math.floor(total_months / 12);
			var months = total_months % 12;

			this.data.total_working_days = null;
			let year_label = "";
			let month_label = "";

			if (years > 1) {
				year_label = years + ' Years ';
			} else if (years == 1) {
				year_label = years + ' Year ';
			} else {
				year_label = "";
			}

			if (months > 1) {
				month_label = months + ' Months ';
			} else if (months == 1) {
				month_label = months + ' Month ';
			} else {
				month_label = "";
			}

			this.data.total_working_days = year_label + month_label;

			// if (this.data.active_status == 1) {
			// 	this.view_only_profile = false;
			// } else {
			// 	this.view_only_profile = true;
			// }

			this.crudServices.getOne<any>(StaffDocuments.getStaffDocs, {
				staff_id: this.id
			}).subscribe(res_docs => {
				if (res_docs.code == '100') {
					if (res_docs.data.length > 0) {
						this.employee_docs = [];
						res_docs.data.forEach(element => {
							let obj = {
								document_id: element.document_id,
								document_type: element.staff_documents_type.document_type,
								document: element.document,
								status: element.status,
							}
							this.employee_docs.push(obj);
						});
					}
				}
				this.isLoading = false;
				this.getEmpTelephoneExtensions(this.id);
			});
		});
	}

	getEmpTelephoneExtensions(id) {
		this.crudServices.getOne<any>(TelephoneExtensions.getEmpExtension, {
			emp_id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					let extensionsArr = res.data[0].extension.split(',');
					this.data.telephone_extension = extensionsArr.join(' / ');
				}
			}
		});
	}

	changePassword() {
		this.changePasswordModal.show();
	}

	submitPasswordForm() {
		this.crudServices.getOne<any>(StaffMemberMaster.updatePassword, {
			staff_id: this.id,
			password: this.passwordForm.value.new_password
		}).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop('success', 'success', 'Password Updated Successfully');
				this.closeModal();
			}
		});
	}

	passwordConfirming() {
		let password = this.passwordForm.value.new_password;
		let confirm_password = this.passwordForm.value.confirm_new_password;
		if (password == confirm_password) {
			return true;
		} else {
			return false;
		}
	}

	changeProfilePhoto() {
		this.changeProfilePhotoModal.show();
	}

	onChangeProfilePhoto(e) {
		let files = <Array<File>>e.target.files;
		this.fileData.append("employee_profile_photo", files[0], files[0]['name']);
	}

	submitProfilePhotoForm() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			this.crudServices.getOne<any>(StaffMemberMaster.updateProfilePhoto, {
				staff_id: this.id,
				profile_photo: res_aws.uploads['employee_profile_photo'][0].location
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'success', 'Profile Photo Updated Successfully');
					this.getEmployeeDetails();
					this.closeModal();
				}
			});
		});
	}

	getFinancialYearList() {
		this.crudServices.getAll<any>(YearlyCTCNew.getFinancialYears).subscribe(res => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.financialYearList.push({
						financial_year: 'Select Financial Year'
					});
					res.data.forEach(element => {
						this.financialYearList.push({
							financial_year: element.financial_year
						});
					});
					this.selectedFinancialYear = this.financialYearList[0].financial_year;
					this.financial_year_list = res.data;
					this.selected_financial_year = this.financial_year_list[0].financial_year;
				}
			}
		});
	}

	getPercentage() {
		this.crudServices.getAll<any>(percentage_master.getAllDataByCurrentDate).subscribe(res => {
			if (res.length > 0) {
				this.percentDetails = res;

				this.basic_per = 0;
				this.da_per = 0;
				this.hra_per = 0;
				this.employer_pf_per = 0;
				this.lta_per = 0;
				this.child_edu_allow_per = 0;
				this.employee_pf_per = 0;
				this.esi_employee_per = 0;
				this.esi_employer_per = 0;

				this.percentDetails.forEach(element => {
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

	getIncomeTaxSections() {
		this.crudServices.getAll<any>(Investment.getIncomeTaxSections).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.income_tax_sections = res.data;
				}
			}
		});
	}

	getEmployeeAttendance(value) {
		this.isLoading = true;
		let current_month = moment().format("MM-YYYY");
		let check_month = moment(value).format("MM-YYYY");
		if (current_month == check_month || moment(value).isAfter(moment())) {
			this.enableDownloadSalarySlip = false;
		} else {
			this.enableDownloadSalarySlip = true;
		}
		let start_date = moment(value).startOf('month').format('YYYY-MM-DD');
		let end_date = moment(value).endOf('month').format('YYYY-MM-DD');
		this.crudServices.getOne<any>(Attendance.getEmpMonthStatus, {
			emp_id: this.id,
			start_date: start_date,
			end_date: end_date
		}).subscribe(res_status => {
			this.empMonthStatus = {};
			if (res_status.code == '100') {
				if (res_status.data.length > 0) {
					let status = res_status.data[0];
					let total_days_in_month = moment(start_date).daysInMonth();
					status.total_present = Number(status.present) + Number(status.late) + Number(status.early) + Number(status.late_early) + Number(status.half_day) + Number(status.official_leave);
					// let total_late_early = Number(status.late_early) / 2;
					status.total_late = Number(status.late) + Number(status.late_early);
					status.total_early = Number(status.early) + Number(status.late_early);

					if (Number(moment(value).format('YYYY')) >= 2022 && Number(moment(value).format('MM')) >= 6) {
						if (this.data.department_id == 1) {
							status.total_weekoff = 2;
							status.total_present += 2;
						} else {
							status.total_weekoff = 1;
							status.total_present += 1;
						}
					}
					status.holidays = Number(status.full_holiday) + (Number(status.half_holiday));
					status.balance_leaves = (status.balance_paid_leaves) < 0 ? 0 : status.balance_paid_leaves;

					if (moment(this.data.appointment_date).isAfter(moment(start_date))) {
						let end = moment(start_date).endOf('month').format('YYYY-MM-DD');
						total_days_in_month = moment(end).diff(moment(this.data.appointment_date), 'days') + 1;
					}

					status.present_with_holidays = Number(status.total_present) + Number(status.holidays);
					if (status.present_with_holidays > total_days_in_month) {
						status.present_with_holidays = total_days_in_month;
					}
					status.total_leaves = total_days_in_month - status.present_with_holidays;
					if (status.total_leaves < 0) {
						status.total_leaves = 0;
					}
					this.empMonthStatus = status;
				}
			}
		});

		this.crudServices.getOne<any>(Attendance.getOne, {
			emp_id: this.id,
			start_date: start_date,
			end_date: end_date
		}).subscribe(res_att => {
			if (res_att.code == '100') {
				if (res_att.data.length > 0) {
					this.events = [];
					let i = 0;
					res_att.data.forEach(element => {

						let saturday_title = null;
						if (element.is_saturday) {
							i += 1;
							if (i == 2 && this.data.department_id == 1) {
								element.status = "Weekend";
								saturday_title = "2nd Saturday";
							} else if (i == 4) {
								element.status = "Weekend";
								saturday_title = "4th Saturday";
							} else {
								element.status = element.status ? element.status : "A";
								saturday_title = null;
							}
						}

						element.attendance_icon = null;
						element.is_holiday = null;
						element.holiday_icon = null;
						element.is_leave = null;
						element.leave_icon = null;
						element.is_maternity_leave = null;
						element.maternity_leave_icon = null;
						element.is_sunday = null;
						element.is_wfh = null;
						element.is_saturday_off = null;
						element.saturday_icon = null;
						element.is_holiday = null;
						element.holiday_icon = null;
						element.is_attendance = null;

						if (element.status == 'P') {
							element.attendance_icon = "../assets/img/attendance/present.png";
						} else if (element.status == 'A') {
							element.attendance_icon = "../assets/img/attendance/absent.png";
						} else if (element.status == 'E') {
							element.attendance_icon = "../assets/img/attendance/early.png";
						} else if (element.status == 'L') {
							element.attendance_icon = "../assets/img/attendance/late.png";
						} else if (element.status == 'LE') {
							element.attendance_icon = "../assets/img/attendance/late-early.png";
						} else if (element.status == 'HD1' || element.status == 'HD2') {
							element.attendance_icon = "../assets/img/attendance/half-day.png";
						} else if (element.status == 'WFH') {
							element.attendance_icon = "../assets/img/attendance/wfh.png";
						} else if (element.status == "Leave") {
							element.is_leave = true;
							element.leave_icon = "../assets/img/attendance/leave.png";
						} else if (element.status == "Maternity_Leave") {
							element.is_maternity_leave = true;
							element.maternity_leave_icon = "../assets/img/attendance/maternity_leave.png";
						} else if (element.status == "Sunday") {
							element.is_sunday = true;
						} else if (element.status == 'WFH') {
							element.is_wfh = true;
						} else if (element.status == "Weekend") {
							element.is_saturday_off = true;
							element.saturday_icon = "../assets/img/attendance/weekend.png";
						}

						if (element.holiday != null) {
							element.is_holiday = true;
							element.holiday_icon = "../assets/img/holidays/" + element.icon + ".png";
						}

						if (element.is_sunday || element.is_holiday || element.is_leave ||
							element.is_saturday_off || element.is_maternity_leave) {
							element.is_attendance = false;
						} else {
							element.is_attendance = true;
						}

						let holiday_name = (element.holiday_type == 1) ? element.holiday : element.holiday + " (Half-Day)";

						let title = null;
						let color = null;

						if (element.is_holiday) {
							title = holiday_name;
							color = ATTENDANCE_COLORS.holiday;
						} else if (element.is_leave) {
							title = "Personal Leave";
							color = ATTENDANCE_COLORS.leave;
						} else if (element.is_saturday_off) {
							title = saturday_title;
							color = ATTENDANCE_COLORS.saturday;
						} else {
							title = null
							color = ATTENDANCE_COLORS.leave;
						}

						let time_in = null;
						let time_out = null;
						if (element.time_in != null) {
							time_in = 'In : ' + element.time_in;
						} else {
							time_in = null;
						}

						let new_attendance_date = moment(element.date).format("YYYY-MM-DD");
						let working_hours = '--';
						let late_minutes = null;

						if (element.time_out != null) {
							time_out = 'Out : ' + element.time_out;
							let start = moment(new_attendance_date + ' ' + element.time_in).format('YYYY-MM-DD HH:mm:ss');
							let end = moment(new_attendance_date + ' ' + element.time_out).format('YYYY-MM-DD HH:mm:ss');
							var duration = moment.duration(moment(end).diff(moment(start)));
							if (duration.hours() > 0) {
								let hours = ('0' + duration.hours()).slice(-2);
								let minutes = ('0' + duration.minutes()).slice(-2);
								working_hours = "Work Hrs : " + hours + ":" + minutes + " Hrs";
							}
						} else {
							time_out = null;
						}

						if (element.time_in != null) {
							let start = moment(new_attendance_date + ' 09:30:00').format('YYYY-MM-DD HH:mm:ss');
							let end = moment(new_attendance_date + ' ' + element.time_in).format('YYYY-MM-DD HH:mm:ss');
							var duration = moment.duration(moment(end).diff(moment(start)));

							if (duration.minutes() > 0) {
								let minutes = ('0' + duration.minutes()).slice(-2);
								let seconds = ('0' + duration.seconds()).slice(-2);
								late_minutes = "Late By : " + minutes + ":" + seconds + " Min";
							}
						}

						let attendance = {
							start: new Date(new_attendance_date),
							end: new Date(new_attendance_date),
							status: element.status,
							title: title,
							time_in: time_in,
							time_out: time_out,
							working_hours: working_hours,
							late_minutes: late_minutes,
							is_sunday: element.is_sunday,
							is_wfh: element.is_wfh,
							is_attendance: element.is_attendance,
							attendance_icon: element.attendance_icon,
							is_holiday: element.is_holiday,
							holiday_icon: element.holiday_icon,
							is_leave: element.is_leave,
							leave_icon: element.leave_icon,
							is_maternity_leave: element.is_maternity_leave,
							maternity_leave_icon: element.maternity_leave_icon,
							is_saturday_off: element.is_saturday_off,
							saturday_icon: element.saturday_icon,
							color: color,
							time_color: (element.time_in != null) ? ATTENDANCE_COLORS.time_in_out : ATTENDANCE_COLORS.leave
						};
						this.events.push(attendance);
					});
					this.isLoading = false;
				}
			}
		});
	}

	showUpdateAttendanceModal(date) {
		this.attendanceForm.reset();
		this.attendanceForm.patchValue({
			date: date,
			status: null,
			remark: null
		});
		this.updateAttendanceModal.show();
	}

	onChangeAttendanceStatus(e) {
		if (e != null && e != undefined) {
			this.attendanceForm.patchValue({
				remark: e.label
			});
		} else {
			this.attendanceForm.patchValue({
				remark: null
			});
		}
	}

	submitAttendanceForm() {
		this.crudServices.updateData<any>(Attendance.updateAttendanceNew, {
			punching_code: Number(this.data.machine_id),
			date: this.attendanceForm.value.date,
			status: Number(this.attendanceForm.value.status),
			remark: this.attendanceForm.value.remark,
		}).subscribe(response => {
			if (response.code == '100') {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getEmployeeAttendance(this.viewDate);
			} else {
				this.toasterService.pop('error', 'error', 'Something Went Wrong');
			}
			this.attendanceForm.reset();
			this.updateAttendanceModal.hide();
		});
	}

	getLeaves(emp_id) {
		this.crudServices.getOne<any>(Leaves.getEmployeeLeave, {
			emp_id: emp_id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.total_days = Number(element.total_days);
					});
					this.leaves_data = res.data;
				}
			}
		});
	}

	onChangeLeaveCategory(value) {
		if (value != null && value != undefined) {
			if (value == 1) {
				this.leaveForm.patchValue({
					leave_type: 4
				});
			}
		}
	}

	submitLeaveForm() {
		let body = {
			data: {
				leave_category: Number(this.leaveForm.value.leave_category),
				leave_type: Number(this.leaveForm.value.leave_type),
				from_date: moment(this.leaveForm.value.from_date).format("YYYY-MM-DD"),
				to_date: moment(this.leaveForm.value.to_date).format("YYYY-MM-DD"),
				total_days: 0,
				reason: this.leaveForm.value.reason,
				created_by: this.id
			}
		};
		if (body.data.leave_type == 4 || body.data.leave_type == 5 || body.data.leave_type == 6 || body.data.leave_type == 7 || body.data.leave_type == 8 || body.data.leave_type == 9 || body.data.leave_type == 10) {
			let diff = 1;
			if (moment(body.data.to_date).isAfter(moment(body.data.from_date))) {
				diff += moment(body.data.to_date).diff(moment(body.data.from_date), 'days');
			}

			let sunday = 0;
			let first_saturday = 0;
			let fourth_saturday = 0;

			for (var d = new Date(body.data.from_date); d <= new Date(body.data.to_date); d.setDate(d.getDate() + 1)) {
				if (moment(d).day() == 0) {
					sunday += 1;
				}
			}
			diff -= sunday;
			body.data.total_days = diff;
		} else {
			body.data.total_days = 0;
		}
		if (this.editLeave) {
			body['id'] = this.leave_id;
			this.crudServices.updateData<any>(Leaves.updateLeave, body).subscribe(response => {
				if (response.code == '100') {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getLeaves(this.id);
				} else {
					this.toasterService.pop('error', 'error', 'Something Went Wrong');
				}
				this.closeModal();
			});
		} else {
			this.crudServices.addData<any>(Leaves.add, body).subscribe(response => {
				if (response.code == '100') {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getLeaves(this.id);
				} else {
					this.toasterService.pop('error', 'error', 'Something Went Wrong');
				}
				this.closeModal();
			});
		}
	}

	getSalaryDetails() {
		this.crudServices.getOne<any>(MonthlySalaryNew.getEmpYearlyCTC, {
			emp_id: this.id
		}).subscribe(res_ctc => {
			if (res_ctc.code == '100') {
				if (res_ctc.data.length > 0) {
					this.salaryDetails = res_ctc.data;
					this.investmentFlag = true;
				}
			}
		});
	}

	getAnnualCTC() {
		this.annual_ctc_data = [];
		this.monthly_ctc_data = [];
		this.crudServices.getOne<any>(YearlyCTCNew.getYearlyCTC, {
			emp_id: this.id,
			financial_year: this.selected_financial_year
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.annual_ctc_data = res.data;
					this.crudServices.getOne<any>(YearlyCTCNew.getEmpMonthlyCtc, {
						emp_id: this.id,
						financial_year: this.selected_financial_year
					}).subscribe(res => {
						if (res.code == '100') {
							if (res.data.length > 0) {
								this.monthly_ctc_data = res.data;
							}
						}
					});
				}
			}
		});
	}

	calculateAnnualSalary(value) {
		if (value != null && value != undefined) {
			let basic = Math.round(value * this.basic_per / 100);
			let da = Math.round(value * this.da_per / 100);
			let hra = Math.round((basic + da) * this.hra_per / 100);
			let salary_for_employer_pf = value - ((da + basic) * (0.4));
			let employer_pf = 0;
			if (salary_for_employer_pf < (15000 * 12)) {
				employer_pf = Math.round(salary_for_employer_pf * this.employer_pf_per / 100);
			} else {
				employer_pf = Math.round((15000 * 12) * this.employer_pf_per / 100);
			}
			let monthly_salary = (value - employer_pf);
			let lta = Math.round(monthly_salary * this.lta_per / 100);
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
				employee_pf = Math.round(grossSalary * this.employee_pf_per / 100);
			} else {
				employee_pf = Math.round((15000 * 12) * this.employee_pf_per / 100);
			}
			this.yearlyCTCForm.patchValue({
				annual_ctc: value,
				basic: basic,
				da: da,
				hra: hra,
				lta: lta,
				child_edu_allowance: child_edu_allowance,
				special_allowance: special_allowance,
				employee_pf: employee_pf,
				employer_pf: employer_pf,
				esi_employee: esi_employee,
				esi_employer: esi_employer,
				bonus: roundAmount(Number(value) / 12)
			});
		}
	}

	submitYearlyCTCForm() {
		let body = {
			data: {
				emp_id: Number(this.id),
				financial_year: this.yearlyCTCForm.value.financial_year,
				from_date: this.yearlyCTCForm.value.from_date,
				to_date: this.yearlyCTCForm.value.to_date,
				annual_ctc: Number(this.yearlyCTCForm.value.annual_ctc),
				basic: Number(this.yearlyCTCForm.value.basic),
				da: Number(this.yearlyCTCForm.value.da),
				hra: Number(this.yearlyCTCForm.value.hra),
				lta: Number(this.yearlyCTCForm.value.lta),
				child_edu_allowance: Number(this.yearlyCTCForm.value.child_edu_allowance),
				special_allowance: Number(this.yearlyCTCForm.value.special_allowance),
				employee_pf: Number(this.yearlyCTCForm.value.employee_pf),
				employer_pf: Number(this.yearlyCTCForm.value.employer_pf),
				esi_employee: Number(this.yearlyCTCForm.value.esi_employee),
				esi_employer: Number(this.yearlyCTCForm.value.esi_employer),
				standard_deduction: 50000,
				bonus: Number(this.yearlyCTCForm.value.bonus),
				incentive: Number(this.yearlyCTCForm.value.incentive),
				feb_pt: Number(this.yearlyCTCForm.value.feb_pt),
				other_pt: Number(this.yearlyCTCForm.value.other_pt),
			}
		};
		if (this.isEditYearlyCTC) {
			body['id'] = this.yearlyCTCForm.value.id;
			this.crudServices.updateData<any>(YearlyCTCNew.updateData, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, res.message, res.data);
					this.closeModal();
					this.getAnnualCTC();
				} else {
					this.toasterService.pop(res.message, res.message, 'Something Went Wrong!!');
				}
			});
		} else {
			if (this.annual_ctc_data.length > 0) {
				this.crudServices.addData<any>(YearlyCTCNew.addDataDateWise, body).subscribe(res => {
					if (res.code == '100') {
						let id = res.data;
						this.crudServices.getOne<any>(YearlyCTCNew.getOne, {
							id: id
						}).subscribe(res_y => {
							this.toasterService.pop(res.message, res.message, res.data);
							this.closeModal();
							this.getAnnualCTC();
							this.createEmployeeSalary(res_y[0]);
						});
					} else {
						this.toasterService.pop(res.message, res.message, 'Something Went Wrong!!');
					}
				});
			} else {
				this.crudServices.addData<any>(YearlyCTCNew.addData, body).subscribe(res => {
					if (res.code == '100') {
						this.toasterService.pop(res.message, res.message, res.data);
						this.closeModal();
						this.getAnnualCTC();
					} else {
						this.toasterService.pop(res.message, res.message, 'Something Went Wrong!!');
					}
				});
			}
		}
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
			element.emp_id,
			element.id,
			element.financial_year,
			monthly_ctc,
			moment(element.appointment_date).format("MM"),
			diff,
			element
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
					element.emp_id,
					element.id,
					element.financial_year,
					monthly_ctc,
					month.id,
					total_days_in_month,
					element
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
						element
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
						element
					);
					all_month_salary.push(data);
				}
			}
		});
		const unique_month_salary = Array.from(new Set(all_month_salary.map(a => a.month)))
			.map(month => {
				return all_month_salary.find(a => a.month === month)
			});

		// this.crudServices.addData<any>(MonthlySalaryNew.addDataDateWise, {
		// 	data: unique_month_salary,
		// 	emp_id: element.emp_id,
		// 	old_annual_ctc_id: old_annual_ctc_id,
		// 	months: delete_months
		// }).subscribe(res => {
		// 	if (res.code == '100') {
		// 		this.toasterService.pop(res.message, "Success", res.data);
		// 	} else {
		// 		this.toasterService.pop('error', 'Error', 'Something Went Wrong');
		// 	}
		// });
	}

	createMonthSalary(emp_id, annual_ctc_id, financial_year, monthly_ctc, month, present_days, item) {
		let year_arr = financial_year.split('-');
		let year = Number(year_arr[0]);

		if ((month == '01') || (month == '02') || (month == '03')) {
			year = Number(year_arr[1]);
		}

		let total_days = moment(year + "-" + month, "YYYY-MM").daysInMonth();
		let pt = (month == '02') ? 300 : 200;

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

		let tds = 0;

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
			performance_bonus: 0
		};
		return data;
	}

	getTDSDate() {
		this.crudServices.getOne<any>(percentage_master.getTDSDate, {
			// 
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					if (this.login_id == this.id) {
						this.editable = true;
					} else {
						this.editable = false;
					}
					if (res.data[0].type_id == 13) {
						this.enableBudget = true;
						this.enableActual = false;
						this.lastDate = res.data[0].to_date;
					} else if (res.data[0].type_id == 14) {
						this.enableBudget = false;
						this.enableActual = true;
						this.lastDate = res.data[0].to_date;
					} else {
						this.enableBudget = false;
						this.enableActual = false;
					}
				} else {
					this.enableBudget = false;
					this.enableActual = false;
				}
				if (this.lastDate != null && moment(this.lastDate).isAfter(moment())) {
					this.activeInvestment = true;
				} else {
					this.activeInvestment = true;
				}
			}
		});
	}

	get c(): FormArray {
		return this.investmentFormNew.get('investment_tds') as FormArray;
	}

	getInvestmentType(financial_year) {
		this.total_annual_investment_budget = 0;
		this.total_annual_investment_actual = 0;
		this.investmentFormNew.reset();
		this.c.clear();
		this.investmentFormNew.patchValue({
			emp_id: this.id,
			financial_year: financial_year,
			investment_tds: []
		});



		this.crudServices.getOne<any>(Investment.getEmpAnnualInvestments, {
			emp_id: this.id,
			financial_year: financial_year
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					if (this.activeInvestment) {
						this.income_tax_sections.forEach(element1 => {
							element1.budget_total = 0;
							element1.actual_total = 0;
							for (let i = 0; i < res.data.length; i++) {
								if (element1.section === res.data[i].section) {
									element1.budget_total += Number(res.data[i].budget_amount);
									element1.actual_total += Number(res.data[i].actual_amount);
									let fg = this.fb.group({
										id: res.data[i].id,
										section: res.data[i].section,
										investment_type_id: res.data[i].it_id,
										budget_docs: res.data[i].budget_docs,
										actual_docs: res.data[i].actual_docs,
										description: res.data[i].description,
										budget_amount: Number(res.data[i].budget_amount),
										actual_amount: Number(res.data[i].actual_amount),
										budget_attachment: null,
										actual_attachment: null,
										budget_attachment_copy: res.data[i].budget_attachment,
										actual_attachment_copy: res.data[i].actual_attachment,
										budget_status: Number(res.data[i].budget_status),
										actual_status: Number(res.data[i].actual_status),
									});
									this.c.push(fg);
								}
							}
							this.total_annual_investment_budget += element1.budget_total;
							this.total_annual_investment_actual += element1.actual_total;
						});
					} else {
						this.income_tax_sections.forEach(element1 => {
							element1.budget_total = 0;
							element1.actual_total = 0;
							res.data.forEach(element2 => {
								if (element1.section === element2.section) {
									element1.budget_total += Number(element2.budget_amount);
									element1.actual_total += Number(element2.actual_amount);
								}
								element2.budget_amount = Number(element2.budget_amount);
								element2.actual_amount = Number(element2.actual_amount);
							});
							this.total_annual_investment_budget += element1.budget_total;
							this.total_annual_investment_actual += element1.actual_total;
						});
					}
					this.investmentTypeList = res.data;
				} else {
					// 
				}
			}
		});
	}

	onChangeInvestmentAmount(value, type, item) {
		let investment_tds = this.investmentFormNew.value.investment_tds;
		this.enableInvestmentSubmit = false;
		let final_status = null;
		if (type == "Budget") {
			investment_tds.forEach((element, index) => {
				element.enable_submit = false;
				if (element.budget_docs == 1) {
					if (Number(element.budget_amount) == 0 && (element.budget_attachment_copy == null || element.budget_attachment == null)) {
						element.enable_submit = true;
					} else {
						if (element.section == "80GG") {
							if (Number(element.budget_amount) > 100000 && (element.budget_attachment_copy == null || element.budget_attachment == null)) {
								element.enable_submit = false;
							} else {
								element.enable_submit = true;
							}
						} else {
							if (Number(element.budget_amount) > 0 && (element.budget_attachment_copy != null || element.budget_attachment != null)) {
								element.enable_submit = true;
							} else {
								element.enable_submit = false;
							}
						}
					}
				} else {
					element.enable_submit = true;
				}
			});
			final_status = investment_tds.find(o => o.enable_submit == false);
		}
		if (type == "Actual") {
			investment_tds.forEach((element, index) => {
				element.enable_submit = false;
				if (element.actual_docs == 1) {
					if (Number(element.actual_amount) == 0 && (element.actual_attachment_copy == null || element.actual_attachment == null)) {
						element.enable_submit = true;
					} else {
						if (element.section == "80GG") {
							if (Number(element.actual_amount) > 100000 && (element.actual_attachment_copy == null || element.actual_attachment == null)) {
								element.enable_submit = false;
							} else {
								element.enable_submit = true;
							}
						} else {
							if (Number(element.actual_amount) > 0 && (element.actual_attachment_copy != null || element.actual_attachment != null)) {
								element.enable_submit = true;
							} else {
								element.enable_submit = false;
							}
						}
					}
				} else {
					element.enable_submit = true;
				}
			});
			final_status = investment_tds.find(o => o.enable_submit == false);
		}

		if (final_status == undefined) {
			this.enableInvestmentSubmit = true;
		} else {
			this.enableInvestmentSubmit = false;
		}
	}

	tdsCalculation() {
		this.tdsDetails.gross_salary = (
			this.tdsDetails.basic +
			this.tdsDetails.da +
			this.tdsDetails.hra +
			this.tdsDetails.lta +
			this.tdsDetails.child_edu_allowance +
			this.tdsDetails.special_allowance +
			this.tdsDetails.bonus +
			this.tdsDetails.incentive
		);

		this.tdsDetails.excess_rent_10 = (
			this.tdsDetails.actual_rent_paid - ((this.tdsDetails.basic + this.tdsDetails.da) * (10 / 100))
		);
		this.tdsDetails.basic_da_40 = ((this.tdsDetails.basic + this.tdsDetails.da) * (40 / 100));

		if (this.tdsDetails.excess_rent_10 < 0) {
			this.tdsDetails.excess_rent_10 = 0;
		}

		if (this.tdsDetails.basic_da_40 < 0) {
			this.tdsDetails.basic_da_40 = 0;
		}

		this.tdsDetails.total_hra = Math.min(...[
			this.tdsDetails.actual_rent_paid,
			this.tdsDetails.hra,
			this.tdsDetails.excess_rent_10,
			this.tdsDetails.basic_da_40
		]);

		this.tdsDetails.allowances_10 = (this.tdsDetails.total_hra + (this.tdsDetails.child_edu_allowance / 12));
		this.tdsDetails.deduction_16 = (
			this.tdsDetails.standard_deduction +
			this.tdsDetails.other_pt +
			this.tdsDetails.feb_pt
		);
		this.tdsDetails.net_salary = (
			this.tdsDetails.gross_salary - this.tdsDetails.allowances_10 - this.tdsDetails.deduction_16
		);

		this.tdsDetails.total_gross_income = (this.tdsDetails.net_salary + this.tdsDetails.other_income);

		if (this.tdsDetails.section_80c >= 150000) {
			this.tdsDetails.total_deductions_80c_cc = 150000;
		} else {
			this.tdsDetails.total_deductions_80c_cc = this.tdsDetails.section_80c;
		}

		if (this.tdsDetails.section_80d >= 75000) {
			this.tdsDetails.total_deductions_80d = 75000;
		} else {
			this.tdsDetails.total_deductions_80d = this.tdsDetails.section_80d;
		}

		if (this.tdsDetails.section_80ccd >= 50000) {
			this.tdsDetails.total_deductions_80ccd = 50000;
		} else {
			this.tdsDetails.total_deductions_80ccd = this.tdsDetails.section_80ccd;
		}

		let investments = (
			Number(this.tdsDetails.total_deductions_80c_cc) +
			Number(this.tdsDetails.total_deductions_80d) +
			Number(this.tdsDetails.total_deductions_80ccd) +
			Number(this.tdsDetails.section_80g) +
			Number(this.tdsDetails.section_others)
		);

		this.tdsDetails.total_income = this.tdsDetails.total_gross_income - investments;

		if (this.tdsDetails.total_income < 250000) {
			this.tdsDetails.tax_on_total_income = 0;
		} else if (this.tdsDetails.total_income > 250000 && this.tdsDetails.total_income < 500000) {
			this.tdsDetails.tax_on_total_income = roundAmount((this.tdsDetails.total_income - 250000) * (5 / 100));
		} else if (this.tdsDetails.total_income > 500000 && this.tdsDetails.total_income < 1000000) {
			this.tdsDetails.tax_on_total_income = 12500 + roundAmount((this.tdsDetails.total_income - 500000) * (20 / 100));
		} else if (this.tdsDetails.total_income > 1000000) {
			this.tdsDetails.tax_on_total_income = 12500 + 100000 + roundAmount((this.tdsDetails.total_income - 1000000) * (30 / 100));
		}

		if (this.tdsDetails.total_income < 10000000) {
			this.tdsDetails.surcharge = 0;
		} else {
			this.tdsDetails.surcharge = this.tdsDetails.tax_on_total_income * 0.1;
		}

		this.tdsDetails.tax_with_surcharge = this.tdsDetails.tax_on_total_income + this.tdsDetails.surcharge;

		if (this.tdsDetails.tax_with_surcharge < 12500) {
			this.tdsDetails.rebate_87a = this.tdsDetails.tax_with_surcharge;
		} else {
			this.tdsDetails.rebate_87a = 0;
		}

		this.tdsDetails.tax_after_rebate_87a = this.tdsDetails.tax_with_surcharge - this.tdsDetails.rebate_87a;
		this.tdsDetails.education_cess = roundAmount(this.tdsDetails.tax_after_rebate_87a * (4 / 100));

		this.tdsDetails.total_tds = this.tdsDetails.tax_after_rebate_87a + this.tdsDetails.education_cess;
		this.tdsDetails.monthly_tds = roundAmount(this.tdsDetails.total_tds / 11);

		this.tdsCalculatorForm.patchValue({
			annual_tds: this.tdsDetails.total_tds,
			monthly_tds: this.tdsDetails.monthly_tds
		});
	}

	calculateTDS(value, type) {
		if (type == 'Incentive') {
			if (value != null && value != undefined) {
				this.tdsDetails.incentive = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Actual_Rent') {
			if (value != null && value != undefined) {
				this.tdsDetails.actual_rent_paid = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Section_80C') {
			if (value != null && value != undefined) {
				this.tdsDetails.section_80c = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Section_80CCD') {
			if (value != null && value != undefined) {
				this.tdsDetails.section_80ccd = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Section_80D') {
			if (value != null && value != undefined) {
				this.tdsDetails.section_80d = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Section_80G') {
			if (value != null && value != undefined) {
				this.tdsDetails.section_80g = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Other_Income') {
			if (value != null && value != undefined) {
				this.tdsDetails.other_income = Number(value);
				this.tdsCalculation();
			}
		}
		if (type == 'Section_Others') {
			if (value != null && value != undefined) {
				this.tdsDetails.section_others = Number(value);
				this.tdsCalculation();
			}
		}
	}

	onSubmitInvestmentForm() {
		let financial_year = this.investmentFormNew.value.financial_year;
		let investment_tds = this.investmentFormNew.value.investment_tds;
		investment_tds.forEach((element, index) => {
			let doc = this.investment_documents.find(o => o.investment_type_id == element.investment_type_id);
			if (doc) {
				let fileData = new FormData();
				let folder_name = null;
				if (this.enableBudget) {
					folder_name = "investment_budget_attachment";
				}
				if (this.enableActual) {
					folder_name = "investment_actual_attachment";
				}
				fileData.append(folder_name, doc.file, doc.file['name']);

				this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res_aws => {
					let budget_attachment = null;
					let actual_attachment = null;

					if (this.enableBudget) {
						budget_attachment = res_aws.uploads[folder_name][0].location;
					}
					if (this.enableActual) {
						actual_attachment = res_aws.uploads[folder_name][0].location;
					}

					let data = {
						emp_id: Number(this.id),
						financial_year: financial_year,
						investment_type_id: Number(element.investment_type_id),
						budget_amount: Number(element.budget_amount),
						actual_amount: Number(element.actual_amount),
						budget_attachment: budget_attachment,
						actual_attachment: actual_attachment,
						budget_status: Number(element.budget_status),
						actual_status: Number(element.actual_status),
					};
					let body = {
						data: data,
						type: (this.enableActual) ? "Actual" : "Budget",
						id: element.id
					};
					this.crudServices.addData<any>(Investment.add, body).subscribe(res => {
						if (res.code == "100") {
							if (Number(element.budget_amount) > 0 || Number(element.actual_amount) > 0) {
								this.toasterService.pop("success", "Success", "TDS Investment Details Added");
							}
						} else {
							this.toasterService.pop("error", "Alert", "Failed to add TDS Investment Details");
						}
					});
				});
			} else {
				let data = {
					emp_id: Number(this.id),
					financial_year: financial_year,
					investment_type_id: Number(element.investment_type_id),
					budget_amount: Number(element.budget_amount),
					actual_amount: Number(element.actual_amount),
					budget_attachment: element.budget_attachment_copy,
					actual_attachment: element.actual_attachment_copy,
					budget_status: Number(element.budget_status),
					actual_status: Number(element.actual_status),
				};
				let body = {
					data: data,
					type: (this.enableActual) ? "Actual" : "Budget",
					id: element.id
				};
				this.crudServices.addData<any>(Investment.add, body).subscribe(res => {
					if (res.code == "100") {
						if (Number(element.budget_amount) > 0 || Number(element.actual_amount) > 0) {
							this.toasterService.pop("success", "Success", "TDS Investment Details Added");
						}
					} else {
						this.toasterService.pop("error", "Alert", "Failed to add TDS Investment Details");
					}
				});
			}
		});
		this.getInvestmentType(financial_year);
	}

	onFileChange(e, type, item) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			let result = this.investment_documents.findIndex(o => o.investment_type_id == item.investment_type_id);
			if (result != -1) {
				let file = {
					investment_type_id: item.investment_type_id,
					file: files[i]
				};
				this.investment_documents[result] = file;
			} else {
				let file = {
					investment_type_id: item.investment_type_id,
					file: files[i]
				};
				this.investment_documents.push(file);
			}
		}
		if (type == "Budget" && Number(item.budget_amount) > 0) {
			this.enableInvestmentSubmit = true;
		} else if (type == "Actual" && Number(item.actual_amount) > 0) {
			this.enableInvestmentSubmit = true;
		} else {
			this.enableInvestmentSubmit = false;
		}
	}

	getExpenseList() {
		this.crudServices.getOne(ExpenseMaster.getEmployeeWisedExpense, {
			staff_id: this.user.userDet[0].id
		}).pipe(map((response) => {
			return response['data'].map(ele => { ele.expense_copy = JSON.parse(ele['expense_copy']); return ele; })
		})).subscribe((expense: any) => {
			this.expenseList = expense;
		})
	}

	onExpenseSubmit() {
		const invalid = [];
		const controls = this.addExpenseForm.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		let data = {
			expense_date: this.convert(this.addExpenseForm.value.expense_date),
			category_id: this.addExpenseForm.value.category_id,
			service_provider: this.addExpenseForm.value.service_provider,
			amount: this.addExpenseForm.value.amount,
			description: this.addExpenseForm.value.description,
			emp_id: [this.user.userDet[0].id],
			status: 0,
			reimburse_to: this.user.userDet[0].id
		}
		let fileData: any = new FormData();
		const files: Array<File> = this.expenseFilesToUpload;
		if (files.length > 0) {
			for (let i = 0; i < files.length; i++) {
				fileData.append('expense_copy', files[i], files[i]['name']);
			}
		}

		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
			let fileDealDocs = [];
			let filesList = res.uploads.expense_copy;
			if (res.uploads.expense_copy) {
				for (let i = 0; i < filesList.length; i++) {
					fileDealDocs.push(filesList[i].location);
				}
				data['expense_copy'] = JSON.stringify(fileDealDocs);
			}
			this.saveData(data);
		})
	}

	saveData(formData) {
		// if (this.editMode) {
		// 	this.crudServices.updateData<any>(ExpenseMaster.update, formData).subscribe((response) => {
		// 		this.toasterService.pop(response.message, response.message, response.data);
		// 		if (response.code === '100') {
		// 			this.onBack();
		// 		}
		// 	});
		// } else {
		this.crudServices.addData<any>(ExpenseMaster.add, formData).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			if (response.code === '100') {
				this.addExpenseForm.reset();
				this.getExpenseList()
			}
		});
		// }
	}

	getExpenseCategory() {
		this.crudServices.getAll<any>(ExpenseCategoryMaster.getAll).subscribe((response) => {
			this.category = response.data;
		});
	}

	fileChangeEvent(fileInput: any) {
		this.expenseFilesToUpload = <Array<File>>fileInput.target.files;
	}

	convert(str) {
		const date = new Date(str),
			mnth = ('0' + (date.getMonth() + 1)).slice(-2),
			day = ('0' + date.getDate()).slice(-2);
		return [date.getFullYear(), mnth, day].join('-');
	}

	getEmployeeAdvance() {
		this.crudServices.getOne<any>(Advance.getOne, {
			emp_id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.advance_data = res.data;
				}
			}
		});
	}

	calculateAdvance(value, type) {
		if (type == 'Advance_Amount') {
			if (Number(value) > 0) {
				let end_date = moment(this.advanceForm.value.start_date).add(Number(this.advanceForm.value.months) - 1, 'month').format("YYYY-MM-DD");
				let monthly_deduction = Number(value) / Number(this.advanceForm.value.months);
				let advance_limit = Number(this.advanceForm.value.actual_salary) * 0.5;
				this.advanceForm.patchValue({
					monthly_deduction: roundAmount(monthly_deduction),
					end_date: end_date
				});
				this.advanceForm.get('monthly_deduction').setValidators([Validators.required, Validators.max(advance_limit)]);
				this.advance_installments = [];
				if (roundAmount(monthly_deduction) > advance_limit) {
					this.toasterService.pop('error', 'Alert', 'Advance Limit or Monthly Installments Exceed');
				} if (this.advanceForm.value.advance_amount > (this.advanceForm.value.actual_salary * 2)) {
					this.toasterService.pop('error', 'Alert', 'Advance Limit Exceed');
				} else {
					this.calculateAdvanceInstallments(end_date, monthly_deduction);
				}
			}
		}
		if (type == 'Advance_Months') {
			if (Number(value) > 0 && Number(value) <= 11) {
				let end_date = moment(this.advanceForm.value.start_date).add(Number(value) - 1, 'month').format("YYYY-MM-DD");
				let monthly_deduction = Number(this.advanceForm.value.advance_amount) / Number(value);
				let advance_limit = Number(this.advanceForm.value.actual_salary) * 0.5;
				this.advanceForm.patchValue({
					monthly_deduction: roundAmount(monthly_deduction),
					end_date: end_date
				});
				this.advanceForm.get('monthly_deduction').setValidators([Validators.required, Validators.max(advance_limit)]);
				this.advance_installments = [];
				if (roundAmount(monthly_deduction) > advance_limit) {
					this.toasterService.pop('error', 'Alert', 'Advance Limit or Monthly Installments Exceed');
				} else {
					this.calculateAdvanceInstallments(end_date, monthly_deduction);
				}
			}
		}
	}

	calculateAdvanceInstallments(end_date, monthly_deduction) {
		var startDate = moment(this.advanceForm.value.start_date, "YYYY-M-DD");
		var endDate = moment(end_date, "YYYY-M-DD").endOf("month");
		while (startDate.isBefore(endDate)) {
			let obj = {
				installment_month: startDate.format("MMM YYYY"),
				installment_date: startDate.format("YYYY-MM-DD"),
				installment_amount: roundAmount(monthly_deduction)
			};
			this.advance_installments.push(obj);
			startDate = startDate.add(1, "month");
		};
	}

	submitAdvanceForm() {
		let advance_data = {
			emp_id: Number(this.advanceForm.value.emp_id),
			financial_year: this.advanceForm.value.financial_year,
			advance_amount: Number(this.advanceForm.value.advance_amount),
			advance_date: moment(this.advanceForm.value.advance_date).format("YYYY-MM-DD"),
			start_date: moment(this.advanceForm.value.start_date).format("YYYY-MM-DD"),
			end_date: moment(this.advanceForm.value.end_date).format("YYYY-MM-DD")
		};

		let advance_installments_data = [];

		this.advance_installments.forEach(element => {
			let obj = {
				installment_date: moment(element.installment_date).format("YYYY-MM-DD"),
				installment_amount: roundAmount(element.installment_amount)
			};
			advance_installments_data.push(obj);
		});

		let body = {
			advance: advance_data,
			advance_installments: advance_installments_data
		};

		this.crudServices.addData<any>(Advance.add, body).subscribe(res => {
			if (res.code == '100') {
				this.closeModal();
				this.getEmployeeAdvance();
			}
		});

	}

	onActionInvestment(item, type) {
		this.tdsCalculatorForm.reset();
		if (type == 'Financial_Year') {
			if (item != null && item != undefined && item != "Select Financial Year") {
				let years = item.split('-');
				if (Number(years[0]) == (new Date()).getFullYear()) {
					this.activeInvestment = true;
				} else {
					this.activeInvestment = false;
				}
				this.active_investment_tab = item;
				this.getInvestmentType(item);
			} else {
				this.onActionInvestment('Instructions', 'Instructions');
			}
		} else {
			this.active_investment_tab = type;
			if (type == 'Calculator') {
				this.crudServices.getOne<any>(MonthlySalaryNew.getEmpYearlyCTC, {
					emp_id: this.id,
					financial_year: this.selected_financial_year
				}).subscribe(res_ctc => {
					if (res_ctc.code == '100') {
						if (res_ctc.data.length > 0) {
							this.tdsDetails = res_ctc.data[0];
							this.tdsCalculatorForm.patchValue({
								annual_ctc: Number(res_ctc.data[0].annual_ctc),
								bonus: Number(res_ctc.data[0].bonus),
								incentive: Number(res_ctc.data[0].incentive),
								standard_deduction: Number(res_ctc.data[0].standard_deduction),
								income_other_source: 0,
								hra: 0,
								section_80c: 0,
								section_80ccd: 0,
								section_80d: 0,
								section_80g: 0,
								section_others: 0,
								annual_tds: 0,
							});
							this.tdsDetails.actual_incentive = 0;
							this.tdsDetails.actual_rent_paid = 0;
							this.tdsDetails.section_80c = 0;
							this.tdsDetails.section_80ccd = 0;
							this.tdsDetails.section_80d = 0;
							this.tdsDetails.section_80g = 0;
							this.tdsDetails.section_others = 0;
							this.tdsDetails.other_income = 0;
							this.tdsCalculation();
						}
					}
				});
			} else if (type == 'Form16') {
				this.empForm16List = [];
				this.crudServices.getOne<any>(EmployeeForm16.getEmployeeForm16, {
					emp_id: this.id
				}).subscribe(res_form => {
					if (res_form.code == '100') {
						if (res_form.data.length > 0) {
							res_form.data.forEach(element => {
								element.form_16_arr = JSON.parse(element.form_16_copy);
							});
							this.empForm16List = res_form.data;
						}
					}
				});
			}
		}
	}

	onAction(item, type) {
		if (type == "Attendance_Date") {
			let current_date = moment().format("YYYY-MM-DD");
			let check_date = moment(item.date).format("YYYY-MM-DD");
			let events = item.events;
			if (events.length > 0) {
				if (!events[0].is_holiday && events[0].status != "Sunday" && events[0].status != "Leave" && events[0].status != "WFH") {
					if (this.updatePermission && moment(item.date).isBefore(moment()) && (current_date != check_date)) {
						if (this.role_id == 1) {
							this.showUpdateAttendanceModal(item.date);
						} else if (this.role_id == 3) {
							if (this.login_id != this.id && item.events[0].status != "P") {
								this.showUpdateAttendanceModal(item.date);
							}
						} else {
							// 
						}
					}
				}
			}
		}
		if (type == "Add_Leave") {
			this.leaveForm.reset();
			this.addLeaveModal.show();
		}
		if (type == "Edit_Leave") {
			this.crudServices.getOne<any>(Leaves.getOneLeave, {
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.leave_id = item.id;
					this.editLeave = true;
					this.leaveForm.patchValue({
						leave_category: res.data[0].leave_category,
						leave_type: res.data[0].leave_type,
						from_date: res.data[0].from_date,
						to_date: res.data[0].to_date,
						reason: res.data[0].reason
					});
					this.addLeaveModal.show();
				}
			});
		}
		if (type == "Delete_Leave") {
			this.crudServices.deleteData<any>(Leaves.delete, {
				id: item.id
			}).subscribe(response => {
				if (response.code == '100') {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getLeaves(this.id);
				} else {
					this.toasterService.pop('error', 'error', 'Something Went Wrong');
				}
			});
		}
		if (type == "Add_CTC") {
			let financial_year_dates = this.commonService.getFinancialYearDates(moment().format("YYYY-MM-DD"));
			let dates = financial_year_dates.split("=");
			this.isEditYearlyCTC = false;
			this.yearlyCTCForm.patchValue({
				id: null,
				emp_id: this.id,
				financial_year: this.commonService.getCurrentFinancialYear(),
				from_date: moment(dates[0]).format("YYYY-MM-DD"),
				to_date: moment(dates[1]).format("YYYY-MM-DD"),
				annual_ctc: null,
				basic: null,
				da: null,
				hra: null,
				lta: null,
				child_edu_allowance: null,
				special_allowance: null,
				employee_pf: null,
				employer_pf: null,
				feb_pt: null,
				other_pt: null,
				bonus: null,
				incentive: null
			});
			this.updateYearlyCTCModal.show();
		}
		if (type == "Edit_CTC") {
			this.isEditYearlyCTC = true;
			this.yearlyCTCForm.patchValue({
				id: item.id,
				emp_id: item.emp_id,
				financial_year: item.financial_year,
				from_date: item.from_date,
				to_date: item.to_date,
				annual_ctc: item.annual_ctc,
				basic: item.basic,
				da: item.da,
				hra: item.hra,
				lta: item.lta,
				child_edu_allowance: item.child_edu_allowance,
				special_allowance: item.special_allowance,
				employee_pf: item.employee_pf,
				employer_pf: item.employer_pf,
				feb_pt: item.feb_pt,
				other_pt: item.other_pt,
				bonus: item.bonus,
				incentive: item.incentive
			});
			this.updateYearlyCTCModal.show();
		}
		if (type == "Delete_CTC") {
			this.crudServices.deleteData<any>(YearlyCTCNew.deleteData, {
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, res.message, res.data);
					this.getAnnualCTC();
				} else {
					this.toasterService.pop(res.message, res.message, 'Something Went Wrong!!');
				}
			});
		}
		if (type == "Add_Advance") {
			this.advanceForm.reset();
			this.crudServices.getOne<any>(MonthlySalaryNew.getSalaryDetailsForAdvance, {
				emp_id: this.id,
				financial_year: this.selected_financial_year
			}).subscribe(res_salary => {
				if (res_salary.code == '100') {

					this.advanceMonths = staticValues.advance_months.filter(o => o.value <= (res_salary.data.length - 1));

					if (res_salary.data.length > 0) {
						res_salary.data.forEach(element => {
							element.actual_salary = Number(element.net_salary) - (Number(element.tds) + Number(element.arrear_minus));
						});
						const total_salary_left = res_salary.data.reduce((a, o) => {
							return a + o.actual_salary;
						}, 0);
						let start_date = new Date(moment().add(1, 'month').startOf('month').format("YYYY-MM-DD"));

						this.advanceForm.patchValue({
							emp_id: this.id,
							financial_year: this.selected_financial_year,
							advance_date: new Date(),
							start_date: start_date,
							actual_salary: res_salary.data[0].actual_salary,
							total_salary_left: total_salary_left,
							months: 1
						});

						let advance_limit = Number(res_salary.data[0].actual_salary) * 0.5;
						this.advanceForm.get('monthly_deduction').setValidators([Validators.required, Validators.max(advance_limit)]);

						this.advanceModal.show();
					}
				}
			});
		}
		if (type == 'Advance_Installments') {
			this.advance_installments = [];
			this.crudServices.getOne<any>(Advance.getAdvanceInstallments, {
				advance_id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						res.data.forEach(element => {
							element.installment_month = moment(element.installment_date).format("MMM YYYY");
						});
						this.advance_installments = res.data;
						this.advanceInstallmentsModal.show();
					}
				}
			});
		}
		if (type == 'Salary_Slip') {
			let month = moment(this.viewDate).format('MM');
			let year = moment(this.viewDate).format('YYYY');
			this.crudServices.getOne<any>(MonthlySalaryNew.getEmpMonthlySalary, {
				year: year,
				month: month,
				emp_id: this.id
			}).subscribe(res_sal => {
				if (res_sal.code == '100') {
					if (res_sal.data.length > 0) {
						if (res_sal.data[0].status == 1) {
							this.generateDocs.salarySlipNew(res_sal.data[0], this.viewDate);
						} else {
							this.toasterService.pop('error', 'Alert', 'Salary Slip Not Generated');
						}
					}
				}
			});
		}
		if (type == 'Salary_Break_Up') {
			this.generateDocs.salaryBreakup(item);
		}
		if (type == 'Appointment_Letter') {
			this.generateDocs.appointmentLetter(item);
		}
		if (type == 'Relieving_Letter') {
			this.generateDocs.relievingLetter(item);
		}
		if (type == "Update_Relieving_Date") {
			this.crudServices.updateData<any>(StaffMemberMaster.updateRelievingDate, {
				emp_id: this.id,
				relieving_date: this.relieving_date
			}).subscribe(res => {
				this.relieving_date = null;
				this.getEmployeeDetails();
			});
		}
		if (type == "Remove_Relieving_Date") {
			this.crudServices.updateData<any>(StaffMemberMaster.updateRelievingDate, {
				emp_id: this.id,
				relieving_date: null
			}).subscribe(res => {
				this.relieving_date = null;
				this.getEmployeeDetails();
			});
		}
	}

	getMaritalStatus(value) {
		if (value == 1) {
			return 'Unmarried';
		} else if (value == 2) {
			return "Married";
		} else if (value == 3) {
			return "Widowed";
		} else if (value == 4) {
			return "Divorced";
		} else if (value == 5) {
			return "Separated";
		}
	}

	getLeaveCategory(leave_category) {
		if (leave_category == 1) {
			return "Personal";
		} else if (leave_category == 2) {
			return "Official";
		}
	}

	getLeaveType(leave_type) {
		if (leave_type == 1) {
			return "Late Check-In";
		} else if (leave_type == 2) {
			return "Early Check-Out";
		} else if (leave_type == 3) {
			return "Half-Day";
		} else if (leave_type == 4) {
			return "Leave";
		} else if (leave_type == 5) {
			return "Work From Home";
		} else if (leave_type == 6) {
			return "Maternity Leave";
		} else if (leave_type == 7) {
			return "Godown Visit";
		} else if (leave_type == 8) {
			return "Banking/Taxation/PF";
		} else if (leave_type == 9) {
			return "Other - Official Work";
		} else if (leave_type == 10) {
			return "Client Visit";
		}
	}

	getStatus(status: number) {
		if (status === 0) {
			return '<span class=" badge-primary">Pending</span>';
		} else if (status === 1) {
			return '<span class="badge badge-success">Approved</span>';
		} else if (status === 2) {
			return '<span class="badge badge-danger">Rejected<span>';
		}
	}

	getInvestmentStatus(item) {
		let status = '<span class="badge badge-primary">Not Filled</span>';
		if (item.budgeted_details != null && item.actual_details != undefined) {
			if (item.status === 'Pending') {
				status = '<span class="badge badge-warning">Pending</span>';
			} else if (item.status === 'Rejected') {
				status = '<span class="badge badge-danger">Rejected</span>';
			} else if (item.status === 'Verified') {
				status = '<span class="badge badge-success">Verified</span>';
			}
		}
		return status;
	}

	onTabChange(event) {
		this.investmentFlag = false;
		if (event.index == 0) { // Personal Details
			// 
		} else if (event.index == 1) { // Attendance
			this.getEmployeeAttendance(this.viewDate);
		} else if (event.index == 2) { // Leaves
			this.getLeaves(this.id);
		} else if (event.index == 3) { // Salary Details
			this.getAnnualCTC();
		} else if (event.index == 4) { // Investments
			this.getTDSDate();
		} else if (event.index == 5) { // Expenses Details
			// 
		} else if (event.index == 6) { // Advance
			this.getEmployeeAdvance();
		}
	}

	closeModal() {
		this.leave_id = null;
		this.editLeave = false;

		this.leaveForm.reset();
		this.addLeaveModal.hide();

		this.passwordForm.reset();
		this.changePasswordModal.hide();

		this.profilePhotoForm.reset();
		this.changeProfilePhotoModal.hide();

		this.attendanceForm.reset();
		this.updateAttendanceModal.hide();

		this.yearlyCTCForm.reset();
		this.updateYearlyCTCModal.hide();

		this.advanceForm.reset();
		this.advanceModal.hide();

		this.advanceInstallmentsModal.hide();
	}

}
