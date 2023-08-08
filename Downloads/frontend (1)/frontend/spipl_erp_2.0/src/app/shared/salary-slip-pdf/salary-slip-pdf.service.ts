import { Component } from "@angular/core";
import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { roundAmount } from "../../shared/common-service/common-service";
import * as moment from "moment";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
	providedIn: 'root'
})

export class SalarySlipPdfService {

	docDefinition: any = [];

	constructor(private amountToWord: AmountToWordPipe, private inr: InrCurrencyPipe) {
		// 
	}

	async generateSalarySlip(data, item, selected_month) {

		let month_name = moment(selected_month).format('MMMM');
		let year = moment(selected_month).format('YYYY');

		this.docDefinition = {
			pageSize: 'A4',
			pageMargins: [10, 34, 10, 10],
			background: function (currentPage, pageSize) {
				return [
					{
						canvas: [
							{ type: 'line', x1: 10, y1: 35, x2: 585, y2: 35, lineWidth: 1 }, // Top
							{ type: 'line', x1: 10, y1: 35, x2: 10, y2: 790, lineWidth: 1 }, // Left
							{ type: 'line', x1: 10, y1: 790, x2: 585, y2: 790, lineWidth: 1 }, // Bottom
							{ type: 'line', x1: 585, y1: 35, x2: 585, y2: 790, lineWidth: 1 } // Rigth
						]
					}
				]
			},
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
											image: data.logo,
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
													text: data.company_name + '\n',
													fontSize: 18,
													bold: true,
													alignment: 'center'
												},
												{
													text: [
														{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.', fontSize: 8, alignment: 'center' },
														'\n',
														{ text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, Maharashtra, India', fontSize: 8, alignment: 'center' },
														'\n',
														{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${data.godown ? data.godown.gst_no.substr(2, 10) : ''}`, fontSize: 8, alignment: 'center' }
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
										{ text: 'Emp ID: ', fontSize: '10', bold: true, },
										{ text: item.emp_id, fontSize: '10', bold: true, },
									],
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'Present Days: ', fontSize: '10', bold: true, },
										{ text: item.total_present, fontSize: '10', bold: true, },
									],
									border: [false, false, false, false]
								},
							],
							[
								{
									text: [
										{ text: 'Bank: ', fontSize: '10', bold: true, },
										{ text: item.bank_name, fontSize: '10', bold: true, },
									],
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'A/c No.: ', fontSize: '10', bold: true, },
										{ text: item.bank_account_no, fontSize: '10', bold: true, },
									],
									border: [false, false, false, false]
								},
							],
							[
								{
									text: [
										{ text: 'PAN No.: ', fontSize: '10', bold: true, },
										{ text: item.pan_no, fontSize: '10', bold: true, },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'UAN No.: ', fontSize: '10', bold: true, },
										{ text: item.uan_no, fontSize: '10', bold: true, },
									],
									border: [false, false, false, true]
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
									text: [
										{ text: 'Earnings', fontSize: '10', bold: true },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Deductions', fontSize: '10', bold: true },
									],
									border: [true, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [false, false, false, true]
								}
							],
							[
								{
									text: [
										{ text: 'Gross Earnings (A): ', fontSize: '10', bold: true },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Deductions (B): ', fontSize: '10', bold: true },
									],
									border: [true, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								}
							],
							[
								{
									text: [
										{ text: 'Monthly CTC (C): ', fontSize: '10', bold: true },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Employer PF (D): ', fontSize: '10', bold: true },
									],
									border: [true, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
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
										{ text: 'Fixed Gross Salary (C - D): ', fontSize: '10', bold: true },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', alignment: 'right' },
									],
									border: [false, false, false, true]
								}
							],
							[
								{
									text: [
										{ text: 'Net Salary Payable (A - B): ', fontSize: '10', bold: true },
									],
									border: [true, false, true, true]
								},
								{
									text: [
										{ text: 'Amount', fontSize: '10', alignment: 'right' },
									],
									border: [false, false, false, true]
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
									text: ['Unpaid Days Calculation'],
									bold: true,
									alignment: 'center',
									border: [false, false, false, true]
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
									text: [
										{ text: 'Reasons', fontSize: '10', bold: true },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Unpaid Unit', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Unpaid Days', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [true, false, true, true]
								}
							],
							[
								{
									text: [
										{ text: 'Days Absent', fontSize: '10' },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Days', fontSize: '10', alignment: 'center' },
									],
									border: [true, false, true, true]
								}
							],
							[
								{
									text: [
										{ text: 'Late Check In', fontSize: '10' },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Days', fontSize: '10', alignment: 'center' },
									],
									border: [true, false, true, true]
								}
							],
							[
								{
									text: [
										{ text: 'Early Check Out', fontSize: '10' },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Days', fontSize: '10', alignment: 'center' },
									],
									border: [true, false, true, true]
								}
							],
							[
								{
									text: [
										{ text: 'Half Days', fontSize: '10' },
									],
									border: [false, false, true, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', alignment: 'center' },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Days', fontSize: '10', alignment: 'center' },
									],
									border: [true, false, true, true]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['75%', '25%'],
						body: [
							[
								{
									text: [
										{ text: 'Total', fontSize: '10', bold: true },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [true, false, false, true]
								},
							],
							[
								{
									text: [
										{ text: 'Paid Leave Balance', fontSize: '10', bold: true },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [true, false, false, true]
								},
							],
							[
								{
									text: [
										{ text: 'Balance Leaves', fontSize: '10', bold: true },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [true, false, false, true]
								},
							],
							[
								{
									text: [
										{ text: 'Net Unpaid Days', fontSize: '10', bold: true },
									],
									border: [false, false, false, true]
								},
								{
									text: [
										{ text: 'Unit', fontSize: '10', bold: true, alignment: 'center' },
									],
									border: [true, false, false, true]
								},
							]
						]
					}
				},
			]
		};
		pdfMake.createPdf(this.docDefinition).open();
	}
}
