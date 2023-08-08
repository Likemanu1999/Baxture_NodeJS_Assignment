import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonService, roundAmount } from '../common-service/common-service';
import { ExportService } from '../export-service/export-service';
import { AmountToWordPipe } from '../amount-to-word/amount-to-word.pipe';
import * as moment from 'moment';

@Injectable({
	providedIn: 'root'
})

export class GenerateSoSurishaService {

	constructor(
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe
	) {
		// 
	}

	async generateSo(item, percent, company_bank_details) {
		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/surisha_logo.png');
		let company_name = "SURISHA";
		let so_no_prefix = "SURISHA/PI/";
		let company_email = "surisha@parmarglobal.com";
		let company_warehouse = "Ex-Surisha";
		let authorised_company_name = "For Surisha\n(A Division of Sushila Parmar International Pvt. Ltd.)";
		let sign = await this.exportService.getBase64ImageFromURL('assets/img/sign.png');
		let obj_gst = percent.find(o => o.percent_type === 'gst');
		let gst_rate = obj_gst.percent_value;
		let tds_tcs_label = null;
		let tds_tcs = null;
		let tds_tcs_value = null;
		let payment_term_label = null;

		if (item.payment_type == 2) {
			payment_term_label = item.advance_payment_term + "% Advance against SC/PI & " + item.balance_payment_term + "% Balance RTGS before vessel arrival";
		} else if (item.payment_type == 4) {
			payment_term_label = item.advance_payment_term + "% Advance against SC/PI & " + item.balance_payment_term + "% Balance against LC";
		} else {
			payment_term_label = null;
		}

		if (item.tcs > 0) {
			tds_tcs = item.tcs;
			tds_tcs_label = "Add: TCS @ ";
		} else if (item.tds > 0) {
			tds_tcs = item.tds;
			tds_tcs_label = "Less: TDS @ ";
		} else {
			tds_tcs = 0.1;
			tds_tcs_label = "Less: TDS @ ";
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
			tds_value = Number(total_amount) * (0.1 / 100);
			tcs_value = 0;
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

		let so_no_new = (item.so_no == null) ? so_no_prefix + this.commonService.get_po_financial_year(item.booking_date) + '/' + item.id : item.so_no;


		grade_body_widths = ['5%', '45%', '10%', '10%', '15%', '15%'];
		grade_body = [
			[
				{
					border: [true, true, true, true],
					bold: true,
					text: 'Sr. No.',
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, true],
					bold: true,
					text: 'Description of Goods',
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, true],
					bold: true,
					text: 'Quantity',
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, true],
					bold: true,
					text: 'HSN/SAC',
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, true],
					bold: true,
					text: 'Rate',
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, true],
					bold: true,
					text: 'Amount',
					alignment: 'center',
					fontSize: 8
				}
			],
			[
				{
					border: [true, true, true, false],
					text: '1',
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, false],
					text: item.grade_name,
					alignment: 'left',
					fontSize: 8
				},
				{
					border: [true, true, true, false],
					text: item.quantity + ' ' + item.unit_type,
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, false],
					text: item.hsn_code,
					alignment: 'center',
					fontSize: 8
				},
				{
					border: [true, true, true, false],
					text: this.currencyPipe.transform(item.final_rate, 'INR'),
					alignment: 'right',
					fontSize: 8
				},
				{
					border: [true, true, true, false],
					text: this.currencyPipe.transform(item.base_amount, 'INR'),
					alignment: 'right',
					fontSize: 8
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
					fontSize: 8
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
					fontSize: 8
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
					fontSize: 8
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
					fontSize: 8
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
					fontSize: 8
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
					fontSize: 8
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
					alignment: 'left',
					fontSize: 8,
					bold: true
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
					fontSize: 8
				}
			]
		];

		let terms_and_conditions = [
			'Advance payment ' + item.advance_payment_term + '% of the proforma invoice amount by RTGS to be paid within 24 hours of the SC/PI date.',
			'Order once confirmed will not be revised or cancelled.',
			'Balance ' + item.balance_payment_term + '% amount as per the proforma invoice to be paid before vessel arrival date.',
			'If the buyer dishonours the contract & fails to make the payment of balance ' + item.balance_payment_term + '% amount, the advance paid amount will stand forfeited and the deal will be cancelled.',
			'Force majeure clause as per international business terms are applicable.',
			'Delivery schedule will be within ' + item.shipment_to + ' days from the date of SC/PI.',
			'Any delay in delivery schedule due to uncontrollable and unforeseen circumstances or any act of god, will be conveyed to the buyers in advance. The buyer will have to abide by this and accept the delivery as per the arrivals.'
		];

		if (item.delivery_term_id == 1) {
			terms_and_conditions.push(
				'Delivery of goods will be ' + company_warehouse + ' warehouse. Loading charges and freight to buyers account.'
			);
			terms_and_conditions.push(
				'Goods should be strictly lifted within 10 days from the vessel arrival date, no extension of storage will be allowed.',
			);
		}

		let terms_arr = [
			[
				{
					border: [true, true, true, false],
					margin: [0, 3, 0, 0],
					text: 'Terms and Conditions:',
					fontSize: 8,
					bold: true,
					decoration: 'underline',
					alignment: 'left'
				}
			],
			[
				{
					border: [true, false, true, false],
					fontSize: 7,
					ol: terms_and_conditions
				}
			]
		];

		if (item.payment_type == 4) {
			terms_arr.push([
				{
					border: [true, false, true, false],
					margin: [0, 3, 0, 0],
					text: 'LC Instruction:',
					fontSize: 8,
					bold: true,
					decoration: 'underline',
					alignment: 'left'
				}
			]);
			terms_arr.push([
				{
					border: [true, false, true, false],
					fontSize: 7,
					ol: [
						'Photocopy of Commercial Invoice will be acceptable, E - way bill generated by the seller, LR copy will be provided by the buyer(self arrangement of inland - logistics).',
						'Negotiating / Advising Bank Details: ICICI BANK LIMITED, IFSC: ICIC0000005.',
						'Payment Terms selected by customer would be intimated prior to release of LC with start date as Date of Bill of Exchange or as confirmed by customer on release of final LC.',
						'LC Discounting charges as per interest rate prevailing (~8.0% p.a.) plus GST will be added to the account of applicant.'
					]
				}
			]);

			let advance_booking_amount = (item.base_amount * item.advance_payment_term) / 100;
			let one = [
				{
					border: [true, false, true, false],
					text: ''
				},
				{
					border: [true, true, false, false],
					text: 'Advance Booking amount (make less)',
					alignment: 'left',
					fontSize: 8
				},
				{
					border: [false, true, false, true],
					text: ''
				},
				{
					border: [false, true, false, true],
					text: ''
				},
				{
					border: [false, true, false, true],
					text: ''
				},
				{
					border: [true, true, true, false],
					text: this.currencyPipe.transform(advance_booking_amount, 'INR'),
					alignment: 'right',
					fontSize: 8
				}
			];

			let balance_amount = total_recievable_amount - advance_booking_amount;
			let two = [
				{
					border: [true, false, true, false],
					text: ''
				},
				{
					border: [true, true, false, false],
					text: 'Balance Amount',
					alignment: 'left',
					fontSize: 8
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [true, true, true, false],
					text: this.currencyPipe.transform(balance_amount, 'INR'),
					alignment: 'right',
					fontSize: 8
				}
			];

			let bank_charges = ((((balance_amount * item.lc_interest) / 100) / 365) * item.lc_days);
			let bank_charges_gst = (bank_charges * 18) / 100;
			// let lc_discounting = bank_charges + bank_charges_gst;
			let lc_discounting = bank_charges;

			let three = [
				{
					border: [true, false, true, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: 'LC Discounting & processing charges* (' + item.lc_days + '-days LC @' + item.lc_interest + '%p.a.)',
					alignment: 'left',
					fontSize: 8
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [true, false, true, false],
					text: this.currencyPipe.transform(lc_discounting, 'INR'),
					alignment: 'right',
					fontSize: 8
				}
			];

			let four = [
				{
					border: [true, false, true, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: 'GST on Bank Charge @18%',
					alignment: 'left',
					fontSize: 8
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [true, false, true, false],
					text: this.currencyPipe.transform(bank_charges_gst, 'INR'),
					alignment: 'right',
					fontSize: 8
				}
			];
			let lc_discounting_with_gst = bank_charges + bank_charges_gst;
			let total_balance_amount = balance_amount + lc_discounting_with_gst;
			let five = [
				{
					border: [true, false, true, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: 'TOTAL BALANCE AMOUNT (FOR LC APPLICATION)',
					alignment: 'left',
					fontSize: 8,
					bold: true
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [false, false, false, false],
					text: ''
				},
				{
					border: [true, false, true, false],
					text: this.currencyPipe.transform(total_balance_amount, 'INR'),
					alignment: 'right',
					fontSize: 8,
					bold: true
				}
			];
			grade_body.push(one);
			grade_body.push(two);
			grade_body.push(three);
			grade_body.push(four);
			grade_body.push(five);
		}


		let docDefinition = {
			pageSize: 'A4',
			pageMargins: [20, 20, 20, 20],
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
											text: [
												{ text: company_name, fontSize: 14, bold: true },
												'\n',
												{ text: '(A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT.LTD.)', fontSize: 7, bold: true },
												'\n'
											],
											alignment: 'center'
										},
										{
											text: [
												{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, MH, India.', fontSize: 7, alignment: 'center' },
												'\n',
												{ text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, MH, India', fontSize: 7, alignment: 'center' },
												'\n',
												{ text: `P: +91-20-24529999 (30 Lines) | F: +91-20-24529997 / +91-20-24529998  |  E: surisha@parmarglobal.com`, fontSize: 7, alignment: 'center' }
											],
											fontSize: 7
										}
									],
									margin: [15, 5, 15, 5],
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
									text: "SALES CONTRACT / PROFORMA INVOICE",
									bold: true,
									fontSize: 9,
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
										{ text: 'SO No : ' + so_no_new, fontSize: 8 }
									]
								},
								{
									border: [false, false, true, true],
									margin: [0, 0, 0, 3],
									bold: true,
									alignment: 'right',
									text: [
										{ text: 'Booking Date : ' + moment(item.booking_date).format('DD-MMM-YYYY'), fontSize: 8 }
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
										{ text: 'Seller:', fontSize: 9, bold: true, decoration: 'underline' },
										'\n',
										{ text: company_name, bold: true, fontSize: 9 },
										'\n',
										{ text: item.godown_address, fontSize: 8 },
										'\n',
										{ text: `State: ${item.godown_state_name ? item.godown_state_name : 'Maharashtra'}`, fontSize: 8 },
										'\n',
										{ text: 'GSTIN: ' + item.godown_gst_no, fontSize: 8 }
									],
									alignment: 'left',
								},
								{
									border: [false, false, true, true],
									text: [
										{ text: 'Buyer:', fontSize: 9, bold: true, decoration: 'underline' },
										'\n',
										{ text: item.customer, bold: true, fontSize: 9 },
										'\n',
										{ text: item.org_address, fontSize: 8 },
										'\n',
										{ text: 'State: ' + item.state_name, fontSize: 8 },
										'\n',
										{ text: 'GSTIN/UIN: ' + (item.org_gst_no != null ? item.org_gst_no : 'N/A'), fontSize: 8 }
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
										{ text: 'Terms of Delivery: ', fontSize: 8, bold: true },
										{ text: item.delivery_term, fontSize: 8 },
									],
									alignment: 'left',
								},
								{
									border: [true, false, true, false],
									margin: [0, 0, 0, 5],
									text: [
										{ text: 'Godown: ', fontSize: 8, bold: true },
										{ text: item.godown_name + ' Godown', fontSize: 8 },
									],
									alignment: 'left',
								}
							],
							[
								{
									border: [true, false, false, false],
									text: [
										{ text: 'Shipment: ', fontSize: 8, bold: true },
										{ text: 'Arrival Within ' + item.shipment_from + ' To ' + item.shipment_to + ' Days', fontSize: 8 },
									],
									alignment: 'left',
								},
								{
									border: [true, false, true, false],
									text: [
										{ text: 'Payment Term: ', fontSize: 8, bold: true },
										{ text: payment_term_label, fontSize: 8 },
									],
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, false, false],
									margin: [0, 5, 0, 0],
									text: [
										{ text: 'Packing: ', fontSize: 8, bold: true },
										{ text: item.packing, fontSize: 8 },
									],
									alignment: 'left'
								},
								{
									border: [true, false, true, false],
									margin: [0, 0, 0, 5],
									text: `${(item.delivery_term_id && item.delivery_term_id == 2) ? 'Buyer is liable for generation of E-way bill.' : ''}`, fontSize: 8,
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
									fontSize: 8,
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
									text: [
										{ text: 'Remarks: ', bold: true },
										{ text: 'Being Sales Order of ' + item.product_name + ' (' + item.grade_name + ')', fontSize: 8, bold: true },
									],
									fontSize: 8,
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									text: 'Declaration: ',
									fontSize: 8,
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									text: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
									fontSize: 8,
									alignment: 'left'
								}
							],
							[
								{
									border: [true, false, true, false],
									text: '[Whether tax is payable or Reserve Charge Basis: No]',
									fontSize: 8,
									alignment: 'left'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: terms_arr
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
											{ text: ((item.virtual_acc_no != null) ? 'Virtual' : 'Bank') + ' Account Number: ', bold: true },
											{ text: (item.virtual_acc_no != null) ? item.virtual_acc_no : company_bank_details.account_no },
										],
										fontSize: 8,
										margin: [3, 5, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'Bank Account Name: ', bold: true },
											{ text: 'SURISHA - A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT LTD' },
										],
										fontSize: 8,
										margin: [3, 5, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'Bank Name: ', bold: true },
											{ text: company_bank_details.bank_name },
										],
										fontSize: 8,
										margin: [3, 3, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'Branch: ', bold: true },
											{ text: company_bank_details.branch_name },
										],
										fontSize: 8,
										margin: [3, 3, 0, 0],
										alignment: 'left'
									},
									{
										border: [true, true, true, true],
										text: [
											{ text: 'IFSC Code: ', bold: true },
											{ text: company_bank_details.ifsc_code },
										],
										fontSize: 8,
										margin: [3, 3, 0, 0],
										alignment: 'left'
									}
								],
								[
									[
										{
											text: authorised_company_name,
											fontSize: 8,
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
											fontSize: 8,
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
