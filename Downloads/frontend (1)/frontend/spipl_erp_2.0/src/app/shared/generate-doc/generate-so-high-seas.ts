import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonService, roundAmount } from '../common-service/common-service';
import { ExportService } from '../export-service/export-service';
import { AmountToWordPipe } from '../amount-to-word/amount-to-word.pipe';
import * as moment from 'moment';

@Injectable({
	providedIn: 'root'
})

export class GenerateSoHighSeasService {

	constructor(
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe
	) {
		// 
	}

	async generateSo(item, company_bank_details) {
		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png');
		let sign = await this.exportService.getBase64ImageFromURL('assets/img/sign.png');
		let mid_date = moment().format("YYYY-MM") + "-20";
		let start_date = null;
		let end_date = null;
		if (moment().isBefore(moment(mid_date))) {
			start_date = moment().format("MMMM YYYY");
			end_date = moment().add(1, 'M').format("MMMM YYYY");
		} else {
			start_date = moment().add(1, 'M').format("MMMM YYYY");
			end_date = moment().add(2, 'M').format("MMMM YYYY");
		}
		let shipment_month = start_date + ' / ' + end_date;

		let payment_term_label_new = null;

		if (item.payment_type == 3) {
			let balance = 100 - Number(item.advance);
			payment_term_label_new = item.advance + '% Advance & ' + balance + '% Against High Seas Document';
		} else {
			payment_term_label_new = 'IMMEDIATE BY RTGS AGAINST TRANSFER OF HIGH SEAS DOCUMENTS';
		}

		const docDefinition = {
			content: [
				{
					table: {
						widths: ['10%', '90%'],
						body: [
							[
								{
									border: [false, false, false, false],
									image: logo,
									width: 60,
									height: 60,
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
												{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${item.godown ? item.godown.gst_no.substr(2, 10) : ''}`, fontSize: 8, alignment: 'center' }
											],
											fontSize: 8
										}
									],
									border: [false, false, false, false],
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
									text: "SALES CONTRACT / PROFORMA INVOICE",
									bold: true,
									fontSize: 9,
									decoration: 'underline',
									border: [false, false, false, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['70%', '30%'],
						border: [false, false, false, false],
						body: [
							[
								{
									text: 'Buyer / Customer / Invoice To: ',
									fontSize: 8,
									bold: true,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'SC NO: ' + item.so_no, fontSize: 8, bold: true, },
									],
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								}
							],
							[

								{
									text: item.customer.toUpperCase(),
									fontSize: 9,
									bold: true,
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'SC DATE: ', fontSize: 8, bold: true, },
										{ text: moment(item.booking_date).format('DD-MMM-YYYY'), fontSize: 8, bold: true, },
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: item.org_address,
									fontSize: 8,
									bold: true,
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{ text: 'IE CODE: ', fontSize: 8, bold: true, },
										{ text: item.ie_code, fontSize: 8, bold: true, },
									],
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{ text: 'GST NO: ', fontSize: 8, bold: true, },
										{ text: (item.org_gst_no != null ? item.org_gst_no : 'N/A'), fontSize: 8, bold: true, },
									],
									margin: [0, 0, 0, 5],
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['40%', '20%', '20%', '20%'],
						body: [
							[
								{
									text: 'DESCRIPTION OF GOODS',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'QUANTITY\n(MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'UNIT PRICE\n' + item.inco_term.toUpperCase() + ' ' + item.port_name.toUpperCase() + '\n(USD/MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'AMOUNT\n(USD)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								}
							],
							[
								{
									text: item.grade_name.toUpperCase(),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: item.quantity + ' ' + item.unit_type,
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(item.final_rate, 'USD'),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(item.base_amount, 'USD'),
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
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'SHIPMENT',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: shipment_month.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'INCOTERMS',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.inco_term.toUpperCase() + '-' + item.port_name.toUpperCase() + ', INDIA',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'FINAL PLACE OF DELIVERY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.inco_term.toUpperCase() + '-' + item.port_name.toUpperCase() + ', INDIA',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PAYMENT',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: payment_term_label_new,
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PACKING',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.packing.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'NAME OF THE MANUFACTURER',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.supplier.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'COUNTRY OF ORIGIN',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.supplier_country.toUpperCase(),
									fontSize: 8,
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
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'BENEFICIARY NAME',
									fontSize: 8,
									bold: true,
									border: [true, true, false, false],
									alignment: 'left'
								},
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 8,
									border: [true, true, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'BANK NAME',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: company_bank_details.bank_name,
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'BANK ADDRESS',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: company_bank_details.branch_name,
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'ACCOUNT NUMBER',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: company_bank_details.account_no,
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'IFSC Code',
									fontSize: 8,
									bold: true,
									border: [true, false, false, true],
									alignment: 'left'
								},
								{
									text: company_bank_details.ifsc_code,
									fontSize: 8,
									border: [true, false, true, true],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'REMARKS',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									ol: [
										'THE USD CONVERSION RATE WILL BE DERIVED ON THE DATE OF TRANSFER OF HIGH SEAS DOCUMENT.',
										'MATERIAL SOLD ON HIGHSEAS BASIS, HENCE THE MATERIAL HAS TO BECLEARED BY THE BUYER DIRECTLY FROM MUNDRA PORT.',
										'ALL CLEARING CHARGES / DUTY ARE TO THE ACCOUNT OF BUYER.',
										'TRANSIT INSURANCE FROM MUNDRA PORT TO BUYERS LOCATION WILL BE TOTHE ACCOUNT OF BUYER.'
									],
									fontSize: 8,
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
									text: 'THE SELLER',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'ACCEPTED BY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.customer.toUpperCase(),
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									image: sign,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false],
									width: 70,
									height: 70
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: 'AUTHORIZED SIGNATORY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'AUTHORIZED SIGNATORY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				}
			]
		};
		return docDefinition;
		// pdfMake.createPdf(docDefinition).open();
	}

}
