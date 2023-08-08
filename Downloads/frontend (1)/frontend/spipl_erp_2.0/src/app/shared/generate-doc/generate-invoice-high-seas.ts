import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonService, roundAmount } from '../common-service/common-service';
import { ExportService } from '../export-service/export-service';
import { AmountToWordPipe } from '../amount-to-word/amount-to-word.pipe';
import * as moment from 'moment';

@Injectable({
	providedIn: 'root'
})

export class GenerateInvoiceHighSeasService {

	constructor(
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe
	) {
		// 
	}

	async generateInvoice(item) {
		let inr_rate = Number(item.final_rate) * Number(item.exchange_rate);
		let inr_total = Number(item.base_amount) * Number(item.exchange_rate);

		const docDefinition = {
			pageOrientation: 'portrait',
			content: [
				{
					margin: [30, 450, 30, 0],
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: "HIGH SEAS SALE CONTRACT",
									bold: true,
									fontSize: 11,
									decoration: 'underline',
									border: [false, false, false, false],
									alignment: 'center'
								}
							],
							[
								{
									text: "DATE: " + moment().format("DD.MM.YYYY"),
									fontSize: 10,
									border: [false, false, false, false],
									alignment: 'right'
								}
							]
						]
					}
				},
				'\n',
				{
					margin: [30, 0, 30, 0],
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: 'SELLER:',
									fontSize: 10,
									decoration: 'underline',
									alignment: 'left',
								},
								{
									text: 'BUYER:',
									fontSize: 10,
									decoration: 'underline',
									alignment: 'left',
								}
							],
							[
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 10,
									bold: true,
									alignment: 'left',
									border: [true, false, true, false]
								},
								{
									text: item.customer.toUpperCase(),
									fontSize: 10,
									bold: true,
									alignment: 'left',
									border: [false, false, true, false]
								}
							]
						]
					}
				},
				{
					margin: [30, 0, 30, 0],
					table: {
						widths: ['50%', '50%'],
						heights: 50,
						body: [
							[
								{
									text: '31, Shree Adinath Shopping Center, Pune-Satara Road, Pune-411037, Maharashtra',
									fontSize: 8,
									lineHeight: 1.3,
									alignment: 'left',
									border: [true, false, true, true]
								},
								{
									text: item.org_address,
									fontSize: 8,
									lineHeight: 1.3,
									alignment: 'left',
									border: [false, false, true, true]
								}
							]
						]
					}
				},
				{
					margin: [30, 0, 30, 0],
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: 'Dear Sir,',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 15, 0, 10],
									alignment: 'left',
								}
							],
							[
								{
									text: 'We confirm having sold to you the following mercantile on as per terms and conditions given below:',
									fontSize: 9,
									border: [false, false, false, false]
								}
							]
						]
					},
					pageBreak: 'after'
				},
				{
					margin: [30, 20, 30, 0],
					table: {
						widths: ['30%', '70%'],
						body: [
							[
								{
									text: 'MATERIAL DESCRIPTION',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: item.grade_name.toUpperCase(),
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'QUANTITY (MT/KGS)',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: [
										{
											text: 'GROSS WT: ' + item.quantity + ' MT'
										},
										'\n',
										{
											text: 'NET WT: ' + item.quantity + ' MT'
										}
									],
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'QUANTITY (PKG/BGS)',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: item.packing.toUpperCase(),
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'VESSEL',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: item.vessel.toUpperCase(),
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'BL/NO & DATE',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: item.bl_no + ', Date: ' + moment(item.bl_date).format('DD.MM.YYYY'),
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'COMMERCIAL INVOICE NO.',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: item.commercial_invoice_no,
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'CONSIDERATION (INR)',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: [
										{
											text: 'UNIT PRICE: ' + this.currencyPipe.transform(inr_rate, 'INR')
										},
										'\n',
										{
											text: 'TOTAL VALUE: ' + this.currencyPipe.transform(inr_total, 'INR')
										}
									],
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'PAYMENT',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: 'The buyer has to make payment of bill at the time of transfer of documents in his favour.',
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'DELIVERY',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: 'All rights and titles of the goods will be transferred in favour of the buyer by endorsement of B/L in his favour.',
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'CLEARANCE',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: 'The buyer will arrange the clearance of the goods after making payment of Customs Duty, Port Charges, Octroi Demurrages, of their own.',
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							],
							[
								{
									text: 'TAXATION',
									fontSize: 9,
									decoration: 'underline',
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								},
								{
									text: 'The subject sale being on High Seas is exempted from Sales Tax. In case any Sale Tax is imposed by any authority whatsoever in future will be on a/c of the buyer. If any Sale Tax is paid by the seller. The same shall be reimbursed by the buyer to the seller.',
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 5, 0, 0]
								}
							]
						]
					},
				},
				{
					margin: [30, 0, 30, 0],
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: 'The above sale is also subject to force majeure clause and Clause and Government Rules and Regulations. In token of your acceptance and confirmation of the above terms and conditions please return us the duplicate copy of this agreement duly signed by you.',
									fontSize: 9,
									alignment: 'left',
									border: [false, false, false, false],
									margin: [0, 8, 0, 0]
								}
							],
							[
								{
									text: 'Thanking you,',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 10, 0, 0],
									alignment: 'left'
								}
							]
						]
					}
				},
				{
					margin: [30, 0, 30, 0],
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - \nSELLER',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 80, 0, 0],
									alignment: 'center'
								},
								{
									canvas: [
										{
											type: 'rect',
											x: 0,
											y: -100,
											w: 120,
											h: 120,
											lineWidth: 1
										},
									],
									border: [false, false, false, false],
									margin: [0, 80, 0, 0],
									alignment: 'right'
								}
							],
							[
								{
									text: 'M/S: SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 10,
									bold: true,
									border: [false, false, false, false],
									margin: [0, 10, 0, 0],
									alignment: 'left'
								},
								{
									text: '',
									border: [false, false, false, false],
								}
							],
							[
								{
									text: [
										{
											text: 'NAME: Sahil S. Bamboli'
										},
										'\n',
										{
											text: 'DESIGNATION: Authorized Signatory'
										},
										'\n',
										{
											text: 'IEC: 3109022087'
										},
										'\n',
										{
											text: 'GST NO.: 27AAFCP3570LIZ2'
										},
									],
									fontSize: 9,
									lineHeight: 1.3,
									border: [false, false, false, false],
									margin: [0, 0, 0, 0],
									alignment: 'left'
								},
								{
									text: '',
									border: [false, false, false, false],
								}
							]
						]
					},
					pageBreak: 'after'
				},
				{
					margin: [30, 35, 30, 0],
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - \nBUYER',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 80, 0, 0],
									alignment: 'center'
								},
								{
									canvas: [
										{
											type: 'rect',
											x: 0,
											y: -100,
											w: 120,
											h: 120,
											lineWidth: 1
										},
									],
									border: [false, false, false, false],
									margin: [0, 80, 0, 0],
									alignment: 'right'
								}
							],
							[
								{
									text: 'M/S: ' + item.customer.toUpperCase(),
									fontSize: 10,
									bold: true,
									border: [false, false, false, false],
									margin: [0, 10, 0, 0],
									alignment: 'left'
								},
								{
									text: '',
									border: [false, false, false, false],
								}
							],
							[
								{
									text: [
										{
											text: 'NAME: ' + item.authorized_person_name
										},
										'\n',
										{
											text: 'DESIGNATION: Authorized Signatory'
										},
										'\n',
										{
											text: 'IEC: ' + item.ie_code
										},
										'\n',
										{
											text: 'GST NO.: ' + (item.org_gst_no != null ? item.org_gst_no : 'N/A')
										},
									],
									fontSize: 9,
									lineHeight: 1.3,
									border: [false, false, false, false],
									margin: [0, 0, 0, 0],
									alignment: 'left'
								},
								{
									text: '',
									border: [false, false, false, false],
								}
							]
						]
					}
				},
				{
					margin: [30, 0, 30, 0],
					table: {
						widths: ['15%', '75%'],
						body: [
							[
								{
									text: 'WITNESS:',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 50, 0, 0],
									alignment: 'left'
								},
								{
									text: '_________________________',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 50, 0, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'NAME:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.witness_1_name,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'ADDRESS:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.witness_1_address,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PAN:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.witness_1_pan,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'WITNESS:',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 30, 0, 0],
									alignment: 'left'
								},
								{
									text: '_________________________',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 30, 0, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'NAME:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.witness_2_name,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'ADDRESS:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.witness_2_address,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PAN:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.witness_2_pan,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
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
									text: "INVOICE HIGH SEAS SALE",
									bold: true,
									fontSize: 12,
									decoration: 'underline',
									border: [false, false, false, false],
									margin: [0, 100, 0, 0],
									alignment: 'center'
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
									text: "Buyer Name & Address:",
									bold: true,
									fontSize: 10,
									decoration: 'underline',
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['50%', '50%'],
						border: [false, false, false, false],
						body: [
							[
								{
									text: item.customer.toUpperCase(),
									fontSize: 10,
									bold: true,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'Invoice No.: ',
											fontSize: 8,
											bold: true
										},
										{
											text: item.invoice_no.toUpperCase(),
											fontSize: 9
										}
									],
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: item.org_address,
									fontSize: 8,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'Invoice Date: ',
											fontSize: 8,
											bold: true
										},
										{
											text: moment(item.invoice_date).format('DD/MM/YYYY'),
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{
											text: 'GST Tin No.: ',
											fontSize: 8,
											bold: true
										},
										{
											text: (item.org_gst_no != null ? item.org_gst_no : 'N/A'),
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'Container Lines: ',
											fontSize: 8,
											bold: true
										},
										{
											text: item.container_lines.toUpperCase(),
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{
											text: 'PAN No.: ',
											fontSize: 8,
											bold: true
										},
										{
											text: item.org_pan_no,
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'B/L No.: ',
											fontSize: 8,
											bold: true
										},
										{
											text: item.bl_no.toUpperCase(),
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'B/L Date: ',
											fontSize: 8,
											bold: true
										},
										{
											text: moment(item.bl_date).format('DD/MM/YYYY'),
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'Country of Origin: ',
											fontSize: 8,
											bold: true
										},
										{
											text: item.supplier_country.toUpperCase(),
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: '',
									border: [false, false, false, false]
								},
								{
									text: [
										{
											text: 'Payment Terms: ',
											fontSize: 8,
											bold: true
										},
										{
											text: item.payment_term_label,
											fontSize: 8
										},
									],
									border: [false, false, false, false]
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['10%', '30%', '15%', '20%', '25%'],
						body: [
							[
								{
									text: 'SR.NO.',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'PARTICULARS',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'QUANTITY (MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'RATE (Rs.)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'AMOUNT (Rs.)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								}
							],
							[
								{
									text: '1',
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: item.grade_name,
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: item.quantity + ' ' + item.unit_type,
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(inr_rate, 'INR'),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(inr_total, 'INR'),
									fontSize: 8,
									alignment: 'center'
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
									text: 'All financial outlays on this consignment after arrival of the goods in Indian Customs frontiers shall be borne by you separately.',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: 'Total:',
									fontSize: 9,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: this.currencyPipe.transform(inr_total, 'INR'),
									fontSize: 9,
									bold: true,
									border: [false, false, false, false],
									alignment: 'right'
								}
							],
							[
								{
									text: 'Amount in Words:',
									fontSize: 9,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: this.amountToWord.transform(inr_total) + ' Only',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'right'
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
											text: 'IEC No.: ',
											fontSize: 8,
											bold: true
										},
										{
											text: '3109022087',
											fontSize: 8
										},
									],
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: [
										{
											text: 'GST Tin No.: ',
											fontSize: 8,
											bold: true
										},
										{
											text: '27AAFCP3570LIZ2',
											fontSize: 8
										},
									],
									border: [false, false, false, false],
									alignment: 'left'
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
									text: 'Terms & Conditions:',
									fontSize: 8,
									bold: true,
									decoration: 'underline',
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									ol: [
										'No Claims will be recognized unless notified in writing within 8 days.',
										'Interest @18% p.a. will be charged on this bill from due date.'
									],
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
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
									text: 'DATE: ' + moment().format('DD.MM.YYYY'),
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 100, 0, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'To,',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 20, 0, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'The Asst. Commissioner of Customs,\nCustoms House,\n' + item.custom_house + '\n' + item.port_name.toUpperCase(),
									fontSize: 9,
									border: [false, false, false, false],
									bold: true,
									alignment: 'left'
								}
							],
							[
								{
									text: 'Dear Sir,',
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 15, 0, 10],
									alignment: 'left',
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['5%', '95%'],
						body: [
							[
								{
									text: 'Sub:',
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'IMPORT CONSIGNMENT OF NET WT. ' + item.quantity + ' MT OF ' + item.grade_name,
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: '',
									border: [false, false, false, false],
								},
								{
									text: 'VESSEL NAME & VOY: ' + item.vessel.toUpperCase(),
									fontSize: 9,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: '',
									border: [false, false, false, false],
								},
								{
									text: 'B/L No.: ' + item.bl_no + ', B/L Date: ' + moment(item.bl_date).format('DD.MM.YYYY'),
									fontSize: 9,
									border: [false, false, false, false],
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
									canvas: [
										{
											type: 'line',
											x1: 0,
											y1: 0,
											x2: 515,
											y2: 0,
											lineWidth: 1,
											dash: {
												length: 5,
												space: 2
											}
										},
									],
									border: [false, false, false, false]
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
											text: 'We hereby declare that we have sold the above goods to "',
											fontSize: 9
										},
										{
											text: 'M/s. ' + item.customer + ' ' + item.org_address,
											bold: true,
											fontSize: 9
										},
										{
											text: '" On "HIGH SEAS" basis in terms of the provision to sub-clause [iii] of Para 5 of Import Trade Control Order 1995, and we/they are hereby authorized to complete the formalities precedent to the Clearance.',
											fontSize: 9
										}
									],
									border: [false, false, false, false]
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
											text: 'Thanking You,'
										},
										'\n\n',
										{
											text: 'Yours faithfully,'
										},
										'\n\n',
										{
											text: 'For Sushila Parmar International Pvt. Ltd.',
											bold: true
										}
									],
									fontSize: 9,
									border: [false, false, false, false],
									margin: [0, 20, 0, 0],
									alignment: 'left'
								}
							],
							[
								{
									text: 'Authorized Signatory',
									fontSize: 9,
									bold: true,
									border: [false, false, false, false],
									margin: [0, 60, 0, 0],
									alignment: 'left'
								}
							]
						]
					},
					// pageBreak: 'after'
				},
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: 'DATE: ' + moment().format('DD.MM.YYYY'),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 100, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'To,',
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 20, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'The Deputy Commissioner of Customs,\nImport Department,\n' + custom_house_2 + ',\n' + item.port_name.toUpperCase(),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'Dear Sir,',
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 15, 0, 10],
				// 					alignment: 'left',
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: 'Sub: Customs Clearance of Import Consignments',
				// 					fontSize: 9,
				// 					bold: true,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[

				// 				{
				// 					text: 'IMPORT CONSIGNMENT OF NET WT. ' + item.quantity + ' MT OF ' + item.grade_name,
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'VESSEL NAME & VOY: ' + vessel.toUpperCase(),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'B/L No.: ' + item.bl_no + ', B/L Date: ' + moment(item.bl_date).format('DD.MM.YYYY'),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					canvas: [
				// 						{
				// 							type: 'line',
				// 							x1: 0,
				// 							y1: 0,
				// 							x2: 515,
				// 							y2: 0,
				// 							lineWidth: 1
				// 						}
				// 					],
				// 					margin: [0, 5, 0, 5],
				// 					border: [false, false, false, false]
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: [
				// 						{
				// 							text: 'This is to confirm & inform you that we undersigned hereby authorize ',
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: 'M/s. ' + shipping_name.toUpperCase(),
				// 							bold: true,
				// 							decoration: 'underline',
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: ', Customs House Agent R. No.: ' + custom_r_no,
				// 							bold: true,
				// 							decoration: 'underline',
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: ', having their Registered Office at ',
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: shipping_address,
				// 							bold: true,
				// 							decoration: 'underline',
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: ' to transact our Import/Export Consignments arrived/arriving to be cleared on our behalf at Mumbai Customs Station from its jurisdictions.',
				// 							fontSize: 9
				// 						},
				// 					],
				// 					lineHeight: 1.5,
				// 					border: [false, false, false, false]
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: [
				// 						{
				// 							text: 'Thanking You,'
				// 						},
				// 						'\n\n',
				// 						{
				// 							text: 'Yours faithfully,'
				// 						},
				// 						'\n\n',
				// 						{
				// 							text: 'For ' + item.customer.toUpperCase(),
				// 							bold: true
				// 						}
				// 					],
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 20, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'Authorized Signatory',
				// 					fontSize: 9,
				// 					bold: true,
				// 					border: [false, false, false, false],
				// 					margin: [0, 60, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			]
				// 		]
				// 	},
				// 	pageBreak: 'after'
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: 'DATE: ' + moment().format('DD.MM.YYYY'),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 100, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'To,',
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 20, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'The Asst. Commissioner of Customs,\nCustoms House,\n' + custom_house_1 + '\n' + item.port_name.toUpperCase(),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					bold: true,
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'Dear Sir,',
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 15, 0, 10],
				// 					alignment: 'left',
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['5%', '95%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: 'Sub:',
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				},
				// 				{
				// 					text: 'IMPORT CONSIGNMENT OF NET WT. ' + item.quantity + ' MT OF ' + item.grade_name,
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: '',
				// 					border: [false, false, false, false],
				// 				},
				// 				{
				// 					text: 'VESSEL NAME & VOY: ' + vessel.toUpperCase(),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: '',
				// 					border: [false, false, false, false],
				// 				},
				// 				{
				// 					text: 'B/L No.: ' + item.bl_no + ', B/L Date: ' + moment(item.bl_date).format('DD.MM.YYYY'),
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					alignment: 'left'
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					canvas: [
				// 						{
				// 							type: 'line',
				// 							x1: 0,
				// 							y1: 0,
				// 							x2: 515,
				// 							y2: 0,
				// 							lineWidth: 1,
				// 							dash: {
				// 								length: 5,
				// 								space: 2
				// 							}
				// 						},
				// 					],
				// 					border: [false, false, false, false]
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: [
				// 						{
				// 							text: 'We hereby declare that we have purchased the above goods from "',
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: 'M/s. SUSHILA PARMAR INTERNATIONAL PVT. LTD., 31, Shree Adinath Shopping Center, Pune-Satara Road, Pune-411037, Maharashtra.',
				// 							bold: true,
				// 							fontSize: 9
				// 						},
				// 						{
				// 							text: '" On "HIGH SEAS" sale basis in terms of the provision to sub-clause [iii] of Para 5 of Import Trade Control Order 1995, and we/they are hereby authorized to complete the formalities precedent to the Clearance.',
				// 							fontSize: 9
				// 						}
				// 					],
				// 					border: [false, false, false, false]
				// 				}
				// 			]
				// 		]
				// 	}
				// },
				// {
				// 	table: {
				// 		widths: ['100%'],
				// 		body: [
				// 			[
				// 				{
				// 					text: [
				// 						{
				// 							text: 'Thanking You,'
				// 						},
				// 						'\n\n',
				// 						{
				// 							text: 'Yours faithfully,'
				// 						},
				// 						'\n\n',
				// 						{
				// 							text: 'For ' + item.customer.toUpperCase(),
				// 							bold: true
				// 						}
				// 					],
				// 					fontSize: 9,
				// 					border: [false, false, false, false],
				// 					margin: [0, 20, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			],
				// 			[
				// 				{
				// 					text: 'Authorized Signatory',
				// 					fontSize: 9,
				// 					bold: true,
				// 					border: [false, false, false, false],
				// 					margin: [0, 60, 0, 0],
				// 					alignment: 'left'
				// 				}
				// 			]
				// 		]
				// 	}
				// }
			]
		};
		return docDefinition;
		// pdfMake.createPdf(docDefinition).open();
	}
}
