import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonService, roundAmount } from '../common-service/common-service';
import { ExportService } from '../export-service/export-service';
import { AmountToWordPipe } from '../amount-to-word/amount-to-word.pipe';
import * as moment from 'moment';
import { CrudServices } from '../crud-services/crud-services';
import { SpiplBankMaster } from '../apis-path/apis-path';

@Injectable({
	providedIn: 'root'
})

export class GenerateSoPvcService {

	constructor(
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe,
		private crudServices: CrudServices
	) {
		// 
	}

	async generateSo(item, percent, company_bank_details) {
		console.log(item);
		let hsn_code = "";
		if (item.gm_hsn_code != null) {
			hsn_code = item.gm_hsn_code;
		} else {
			hsn_code = item.pm_hsn_code;
		}
		let demoData;

		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png');
		let sign = await this.exportService.getBase64ImageFromURL('assets/img/sign.png');
		let obj_gst = percent.find(o => o.percent_type === 'gst');
		let gst_rate = obj_gst.percent_value;
		let interest = (item.company_id == 1 || item.company_id == 3) ? 24 : 36
		let days = (item.company_id == 1) ? 10 : 6;
		days = (item.company_id == 1 && item.is_forward) ? 7 : 6;
		let tds_tcs_label = null;
		let tds_tcs = null;
		let tds_tcs_value = null;
		let order_validity = moment(item.expiry_date).format("YYYY-MM-DD");
		let gradeWithRemark =  item.grade_name || '';
		// if(item.company_id == 1) {
		// 	gradeWithRemark = `${gradeWithRemark} | (${item.remark})`;
		// }
		if (item.tcs > 0) {
			tds_tcs = item.tcs;
			tds_tcs_label = "Add: TCS @ ";
		} else if (item.tds > 0) {
			tds_tcs = item.tds;
			tds_tcs_label = "Less: TDS @ ";
		} else {
			if (item.company_id == 2) {
				tds_tcs = 0.1;
				tds_tcs_label = "Add: TCS @ ";
			} else {
				tds_tcs = 0.1;
				tds_tcs_label = "Less: TDS @ ";
			}
		}

		let total_amount = Number(item.quantity) * Number(item.final_rate);
		let gst_value = total_amount * (Number(gst_rate) / 100);
		let total_with_gst = total_amount + gst_value;
		let tds_value = 0;
		let tcs_value = 0;
		if (item.tds != null && item.tds != undefined) {
			tds_value = (Number(item.tds) > 0) ? Number(total_amount) * (Number(item.tds) / 100) : 0;
		}
		if (item.tcs != null && item.tcs != undefined) {
			tcs_value = (Number(item.tcs) > 0) ? Number(total_with_gst) * (Number(item.tcs) / 100) : 0
		}

		if (tds_value == 0 && tcs_value == 0) {
			if (item.company_id == 2) {
				tds_value = 0;
				tcs_value = Number(total_with_gst) * (0.1 / 100);
			} else {
				tds_value = Number(total_amount) * (0.1 / 100);
				tcs_value = 0;
			}
		}

		if (tcs_value > 0) {
			tds_tcs_value = tcs_value;
		} else {
			tds_tcs_value = tds_value;
		}

		let credit_note_label = null;
		let credit_note_amount = null;
		if (Number(item.credit_note) > 0) {
			credit_note_label = "Less: Credit Note";
			credit_note_amount = item.credit_note;
		}

		let total_minus_tds = total_with_gst - tds_value;
		let total_plus_tcs = total_minus_tds + tcs_value;
		let final_value = total_plus_tcs - Number(credit_note_amount);
		let total_recievable_amount = roundAmount(final_value);

		let grade_body_widths = null;
		let grade_body = null;

		let so_no_new = (item.so_no == null) ? 'SPIPL/PI/' + this.commonService.get_po_financial_year(item.booking_date) + '/' + item.id : item.so_no;

		console.log(company_bank_details, demoData);
		let finalRemark = 'Being Sales Order of ' + item.product_name + ' (' + item.grade_name + ').';
		if(item.company_id == 1 && item.remark.length) {
			finalRemark = 'Being Sales Order of ' + item.product_name + ' ' + item.remark + '.';
		}

		if (item.company_id == 2) {
			grade_body_widths = ['5%', '36%', '10%', '10%', '12%', '12%', '15%'];
			grade_body = [
				[
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Sr. No.',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Description of Goods',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Quantity',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'HSN/SAC',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Bill Rate',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Deal Rate',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Amount',
						alignment: 'center',
						fontSize: 9
					}
				],
				[
					{
						border: [true, true, true, false],
						text: '1',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: gradeWithRemark,
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: item.quantity + ' ' + item.unit_type,
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: hsn_code,
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(item.bill_rate, 'INR'),
						alignment: 'right',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(item.deal_rate, 'INR'),
						alignment: 'right',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(item.base_amount, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: '\nOutput GST: ' + gst_rate + '%',
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: '\n' + this.currencyPipe.transform(gst_value, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: tds_tcs_label + tds_tcs + '%',
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: this.currencyPipe.transform(tds_tcs_value, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: credit_note_label,
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: (credit_note_amount != null) ? this.currencyPipe.transform(Number(credit_note_amount), 'INR') : null,
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: 'Net Payable to Amount',
						alignment: 'right',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(total_recievable_amount, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				]
			];
		} else {
			grade_body_widths = ['5%', '45%', '10%', '10%', '15%', '15%'];
			grade_body = [
				[
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Sr. No.',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Description of Goods',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Quantity',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'HSN/SAC',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Rate',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, true],
						bold: true,
						text: 'Amount',
						alignment: 'center',
						fontSize: 9
					}
				],
				[
					{
						border: [true, true, true, false],
						text: '1',
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: gradeWithRemark,
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: item.quantity + ' ' + item.unit_type,
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: hsn_code,
						alignment: 'center',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(item.final_rate, 'INR'),
						alignment: 'right',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(item.base_amount, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: '\nOutput GST: ' + gst_rate + '%',
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: '\n' + this.currencyPipe.transform(gst_value, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: tds_tcs_label + tds_tcs + '%',
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: this.currencyPipe.transform(tds_tcs_value, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: credit_note_label,
						alignment: 'left',
						fontSize: 9
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: ''
					},
					{
						border: [true, false, true, false],
						text: (credit_note_amount != null) ? this.currencyPipe.transform(Number(credit_note_amount), 'INR') : null,
						alignment: 'right',
						fontSize: 9
					}
				],
				[
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: 'Net Payable to Amount',
						alignment: 'right',
						fontSize: 9
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: ''
					},
					{
						border: [true, true, true, false],
						text: this.currencyPipe.transform(total_recievable_amount, 'INR'),
						alignment: 'right',
						fontSize: 9
					}
				]
			];
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
												{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${item.godown ? item.godown.gst_no.substr(2, 10) : ''}`, fontSize: 8, alignment: 'center' }
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
									text: "SALES ORDER",
									bold: true,
									fontSize: 10,
									decoration: 'underline',
									margin: [0, 5, 0, 0],
									border: [true, true, true, false],
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
									border: [true, false, false, true],
									margin: [0, 0, 0, 3],
									bold: true,
									text: [
										{ text: 'SO No : ' + so_no_new, fontSize: 9 }
									]
								},
								{
									border: [false, false, true, true],
									margin: [0, 0, 0, 3],
									bold: true,
									alignment: 'right',
									text: [
										{ text: 'Booking Date : ' + moment(item.booking_date).format('DD-MMM-YYYY'), fontSize: 9 }
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
									border: [true, false, true, true],
									text: [
										{ text: 'Seller:', fontSize: 10, bold: true, decoration: 'underline' },
										'\n',
										{ text: 'Sushila Parmar International Pvt. Ltd.', bold: true, fontSize: 10 },
										'\n',
										{ text: item.godown_address, fontSize: 9 },
										'\n',
										{ text: `State: ${item.godown_state_name ? item.godown_state_name : 'Maharashtra'}`, fontSize: 9 },
										'\n',
										{ text: 'GSTIN: ' + item.godown_gst_no, fontSize: 9 }
									],
									alignment: 'left',
								},
								{
									border: [false, false, true, true],
									text: [
										{ text: 'Buyer:', fontSize: 10, bold: true, decoration: 'underline' },
										'\n',
										{ text: item.customer, bold: true, fontSize: 10 },
										'\n',
										{ text: item.org_address, fontSize: 9 },
										'\n',
										{ text: 'State: ' + item.state_name, fontSize: 9 },
										'\n',
										{ text: 'GSTIN/UIN: ' + (item.org_gst_no != null ? item.org_gst_no : 'N/A'), fontSize: 9 }
									],
									alignment: 'left'
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
									border: [true, false, false, false],
									margin: [0, 5, 0, 0],
									text: [
										{ text: 'Terms of Delivery: ', fontSize: 9, bold: true },
										{ text: item.delivery_term, fontSize: 9 },
									],
									alignment: 'left',
								},
								{
									border: [false, false, true, false],
									margin: [0, 5, 0, 0],
									text: [
										{ text: 'Name of Transporter: ', fontSize: 9, bold: true },
										{ text: '', fontSize: 9 },
									],
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, false, false],
									text: [
										{ text: 'Order Validity: ', fontSize: 9, bold: true },
										{ text: moment(order_validity).format('DD-MMM-YYYY'), fontSize: 9 },
									],
									alignment: 'left',
								},
								{
									border: [false, false, true, false],
									text: [
										{ text: 'Payment Term: ', fontSize: 9, bold: true },
										{ text: item.is_forward == 0 ? item.payment_term_label + ' (Interest @ ' + interest + '% will be charged on delayed payment)' : item.advance > 0 ? (item.advance + ` % Advance by RTGS and Balance Payment within ${item.payment_term ? item.payment_term_label : '5 Days'} from the Invoice date (Interest @ ${interest} % will be charged on delayed payment)`) : `Payment within ${item.payment_term_label} from the Invoice date (Interest @ ${interest} % will be charged on delayed payment)`, fontSize: 9 },
									],
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, false, false],
									margin: [0, 0, 0, 5],
									text: [
										{ text: 'Dispatch From: ', fontSize: 9, bold: true },
										{ text: item.godown_name + ' Godown', fontSize: 9 },
									],
									alignment: 'left',
								},
								{
									border: [false, false, true, false],
									margin: [0, 0, 0, 5],
									text: `${(item.delivery_term_id && item.delivery_term_id == 2) ? 'Buyer is liable for generation of E-way bill.' : ''}`, fontSize: 9,
									alignment: 'left'
								}
							]
						]
					},
				},
				{
					table: {
						margin: [3, 3, 3, 3],
						widths: grade_body_widths,
						body: grade_body
					},
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									border: [true, true, true, true],
									text: [
										{ text: 'Amount Receivable (in Words): ', bold: true },
										{ text: this.amountToWord.transform(total_recievable_amount) + ' Only' },
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
									border: [true, false, true, false],
									margin: [0, 5, 0, 0],
									text: [
										{ text: 'Remarks: ', bold: true },
										{ text: finalRemark, fontSize: 9, bold: true },
									],
									fontSize: 9,
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									text: 'Declaration: ',
									fontSize: 9,
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									text: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
									fontSize: 9,
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									margin: [0, 0, 0, 5],
									text: '[Whether tax is payable or Reserve Charge Basis: No]',
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
									border: [true, true, true, false],
									margin: [0, 3, 0, 0],
									text: 'Terms and Conditions:',
									fontSize: 9,
									bold: true,
									decoration: 'underline',
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									fontSize: 8,
									ol: [
										(item.company_id == 1) ? 'If no objection received within 3 hours (from sent time over email) for the sales order / invoice, it will be presumed as confirmed & accepted by buyer.' : 'Once the deal is confirmed will not be cancelled under any condition.',
										'Goods once sold will not be taken back at any condition.',
										'In case of advance payment deals, advance amount must be paid to seller from buyer side within ' + days + ' days of the sales order / deal confirmation date or decided time (whichever is earlier) at time of deal confirmation. If buyer fails to do so, then it is 100% seller choice to keep the deal / modify the deal / cancel the deal.',
										'In case any disputes arises (including delay payments without good consent of seller), seller has full right to go for legal action for payment recovery after 1 official reminder by email. In such scenario all legal charges/fees, interest, penalty, increased price difference (if any) etc. as mentioned in 2nd point will be added in the amount of recovery.',
										'All liability / responsibility of goods/ cargo will be on buyer account only (including market prices fluctuation, goods in transit etc.)',
										'All goods sold on ex ware-house (transportation arranged by buyer) basis, must get lifted within 3 days of confirmation / sales order date or as agreed during confirmation (whichever is earlier). In case of late lifting of goods (without good consent of seller), seller is not responsible for any damage/ theft etc. happening to goods & has right to modify the deal / cancel the deal & foresight the amount paid without any reminder / notice to buyer.',
										'All warranty / Guarantee for the goods to be entertained by principal companies only. Seller is not responsible for the same for any type of issues. In case if Sushila Parmar International Pvt. Ltd. is the principal / manufacturer of the goods sold, buyer is bound to intimate by official e mail for the issue / problem in the goods (with satisfying proof including pictures, videos etc.) within 48 hours of dispatch of material. If buyer fails to intimate within 48 hours from time of dispatch, seller is not bound to accept return of goods or any damages caused at any time (damages like: return of goods /exchange the goods / any discount in prices / claims etc.).',
										'Disputes (if any) will be subjected to Pune jurisdiction.'
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
								[
									{
										border: [true, true, true, true],
										text: [
											{ text: (item.company_id == 1 && item.is_forward == 1) ? 'Account Number: ' : 'Virtual Account Number: ', bold: true },
											{ text: company_bank_details.account_no },
										],
										fontSize: 9,
										margin: [3, 5, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'Bank Name: ', bold: true },
											{ text: company_bank_details.bank_name },
										],
										fontSize: 9,
										margin: [3, 3, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'Branch: ', bold: true },
											{ text: company_bank_details.branch_name },
										],
										fontSize: 9,
										margin: [3, 3, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'IFSC Code: ', bold: true },
											{ text: company_bank_details.ifsc_code },
										],
										fontSize: 9,
										margin: [3, 3, 0, 0],
										alignment: 'left'
									}
								],
								[
									[
										{
											text: 'For Sushila Parmar International Pvt. Ltd.\n',
											fontSize: 9,
											bold: true,
											alignment: 'right',
											margin: [0, 5, 3, 0],
											border: [true, false, true, false]
										},
										{
											image: sign,
											width: 60,
											height: 60,
											alignment: 'right',
											margin: [0, 0, 3, 0],
											border: [true, false, true, false]
										},
										{
											text: 'Authorised Signatory',
											fontSize: 9,
											bold: true,
											alignment: 'right',
											margin: [0, 0, 3, 5],
											border: [true, false, true, true]
										}
									]
								]
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
