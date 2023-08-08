import { Injectable } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { roundAmount } from '../../../shared/common-service/common-service';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from "moment";

@Injectable({
	providedIn: 'root',
})

export class GenerateDocsService {

	constructor(
		private exportService: ExportService,
		private currencyPipe: InrCurrencyPipe
	) {
		// 
	}

	async salarySlipNew(item, date) {
		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png');
		let month_name = moment(date).format('MMMM');
		let year = moment(date).format('YYYY');
		let balance_paid_leaves = (item.balance_paid_leaves > 0) ? item.balance_paid_leaves : 0;
		let tenPercentTitle1 = '';
		let tenPercentTitle2 = '';
		if (item.ten_percent > 0) {
			tenPercentTitle1 = '10% Deduction';
			tenPercentTitle2 = '\n (Refundable)';
		}

		let docDefinition = {
			pageSize: 'A4',
			pageMargins: [25, 25, 25, 25],
			content: [
				{
					table: {
						widths: ['10%', '90%'],
						body: [
							[
								{
									border: [true, true, false, false],
									image: logo,
									width: 60,
									height: 60,
									margin: [3, 5, 3, 5],
									alignment: 'left'
								},
								{
									text: [
										{
											text: 'Sushila Parmar International Pvt. Ltd.\n',
											fontSize: 16,
											bold: true,
											alignment: 'center'
										},
										{
											text: [
												{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, MH, India.', fontSize: 8, alignment: 'center' },
												'\n',
												{ text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, MH, India', fontSize: 8, alignment: 'center' },
												'\n',
												{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com `, fontSize: 8, alignment: 'center' }
											],
											fontSize: 8
										}
									],
									margin: [0, 5, 0, 0],
									border: [false, true, true, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: 'Payslip for ' + month_name + '-' + year,
									bold: true,
									fontSize: 11,
									margin: [0, 5, 0, 5],
									border: [true, true, true, true],
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									border: [true, false, false, false],
									margin: [0, 3, 0, 3],
									fontSize: 10,
									text: [
										{ text: 'Employee ID: ', bold: true },
										{ text: item.emp_id },
									],
									alignment: 'left',
								},
								{
									border: [true, false, true, false],
									margin: [0, 3, 0, 3],
									fontSize: 10,
									text: [
										{ text: 'Employee Name: ', bold: true },
										{ text: item.emp_name },
									],
									alignment: 'left',
								}
							],
							[
								{
									border: [true, false, false, false],
									margin: [0, 0, 0, 3],
									fontSize: 10,
									text: [
										{ text: 'Bank: ', bold: true },
										{ text: item.bank_name },
									],
									alignment: 'left',
								},
								{
									border: [true, false, true, false],
									margin: [0, 0, 0, 3],
									fontSize: 10,
									text: [
										{ text: 'Account No.: ', bold: true },
										{ text: item.bank_account_no },
									],
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, false, false],
									margin: [0, 0, 0, 3],
									fontSize: 10,
									text: [
										{ text: 'PAN: ', bold: true },
										{ text: item.pan_no },
									],
									alignment: 'left'
								}, {
									border: [true, false, true, false],
									margin: [0, 0, 0, 3],
									fontSize: 10,
									text: [
										{ text: 'UAN: ', bold: true },
										{ text: item.uan_no },
									],
									alignment: 'left'
								},
							]
						]
					},
				},
				{
					table: {
						margin: [3, 3, 3, 3],
						widths: ['25%', '25%', '25%', '25%'],
						body: [
							[
								{
									text: 'Earnings',
									fontSize: 11,
									bold: true,
									alignment: 'left'
								},
								{
									text: 'Amount',
									fontSize: 11,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'Deductions',
									fontSize: 11,
									bold: true,
									alignment: 'left'
								},
								{
									text: 'Amount',
									fontSize: 11,
									bold: true,
									alignment: 'center'
								}
							],
							[
								{
									text: 'Basic',
									alignment: 'left',
									fontSize: 10,
									border: [true, true, true, false],
									bold: true,
								},
								{
									text: item.basic,
									alignment: 'center',
									fontSize: 10,
									border: [false, true, true, false],
									bold: false,
								},
								{
									text:
										[
											{ text: 'Professional Tax', bold: true, },
											{ text: '\n (as applicable in some states)', fontSize: 9, }
										],
									alignment: 'left',
									fontSize: 10,
									border: [false, true, true, false],
								},
								{
									text: item.pt,
									alignment: 'center',
									fontSize: 10,
									border: [false, true, true, false],
									bold: false,
								},
							],
							[
								{
									text: 'DA',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.da,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
								{
									text: 'PF',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.employee_pf,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
							],
							[
								{
									text: 'HRA',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.hra,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
								{
									text: 'TDS',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.tds,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
							],
							[
								{
									text: 'LTA',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.lta,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
								{
									text: 'Arrears (+)',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.arrear_plus,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
								// {
								// 	text:
								// 		[
								// 			{ text: tenPercentTitle1, bold: true, },
								// 			{ text: tenPercentTitle2, fontSize: 9, }
								// 		],
								// 	alignment: 'left',
								// 	fontSize: 10,
								// 	border: [false, false, true, false],
								// 	bold: true,
								// },
								// {
								// 	text: item.ten_percent,
								// 	alignment: 'center',
								// 	fontSize: 10,
								// 	border: [false, false, true, false],
								// 	bold: false,
								// },
							],
							[
								{
									text: 'Child Edu. Allowance',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.child_edu_allowance,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
								{
									text: 'Arrears (-)',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.arrear_minus,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: false,
								},
							],
							[
								{
									text: 'Special Allowance',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, true],
									bold: true,
								},
								{
									text: item.special_allowance,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: false,
								},
								{
									text: 'ESI',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true,
								},
								{
									text: item.employee_esi,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: false,
								}
							],
							[
								{
									text: 'Gross Earnings (A): ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true,
								},
								{
									text: item.gross_salary,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								},
								{
									text: 'Deductions (B) : ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true
								},
								{
									text: Number(item.total_deduction),
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								}
							], [
								{
									text: 'Monthly CTC (C) : ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true
								},
								{
									text: item.monthly_ctc,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								},
								{
									text: 'Employer PF (D) : ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true
								},
								{
									text: item.employer_pf,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								}
							],
							[
								{
									text: 'Fixed Gross Salary (C-D) : ',
									alignment: 'left',
									fontSize: 10,
									bold: true,
									border: [true, true, false, true]
								},
								{
									text: item.fixed_gross_salary,
									alignment: 'center',
									fontSize: 10,
									bold: true,
									border: [false, true, true, true]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: 'Net Salary Payable (A-B) : ',
									alignment: 'left',
									fontSize: 10,
									bold: true,
									border: [true, true, false, true]
								},
								{
									text: item.net_salary,
									alignment: 'center',
									fontSize: 10,
									bold: true,
									border: [false, true, true, true]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							]
						]
					},
				},
				'\n',
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: 'Monthly Attendance Summary',
									fontSize: 10,
									bold: true,
									border: [true, true, true, true],
									margin: [4, 2, 0, 2],
									fillColor: '#DDDDDD',
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '5%', '45%'],
						body: [
							[
								{
									text: 'Total Present',
									fontSize: 10,
									bold: true,
									border: [true, false, false, false],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, false],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: item.total_present + ' Days',
									fontSize: 10,
									border: [false, false, true, false],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Total Absent',
									fontSize: 10,
									bold: true,
									border: [true, false, false, false],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, false],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: item.total_absent + ' Days',
									fontSize: 10,
									border: [false, false, true, false],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Late Check-In',
									fontSize: 10,
									bold: true,
									border: [true, false, false, false],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, false],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: item.total_late + ' Days',
									fontSize: 10,
									border: [false, false, true, false],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Early Check-Out',
									fontSize: 10,
									bold: true,
									border: [true, false, false, false],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, false],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: item.total_early + ' Days',
									fontSize: 10,
									border: [false, false, true, false],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Half Day',
									fontSize: 10,
									bold: true,
									border: [true, false, false, false],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, false],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: item.total_half_day + ' Days',
									fontSize: 10,
									border: [false, false, true, false],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Total Leaves',
									fontSize: 10,
									bold: true,
									border: [true, false, false, true],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, true],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: (
										item.total_absent +
										item.total_late +
										item.total_early +
										item.total_half_day
									) + ' Days',
									fontSize: 10,
									bold: true,
									border: [false, false, true, true],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Balance Paid Leaves (Current + Previous Year)',
									fontSize: 10,
									bold: true,
									border: [true, false, false, true],
									margin: [4, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: ':',
									fontSize: 10,
									border: [false, false, false, true],
									margin: [0, 3, 0, 0],
									alignment: 'left'
								},
								{
									text: balance_paid_leaves + ' Days',
									fontSize: 10,
									bold: true,
									border: [false, false, true, true],
									margin: [0, 3, 2, 0],
									alignment: 'left'
								}
							]
						]
					},
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: '* For any Queries you are requested to contact concerned department.',
									fontSize: 8,
									margin: [0, 5, 0, 0],
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: '* This is a computer-generated document, not requiring a signature.',
									fontSize: 8,
									margin: [0, 2, 0, 0],
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				}
			]
		};
		pdfMake.createPdf(docDefinition).open();
	}









	async salarySlip(item, date) {
		let month_name = moment(date).format('MMMM');
		let year = moment(date).format('YYYY');

		// let total_leaves = 12;

		let tenPercentTitle1 = '';
		let tenPercentTitle2 = '';
		if (item.ten_percent > 0) {
			tenPercentTitle1 = '10% Deduction';
			tenPercentTitle2 = '\n (Refundable)';
		}

		const docDefinition = {
			content: [
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									columns: [
										{
											border: [false, false, false, false],
											image: await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png'),
											margin: [5, 5, 5, 5],
											width: 60,
											height: 60,
											alignment: 'left'
										},
										{
											width: '*',
											border: [false, false, false, false],
											text: [
												{
													text: 'Sushila Parmar International Pvt. Ltd.\n',
													fontSize: 18,
													bold: true,
													alignment: 'center'
												},
												{
													text: [
														{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.', fontSize: 8, alignment: 'center' },
														'\n',
														{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com`, fontSize: 8, alignment: 'center' }
													],
													fontSize: 8
												}
											],
											margin: [5, 5, 5, 5],
											alignment: 'center'
										}
									]
								}
							],
							[
								{
									text: ['Payslip for ' + month_name + '-' + year + ' : ' + item.emp_name],
									bold: true,
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: [
										{ text: 'Emp No.: ', fontSize: 10, bold: true, },
										{ text: item.emp_id, fontSize: 10, bold: true, },
									],
									border: [true, false, false, false],
								},
								{
									text: [
										{ text: 'Present Days: ', fontSize: 10, bold: true, },
										{ text: item.total_present, fontSize: 10, bold: true, },
									],
									border: [false, false, true, false],
								}
							],
							[

								{
									text: [
										{ text: 'Bank: ', fontSize: 10, bold: true, },
										{ text: item.bank_name, fontSize: 10, bold: true, },
									],
									border: [true, false, false, false],
								},
								{
									text: [
										{ text: 'A/c. No.: ', fontSize: 10, bold: true, },
										{ text: item.bank_account_no, fontSize: 10, bold: true, },
									],
									border: [false, false, true, false],
								}
							],
							[
								{
									text: [
										{ text: 'PAN No.: ', fontSize: 10, bold: true, },
										{ text: item.pan_no, fontSize: 10, bold: true, },
									],
									border: [true, false, false, false],
								},
								{
									text: [
										{ text: 'UAN: ', fontSize: 10, bold: true, },
										{ text: item.uan_no, fontSize: 10, bold: true, },
									],
									border: [false, false, true, false],
								},
							]
						]
					}
				},
				{
					table: {
						widths: ['25%', '25%', '25%', '25%'],
						body: [
							[
								{
									text: 'Earnings',
									fontSize: 11,
									bold: true,
									alignment: 'left'
								},
								{
									text: 'Amount',
									fontSize: 11,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'Deductions',
									fontSize: 11,
									bold: true,
									alignment: 'left'
								},
								{
									text: 'Amount',
									fontSize: 11,
									bold: true,
									alignment: 'center'
								}
							],
							[
								{
									text: 'Basic',
									alignment: 'left',
									fontSize: 10,
									border: [true, true, true, false],
									bold: true,
								},
								{

									text: item.basic,
									alignment: 'center',
									fontSize: 10,
									border: [false, true, true, false],
									bold: true,
								},
								{
									text:
										[
											{ text: 'Professional Tax', bold: true, },
											{ text: '\n (as applicable in some states)', fontSize: 9, }
										],
									alignment: 'left',
									fontSize: 10,
									border: [false, true, true, false],
								},
								{
									text: item.pt,
									alignment: 'center',
									fontSize: 10,
									border: [false, true, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'DA',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.da,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'PF',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.employee_pf,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'HRA',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.hra,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'TDS',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.tds,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'LTA',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.lta,
									alignment: 'center',
									fontSize: 10,
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
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.ten_percent,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'Child Edu. Allowance',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.child_edu_allowance,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'Arrears (+)',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.arrear_plus,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: 'Special Allowance',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: item.special_allowance,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: 'Arrears (-)',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
								{
									text: item.arrear_minus,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								},
							],
							[
								{
									text: '',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, true],
									bold: true,
								},
								{
									text: '',
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true,
								},
								{
									text: 'ESI',
									alignment: 'left',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true,
								},
								{
									text: item.employee_esi,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true,
								}
							],
							[
								{
									text: 'Gross Earnings (A): ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true,
								},
								{
									text: item.gross_salary,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								},
								{
									text: 'Deductions (B) : ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true
								},
								{
									text: Number(item.total_deduction),
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								}
							], [
								{
									text: 'Monthly CTC (C) : ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true
								},
								{
									text: item.monthly_ctc,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								},
								{
									text: 'Employer PF (D) : ',
									alignment: 'left',
									fontSize: 10,
									border: [true, false, false, true],
									bold: true
								},
								{
									text: item.employer_pf,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, true],
									bold: true
								}
							],
							[
								{
									text: 'Fixed Gross Salary (C-D) : ',
									alignment: 'left',
									fontSize: 10,
									bold: true,
									border: [true, true, false, true]
								},
								{
									text: item.fixed_gross_salary,
									alignment: 'center',
									fontSize: 10,
									bold: true,
									border: [false, true, false, true]
								},
								{
									text: '',
									border: [false, false, false, true]
								},
								{
									text: '',
									border: [false, false, true, true]
								}
							],
							[
								{
									text: 'Net Salary Payable (A-B) : ',
									alignment: 'left',
									fontSize: 10,
									bold: true,
									border: [true, true, false, true]
								},
								{
									text: item.net_salary,
									alignment: 'center',
									fontSize: 10,
									bold: true,
									border: [false, true, false, true]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, true, false]
								}
							],
							[
								{
									text: 'Unpaid Days Calculation',
									colSpan: 4,
									alignment: 'center',
									fontSize: 11,
									bold: true,
									border: [true, true, true, true]
								}, {}, {}, {}
							],
							[
								{
									text: 'Reasons',
									colSpan: 2,
									fontSize: 11,
									bold: true,
									border: [true, false, true, true]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: 'Days',
									alignment: 'center',
									fontSize: 11,
									bold: true,
									border: [true, false, true, true]
								}
							],
							[
								{
									text: 'Days Absent',
									colSpan: 2,
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: item.total_absent,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Late Check In',
									colSpan: 2,
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: item.total_late,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Early Check Out',
									colSpan: 2,
									fontSize: 10,
									alignment: 'left',
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: item.total_early,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Half Days',
									colSpan: 2,
									alignment: 'left',
									fontSize: 10,
									border: [true, false, true, false],
									bold: true,
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: item.total_half_day,
									alignment: 'center',
									fontSize: 10,
									border: [false, false, true, false],
									bold: true,
								}
							],
							[
								{
									text: 'Total',
									bold: true,
									fontSize: 10,
									colSpan: 3,
									alignment: 'left',
									border: [true, true, false, true],
								}, {}, {},
								{
									text: (
										item.total_absent +
										item.total_late +
										item.total_early +
										item.total_half_day
									),
									bold: true,
									alignment: 'center',
									fontSize: 10,
									border: [true, true, true, true],
								}
							],
							[
								{
									text: 'Balance Paid Leaves (Current + Previous Year)',
									bold: true,
									colSpan: 3,
									alignment: 'left',
									fontSize: 10,
									border: [true, true, false, true],
								}, {}, {},
								{
									text: item.balance_paid_leaves,
									bold: true,
									alignment: 'center',
									fontSize: 10,
									border: [true, true, true, true],
								},
							],
							[
								{
									text: 'Net Unpaid Days',
									bold: true,
									colSpan: 3,
									alignment: 'left',
									fontSize: 10,
									border: [true, true, false, true]
								}, {}, {},
								{
									text: item.total_unpaid_leaves,
									bold: true,
									fontSize: 10,
									alignment: 'center',
									border: [true, true, true, true],
								}
							],
							[
								{
									text: '* For any Queries you are requested to contact concerned department.\n* This is a computer-generated document, not requiring a signature. ',
									colSpan: 4,
									fontSize: 9,
									alignment: 'justify',
									border: [true, false, true, true],
								}, {}, {}, {}
							]
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
		pdfMake.createPdf(docDefinition).open();
	}

	async salaryBreakup(item) {
		const docDefinition = {
			content: [
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									columns: [
										{
											border: [false, false, false, false],
											image: await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png'),
											margin: [5, 5, 5, 5],
											width: 60,
											height: 60,
											alignment: 'left'
										},
										{
											width: '*',
											border: [false, false, false, false],
											text: [
												{
													text: 'Sushila Parmar International Pvt. Ltd.\n',
													fontSize: 18,
													bold: true,
													alignment: 'center'
												},
												{
													text: [
														{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.', fontSize: 8, alignment: 'center' },
														'\n',
														{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com`, fontSize: 8, alignment: 'center' }
													],
													fontSize: 8
												}
											],
											margin: [5, 5, 5, 5],
											alignment: 'center'
										}
									]
								}
							],
							[
								{
									text: ['Salary Breakup of F.Y.: ' + item.financial_year],
									bold: true,
									fontSize: 11,
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: [
										{
											text: 'Emp No.: ',
											fontSize: 10,
											bold: true,
										},
										{
											text: item.emp_id,
											fontSize: 10,
											bold: true,
										},
									],
									border: [true, false, false, false]
								},
								{
									text: [
										{
											text: 'Employee Name: ',
											fontSize: 10,
											bold: true,
										},
										{
											text: item.emp_name,
											fontSize: 10,
											bold: true,
										},
									],
									border: [false, false, true, false]
								}
							],
							[
								{
									text: [
										{
											text: 'PAN No.: ',
											fontSize: 10,
											bold: true,
										},
										{
											text: item.pan_no,
											fontSize: 10,
											bold: true,
										},
									],
									border: [true, false, false, false]
								},
								{
									text: [
										{
											text: 'UAN: ',
											fontSize: 10,
											bold: true,
										},
										{
											text: item.uan_no,
											fontSize: 10,
											bold: true,
										},
									],
									border: [false, false, true, false]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: 'Fixed Allowances',
									fontSize: 9,
									bold: true,
									alignment: 'left'
								},
								{
									text: 'Fixed Amount (INR)',
									fontSize: 9,
									bold: true,
									alignment: 'right'
								}
							],
							[
								{
									text: 'Basic',
									fontSize: 9,
									alignment: 'left',
									border: [true, true, false, false],
								},
								{
									text: this.currencyPipe.transform(item.basic),
									alignment: 'right',
									fontSize: 9,
									border: [false, true, true, false],
								}
							],
							[
								{
									text: 'DA',
									fontSize: 9,
									alignment: 'left',
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.da),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'HRA',
									fontSize: 9,
									alignment: 'left',
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.hra),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'LTA',
									alignment: 'left',
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.lta),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'Child Edu. Allowance',
									alignment: 'left',
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.child_edu_allowance),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'Special Allowance',
									alignment: 'left',
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.special_allowance),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'Fixed Gross',
									alignment: 'left',
									bold: true,
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.annual_ctc - item.employer_pf),
									bold: true,
									fontSize: 9,
									alignment: 'right',
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'CTC Per Year',
									alignment: 'left',
									fontSize: 9,
									bold: true,
									border: [true, false, false, true],
								},
								{
									text: this.currencyPipe.transform(item.annual_ctc),
									bold: true,
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, true],
								}
							],
							// [
							// 	{
							// 		text: 'Basic',
							// 		alignment: 'left',
							// 		fontSize: 10,
							// 		border: [true, true, true, false],
							// 		bold: true
							// 	},
							// 	{
							// 		text: item.basic,
							// 		alignment: 'right',
							// 		fontSize: 10,
							// 		border: [false, true, true, false],
							// 		bold: true
							// 	}
							// ],
							[
								{
									text: 'Deductions',
									fontSize: 9,
									bold: true,
									alignment: 'left'
								},
								{
									text: 'Amount (INR)',
									fontSize: 9,
									bold: true,
									alignment: 'right'
								}
							],
							[
								{
									text: 'Profession Tax',
									alignment: 'left',
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.feb_pt + item.other_pt),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'Employee Contribution to PF',
									alignment: 'left',
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.employee_pf),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'Employer Contribution to PF',
									alignment: 'left',
									fontSize: 9,
									border: [true, false, false, false],
								},
								{
									text: this.currencyPipe.transform(item.employer_pf),
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, false],
								}
							],
							[
								{
									text: 'Total',
									bold: true,
									fontSize: 9,
									alignment: 'left',
									border: [true, false, false, true],
								},
								{
									text: this.currencyPipe.transform(item.feb_pt + item.other_pt + item.employee_pf),
									bold: true,
									alignment: 'right',
									fontSize: 9,
									border: [false, false, true, true],
								}
							],
							[
								{
									text: '* For any Queries you are requested to contact concerned department.\n* This is a computer-generated document, not requiring a signature. ',
									colSpan: 2,
									fontSize: 9,
									alignment: 'justify',
									border: [true, false, true, true],
								}, {}
							]
						]
					}
				}
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
		pdfMake.createPdf(docDefinition).open();
	}

	async appointmentLetter(item) {
		let printed_date = new Date(moment(item.appointment_date).format("YYYY-MM-DD"));
		let monthly_ctc = roundAmount(Number(item.joining_ctc) / 12);

		let pt = 200;
		let fixed_basic = Math.ceil((monthly_ctc * 30) / 100);
		let fixed_da = Math.ceil((monthly_ctc * 5) / 100);
		let basic = Math.ceil((fixed_basic * 30) / 30);

		let salary_for_pf_employer_cont = Math.ceil(monthly_ctc - ((fixed_basic + fixed_da) * 40) / 100);
		let employer_pf = (salary_for_pf_employer_cont < 15000) ? Math.ceil((salary_for_pf_employer_cont * 13) / 100) : Math.ceil((15000 * 13) / 100);

		let da = Math.ceil((fixed_da * 30) / 30);
		let hra = Math.ceil(((basic + da) * 40) / 100);
		let fixed_gross_salary = monthly_ctc - employer_pf;
		let child_edu_allowance = Math.ceil((2400 * 30) / 30);

		let total_salary_of_month = Math.ceil((fixed_gross_salary * 30) / 30);

		let lta = Math.ceil((((total_salary_of_month * 10) / 100) * 30) / 30);

		let special_allowance = total_salary_of_month - (basic + da + hra + lta + child_edu_allowance);
		let gross_salary = (basic + da + hra + lta + child_edu_allowance + special_allowance);

		let employee_pf_sum = basic + da + lta + child_edu_allowance + special_allowance;

		let employee_pf = (employee_pf_sum < 15000) ? Math.ceil((employee_pf_sum * 12) / 100) : Math.ceil((15000 * 12) / 100);

		let employee_esi = (gross_salary < 21000) ? Math.ceil((gross_salary * 0.75) / 100) : 0;
		let employer_esi = (gross_salary < 21000) ? Math.ceil((gross_salary * 3.25) / 100) : 0;

		let total_deduction = (pt + employee_pf + employee_esi);

		let final_salary = gross_salary - total_deduction;

		let net_salary = Math.ceil(final_salary);

		let bonus = monthly_ctc;

		const docDefinition = {
			content: [
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: 'Appointment Letter',
									bold: true,
									border: [0, 0, 0, 0],
									margin: [0, 150, 0, 0],
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'Date: ',
											fontSize: 10,
										},
										{
											text: moment(printed_date).format('DD-MM-YYYY'),
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 20, 0, 20],
									alignment: 'right',
								}
							],
							[
								{
									text: [
										{
											text: item.first_name + ' ' + item.middle_name + ' ' + item.last_name,
											fontSize: 10,
											bold: true
										}
									],
									border: [false, false, false, false],
									margin: [0, 20, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: item.local_address,
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									lineHeight: 1,
									margin: [0, 0, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: 'Mobile No.: ',
											fontSize: 10
										},
										{
											text: item.mobile,
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 0, 0, 10]
								}
							],
							[
								{
									text: [
										{
											text: 'Dear ',
											fontSize: 10
										},
										{
											text: item.first_name,
											fontSize: 10,
											bold: true
										},
										{
											text: ',',
											fontSize: 10
										},
									],
									border: [false, false, false, false],
									margin: [0, 25, 0, 10]
								}
							],
							[
								{
									text: [
										{
											text: 'We are delighted to offer you a position as ',
											fontSize: 10
										},
										{
											text: item.job_profile,
											bold: true,
											fontSize: 10
										},
										{
											text: ' with Sushila Parmar International Pvt. Ltd. (SPIPL)',
											fontSize: 10
										},
									],
									border: [false, false, false, false],
									lineHeight: 1.2,
									margin: [0, 0, 0, 5]
								}
							],
							[
								{
									text: [
										{
											text: 'The Total Cost to Company offered to you is INR ',
											fontSize: 10
										},
										{
											text: this.currencyPipe.transform(item.joining_ctc),
											bold: true,
											fontSize: 10
										},
										{
											text: '/- with an annual bonus of INR ',
											fontSize: 10
										},
										{
											text: this.currencyPipe.transform(bonus),
											bold: true,
											fontSize: 10
										},
										{
											text: '/-.',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									lineHeight: 1.2,
									margin: [0, 0, 0, 5]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'Tax at the applicable rate shall be deducted at source from your salary.',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									lineHeight: 1.2,
									margin: [0, 0, 0, 5]
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'Your joining date will be ',
											fontSize: 10
										},
										{
											text: moment(item.appointment_date).format('MMMM DD, YYYY'),
											bold: true,
											fontSize: 10
										},
										{
											text: '. You will be on probation for a period of 6 months.',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 0, 0, 5]
								}
							]
						]
					},
					pageBreak: 'after'
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'The Salary Structure is as below:-',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 120, 0, 5]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '25%', '25%'],
						body: [
							[
								{
									text: 'Fixed Allowances',
									alignment: 'left',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: 'Monthly',
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: 'Annual',
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								}
							],
							[
								{
									text: 'Basic',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(basic),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(basic * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'DA',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(da),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(da * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'HRA',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(hra),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(hra * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'LTA',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(lta),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(lta * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Child Education Allowance',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(child_edu_allowance),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(child_edu_allowance * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Special Allowance',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(special_allowance),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(special_allowance * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Gross Salary',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(gross_salary),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(gross_salary * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Deductions',
									alignment: 'left',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: 'Monthly',
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: 'Annual',
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								}
							],
							[
								{
									text: 'Professional Tax',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(pt),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform((pt * 11) + 300),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Employee PF',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(employee_pf),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(employee_pf * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Employer PF',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(employer_pf),
									alignment: 'right',
									fontSize: 9
								},
								{
									text: this.currencyPipe.transform(employer_pf * 12),
									alignment: 'right',
									fontSize: 9
								}
							],
							[
								{
									text: 'Net Salary',
									alignment: 'left',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: this.currencyPipe.transform(net_salary),
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: this.currencyPipe.transform(net_salary * 12),
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								}
							],
							[
								{
									text: 'Variable Pay (Incentive/Bonus)',
									alignment: 'left',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: '-',
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: this.currencyPipe.transform(bonus),
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								}
							],
							[
								{
									text: 'Total Salary',
									alignment: 'left',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: this.currencyPipe.transform(net_salary),
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								},
								{
									text: this.currencyPipe.transform((net_salary * 12) + bonus),
									alignment: 'right',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9'
								}
							]
						],
					}
				},
				'\n\n',
				{
					table: {
						widths: ['25%', '75%'],
						body: [
							[
								{
									text: 'Other Company Benefits',
									alignment: 'center',
									fontSize: 9,
									bold: true,
									fillColor: '#90CAF9',
									colSpan: 2,
								},
								{}
							],
							[
								{
									text: 'Medical Coverage',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: 'Floater of INR ' + this.currencyPipe.transform(item.medical_coverage) + ' /- in case of any normal or critical illness provided.\n*Terms & Conditions Apply',
									alignment: 'left',
									fontSize: 9
								}
							],
							[
								{
									text: 'Family members covered',
									alignment: 'left',
									fontSize: 9
								},
								{
									text: 'Self, Spouse & Two Children.',
									alignment: 'left',
									fontSize: 9
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'Thanking You,',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 30, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: 'For Sushila Parmar International Pvt. Ltd.',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 50, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: 'Authorized Signatory',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 40, 0, 0]
								}
							],
						]
					}
				}
			]
		};
		pdfMake.createPdf(docDefinition).open();
	}

	async relievingLetter(item) {
		let printed_date = moment().format("YYYY-MM-DD");

		let authorized_person_name = null;
		let authorized_person_designation = null;

		if (item.department_id == 1) {
			authorized_person_name = "Mr. Govinda Mahajan";
			authorized_person_designation = "CTO & IT Head";
		} else {
			authorized_person_name = "Mr. Rohit Parmar";
			authorized_person_designation = "Director";
		}

		const docDefinition = {
			content: [
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'Date: ',
											fontSize: 10,
										},
										{
											text: moment(printed_date).format('DD-MM-YYYY'),
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 150, 0, 0],
									alignment: 'right',
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: 'RELIEVING & EXPERIENCE LETTER',
									bold: true,
									fontSize: 12,
									border: [0, 0, 0, 0],
									margin: [0, 20, 0, 0],
									decoration: 'underline',
									alignment: 'center'
								}
							],
							[
								{
									text: 'TO WHOMSOEVER IT MAY CONCERN',
									bold: true,
									fontSize: 10,
									border: [0, 0, 0, 0],
									margin: [0, 25, 0, 0],
									decoration: 'underline',
									alignment: 'center'
								}
							],
							[
								{
									text: [
										{
											text: 'This is to certify that ',
											fontSize: 10
										},
										{
											text: item.title + '. ' + item.first_name + ' ' + item.last_name,
											bold: true,
											fontSize: 10
										},
										{
											text: ' has worked with us from ' + moment(item.appointment_date).format("Do MMMM YYYY") + ' to ' + moment(item.relieving_date).format("Do MMMM YYYY") + ' and was designated as "',
											fontSize: 10
										},
										{
											text: item.job_profile,
											bold: true,
											fontSize: 10
										},
										{
											text: '" at the time of leaving the organization.',
											fontSize: 10
										},
									],
									border: [false, false, false, false],
									lineHeight: 1.1,
									margin: [0, 20, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: `During ${item.gender == 1 ? 'his' : 'her'} above tenure we found ${item.gender == 1 ? 'him' : 'her'} to be regular, honest and diligent in ${item.gender == 1 ? 'his' : 'her'} duties and responsibilities.`,
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									lineHeight: 1.1,
									margin: [0, 10, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: 'This is also to certify that ' + item.title + '. ' + item.first_name + ' ' + item.last_name + ' holds no liabilities towards the company. We wish him all success in his future endeavour.',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									lineHeight: 1.1,
									margin: [0, 10, 0, 0]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: [
										{
											text: 'Thanking You,',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 40, 0, 0]
								}
							],
							[
								{
									text: [
										{
											text: 'For Sushila Parmar International Pvt. Ltd.',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 20, 0, 0]
								}
							],
							// [
							// 	{
							// 		text: [
							// 			{
							// 				text: authorized_person_name,
							// 				fontSize: 10
							// 			}
							// 		],
							// 		border: [false, false, false, false],
							// 		margin: [0, 60, 0, 0]
							// 	}
							// ],
							// [
							// 	{
							// 		text: [
							// 			{
							// 				text: authorized_person_designation,
							// 				fontSize: 10
							// 			}
							// 		],
							// 		border: [false, false, false, false],
							// 		margin: [0, 5, 0, 0]
							// 	}
							// ],
							[
								{
									text: [
										{
											text: 'Authorized Signatory',
											fontSize: 10
										}
									],
									border: [false, false, false, false],
									margin: [0, 40, 0, 0]
								}
							],
						]
					}
				}
			]
		};
		pdfMake.createPdf(docDefinition).open();
	}

}
