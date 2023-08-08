import { Component } from "@angular/core";
import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { CommonService, roundAmount } from "../../shared/common-service/common-service";
import { ExportService } from '../../shared/export-service/export-service';
import { NullReplacePipe } from '../../shared/null-replace/null-replace.pipe';
import * as moment from "moment";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
	providedIn: 'root'
})

export class SalaryPdfService {

	docDefinition: any = [];

	constructor(
		private commonService: CommonService,
		private exportService: ExportService,
		private nullReplacePipe: NullReplacePipe
	) {
		// 
	}

	async createPdfFormat(row, selectedDate) {
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

		let calculateYear = Number(selectedDate.getFullYear());

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
											{ text: 'Payslip for ' + mlist[row.month - 1] + '-' + calculateYear + ' : ' },
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
										{ text: moment().format("DD-MM-YYYY"), fontSize: '10', bold: true, },
									],
									border: [false, true, false, false],

								},
								{
									text: [
										{ text: 'Date: ', fontSize: '10', bold: true, },
										{ text: moment().format("DD-MM-YYYY"), fontSize: '10', bold: true, },
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

		const file_name = (row.emp_name + mlist[row.month - 1] + '_' + calculateYear).replace(/ /g, '_') + '.pdf';
		pdfMake.createPdf(docDefinition).download(file_name)
	}
}
