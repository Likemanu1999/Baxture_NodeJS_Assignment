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

export class PiPdfService {

	docDefinition: any = [];

	constructor(private amountToWord: AmountToWordPipe, private inr: InrCurrencyPipe) {
		// 
	}

	async createPi(data, item, grades) {
		let tds_tcs_label = null;
		let tds_tcs = null;
		let header = item.company_id == 3 ? `P: +91-20-24529999 (30 Lines)|F: +91-20-24529997 / +91-20-24529998 | E: surisha@parmarglobal.com` : `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${data.pan_no ? data.pan_no : ''}`;
		if (item.tcs > 0) {
			tds_tcs = item.tcs;
			tds_tcs_label = `Add TCS @${item.tcs}%`;
		} else if (item.tds > 0) {
			tds_tcs = item.tds;
			tds_tcs_label = `Less TDS @${item.tds}%`;
		}

		let LSD = moment(item.pi_date).add(15, 'days').format("DD/MMM/YYYY");
		let expiry = moment(LSD).add(21, 'days').format("DD/MMM/YYYY");

		let headers = {
			header_1: {
				col_1: 'Sr No.',
				col_2: 'Description of Goods',
				col_3: 'Quantity',
				col_4: 'HSN Code',
				col_5: 'Rate',
				col_6: 'Amount',
			}
		};

		let bodynew = [];
		for (var key in headers) {
			if (headers.hasOwnProperty(key)) {
				let header = headers[key];
				let row = new Array();
				row.push({ text: header.col_1, fontSize: 9, bold: true, alignment: 'center', border: [false, true, false, true] });
				row.push({ text: header.col_2, fontSize: 9, bold: true, alignment: 'center', border: [true, true, true, true] });
				row.push({ text: header.col_3, fontSize: 9, bold: true, alignment: 'center', border: [true, true, true, true] });
				row.push({ text: header.col_4, fontSize: 9, bold: true, alignment: 'center', border: [true, true, true, true] });
				row.push({ text: header.col_5, fontSize: 9, bold: true, alignment: 'center', border: [false, true, false, true] });
				row.push({ text: header.col_6, fontSize: 9, bold: true, alignment: 'center', border: [true, true, false, true] });
				bodynew.push(row);
			}
		}

		let total_recievable_amount = 0;
		let advance_amount = 0;

		for (var key in grades) {
			let data1 = grades[key];
			let row = new Array();
			let total_amount = Number(data1.covered_quantity) * Number(data1.final_rate);
			total_recievable_amount += total_amount;
			advance_amount += (data1.advance_amount ? data1.advance_amount : 0);
			row.push({ text: (Number(key) + 1), fontSize: 9, alignment: 'center', border: [false, false, false, false] });
			row.push({ text: data1.main_grade + ' - ' + data1.grade_name, fontSize: 9, alignment: 'center', border: [true, false, true, false] });
			row.push({ text: data1.covered_quantity + ' ' + data1.unit_type, fontSize: 9, alignment: 'center', border: [true, false, true, false] });
			row.push({ text: data1.hsn_code, fontSize: 9, alignment: 'center', border: [true, false, true, false] });
			row.push({ text: '₹' + (data1.final_rate).toFixed(2), fontSize: 9, alignment: 'center', border: [true, false, true, false] });
			row.push({ text: '₹' + (total_amount).toFixed(2), fontSize: 9, alignment: 'right', border: [false, false, false, false] });
			bodynew.push(row);
		}

		let empty_row = [
			{ text: '', border: [false, false, false, false] },
			{ text: '', border: [true, false, false, false] },
			{ text: '', border: [true, false, false, false] },
			{ text: '', border: [true, false, false, false] },
			{ text: '', border: [true, false, false, false] },
			{ text: '', border: [true, false, false, false] }
		];
		bodynew.push(empty_row);
		bodynew.push(empty_row);

		let gst_value = total_recievable_amount * (Number(data.gst_rate) / 100);
		let gst_row = [
			{ text: '', fontSize: 9, border: [false, false, false, false] },
			{ text: 'Output GST: ' + data.gst_rate + '%', fontSize: 9, alignment: 'center', border: [true, false, false, false] },
			{ text: '', fontSize: 9, border: [true, false, false, false] },
			{ text: '', fontSize: 9, border: [true, false, false, false] },
			{ text: '', fontSize: 9, alignment: 'center', border: [true, false, false, false] },
			{ text: '₹' + (gst_value).toFixed(2), fontSize: 9, alignment: 'right', border: [true, false, false, false] }
		];
		bodynew.push(gst_row);

		let tcs_value = 0;
		let tds_value = 0;

		if (item.tcs > 0) {
			tcs_value = (Number(item.tcs) > 0) ? (total_recievable_amount + gst_value) * (Number(item.tcs) / 100) : 0;
			tds_value = 0;
		} else if (item.tds > 0) {
			tcs_value = 0;
			tds_value = (Number(item.tds) > 0) ? total_recievable_amount * (Number(item.tds) / 100) : 0;
		}

		let final_tds_tcs_value = roundAmount(tds_value + tcs_value);

		let tds_tcs_row = [
			{ text: '', fontSize: 9, border: [false, false, true, false] },
			{ text: tds_tcs_label, fontSize: 9, alignment: 'center', border: [false, false, true, false] },
			{ text: '', fontSize: 9, border: [false, false, true, false] },
			{ text: '', fontSize: 9, border: [false, false, true, false] },
			{ text: '', fontSize: 9, alignment: 'center', border: [false, false, true, false] },
			{ text: '₹' + (final_tds_tcs_value).toFixed(2), fontSize: 9, alignment: 'right', border: [false, false, true, false] }
		];
		bodynew.push(tds_tcs_row);

		let sub_total = (total_recievable_amount + gst_value + tcs_value) - tds_value;

		let final_sub_total = roundAmount(sub_total);

		let sub_total_row = [
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: 'NET RECEIVABLE AMOUNT', fontSize: 9, bold: true, alignment: 'center', border: [false, true, true, false] },
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: '₹' + (final_sub_total).toFixed(2), bold: true, fontSize: 9, alignment: 'right', border: [false, true, true, false] }
		];
		bodynew.push(sub_total_row);

		let advance_row = [
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: 'Less : Advance Amount Received', fontSize: 9, alignment: 'left', border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '₹' + (advance_amount).toFixed(2), fontSize: 9, alignment: 'right', border: [true, true, false, false] }
		];
		bodynew.push(advance_row);

		let balance_amount = final_sub_total - advance_amount;
		let balance_row = [
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: 'Balance Amount ', fontSize: 9, alignment: 'left', border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '₹' + (balance_amount).toFixed(2), fontSize: 9, alignment: 'right', border: [true, true, false, false] }
		];
		bodynew.push(balance_row);

		let bank_charges = ((balance_amount * (item.bank_interest_rate / 100)) * (Number(item.lc_days) / 365)) + (item.bank_charges);
		let final_bank_charges = roundAmount(bank_charges);

		let bank_charges_row = [
			{ text: '', fontSize: 9, border: [false, true, true, false] },
			{ text: `LC Discounting & Processing Charges* (${Number(item.lc_days)}-days LC @${item.bank_interest_rate}%p.a.)`, fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '₹' + (final_bank_charges).toFixed(2), fontSize: 9, alignment: 'right', border: [true, true, true, true] }
		];
		bodynew.push(bank_charges_row);

		let bank_charges_gst_value = final_bank_charges * (Number(data.gst_rate) / 100);
		let final_bank_charges_gst_value = roundAmount(bank_charges_gst_value);


		let bank_charges_gst_row = [
			{ text: '', fontSize: 9, border: [false, false, true, true] },
			{ text: 'Add : GST on Bank Charges @ ' + data.gst_rate + '%', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '', fontSize: 9, border: [false, true, false, false] },
			{ text: '₹' + (final_bank_charges_gst_value).toFixed(2), fontSize: 9, alignment: 'right', border: [true, true, true, true] }
		];
		bodynew.push(bank_charges_gst_row);

		let grand_total = balance_amount + final_bank_charges + final_bank_charges_gst_value;

		let footer = [
			{ text: '', fontSize: 9, border: [false, true, false, true] },
			{ text: 'TOTAL BALANCE AMOUNT RECEIVABLE', fontSize: 9, bold: true, border: [true, true, false, true] },
			{ text: '', fontSize: 9, border: [false, true, false, true] },
			{ text: '', fontSize: 9, border: [false, true, false, true] },
			{ text: '', fontSize: 9, border: [false, true, false, true] },
			{ text: '₹' + (grand_total).toFixed(2), fontSize: 9, bold: true, alignment: 'right', border: [true, true, false, true] }
		];
		bodynew.push(footer);

		let signatureBody = [];
		let title_row = [
			{ text: `For ${data.company_name}`, fontSize: 10, bold: true, alignment: 'left', border: [false, false, false, false] },
		];
		signatureBody.push(title_row);

		if (data.company_division_title != null && data.company_division_title != undefined) {
			let division_row = [
				{ text: data.company_division_title, fontSize: 9, alignment: 'left', border: [false, false, false, false] },
			];
			signatureBody.push(division_row);
		}

		let signature_row = [
			{
				border: [false, false, false, false],
				image: data.sign,
				margin: [20, 0, 0, 0],
				width: 70,
				height: 70,
				alignment: 'left'
			}
		];
		signatureBody.push(signature_row);

		let footer_row = [
			{ text: `Authorised Signatory`, fontSize: 10, bold: true, alignment: 'left', border: [false, false, false, false] },
		];
		signatureBody.push(footer_row);

		this.docDefinition = {
			pageSize: 'A4',
			pageMargins: [35, 24, 20, 10],
			background: function (currentPage, pageSize) {
				return [
					{
						canvas: [
							// { type: 'line', x1: 10, y1: 35, x2: 585, y2: 35, lineWidth: 1 }, // Top
							{ type: 'line', x1: 35, y1: 25, x2: 35, y2: 773, lineWidth: 1 }, // Left
							// { type: 'line', x1: 10, y1: 790, x2: 585, y2: 790, lineWidth: 1 }, // Bottom
							{ type: 'line', x1: 575, y1: 25, x2: 575, y2: 773, lineWidth: 1 }, // Rigth
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
													text: data.company_division_title ? `${data.company_division_title} \n` : '',
													fontSize: 9,
													bold: true,
													alignment: 'center'
												},
												{
													text: [
														{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.', fontSize: 8, alignment: 'center' },
														'\n',
														{ text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, Maharashtra, India', fontSize: 8, alignment: 'center' },
														'\n',
														{ text: header, fontSize: 8, alignment: 'center' }
													],
													fontSize: 8
												}
											],
											margin: [5, 5, 5, 5],
											alignment: 'center'
										},
									]
								}
							],
							[
								{
									text: ['PROFORMA INVOICE'],
									bold: true,
									fontSize: 10,
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
									border: [false, false, false, true],
									margin: [3, 3, 3, 3],
									bold: true,
									alignment: 'center',
									text: [
										{ text: 'Proforma Invoice No : ' + item.pi_invoice_no, fontSize: 9 }
									]
								},
								{

									border: [true, false, false, true],
									margin: [3, 3, 3, 3],
									bold: true,
									alignment: 'center',
									text: [
										{ text: 'PI Date : ' + moment(item.pi_date).format("DD-MMM-YYYY"), fontSize: 9 }
									]
								}
							]
						]
					},
				},
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									border: [false, false, true, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: 'Seller :', fontSize: 9, bold: true, decoration: 'underline' },
										'\n',
										{ text: data.company_name, bold: true, fontSize: 10 },
										'\n',
										{ text: '31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037', fontSize: 9 },
										'\n',
										{ text: 'State: Maharashtra', fontSize: 9 },
										'\n',
										{ text: 'GSTIN: ' + data.gst_no, fontSize: 9 }
									],
									alignment: 'left',
								},
								{
									border: [false, false, false, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: 'Buyer :', fontSize: 9, bold: true, decoration: 'underline', },
										'\n',
										{ text: item.sub_org_name, bold: true, fontSize: 10 },
										'\n',
										{ text: item.org_address, fontSize: 9 },
										'\n',
										{ text: 'State: ' + item.state_name, fontSize: 9 },
										'\n',
										{ text: 'GSTIN/UIN: ' + item.gst_no, fontSize: 9 }
									],
									alignment: 'left'
								}
							]
						]
					},
				},
				item.company_id == 3 ? {
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									border: [false, false, false, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: 'Terms of Delivery: ', fontSize: 9, bold: true },
										{ text: (grades && grades.length > 0) ? grades[0].term : '', fontSize: 9 },
										{ text: (grades && grades.length > 0 && grades[0].shipment_from > 0 && grades[0].shipment_from > 0) ? `Shipment: ` : '', fontSize: 9, bold: true },
										{ text: (grades && grades.length > 0 && grades[0].shipment_from > 0 && grades[0].shipment_from > 0) ? `Arrival within ${grades[0].shipment_from} to ${grades[0].shipment_to} days \n` : '', fontSize: 9 },
										{ text: (grades && grades.length > 0 && grades[0].packing) ? `Packing: ` : '', fontSize: 9, bold: true },
										{ text: (grades && grades.length > 0 && grades[0].packing) ? `${grades[0].packing}` : '', fontSize: 9 }
									],
									alignment: 'left',
								},
								{

									border: [true, false, true, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: `Godown: `, fontSize: 9, bold: true },
										{ text: `${item.place_of_loading} Godown`, fontSize: 9 },
										'\n',
										{ text: `Payment Term: `, fontSize: 9, bold: true },
										{ text: `${item.pay_term} `, fontSize: 9 }
									],
									alignment: 'left'
								}
							]
						]
					},
				} : {
					table: {
						widths: ['33.33%', '33.33%', '33.33%'],
						body: [
							[
								{
									border: [false, false, false, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: `Dispatch From: `, fontSize: 9, bold: true },
										'\n',
										{ text: item.place_of_loading, fontSize: 9, bold: true },
									],
									alignment: 'left',
								},
								{

									border: [true, false, false, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: `Dispatch To: `, fontSize: 9, bold: true },
										'\n',
										{ text: item.place_of_destination, fontSize: 9, bold: true },
									],
									alignment: 'left'
								},
								{

									border: [true, false, true, true],
									margin: [3, 3, 3, 3],
									text: [
										{ text: `Mode/Terms of Payment: `, fontSize: 9, bold: true },
										'\n',
										{ text: item.pay_term, fontSize: 9, bold: true },
									],
									alignment: 'left'
								}
							]
						]
					},
				},
				{
					table: {
						margin: [3, 3, 3, 3],
						widths: ['5%', '46.7%', '10%', '10%', '13.3%', '15%'],
						body: bodynew
					},
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									border: [false, false, false, true],
									text: [
										{ text: 'Amount Recievable (in words): ', bold: true },
										{ text: this.amountToWord.transform(grand_total) + ' Only' },
									],
									fontSize: 9,
									alignment: 'left'
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
									border: [false, false, false, false],
									text: [
										{ text: 'Remark: ', bold: true },
										{ text: item.remark, fontSize: 9 },
										'\n',
										{ text: 'Declaration:\nWe declare that the invoice shows the actual price of the goods described and that all particulars are true and correct.\n[Whether Tax is payable or Reserve Charges: No]' },
										'\n'
									],
									fontSize: 9,
									alignment: 'left'
								}
							]
						]
					}
				},
				item.company_id != 3 ? {
					table: {
						widths: ['100%'],
						body: [
							[
								{
									border: [false, true, false, false],
									text: [
										{ text: 'NEGOTIATING / ADVISING BANK DETAILS', bold: true },
										'\n',
										{ text: item.bank_name, fontSize: 9 },
										'\n',
										{ text: item.bank_address, fontSize: 9 },
										'\n',
										{ text: 'IFSC Code: ' + item.ifsc_code, fontSize: 9, bold: true },
									],
									fontSize: 9,
									alignment: 'left'
								}
							]
						]
					},
				} : null,
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									border: [false, true, false, false],
									fontSize: 8,
									text: [
										{ text: 'LC INSTRUCTIONS / CLAUSES: ', bold: true, fontSize: 9, decoration: 'underline' },
									]
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
									border: [false, false, true, false],
									fontSize: 8,
									ol: [
										'Photocopy of Digital TAX Invoice will be acceptable, E-way bill be generated by the Buyer',
										`Negotiating /Advising Bank Details: ${item.bank_name}, IFSC: ${item.ifsc_code}`,
										`Delivery of goods will be ${item.company_id == 3 ? 'SPIPL' : ''} ${(grades && grades.length > 0) ? grades[0].term : ''} warehouse. Loading charges and freight to buyers account.`,
										`LSD on LC should mention as ${LSD} and Expiry ${expiry}`,
										`Variation / Tolerance: 5% + / - on quantity received are acceptable`,
										'LC discounting Charges of ' + (final_bank_charges).toFixed(2) + ' + GST are in to the account of applicant',
										'Discounting Bank charges should be included in the LC value',
										' LC Should Be Confirmed.',
										'All Bank Charges including discrepancy charges are into the account of Applicant.',
										'LR Copy or Acknowledgment on Invoice from Applicant is acceptable.'
									]
								}
							]
						]
					},
				},
				item.company_id == 3 ? {
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									table: {
										widths: ['100%'],
										body: [
											[
												{
													border: [false, false, false, false],
													text: [
														{ text: `Bank Account Name: `, bold: true, fontSize: 9 },
														{ text: data.company_name + (data.company_division_title ? data.company_division_title : ''), fontSize: 9 },
														'\n',
														{ text: `Bank Name: `, bold: true, fontSize: 9 },
														{ text: item.bank_name, fontSize: 9 },
														'\n',
														{ text: `Branch: `, bold: true, fontSize: 9 },
														{ text: item.bank_address, fontSize: 9 },
														'\n',
														{ text: `IFSC: `, bold: true, fontSize: 9 },
														{ text: item.ifsc_code, fontSize: 9 },
													],
													fontSize: 9,
													alignment: 'left'
												}
											]
										]
									}
								},
								{
									table: {
										margin: [0, 0, 0, 0],
										widths: ['100%'],
										body: signatureBody
									},
								}
							]
						],
					}
				} : {
					table: {
						widths: ['100%'],
						body: [
							[
								{
									table: {
										margin: [0, 0, 0, 0],
										widths: ['50%'],
										body: signatureBody
									},
								}
							]
						],
					}
				}
			]
		};
		pdfMake.createPdf(this.docDefinition).open();
	}
}
