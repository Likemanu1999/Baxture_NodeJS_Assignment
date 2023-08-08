import { Component, OnInit, Input, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { ExportService } from '../../../shared/export-service/export-service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { MonthlySalary, PercentageDetails, percentage_master, YearCtc } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { NullReplacePipe } from '../../../shared/null-replace/null-replace.pipe';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-salary-details',
	templateUrl: './salary-details.component.html',
	styleUrls: ['./salary-details.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ToasterService, LoginService, ExportService, InrCurrencyPipe, CrudServices, DatePipe, NullReplacePipe]
})
/**
* This Component takes inputs employee id (parentData),  memberwholeData from parent component.
*/
export class SalaryDetailsComponent implements OnInit {
	@Input() parentData;
	@Input() memberwholeData: any;
	isLoading = false;
	ctcList: any = '';
	addMode: boolean = false;
	editMode: boolean = false;
	editId: number;
	showTable: boolean = false;
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public popoverMessageSend: string = 'Are you sure, you want to send mail?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	salaryForm: FormGroup;
	modalTitle: string = 'Add Salary Details';
	cols: any[];
	financial_year: string;
	yearly_ctc: number;
	basic: number;
	da: number;
	hra: number;
	lta: number;
	child_edu_allowance: number;
	special_allowance: number;
	incentive: number;
	yearly_pf: number;
	yearly_pt: number;
	salary_for_employer_pf: number;
	employer_pf: number;
	basicPer: number;
	daPer: number;
	hraPer: number;
	emploerpfPer: number;
	ltaPer: number;
	childEducationAllow: number;
	yearlypfPer: number;
	ten_percent_deduction: number = 0;
	esi_employee_per: number;
	esi_employer_per: number;
	esi_employee: number = 0;
	esi_employer: number = 0;
	pt_feb: number;
	pt_other_month: number;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			positionClass: 'toast-bottom-right',
			timeout: 5000
		});
	add_yearly_ctc: boolean = false;
	edit_yearly_ctc: boolean = false;
	delete_yearly_ctc: boolean = false;
	show_salary_breakup_pdf: boolean = false;
	send_breakup_on_mail: boolean = false;
	user: UserDetails;
	links: string[] = [];
	isDisabled: boolean = false;
	public yearMask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];


	bsRangeValue: any = [];
	fromdate: string;
	todate: string;
	currentYear: number;
	currdate = new Date();
	/**
	* Injecting services,Initializing form, getting percentage for calculation from backend.
	*/
	constructor(
		private loginService: LoginService,
		private toasterService: ToasterService,
		private datepipe: DatePipe,
		private exportService: ExportService,
		private currencyPipe: InrCurrencyPipe,
		private nullReplacePipe: NullReplacePipe,
		private crudServices: CrudServices) {
		this.cols = [
			{ field: 'financial_year', header: 'Financial Year' },
			{ field: 'yearly_ctc', header: 'CTC' },
			{ field: 'basic', header: 'Basic' },
			{ field: 'da', header: 'DA' },
			{ field: 'hra', header: 'HRA' },
			{ field: 'lta', header: 'LTA' },
			{ field: 'child_edu_allowance', header: 'Child Edu. Allowance' },
			{ field: 'special_allowance', header: 'Special Allowance' },
			{ field: 'incentive', header: 'Incentive' },
			{ field: 'yearly_pf', header: 'Employee PF' },
			{ field: 'employer_pf', header: 'Employer PF' },
			{ field: 'yearly_pt', header: 'PT' }
		];
		this.salaryForm = new FormGroup({
			'financial_year': new FormControl(null, Validators.required),
			'yearly_ctc': new FormControl(null, Validators.required),
			'basic': new FormControl(null, Validators.required),
			'da': new FormControl(null, Validators.required),
			'hra': new FormControl(null, Validators.required),
			'lta': new FormControl(null, Validators.required),
			'child_edu_allowance': new FormControl(null, Validators.required),
			'special_allowance': new FormControl(null, Validators.required),
			'incentive': new FormControl(null),
			'yearly_pf': new FormControl(null, Validators.required),
			'yearly_pt': new FormControl(null, Validators.required),
			'employer_pf': new FormControl(null, Validators.required),
			'pt_feb': new FormControl(null),
			'pt_other_month': new FormControl(null),
		});
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.add_yearly_ctc = (this.links.indexOf('Add Yearly CTC') > -1);
		this.edit_yearly_ctc = (this.links.indexOf('Edit Yearly CTC') > -1);
		this.delete_yearly_ctc = (this.links.indexOf('Delete Yearly CTC') > -1);
		this.show_salary_breakup_pdf = (this.links.indexOf('View Salary Breakup Pdf') > -1);
		this.send_breakup_on_mail = (this.links.indexOf('Send Salary Breakup On Mail') > -1);

		this.crudServices.getAll<any>(percentage_master.getAllDataByCurrentDate).subscribe(response => {
			response.forEach(element => {
				if (element.percentage_type.type == 'Basic') {
					this.basicPer = element.percent_value;
				}
				if (element.percentage_type.type == 'DA') {
					this.daPer = element.percent_value;
				}
				if (element.percentage_type.type == 'HRA') {
					this.hraPer = element.percent_value;
				}
				if (element.percentage_type.type == 'Employer PF') {
					this.emploerpfPer = element.percent_value;
				}
				if (element.percentage_type.type == 'LTA') {
					this.ltaPer = element.percent_value;
				}
				if (element.percentage_type.type == 'Child Education') {
					this.childEducationAllow = element.percent_value;
				}
				if (element.percentage_type.type == 'Employee PF') {
					this.yearlypfPer = element.percent_value;
				}
				if (element.percentage_type.type == 'ESI Employee') {
					this.esi_employee_per = element.percent_value;
				}

				if (element.percentage_type.type == 'ESI Employer') {
					this.esi_employer_per = element.percent_value;
				}
			});

		})

	}
	/**
	* Getting member salary details from backend by passing id.
	*/
	ngOnInit() {
		this.crudServices.getOne<any>(YearCtc.getOneEmpCtc, { emp_id: this.parentData }).subscribe((response) => {
			this.ctcList = response.data;
		});

	}
	/**
	* To delete salary record from backend by passing id.
	*/
	onDelete(id) {
		if (id) {
			this.crudServices.deleteData<any>(YearCtc.delete, { id: id })
				.subscribe(response => {

					if (response.code === '100') {
						this.toasterService.pop(response.message, response.message, response.data);
						this.ngOnInit();
					} else if (response.code === '101') {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
					}
				});
		}
	}
	/**
	* On edit button click we are fetching data from backend.
	*/
	onEdit(id) {
		if (id) {
			this.showTable = true;
			this.editMode = true;
			this.editId = id;
			this.isDisabled = true;
			this.crudServices.getOne<any>(YearCtc.getOne, { id: id })
				.subscribe((response) => {
					var data = response.data[0];
					this.bsRangeValue = [new Date(data['from_date']), new Date(data['to_date'])];
					this.yearly_ctc = data['yearly_ctc'];
					this.basic = data['basic'];
					this.da = data['da'];
					this.hra = data['hra'];
					this.lta = data['lta'];
					this.child_edu_allowance = data['child_edu_allowance'];
					this.special_allowance = data['special_allowance'];
					this.incentive = data['incentive'];
					this.yearly_pf = data['yearly_pf'];
					this.yearly_pt = data['yearly_pt'];
					this.employer_pf = data['employer_pf'];
					this.pt_feb = data['pt_feb'];
					this.pt_other_month = data['pt_other_month'];
				});
		}
	}
	/**
	* On add button click we are hiding table & showing form.
	*/
	onAdd() {
		this.isDisabled = false;
		const d = new Date();
		// this.financial_year = (String(d.getFullYear() - 1)) + '-' + (String(d.getFullYear()));
		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		this.showTable = true;
		this.addMode = true;
	}
	/**
	* On submit button click we are checking mode of form and as per mode calling service method.
	*/
	onSubmit() {
		this.financial_year = this.datepipe.transform(this.bsRangeValue[0], 'yyyy') + '-' + this.datepipe.transform(this.bsRangeValue[1], 'yyyy')

		if (this.addMode) {
			this.crudServices.addData<any>(YearCtc.add, {
				emp_id: this.parentData,
				yearly_ctc: this.yearly_ctc,
				basic: this.basic,
				da: this.da,
				hra: this.hra,
				lta: this.lta,
				from_date: this.datepipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd'),
				to_date: this.datepipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd'),
				financial_year: this.financial_year,
				child_edu_allowance: this.child_edu_allowance,
				special_allowance: this.special_allowance,
				incentive: this.incentive,
				yearly_pf: this.yearly_pf,
				yearly_pt: this.yearly_pt,
				employer_pf: this.employer_pf,
				esi_employee: this.esi_employee,
				esi_employer: this.esi_employer,
				pt_feb: this.pt_feb,
				pt_other_month: this.pt_other_month,
			}).subscribe((response) => {

				if (response.code === '100') {
					this.toasterService.pop(response.message, response.message, response.data);
					this.addMode = false;
					this.onBack();
					this.ngOnInit();
				} else if (response.code === '101') {
					this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
				}
			});
		}
		if (this.editMode) {
			this.crudServices.updateData<any>(YearCtc.update, {
				id: this.editId,
				emp_id: this.parentData,
				yearly_ctc: this.yearly_ctc,
				basic: this.basic,
				da: this.da,
				hra: this.hra,
				lta: this.lta,
				from_date: this.datepipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd'),
				to_date: this.datepipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd'),
				financial_year: this.financial_year,
				child_edu_allowance: this.child_edu_allowance,
				special_allowance: this.special_allowance,
				incentive: this.incentive,
				yearly_pf: this.yearly_pf,
				yearly_pt: this.yearly_pt,
				employer_pf: this.employer_pf,
				esi_employee: this.esi_employee,
				esi_employer: this.esi_employer,
				pt_feb: this.pt_feb,
				pt_other_month: this.pt_other_month,
			})
				.subscribe((response) => {
					if (response.code === '100') {
						this.toasterService.pop(response.message, response.message, response.data);
						this.editMode = false;
						this.onBack();
						this.ngOnInit();
					} else if (response.code === '101') {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
					}
				});
		}
	}


	onBack() {
		this.showTable = false;
		this.addMode = false;
		this.editMode = false;
		this.salaryForm.reset();
	}
	/**
	* On yearly ctc entered this function executed and calculate all salary details using percentage we fetched in constructor.
	*/
	calculateSal() {
		if (this.yearly_ctc) {
			this.basic = Math.round(this.yearly_ctc * this.basicPer / 100); // 30
			this.da = Math.round(this.yearly_ctc * this.daPer / 100); // 5
			this.hra = Math.round((this.basic + this.da) * this.hraPer / 100); // 40
			//this.salary_for_employer_pf = this.yearly_ctc - this.da - this.basic;
			this.salary_for_employer_pf = this.yearly_ctc - ((this.da + this.basic) * (0.4));
			if (this.salary_for_employer_pf < (15000 * 12)) {
				this.employer_pf = Math.round(this.salary_for_employer_pf * this.emploerpfPer / 100); // 11
			} else {
				this.employer_pf = Math.round((15000 * 12) * this.emploerpfPer / 100); // 11
			}
			const monthly_salary = (this.yearly_ctc - this.employer_pf);
			this.lta = Math.round(monthly_salary * this.ltaPer / 100); // 10
			this.child_edu_allowance = this.childEducationAllow * 12;  // 2400
			this.special_allowance = monthly_salary - (this.basic + this.da + this.hra + this.lta + this.child_edu_allowance);
			const grossSalary = this.basic + this.da + this.hra + this.lta + this.child_edu_allowance + this.special_allowance;



			// let esi_flag = 1;

			// if (esi_flag == 1) {
			if (grossSalary > 252000) {
				this.esi_employee = 0;
				this.esi_employer = 0;
			} else {
				this.esi_employee = grossSalary * (this.esi_employee_per / 100)
				this.esi_employer = grossSalary * (this.esi_employer_per / 100);
			}
			//}
			if (grossSalary < (15000 * 12)) {
				this.yearly_pf = Math.round(grossSalary * this.yearlypfPer / 100); // 12
			} else {
				this.yearly_pf = Math.round((15000 * 12) * this.yearlypfPer / 100);  // 12
			}

		}
	}
	/**
	* Generating salary breakup pdf using pdf make.
	  we are passing action flag to send email or download pdf.
	*/
	async generatePdf(index, action) {
		const response = this.ctcList[index];
		this.financial_year = response.financial_year;
		this.yearly_ctc = response.yearly_ctc;
		this.basic = response.basic;
		this.da = response.da;
		this.hra = response.hra;
		this.lta = response.lta;
		this.child_edu_allowance = response.child_edu_allowance;
		this.special_allowance = response.special_allowance;
		this.incentive = response.incentive;
		this.yearly_pf = response.yearly_pf;
		this.yearly_pt = response.yearly_pt;
		this.employer_pf = response.employer_pf;
		const appoint_date = new Date(this.memberwholeData.appointment_date);
		const fy_year = this.financial_year.split('-');
		/* const todayDate = new Date();
		const monthdiff = ( todayDate.getMonth() - appoint_date.getMonth() +
		(12 * (todayDate.getFullYear() - appoint_date.getFullYear())) ); */
		if (appoint_date.getFullYear() === Number(fy_year[0]) || appoint_date.getFullYear() === Number(fy_year[1])) {
			this.ten_percent_deduction = Math.round((this.yearly_ctc - this.employer_pf) * 10 / 100);
		}
		const docDefinition = {
			content: [
				{
					columns: [
						{
							image: await this.exportService.getBase64ImageFromURL(
								'assets/img/brand/parmar_logo.png'
							),
							margin: [38, 0, 0, 0],
							width: 60,
							height: 60,
						},
						{
							width: '*',
							text: [
								{ text: 'Sushila Parmar International Pvt. Ltd.\n', fontSize: 18, bold: true, },
								{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.', fontSize: 8 },
							],
							margin: [42, 15, 0, 0]
						},
					],
				},
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
									text: 'Salary Breakup of: ' + this.memberwholeData.title + ' ' + this.memberwholeData.first_name + ' ' + this.nullReplacePipe.transform(this.memberwholeData.middle_name) + ' ' + this.memberwholeData.last_name + '\n Breakup of F.Y.: ' + this.financial_year,
									style: 'tableHeader',
									colSpan: 4,
									alignment: 'center',
								}, {}, {}, {}
							],
							[
								{ text: 'Emp No.:' + this.memberwholeData.id, fontSize: '10' },
								{ text: 'Date Of Appointment : ' + this.memberwholeData.appointment_date, fontSize: '10' },
								{ text: 'PAN No.:	' + this.memberwholeData.pan_no, fontSize: '10' },
								{ text: 'UAN No. : ' + this.nullReplacePipe.transform(this.memberwholeData.uan_no), fontSize: '10' },
							],
							[
								{
									text: 'Fixed Allowances',
									fontSize: 11,
									bold: true,
									colSpan: 2,
									alignment: 'center'
								},
								{},
								{
									text: 'Fixed Amount',
									fontSize: 11,
									bold: true,
									colSpan: 2,
									alignment: 'center'
								},
								{}
							],
							[
								{
									text: 'Basic',
									colSpan: 2,
									alignment: 'left',
									border: [true, true, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.basic),
									colSpan: 2,
									alignment: 'right',
									border: [false, true, true, false],
								}, {}
							],
							[
								{
									text: 'DA',
									colSpan: 2,
									alignment: 'left',
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.da),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'HRA',
									colSpan: 2,
									alignment: 'left',
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.hra),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'LTA',
									colSpan: 2,
									alignment: 'left',
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.lta),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'Child Edu. Allowance',
									colSpan: 2,
									alignment: 'left',
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.child_edu_allowance),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'Special Allowance',
									colSpan: 2,
									alignment: 'left',
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.special_allowance),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'Fixed Gross',
									colSpan: 2,
									alignment: 'left',
									bold: true,
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.yearly_ctc - this.employer_pf),
									colSpan: 2,
									bold: true,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'CTC Per Year',
									colSpan: 2,
									alignment: 'left',
									bold: true,
									border: [true, false, false, true],
								}, {},
								{
									text: this.currencyPipe.transform(this.yearly_ctc),
									colSpan: 2,
									bold: true,
									alignment: 'right',
									border: [false, false, true, true],
								}, {}
							],
							[
								{
									text: 'Deductions',
									colSpan: 2,
									alignment: 'center',
									border: [true, false, true, true],
								}, {},
								{
									text: 'Amount(INR)',
									colSpan: 2,
									alignment: 'center',
									border: [false, false, true, true],
								}, {}
							],
							[
								{
									text: ' A.General Deduction',
									colSpan: 4,
									alignment: 'left',
									bold: true,
									border: [true, false, true, false],
								}, {},
								{}, {}
							],
							[
								{
									text: '10%\n Deduction(Refundable)',
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.ten_percent_deduction),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: ' B.Statutory Deduction',
									colSpan: 4,
									alignment: 'left',
									bold: true,
									border: [true, false, true, false],
								}, {},
								{}, {}
							],
							[
								{
									text: 'Profession Tax \n Employee Contribution to PF',
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, false, false],
								}, {},
								{
									text: this.currencyPipe.transform(this.yearly_pt) + ' \n ' + this.currencyPipe.transform(this.yearly_pf),
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, false],
								}, {}
							],
							[
								{
									text: 'Total',
									bold: true,
									colSpan: 2,
									alignment: 'left',
									margin: [5, 0],
									border: [true, false, false, true],
								}, {},
								{
									text: this.currencyPipe.transform(((this.ten_percent_deduction * 10 / 100) + this.yearly_pt + this.yearly_pf)),
									bold: true,
									colSpan: 2,
									alignment: 'right',
									border: [false, false, true, true],
								}, {}
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
		if (action === 1) {
			pdfMake.createPdf(docDefinition).open();
		} else if (action === 2) {
			const sub = 'SParmar - Information on Annual Package F.Y. ' + this.financial_year;
			const mailBody = '<p>To,</p>\
        \
        <p>' + this.memberwholeData.title + ' ' + this.memberwholeData.first_name + ' ' + this.memberwholeData.middle_name + ' ' + this.memberwholeData.last_name + ',</p>\
        \
        <p>SPIPL, Pune.</p>\
        \
        <p>Sub:&nbsp; Information on Annual Package F.Y. &nbsp;<strong>' + this.financial_year + '</strong></p>\
        \
        <p>&nbsp;&nbsp;</p>\
        \
        <p>Good Day.</p>\
        \
        <p>We thank you for being with SPIPL (Parmar) as a strong team member and support. We highly appreciate your contribution in the growth of this company till date.</p>\
        \
        <p>This mail is just a information about your &ldquo;Financial Package &rdquo; for the F.Y ' + this.financial_year + '.</p>\
        \
        <p><strong>Find below attached file.</strong></p>\
        \
        <p><strong>&nbsp;</strong></p>\
        \
        <p>We hope this will help you to plan your financial planning better.</p>\
        \
        <p>We look forward to your long term and stable relationship with SPIPL.</p>\
        \
        <p>Thanking You,</p>\
        \
        <p>Sushila&nbsp;Parmar&nbsp;International</p>';
			const pdfDocGenerator = pdfMake.createPdf(docDefinition);
			pdfDocGenerator.getBase64((data) => {
				this.crudServices.postRequest<any>(MonthlySalary.salaryBreakUp, {
					thepdf: data,
					tomail: this.memberwholeData.email,
					subject: sub,
					bodytext: mailBody,
					filename: 'Salary_breakup.pdf'
				}).subscribe((responsea) => {
					this.toasterService.pop(responsea.message, responsea.message, responsea.data);
				});
			});
		}
	}
}
