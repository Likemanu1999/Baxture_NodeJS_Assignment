import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HrServices } from '../hr-services';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { ExportService } from '../../../shared/export-service/export-service';
import { SalaryResultList, SalaryResult } from './salary-result-model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { environment } from '../../../../environments/environment';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { MonthlySalary, YearCtc } from '../../../shared/apis-path/apis-path';
import { NullReplacePipe } from '../../../shared/null-replace/null-replace.pipe';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-salary-calculator',
	templateUrl: './salary-calculator.component.html',
	styleUrls: ['./salary-calculator.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [HrServices, ExportService, DatePipe, CommonService, ToasterService, CrudServices, NullReplacePipe]
})
export class SalaryCalculatorComponent implements OnInit {
	isLoading: boolean = false;
	salaryResult: SalaryResultList;
	bsValue: Date = new Date();
	bsValue2: Date = new Date();
	selectedDate: Date;
	minMode: BsDatepickerViewMode = 'month';
	bsConfig: Partial<BsDatepickerConfig>;
	exportColumns: any[];
	cols: any[];
	inputCss: string;
	isDisabled: boolean = false;
	fileName: string;
	checkedList = [];
	showMailBtn: boolean = false;
	calculateMonth: any;
	calculateYear: any;
	user: UserDetails;
	all_salary_cal: boolean;

	links: string[] = [];
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			positionClass: 'toast-bottom-right',
			timeout: 5000
		});
	Activeoperation: boolean = false;
	cols_yearly: { field: string; header: string; }[];
	yearly_data = [];
	constructor(private hrServices: HrServices,
		private exportService: ExportService,
		private datePipe: DatePipe,
		private toasterService: ToasterService,
		private commonService: CommonService,
		private crudServices: CrudServices, private nullReplacePipe: NullReplacePipe,
		private loginService: LoginService,) {

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.all_salary_cal = (this.links.indexOf('all_salary_cal') > -1);


		this.cols = [
			{ field: 'id', header: 'Salary Id' },
			{ field: 'emp_id', header: 'Emp. No' },
			{ field: 'emp_name', header: 'Name' },
			{ field: 'net_salary', header: 'Net Salary' },
			{ field: 'total_month_days', header: 'Present Days' },
			{ field: 'total_absent', header: 'Absent Days' },
			{ field: 'arrear_plus', header: 'Arrears Plus' },
			{ field: 'arrear_plus_rmk', header: 'Arrears + Remark' },
			{ field: 'arrear_deduction', header: 'Arrears Minus' },
			{ field: 'arrear_deduction_rmk', header: 'Arrears - Remark' },
			{ field: 'tds', header: 'TDS' },
			{ field: 'bonus', header: 'Bonus' },
			{ field: 'performance_bonus', header: 'Performance Bonus' },
			{ field: 'incentive', header: 'Incentive' },
			{ field: 'incentive_tds', header: 'TDS On Incentive' },
		];


		this.cols_yearly = [

			{ field: 'staff_name', header: 'Name' },
			{ field: 'financial_year', header: 'Financial_year' },
			{ field: 'yearly_ctc', header: 'Yearly CTC' },
			{ field: 'basic', header: 'Basic' },
			{ field: 'da', header: 'DA' },
			{ field: 'hra', header: 'HRA' },
			{ field: 'lta', header: 'LTA' },
			{ field: 'child_edu_allowance', header: 'Child Edu Allowance' },
			{ field: 'incentive', header: 'Incentive' },
			{ field: 'yearly_pf', header: 'Yearly PF' },
			{ field: 'yearly_pt', header: 'Yearly PT' },
			{ field: 'employer_pf', header: 'Employer PF' },
			{ field: 'bonus', header: 'Bonus' },

		];
		this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
	}
	ngOnInit() {
		this.bsConfig = Object.assign({}, {
			minMode: this.minMode,
			dateInputFormat: 'MM-YYYY',
			adaptivePosition: true
		});


	}

	getYearlyData() {
		this.crudServices.getOne<any>(YearCtc.getAll, { date: this.datePipe.transform(this.bsValue2, 'yyyy-MM-dd') }).subscribe(response => {
			this.yearly_data = response.data
		})
	}
	/**
	*There is two option for salary calculation one is view calculated salary another is calculate whole salary.
	*Passing flag to this function (1 -> calculate 2-> view) to calculate salary of selected month.
	*/
	onValueChange(flag: number, emp_id): void {
		this.isDisabled = true;
		this.selectedDate = this.bsValue;
		this.calculateMonth = this.selectedDate.getMonth() + 1;
		this.calculateYear = Number(this.selectedDate.getFullYear());

		let financial_year = '';
		if (this.calculateMonth <= 3) {
			financial_year = (this.calculateYear - 1) + '-' + this.calculateYear;
		} else {
			financial_year = this.calculateYear + '-' + (this.calculateYear + 1);
		}
		this.salaryResult = null;
		this.fileName = this.calculateMonth + '' + financial_year;
		this.calculateSalary(financial_year, this.calculateMonth, this.calculateYear, flag, emp_id);
	}
	/**
	* This function is used to get calculation by passing parameters to the backend.
	*/
	calculateSalary(financial_year, month, year, flag, emp_id) {
		this.isLoading = true;
		this.crudServices.getOne<any>(MonthlySalary.calculateSalaryAttendance, {
			emp_id: emp_id,
			financial_year: financial_year,
			month: month,
			year: year,
			flag: flag,
			date: this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')
		}).subscribe((response: SalaryResultList | any) => {
			if (response.code === '101') {
				this.toasterService.pop('error', 'error', 'Something Went Wrong');
			} else {
				this.salaryResult = response;
			}
			this.uncheckAll();
			this.isLoading = false;
			this.isDisabled = false;
		});
	}
	exportPdf() {
		this.exportService.exportPdf(this.exportColumns, this.salaryResult, 'SalaryWorking_' + this.fileName);
	}

	exportExcel() {
		this.exportService.exportExcel(this.salaryResult, 'SalaryWorking_' + this.fileName);
	}

	exportExcel2() {
		let export_list = [];
		let year = Number(this.bsValue2.getFullYear());


		for (let i = 0; i < this.yearly_data.length; i++) {
			const exportData = {};
			for (let j = 0; j < this.cols_yearly.length; j++) {
				if (this.cols_yearly[j]["header"] != "Action") {
					exportData[this.cols_yearly[j]["header"]] =
						this.yearly_data[i][this.cols_yearly[j]["field"]];
				}
			}
			export_list.push(exportData);
		}
		this.exportService.exportExcel(export_list, 'Yearly_CTC_Report');
	}
	/**
	* On all check checkox click this function gets called.
	Checks all checkbox and create checkedList array if checkbox checked otherwise unchecked all checkbox in list and remove from checkedList array.
	*/
	onCheckAll(checked) {
		this.uncheckAll();
		let arr = [];
		if (this.salaryResult === undefined) {
			arr = this.salaryResult;
		} else {
			arr = this.salaryResult;
		}
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				this.checkedList.push(val);
			}
		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				this.checkedList.splice(this.checkedList.indexOf(val), 1);
			}
		}
		this.showSendBtn();
	}
	/**
	* On single checkbox click this method gets executed and check for checked or unchecked clicked checkbox
	*/
	onCheck(checked, item) {
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}
		this.showSendBtn();
	}
	/**
	*To mark all checkbox as unchecked this method is used.
	*/
	uncheckAll() {
		this.inputs.forEach(check => {
			check.nativeElement.checked = false;
		});
		this.checkedList = [];
		this.showSendBtn();
	}
	/**
	*This method checks checkList array having some item or not based on that hide show send mail button.
	*/
	showSendBtn() {
		if (this.checkedList.length > 0) {
			this.showMailBtn = true;
		} else {
			this.showMailBtn = false;
		}
	}
	/**
	* Two options available for salary slip one is download in pdf format other is send pdf in email.
	we have checkList array contains list of checked/selected record we loop through the records & send item & action to createPdfFormat function as parameter which will handle remaining operation.
	*/
	pdfOPtions(action: number) {
		this.Activeoperation = true;
		this.checkedList.forEach(element => {
			this.createPdfFormat(element, action);
		});
		this.Activeoperation = false;
		// this.Activeoperation = false;
	}
	/**
	* This function creates pdf of salary slip information based on action it send email or force to download pdf of salary slip.
	by using pdf make liberary we are creating pdf.
	*/
	async createPdfFormat(row: SalaryResult, action: number) {
		const totalDeductions = Number(row.tds) + Number(row.pf) + Number((row.pt_feb) + (row.pt_other_month)) + Number(row.arrear_deduction) + Number(row.ten_percent) + Number(row.esi_employee);
		const totalEarnings = row.basic + row.da + row.hra + row.lta + row.child_edu_allowance + row.special_allowance;
		let tenPercentTitle1 = '';
		let tenPercentTitle2 = '';
		let tenPercentValue = '';
		if (row.ten_percent > 0) {
			tenPercentTitle1 = '10% Deduction';
			tenPercentTitle2 = '\n (Refundable)';
			tenPercentValue = this.commonService.getMoneyIndianFormat(String(row.ten_percent));
		}
		const mlist = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		const late = ((row.total_late > 3) ? (row.total_late - 3) * 0.25 : 0);
		const early = ((row.total_early > 3) ? (row.total_early - 3) * 0.25 : 0);
		const half = ((row.total_half > 0) ? (row.total_half) * 0.5 : 0);
		const totalUnpaid = late + early + half + row.total_absent;
		let arr_minus = '';
		let arr_plus = '';
		let esi = '';
		let tds = '';

		esi = this.commonService.getMoneyIndianFormat(String(row.esi_employee));
		if (row.arrear_deduction !== null) {
			arr_minus = this.commonService.getMoneyIndianFormat(String(row.arrear_deduction));
		}

		if (row.arrear_plus !== null) {
			arr_plus = this.commonService.getMoneyIndianFormat(String(row.arrear_plus));
		}

		if (row.tds !== null) {
			tds = this.commonService.getMoneyIndianFormat(String(row.tds));
		}





		const docDefinition = {
			content: [
				{
					style: 'tableExample',
					color: '#444',
					table: {
						widths: ['auto', 'auto', 'auto', 'auto'],
						headerRows: 1,
						// keepWithHeaderRows: 1,
						body: [
							[
								{
									image: await this.exportService.getBase64ImageFromURL(
										'assets/img/brand/parmar_logo.png'
									),
									margin: [40, 5, 0, 5],
									width: 60,
									height: 60,
									alignment: 'left',
									border: [true, true, false, true],
								},
								{
									text:
										[
											{
												text: 'Sushila Parmar International Pvt. Ltd.\n',
												fontSize: 18,
												bold: true,
												alignment: 'left',
											},
											{
												text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.',
												fontSize: 8,
												alignment: 'left',
											},
										],
									colSpan: 3,
									margin: [0, 18, 0, 0],
									border: [false, true, true, false],

								}, {}, {}
							],
							[
								{
									text:
										[
											{ text: 'Payslip for ' + mlist[row.month - 1] + '-' + this.calculateYear + ' : ' },
											{ text: row.emp_name },
										],
									style: 'tableHeader',
									colSpan: 4,
									alignment: 'center',
									bold: true,
								}, {}, {}, {}
							],



							[
								{
									text: [
										{ text: 'Emp No.: ', fontSize: '10', bold: true, },
										{ text: row.emp_id, fontSize: '10', bold: true, },
									],
									border: [true, true, false, false],


								},
								{
									text: [
										{ text: 'Present Days: ', fontSize: '10', bold: true, },
										{ text: row.total_month_days, fontSize: '10', bold: true, },
									],
									border: [false, true, false, false],

								},
								{
									text: [
										{ text: 'Appt. Date: ', fontSize: '10', bold: true, },
										{ text: this.datePipe.transform(row.appointment_date, 'dd-MM-yyyy'), fontSize: '10', bold: true, },
									],
									border: [false, true, false, false],

								},
								{
									text: [
										{ text: 'Date: ', fontSize: '10', bold: true, },
										{ text: this.datePipe.transform(Date.now(), 'dd-MM-yyyy'), fontSize: '10', bold: true, },
									],
									border: [false, true, true, false],

								},
							],
							[

								{
									text: [
										{ text: 'Bank: ', fontSize: '10', bold: true, },
										{ text: row.bank_name, fontSize: '10', bold: true, },
									],
									border: [true, false, false, false],

								},
								{
									text: [
										{ text: 'A/c. No.: ', fontSize: '10', bold: true, },
										{ text: row.bank_account_no, fontSize: '10', bold: true, },
									],
									border: [false, false, false, false],

								},
								{
									text: [
										{ text: 'PAN No.: ', fontSize: '10', bold: true, },
										{ text: row.pan_no, fontSize: '10', bold: true, },
									],
									border: [false, false, false, false],

								},
								{
									text: [
										{ text: 'UAN: ', fontSize: '10', bold: true, },
										{ text: this.nullReplacePipe.transform(row.uan_no), fontSize: '10', bold: true, },
									],
									border: [false, false, true, false],
								},
							],
							[
								{
									text: 'Earnings',
									fontSize: 12,
									bold: true,
									alignment: 'left',

								},
								{
									text: 'Amount',
									fontSize: 12,
									bold: true,
									alignment: 'center',


								},
								{
									text: 'Deductions',
									fontSize: 11,
									bold: true,
									alignment: 'left',

								},
								{
									text: 'Amount',
									fontSize: 11,
									bold: true,
									alignment: 'center',

								}
							],

							[
								{
									text: 'Basic',
									alignment: 'left',
									border: [true, true, true, false],
									bold: true,
								},
								{

									text: this.commonService.getMoneyIndianFormat(String(row.basic)),
									alignment: 'center',
									border: [false, true, true, false],
									bold: true,
								},
								{
									text:
										[
											{ text: ' Professional Tax1', bold: true, },
											{ text: '\n (as applicable in some states)', fontSize: 9, }

										],
									alignment: 'left',
									border: [false, true, true, false],

								},
								{
									text: this.commonService.getMoneyIndianFormat(String((row.pt_feb) + (row.pt_other_month))),
									alignment: 'center',
									border: [false, true, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'DA',
									alignment: 'left',
									border: [true, false, true, false],
									bold: true,
								},
								{

									text: this.commonService.getMoneyIndianFormat(String(row.da)),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'PF',
									alignment: 'left',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: this.commonService.getMoneyIndianFormat(String(row.pf)),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'HRA',
									alignment: 'left',
									border: [true, false, true, false],
									bold: true,
								},
								{

									text: this.commonService.getMoneyIndianFormat(String(row.hra)),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'TDS',
									alignment: 'left',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: tds,
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'LTA',
									alignment: 'left',
									border: [true, false, true, false],
									bold: true,
								},
								{

									text: this.commonService.getMoneyIndianFormat(String(row.lta)),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text:
										[
											{ text: tenPercentTitle1, bold: true, },
											{ text: tenPercentTitle2, fontSize: 9, }
										],
									alignment: 'left',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: tenPercentValue,
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'Child Edu. Allowance',
									alignment: 'left',
									border: [true, false, true, false],
									bold: true,
								},
								{

									text: this.commonService.getMoneyIndianFormat(String(row.child_edu_allowance)),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'Arrears(+)',
									alignment: 'left',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: arr_plus,
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'Special Allowance',
									alignment: 'left',
									border: [true, false, true, false],
									bold: true,
								},
								{

									text: this.commonService.getMoneyIndianFormat(String(row.special_allowance)),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'Arrears(-)',
									alignment: 'left',
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: arr_minus,
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								},
							],


							[
								{
									text: '',
									alignment: 'left',
									border: [true, false, true, true],
									bold: true,
								},
								{

									text: '',
									alignment: 'center',
									border: [false, false, true, true],
									bold: true,
								},
								{
									text: 'ESI',
									alignment: 'left',
									border: [false, false, true, true],
									bold: true,
								},
								{
									text: esi,
									alignment: 'center',
									border: [false, false, true, true],
									bold: true,
								},
							],


							[
								{
									text: 'Gross Earnings (A):',
									alignment: 'left',
									border: [true, false, false, true],
									bold: true,

								},
								{
									text: this.commonService.getMoneyIndianFormat(String(totalEarnings)),
									alignment: 'center',
									border: [false, false, true, true],
									bold: true,


								},
								{
									text: 'Deductions (B) :',
									alignment: 'left',
									border: [true, false, false, true],
									bold: true,

								},
								{
									text: this.commonService.getMoneyIndianFormat(String(totalDeductions)),
									alignment: 'center',
									border: [false, false, true, true],
									bold: true,


								},
							], [
								{
									text: 'Monthly CTC: (C)',
									alignment: 'left',
									border: [true, false, false, true],
									bold: true,

								},
								{
									text: this.commonService.getMoneyIndianFormat(String(row.gross_salary + row.employer_pf)),
									alignment: 'center',
									border: [false, false, true, true],
									bold: true,


								},
								{
									text: 'Employer PF : (D)',
									alignment: 'left',
									border: [true, false, false, true],
									bold: true,

								},
								{
									text: this.commonService.getMoneyIndianFormat(String(row.employer_pf)),
									alignment: 'center',
									border: [false, false, true, true],
									bold: true,


								},
							],
							[
								{
									text: 'Fixed Gross Salary : (C-D)',
									alignment: 'left',
									bold: true,
									border: [true, true, false, true],

								},
								{
									text: this.commonService.getMoneyIndianFormat(String(row.gross_salary)),
									alignment: 'center',
									bold: true,
									border: [false, true, false, true],

								},
								{
									text: '',
									alignment: 'center',
									bold: true,
									border: [false, true, true, true],

									colSpan: 2
								}, {}
							],
							[
								{
									text: 'Net Salary Payable (A-B) : \t\t' + this.commonService.getMoneyIndianFormat(String(row.net_salary)),
									colSpan: 4,
									alignment: 'left',
									bold: true,
									border: [true, true, true, true],

								}, {},
								{}, {}
							],
							[
								{
									text: 'Unpaid Days Calculation',
									colSpan: 4,
									alignment: 'center',
									bold: true,
									border: [true, true, true, true],

								}, {},
								{}, {}
							],
							[
								{
									text: 'Reasons',
									colSpan: 2,
									alignment: 'center',
									bold: true,
									border: [true, false, true, true],

								}, {},
								{
									text: 'Unpaid Unit',
									alignment: 'center',
									bold: true,
									border: [true, false, true, true],

								},
								{
									text: 'Unpaid Days',
									alignment: 'center',
									bold: true,
									border: [true, false, true, true],

								},
							],
							[
								{
									text: 'Days Absent',
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, true, false],
									bold: true,
								}, {},
								{
									text: parseFloat(row.total_absent).toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}, {
									text: parseFloat(row.total_absent).toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Late Check In',
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, true, false],
									bold: true,
								}, {},
								{
									text: parseFloat(row.total_late).toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}, {
									text: late.toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Early Check Out',
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, true, false],
									bold: true,
								}, {},
								{
									text: parseFloat(row.total_early).toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}, {
									text: early.toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Half Days',
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, true, false],
									bold: true,
								}, {},
								{
									text: parseFloat(row.total_half).toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}, {
									text: half.toFixed(2),
									alignment: 'center',
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Total',
									bold: true,
									colSpan: 3,
									alignment: 'left',
									margin: [5, 0],
									border: [true, true, false, true],

								}, {}, {},
								{
									text: totalUnpaid.toFixed(2),
									bold: true,
									alignment: 'center',
									border: [true, true, true, true],
								},
							],
							[
								{
									text: 'Paid Leave Balance 9 + Leave Remaining From Previous Year',
									bold: true,
									colSpan: 3,
									alignment: 'left',
									margin: [5, 0],
									border: [true, true, false, true],
								}, {}, {},
								{
									text: parseFloat(row.tot_leave).toFixed(2),
									bold: true,
									alignment: 'center',
									border: [true, true, true, true],
								},
							],
							[
								{
									text: 'Balance Leaves',
									bold: true,
									colSpan: 3,
									alignment: 'left',
									margin: [5, 0],
									border: [true, true, false, true],
								}, {}, {},
								{
									text: parseFloat(row.nxt_rem_bal).toFixed(2),
									bold: true,
									alignment: 'center',
									border: [true, true, true, true],
								},
							],
							[
								{
									text: 'Net Unpaid Days',
									bold: true,
									colSpan: 3,
									alignment: 'left',
									margin: [5, 0],
									border: [true, true, false, true],

								}, {}, {},
								{
									text: parseFloat(row.un_paid_leave).toFixed(2),
									bold: true,
									alignment: 'center',
									border: [true, true, true, true],
								},
							],
							[
								{
									text: 'For any Queries you are requested to contact concerned department between 7th to 10th.\n This is a computer-generated document, not requiring a signature. ',
									colSpan: 4,
									alignment: 'justify',
									border: [true, false, true, true],
								}, {},
								{}, {}
							],
						]
					}
				},
			],
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					margin: [0, 0, 0, 10]
				},
				tableExample: {
					margin: [20, 8, 0, 20]
				},
				tableHeader: {
					bold: true,
					fontSize: 13,
					color: 'black'
				}
			}
		};
		const file_name = (row.emp_name + mlist[row.month - 1] + '_' + this.calculateYear).replace(/ /g, '_') + '.pdf';
		if (action === 1) {
			pdfMake.createPdf(docDefinition).download(file_name);
			// pdfMake.createPdf(docDefinition).open({}, window);
		} else if (action === 2) {
			const sub = 'SParmar- PaySlip ' + mlist[row.month - 1] + '-' + this.calculateYear;
			const mailBody = '<p>Dear ' + row.emp_name + ',<br />\
        <br />\
        Good Day.<br />\
        <br />\
        Kindly find enclosed herewith PaySlip for the Month ' + mlist[row.month - 1] + '-' + this.calculateYear + '\
        <br />\
        Regards,<br />\
        <br />\
        Sushila Parmar International.</p>';
			const pdfDocGenerator = pdfMake.createPdf(docDefinition);
			pdfDocGenerator.getBase64((data) => {
				this.hrServices.sendMail(data, row.email, sub, mailBody, file_name)
					.subscribe((responsea) => {
						this.toasterService.pop(responsea.message, responsea.message, responsea.data);
					});
			});
		}
	}
	/**
	* This function gets called on enter keyup on any cell of table.
	we are passing event for getting value from it, id of record, the field name & index of record then we are creating object for posting data to backend.
	*/
	update($event, emp_id, id, field, index) {
		if (confirm('Are you sure to update record?')) {
			const object = { salary_id: id };
			object[field] = $event.target.value;
			this.crudServices.updateData<any>(MonthlySalary.salaryUpdate, object).subscribe((response: SalaryResultList | any) => {
				if (response.code !== '100') {
					this.salaryResult.splice(index, 1, response[0]);
				} else {
					this.toasterService.pop(response.message, response.message, response.data);
					this.onValueChange(1, emp_id);
				}
			});
		} else {
			// 
		}
	}


}
