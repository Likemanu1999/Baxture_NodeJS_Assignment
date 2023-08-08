import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HrServices } from '../hr-services';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { ExportService } from '../../../shared/export-service/export-service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { CommonService, staticValues } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { SalaryResultList, SalaryResult } from '../salary-calculator/salary-result-model';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { EmailTemplateMaster, FileUpload, MonthlySalary, ValueStore, MonthlySalaryNew, YearCtc } from '../../../shared/apis-path/apis-path';
import { NullReplacePipe } from '../../../shared/null-replace/null-replace.pipe';
import * as moment from "moment";
@Component({
	selector: 'app-salary-details-sheet',
	templateUrl: './salary-details-sheet.component.html',
	styleUrls: ['./salary-details-sheet.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [HrServices, ExportService, DatePipe, CommonService, ToasterService, CrudServices, NullReplacePipe]
})
export class SalaryDetailsSheetComponent implements OnInit {
	isLoading: boolean = false;
	salaryResult: SalaryResultList;
	salaryResult2: SalaryResultList;
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
	statusList: any = staticValues.yes_no_status;
	selected_status: any = this.statusList[2];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			positionClass: 'toast-bottom-right',
			timeout: 5000
		});


	all_salary_cal: boolean;
	cols1: { field: string; header: string; }[];
	cols2: { field: string; header: string; }[];
	sendData: any;
	subject: any;
	foot: any;
	total1: number;
	total2: number;
	month_year: string;
	bank_acc_no: any;
	bank_email: any;
	verify_salary_bank_mail: any;

	constructor(private hrServices: HrServices,
		private exportService: ExportService,
		private datePipe: DatePipe,
		private toasterService: ToasterService,
		private commonService: CommonService,
		private crudServices: CrudServices, private nullReplacePipe: NullReplacePipe) {
		this.cols1 = [
			{ field: 'id', header: 'Product Code' },
			{ field: 'debit_acc_number', header: 'Debit Account Number' },
			{ field: 'emp_name', header: 'Beneficiary Name' },
			{ field: 'net_salary', header: 'Instrument Amount' },
			{ field: 'ifsc_code', header: 'Beneficiary Bank IFSC Code ' },
			{ field: 'bank_account_no', header: 'Beneficiary Account Number' },

		];


		this.cols2 = [
			{ field: 'id', header: '4 Digit Serial No' },
			{ field: 'debit_acc_number', header: '14 Digit Debit Account No' },
			{ field: 'net_salary', header: 'Amount' },
			{ field: 'ifsc_code', header: '11 Digit IFSC Code' },
			{ field: 'bank_account_no', header: 'Beneficiary Account No' },
			{ field: 'emp_name', header: 'Name of the Beneficiary ' },
			{ field: 'acc_type_name', header: 'Type of Beneficiary Account (SB/CA)' },

		];
	}

	ngOnInit() {
		this.bsConfig = Object.assign({}, {
			minMode: this.minMode,
			dateInputFormat: 'MM-YYYY',
			adaptivePosition: true
		});
		this.onValueChange(2, 0);
		this.getBankDetails();

		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Salary Sheet' }).subscribe(response => {

			this.sendData = response[0].custom_html;
			this.subject = response[0].subject;

		})


		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {

			this.foot = response[0].custom_html;

		})
	}

	getBankDetails() {
		this.crudServices.getAll<any>(ValueStore.getAll).subscribe(response => {
			if (response) {

				response.forEach(element => {

					if (element.thekey == 'salary_bank_email') {
						this.bank_email = element.value;
					}

					if (element.thekey == 'salary_bank_acc_no') {
						this.bank_acc_no = element.value;
					}

					if (element.thekey == 'verify_salary_bank_mail') {
						this.verify_salary_bank_mail = element.value;
					}



				});



			}
		})
	}

	onValueChange(flag: number, emp_id): void {
		this.isDisabled = true;
		this.selectedDate = this.bsValue;
		this.calculateMonth = moment(this.selectedDate).format("MM"); //this.selectedDate.getMonth() + 1;
		this.calculateYear = moment(this.selectedDate).format("YYYY");//Number(this.selectedDate.getFullYear());
		const monthNames = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		this.month_year = `${monthNames[Number(this.calculateMonth) - 1]}  ${this.calculateYear}`;
		this.salaryResult = null;
		this.calculateSalary();
	}

	/**
	* This function is used to get calculation by passing parameters to the backend.
	*/
	calculateSalary() {
		let financial_year = this.commonService.getDateFinancialYear(this.selectedDate);
		this.fileName = this.calculateMonth + '' + financial_year;
		this.isLoading = true;
		this.crudServices.getOne<any>(MonthlySalaryNew.getMonthlySalaryNew, {
			month: this.calculateMonth,
			year: this.calculateYear,
			status: this.selected_status.id
		}).subscribe(res => {
			if (res.code === '101') {
				this.toasterService.pop('error', 'error', 'Something Went Wrong');
			} else {
				this.salaryResult = res.data.filter(item => item.bank_id == 1 && Number(item.net_salary) > 0);
				this.total1 = this.salaryResult.reduce((sum, item) => sum + Number(item.net_salary), 0);
				this.salaryResult2 = res.data.filter(item => item.bank_id != 1 && Number(item.net_salary) > 0);
				this.total2 = this.salaryResult2.reduce((sum, item) => sum + Number(item.net_salary), 0);
			}
			this.isLoading = false;
			this.isDisabled = false;
		});
	}


	exportExcel() {



		if (confirm("Send Mail To BOB")) {
			let export_list = [];
			let export_list2 = [];
			// let year = Number(this.bsValue.getFullYear());
			// let month = this.bsValue.getMonth();
			// const monthNames = ["January", "February", "March", "April", "May", "June",
			// 	"July", "August", "September", "October", "November", "December"
			// ];


			// let month_year = `${monthNames[month]}  ${year}`;
			const re = /{MONTH_YEAR}/gi;
			this.subject = this.subject.replace(re, this.month_year);
			this.sendData = this.sendData.replace(re, this.month_year);

			let Htmldata = this.sendData + this.foot



			for (let i = 0; i < this.salaryResult.length; i++) {
				const exportData = {};
				for (let j = 0; j < this.cols1.length; j++) {

					if (this.cols1[j]["field"] == "id") {
						exportData[this.cols1[j]["field"]] = i + 1
					} else if (this.cols1[j]["field"] == "debit_acc_number") {
						exportData[this.cols1[j]["field"]] = this.bank_acc_no;
					} else if (this.cols1[j]["field"] == "bank_account_no") {
						exportData[this.cols1[j]["field"]] = this.salaryResult[i][this.cols1[j]["field"]];
					} else if (this.cols1[j]["field"] == "net_salary") {
						exportData[this.cols1[j]["field"]] = this.salaryResult[i][this.cols1[j]["field"]].toFixed(2);
					}
					else {
						exportData[this.cols1[j]["field"]] =
							this.salaryResult[i][this.cols1[j]["field"]];
					}
				}
				export_list.push(exportData);
			}

			const foot = {
				'debit_acc_number': 'Total ',
				'net_salary': this.total1.toFixed(2)
			};

			export_list.push(foot);



			for (let i = 0; i < this.salaryResult2.length; i++) {
				const exportData2 = {};
				for (let j = 0; j < this.cols2.length; j++) {

					if (this.cols2[j]["field"] == "id") {
						exportData2[this.cols2[j]["field"]] = (i + 1).toString().padStart(4, "0")
					} else if (this.cols2[j]["field"] == "debit_acc_number") {
						exportData2[this.cols2[j]["field"]] = this.bank_acc_no;
					} else if (this.cols2[j]["field"] == "bank_account_no") {
						exportData2[this.cols2[j]["field"]] = this.salaryResult2[i][this.cols2[j]["field"]];
					} else if (this.cols2[j]["field"] == "net_salary") {
						exportData2[this.cols2[j]["field"]] = this.salaryResult2[i][this.cols2[j]["field"]].toFixed(2);
					}
					else {
						exportData2[this.cols2[j]["field"]] =
							this.salaryResult2[i][this.cols2[j]["field"]];
					}
				}
				export_list2.push(exportData2);
			}

			const foot1 = {
				'debit_acc_number': 'Total ',
				'net_salary': this.total2.toFixed(2)
			};
			export_list2.push(foot1);


			let header1 = this.cols1.map(
				obj => {
					return {
						"header": obj.header,
						"key": obj.field,

					}
				}
			);

			let header2 = this.cols2.map(
				obj => {
					return {
						"header": obj.header,
						"key": obj.field,

					}
				}
			);



			let data = {
				list1: export_list,
				list2: export_list2,
				header1: header1,
				header2: header2,
				tomail: this.bank_email,
				subject: this.subject,
				bodytext: Htmldata,
				file_name: this.month_year
			}



			this.isLoading = true;
			if (export_list.length) {

				this.crudServices.postRequest<any>(MonthlySalary.salarySheetMail, data).subscribe(response => {
					this.isLoading = false;
					this.toasterService.pop(response.message, response.message, response.data);
				})

			}

		}



	}

	exportExcelVerify() {



		if (confirm("Send Varification Mail ")) {
			let export_list = [];
			let export_list2 = [];

			const re = /{MONTH_YEAR}/gi;
			this.subject = this.subject.replace(re, this.month_year);
			this.sendData = this.sendData.replace(re, this.month_year);

			let Htmldata = this.sendData + this.foot



			for (let i = 0; i < this.salaryResult.length; i++) {
				const exportData = {};
				for (let j = 0; j < this.cols1.length; j++) {

					if (this.cols1[j]["field"] == "id") {
						exportData[this.cols1[j]["field"]] = i + 1
					} else if (this.cols1[j]["field"] == "debit_acc_number") {
						exportData[this.cols1[j]["field"]] = this.bank_acc_no;
					} else if (this.cols1[j]["field"] == "bank_account_no") {
						exportData[this.cols1[j]["field"]] = this.salaryResult[i][this.cols1[j]["field"]];
					} else if (this.cols1[j]["field"] == "net_salary") {
						exportData[this.cols1[j]["field"]] = this.salaryResult[i][this.cols1[j]["field"]].toFixed(2);
					}
					else {
						exportData[this.cols1[j]["field"]] =
							this.salaryResult[i][this.cols1[j]["field"]];
					}
				}
				export_list.push(exportData);
			}

			const foot = {
				'debit_acc_number': 'Total ',
				'net_salary': this.total1.toFixed(2)
			};

			export_list.push(foot);



			for (let i = 0; i < this.salaryResult2.length; i++) {
				const exportData2 = {};
				for (let j = 0; j < this.cols2.length; j++) {

					if (this.cols2[j]["field"] == "id") {
						exportData2[this.cols2[j]["field"]] = (i + 1).toString().padStart(4, "0")
					} else if (this.cols2[j]["field"] == "debit_acc_number") {
						exportData2[this.cols2[j]["field"]] = this.bank_acc_no;
					} else if (this.cols2[j]["field"] == "bank_account_no") {
						exportData2[this.cols2[j]["field"]] = this.salaryResult2[i][this.cols2[j]["field"]];
					} else if (this.cols2[j]["field"] == "net_salary") {
						exportData2[this.cols2[j]["field"]] = this.salaryResult2[i][this.cols2[j]["field"]].toFixed(2);
					}
					else {
						exportData2[this.cols2[j]["field"]] =
							this.salaryResult2[i][this.cols2[j]["field"]];
					}
				}
				export_list2.push(exportData2);
			}

			const foot1 = {
				'debit_acc_number': 'Total ',
				'net_salary': this.total2.toFixed(2)
			};
			export_list2.push(foot1);


			let header1 = this.cols1.map(
				obj => {
					return {
						"header": obj.header,
						"key": obj.field,

					}
				}
			);

			let header2 = this.cols2.map(
				obj => {
					return {
						"header": obj.header,
						"key": obj.field,

					}
				}
			);



			let data = {
				list1: export_list,
				list2: export_list2,
				header1: header1,
				header2: header2,
				tomail: this.verify_salary_bank_mail,
				subject: this.subject,
				bodytext: Htmldata,
				file_name: this.month_year
			}



			this.isLoading = true;
			if (export_list.length) {

				this.crudServices.postRequest<any>(MonthlySalary.salarySheetMail, data).subscribe(response => {
					this.isLoading = false;
					this.toasterService.pop(response.message, response.message, response.data);
				})

			}

		}



	}

	sendWhatsApp() {
		if (confirm("Send Whatsaap")) {
			this.toasterService.pop('success', 'success', 'Whatsapp Send');


			for (let val of this.salaryResult2) {

				this.createPdfFormat(val)


			}


			for (let val of this.salaryResult) {

				this.createPdfFormat(val)
			}
		}


	}



	async createPdfFormat(row: SalaryResult) {
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
		let pan = row.pan_no;
		let dob = row.dob;
		let salary_slip_password = this.commonService.salarySlipPasswordGenerate(pan, dob);



		const docDefinition = {
			userPassword: salary_slip_password,
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


		let fileData: FormData = new FormData();

		await pdfMake.createPdf(docDefinition).
			getBlob(data => {
				if (data) {
					fileData.append('salary_slip', data, 'Payslip' + file_name)
					this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
						let path = res.uploads.salary_slip[0].location;

						let sendHeads = [row.emp_name, this.month_year + ". " + "Payslip is Password Protected & password will be combination of first 5 digits of your PAN and DOB Number. e.g. PAN: ABCDE1234G, DOB: 11-Jun-1999, Password: *ABCDE110699*", row.tot_leave.toString(), row.total_late.toString(), row.total_absent.toString(), row.nxt_rem_bal.toString()];

						if (path && row.mobile) {
							this.crudServices.postRequest<any>(MonthlySalary.sendWhatsapp, [{
								"template_name": 'salary_payslip',
								"locale": "en",
								"numbers": [row.mobile],
								"params": sendHeads,
								'attachment': [
									{
										"caption": row.emp_name,
										"filename": file_name,
										"url": path
									}
								]

							}]).subscribe(res => {

							})
						}




					})
				}
			});


	}


	onChangeStatus(event) {
		if (event != null && event != undefined) {
			this.selected_status = {
				id: event.value.id,
				name: event.value.name
			};
			this.calculateSalary();
		}
	}





}
