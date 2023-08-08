import * as moment from "moment";

import { insertToArray, searchInArray, searchInDeepArray } from '../../shared/common-service/common-service';

import { Component } from "@angular/core";
import { Injectable } from '@angular/core';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
	providedIn: 'root',
})

export class IlcPdfService {

	docDefinition: any = [];

	constructor() {
		// 
	}

	defaultHeader(item, data) {
		let charges_date = moment(item.charges_date).format("DD-MMM-YYYY");

		this.docDefinition = {
			content: [
				{
					table: {
						widths: ['8%', '72%', '20%'],
						body: [
							[
								{
									width: '*',
									text: [
										item.spipl_bank.bank_name + ' ' + item.spipl_bank.account_no +
										' GSTIN - ' + item.spipl_bank.gst_no +
										' (' + charges_date + ')'
									],
									margin: [10, 5, 0, 0],
									bold: true,
									colSpan: 3,
									alignment: 'center'
								}, {}, {}
							],
							[
								{
									columns: [
										{
											image: data.logo,
											margin: [38, 0, 0, 0],
											width: 60,
											height: 60,
											alignment: 'center'
										},
										{
											width: '*',
											text: [
												{
													text: data.company_name + '\n',
													fontSize: 18,
													bold: true
												},
												{
													text: data.company_address,
													fontSize: 8
												}
											],
											margin: [0, 15, 0, 0]
										},
									],
									colSpan: 3,
									alignment: 'center'
								}, {}, {}
							],
							[
								{
									text: 'Sr.No.',
									alignment: 'center',
									bold: true
								},
								{
									text: 'Particular',
									alignment: 'center',
									bold: true
								},
								{
									text: 'Amount',
									alignment: 'center',
									bold: true
								}
							]
						]
					},
					layout: {
						paddingLeft: function (i, node) { return 10; },
						paddingRight: function (i, node) { return 10; },
						paddingTop: function (i, node) { return 10; },
						paddingBottom: function (i, node) { return 10; },
					}
				}
			]
		};
	}



	/*
		$$$$$$\ $$\       $$$$$$\         $$$$$$\                                $$\                     
		\_$$  _|$$ |     $$  __$$\       $$  __$$\                               \__|                    
		  $$ |  $$ |     $$ /  \__|      $$ /  $$ | $$$$$$\   $$$$$$\  $$$$$$$\  $$\ $$$$$$$\   $$$$$$\  
		  $$ |  $$ |     $$ |            $$ |  $$ |$$  __$$\ $$  __$$\ $$  __$$\ $$ |$$  __$$\ $$  __$$\ 
		  $$ |  $$ |     $$ |            $$ |  $$ |$$ /  $$ |$$$$$$$$ |$$ |  $$ |$$ |$$ |  $$ |$$ /  $$ |
		  $$ |  $$ |     $$ |  $$\       $$ |  $$ |$$ |  $$ |$$   ____|$$ |  $$ |$$ |$$ |  $$ |$$ |  $$ |
		$$$$$$\ $$$$$$$$\\$$$$$$  |       $$$$$$  |$$$$$$$  |\$$$$$$$\ $$ |  $$ |$$ |$$ |  $$ |\$$$$$$$ |
		\______|\________|\______/        \______/ $$  ____/  \_______|\__|  \__|\__|\__|  \__| \____$$ |
												   $$ |                                        $$\   $$ |
												   $$ |                                        \$$$$$$  |
												   \__|                                         \______/ 	
	*/
	async ilcOpening(item, flag, data) {
		let tolerance = Number(item.ilc_letter_of_credit.tolerance);
		let tolerance_amount = Number(((Number(item.ilc_amount) * Number(tolerance)) / 100).toFixed(3));
		let ilcAmountWithTolerence = Number(item.ilc_amount) + Number(tolerance_amount);
		let ilcOpeningChargesAmount = Number(((Number(ilcAmountWithTolerence) * Number(item.ilc_open_charges)) / 100).toFixed(3));

		let ILC_AMOUNT_TEXT = "";

		if (tolerance == 0) {
			ILC_AMOUNT_TEXT = 'ILC Amount INR ' + item.ilc_amount;
		} else {
			ILC_AMOUNT_TEXT = 'ILC Amount INR ' + item.ilc_amount + ' + ' + tolerance + '% Tolerance ' + tolerance_amount.toFixed(3);
		}

		this.defaultHeader(item, data);

		let content_header = [
			{
				width: '*',
				text: [
					{
						text: 'Being ILC Opening Charges debited by bank for '
					},
					{
						text: item.sub_org_master.sub_org_name + '\n',
						bold: true
					},
					{
						text: 'for INR '
					},
					{
						text: item.ilc_open_amt_inr,
						bold: true
					},
					{
						text: ' as per ILC No. '
					},
					{
						text: item.ilc_letter_of_credit.ilc_bank_no,
						bold: true
					},
					{
						text: ' DTD '
					},
					{
						text: moment(item.ilc_letter_of_credit.ilc_opening_date).format("DD-MM-YYYY"),
						bold: true
					}
				],
				margin: [10, 5, 0, 0],
				colSpan: 3,
				alignment: 'center'
			}, {}, {}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_header, index1 - 2);

		let content_a = [
			{
				text: 'A]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				text: ILC_AMOUNT_TEXT,
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: item.ilc_open_amt_inr.toFixed(3),
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_a, index1);

		let content_b = [
			{
				text: 'B]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: 'ILC Opening (Usance + Commitment) Charges @ ' + item.ilc_open_charges + '%\n'
					},
					{
						ul: [
							{
								text: 'CGST @ ' + data.cgstDbValue + '% on ILC Opening\n'
							},
							{
								text: 'SGST @ ' + data.sgstDbValue + '% on ILC Opening'
							}
						]
					}
				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: ilcOpeningChargesAmount + '\n'
					},
					{
						text: item.ilc_open_cgst + '\n'
					},
					{
						text: item.ilc_open_sgst + '\n'
					}
				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_b, index1);

		this.swiftCharges('C]', data, item.ilc_open_swift, item.ilc_swift_cgst, item.ilc_swift_sgst);

		this.totalCharges(item, flag);

		// this.checkedByEnteredBy(item);

		// Updated Voucher
		if (flag == 2) {
			let content_sr_no = "D]";
			// Additional Charges
			if (item.additional_charges != null && Number(item.additional_charges) > 0) {
				content_sr_no = "E]";
				this.additionalCharges("D]", item);
			}
			this.shortExcessDebitedByBank(content_sr_no, item);
		}
		pdfMake.createPdf(this.docDefinition).open();
	}


	/*
		$$$$$$\ $$\       $$$$$$\         $$$$$$\                                          $$\ 
		\_$$  _|$$ |     $$  __$$\       $$  __$$\                                         $$ |
		  $$ |  $$ |     $$ /  \__|      $$ /  $$ |$$$$$$\$$$$\   $$$$$$\  $$$$$$$\   $$$$$$$ |
		  $$ |  $$ |     $$ |            $$$$$$$$ |$$  _$$  _$$\ $$  __$$\ $$  __$$\ $$  __$$ |
		  $$ |  $$ |     $$ |            $$  __$$ |$$ / $$ / $$ |$$$$$$$$ |$$ |  $$ |$$ /  $$ |
		  $$ |  $$ |     $$ |  $$\       $$ |  $$ |$$ | $$ | $$ |$$   ____|$$ |  $$ |$$ |  $$ |
		$$$$$$\ $$$$$$$$\\$$$$$$  |      $$ |  $$ |$$ | $$ | $$ |\$$$$$$$\ $$ |  $$ |\$$$$$$$ |
		\______|\________|\______/       \__|  \__|\__| \__| \__| \_______|\__|  \__| \_______|
	*/
	async ilcAmendment(item, flag, data) {
		let tolerance = Number(item.ilc_letter_of_credit.tolerance);
		let tolerance_amount = Number(((Number(item.ilc_amount) * Number(tolerance)) / 100).toFixed(3));
		let ILC_AMOUNT_TEXT = "";

		if (tolerance == 0) {
			ILC_AMOUNT_TEXT = 'ILC Amount INR ' + item.ilc_amount;
		} else {
			ILC_AMOUNT_TEXT = 'ILC Amount INR ' + item.ilc_amount + ' + ' + tolerance + '% Tolerance ' + tolerance_amount;
		}

		this.defaultHeader(item, data);

		let content_header = [
			{
				width: '*',
				text: [
					{
						text: 'Being ILC Amendment Charges debited by bank for '
					},
					{
						text: item.sub_org_master.sub_org_name + '\n',
						bold: true
					},
					{
						text: ' for INR '
					},
					{
						text: item.ilc_open_amt_inr,
						bold: true
					},
					{
						text: ' as per ILC No. '
					},
					{
						text: item.ilc_letter_of_credit.ilc_bank_no,
						bold: true
					},
					{
						text: ' DTD '
					},
					{
						text: item.ilc_letter_of_credit.ilc_opening_date,
						bold: true
					}
				],
				margin: [10, 5, 0, 0],
				colSpan: 3,
				alignment: 'center'
			}, {}, {}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_header, index1 - 2);

		let content_a = [
			{
				text: 'A]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				text: ILC_AMOUNT_TEXT,
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: item.ilc_open_amt_inr,
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_a, index1);

		let content_b = [];

		if (item.va_ilc_open_amt_inr != null) {
			content_b = [
				{
					text: 'B]',
					alignment: 'center',
					border: [true, false, true, false]
				},
				{
					stack: [
						{
							text: 'Amendment Charges for Value Change - ILC Open (Usance + Commitment) Charges @ ' + item.va_ilc_open_per + '% on Value ' + item.va_ilc_open_charges_value + ' INR\n\n'
						},
						{
							ul: [
								{
									text: 'CGST @ ' + data.cgstDbValue + '% on Amendment Charges for Value Change\n'
								},
								{
									text: 'CGST @ ' + data.sgstDbValue + '% on Amendment Charges for Value Change'
								}
							]
						}
					],
					alignment: 'left',
					border: [false, false, true, false]
				},
				{
					text: [
						{
							text: item.va_ilc_open_amt_inr + '\n\n\n'
						},
						{
							text: item.va_ilc_open_amt_cgst + '\n'
						},
						{
							text: item.va_ilc_open_amt_sgst
						}
					],
					alignment: 'right',
					border: [false, false, true, false]
				}
			];
			var index1 = this.docDefinition.content[0].table.body.length;
			insertToArray(this.docDefinition.content[0].table.body, content_b, index1);
		}

		let content_c = [];

		if (item.da_ilc_open_amt_inr != null) {
			content_c = [
				{
					text: content_b.length > 0 ? 'C]' : 'B]',
					alignment: 'center',
					border: [true, false, true, false]
				},
				{
					stack: [
						{
							text: 'Amendment Charges for Date Change - ILC Open (Usance + Commitment) Charges @ ' + item.da_ilc_open_per + '% on Value ' + item.da_ilc_open_charges_value + ' INR\n',
						},
						{
							ul: [
								{
									text: 'CGST @ ' + data.cgstDbValue + '% on Amendment Charges for Date Change\n'
								},
								{
									text: 'CGST @ ' + data.sgstDbValue + '% on Amendment Charges for Date Change'
								}
							]
						}
					],
					alignment: 'left',
					border: [false, false, true, false]
				},
				{
					text: [
						{
							text: item.da_ilc_open_amt_inr + '\n\n\n'
						},
						{
							text: item.da_ilc_open_amt_cgst + '\n'
						},
						{
							text: item.da_ilc_open_amt_sgst
						}
					],
					alignment: 'right',
					border: [false, false, true, false]
				}
			];
			var index1 = this.docDefinition.content[0].table.body.length;
			insertToArray(this.docDefinition.content[0].table.body, content_c, index1);
		}

		let content_d_sr_no = "";
		let content_e_sr_no = "";
		let content_f_sr_no = "";
		let content_g_sr_no = "";

		if (content_b.length == 0 && content_c.length == 0) {
			content_d_sr_no = 'B]';
			content_e_sr_no = 'C]';
			content_f_sr_no = 'D]';
			content_g_sr_no = 'E]';
		} else if (content_b.length > 0 && content_c.length == 0) {
			content_d_sr_no = 'C]';
			content_e_sr_no = 'D]';
			content_f_sr_no = 'E]';
			content_g_sr_no = 'F]';
		} else if (content_b.length == 0 && content_c.length > 0) {
			content_d_sr_no = 'C]';
			content_e_sr_no = 'D]';
			content_f_sr_no = 'E]';
			content_g_sr_no = 'F]';
		} else if (content_b.length > 0 && content_c.length > 0) {
			content_d_sr_no = 'D]';
			content_e_sr_no = 'E]';
			content_f_sr_no = 'F]';
			content_g_sr_no = 'G]';
		}

		let content_d = [
			{
				text: content_d_sr_no,
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: 'Ammendment Clause Charges\n',
					},
					{
						ul: [
							{
								text: 'CGST @ ' + data.cgstDbValue + '% on Amendment Clause Charges\n'
							},
							{
								text: 'CGST @ ' + data.sgstDbValue + '% on Amendment Clause Charges'
							}
						]
					}
				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: item.ammend_clause + '\n'
					},
					{
						text: item.ammend_clause_cgst + '\n'
					},
					{
						text: item.ammend_clause_sgst
					}
				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_d, index1);

		this.swiftCharges(content_e_sr_no, data, item.ammend_swift, item.ammend_swift_cgst, item.ammend_swift_sgst);

		this.totalCharges(item, flag);

		// this.checkedByEnteredBy(item);

		// Updated Voucher
		if (flag == 2) {
			let section = content_f_sr_no;
			// Additional Charges
			if (item.additional_charges != null && Number(item.additional_charges) > 0) {
				section = content_g_sr_no;
				this.additionalCharges(content_f_sr_no, item);
			}
			this.shortExcessDebitedByBank(section, item);
		}
		pdfMake.createPdf(this.docDefinition).open();
	}


	/*
		$$$$$$\ $$\       $$$$$$\        $$$$$$$\                          $$\   $$\     
		\_$$  _|$$ |     $$  __$$\       $$  __$$\                         \__|  $$ |    
		  $$ |  $$ |     $$ /  \__|      $$ |  $$ | $$$$$$\  $$$$$$\$$$$\  $$\ $$$$$$\   
		  $$ |  $$ |     $$ |            $$$$$$$  |$$  __$$\ $$  _$$  _$$\ $$ |\_$$  _|  
		  $$ |  $$ |     $$ |            $$  __$$< $$$$$$$$ |$$ / $$ / $$ |$$ |  $$ |    
		  $$ |  $$ |     $$ |  $$\       $$ |  $$ |$$   ____|$$ | $$ | $$ |$$ |  $$ |$$\ 
		$$$$$$\ $$$$$$$$\\$$$$$$  |      $$ |  $$ |\$$$$$$$\ $$ | $$ | $$ |$$ |  \$$$$  |
		\______|\________|\______/       \__|  \__| \_______|\__| \__| \__|\__|   \____/ 
	*/
	async ilcRemittance(item, flag, data) {
		this.defaultHeader(item, data);



		let content_header = [
			{
				width: '*',
				text: [
					{
						text: 'Being full & final '
					},
					{
						text: 'Inland LC Payment Charges ',
						bold: true
					},
					{
						text: 'debited by bank for '
					},
					{
						text: item.sub_org_master.sub_org_name + '\n',
						bold: true
					},
					{
						text: ' against ILC No. '
					},
					{
						text: item.ilc_letter_of_credit.ilc_bank_no,
						bold: true
					},
					{
						text: ' for Rs. '
					},
					{
						text: item.bex_amount,
						bold: true
					},
					{
						text: ' as per Bill of Exchange No. '
					},
					{
						text: item.bill_of_exchange.be_no,
						bold: true
					},
					{
						text: ' DTD '
					},
					{
						text: item.ilc_letter_of_credit.ilc_opening_date,
						bold: true
					}
				],
				margin: [10, 5, 0, 0],
				colSpan: 3,
				alignment: 'center'
			}, {}, {}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_header, index1 - 2);

		let content_a = [
			{
				text: 'A]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: "Bill of Exchange Amount (" + item.godown + ")\n\n",
					},
					{
						text: "Inland Bill Payment Remittance " + data.remit_charges + "%\n(Min. " +
							data.remit_min_value + "/- &  Max. " + data.remit_max_value + "/-)\n"
					},
					{
						ul: [
							{
								text: 'CGST @ ' + data.cgstDbValue + '% on ILC Payment Remittance Charges\n'
							},
							{
								text: 'SGST @ ' + data.sgstDbValue + '% on ILC Payment Remittance Charges'
							}
						]
					}
				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: item.bex_amount + '\n\n'
					},
					{
						text: item.remit_charges + '\n\n'
					},
					{
						text: item.remit_cgst + '\n'
					},
					{
						text: item.remit_sgst
					}
				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_a, index1);


		let content_b = [
			{
				text: 'B]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: "Inland Bill Acceptance Charges " + data.boa_charges + "%\n(Min. " +
							data.boa_min_value + "/- &  Max. " + data.boa_max_value + "/-)\n"
					},
					{
						ul: [
							{
								text: 'CGST @ ' + data.cgstDbValue + '% on ILC Acceptance Remittance Charges\n'
							},
							{
								text: 'SGST @ ' + data.sgstDbValue + '% on ILC Acceptance Remittance Charges'
							}
						]
					}
				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: item.boa_charges + '\n\n'
					},
					{
						text: item.boa_cgst + '\n'
					},
					{
						text: item.boa_sgst
					}
				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_b, index1);

		this.swiftCharges('C]', data, item.swift_charges, item.swift_cgst, item.swift_sgst);

		this.totalCharges(item, flag);

		// this.checkedByEnteredBy(item);

		// Updated Voucher
		if (flag == 2) {
			let content_sr_no = "D]";
			// Additional Charges
			if (item.additional_charges != null && Number(item.additional_charges) > 0) {
				content_sr_no = "E]";
				this.additionalCharges("D]", item);
			}
			this.shortExcessDebitedByBank(content_sr_no, item);
		}
		pdfMake.createPdf(this.docDefinition).open();
	}

	async ilcDiscountCharges(item, flag, data) {

		let dut_dt = moment(item.bill_of_exchange.dut_dt).format("DD-MMM-YYYY");
		let discount_date = moment(item.bill_of_exchange.discount_date).format("DD-MMM-YYYY");

		this.defaultHeader(item, data);

		let content_header = [
			{
				width: '*',
				text: [
					{
						text: 'Being '
					},
					{
						text: 'Inland LC discounting intrest ',
						bold: true
					},
					{
						text: 'debited by bank for '
					},
					{
						text: item.sub_org_master.sub_org_name + '\n',
						bold: true
					},
					{
						text: ' against Inland Purchase Bill Of Exchange No. '
					},
					{
						text: item.bill_of_exchange.be_no,
						bold: true
					},
					{
						text: ' for Rs. '
					},
					{
						text: item.bex_amount,
						bold: true
					},
					{
						text: ' in Favor of  '
					},
					{
						text: item.sub_org_master.sub_org_name + '\n',
						bold: true
					},
				],
				margin: [10, 5, 0, 0],
				colSpan: 3,
				alignment: 'center'
			}, {}, {}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_header, index1 - 2);

		let content_a = [
			{
				text: 'A]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: "Bill of Exchange Amount \n (Bill of Exchange No.:- " + item.bill_of_exchange.be_no + ")\n\n",
					}
				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: item.bex_amount + '\n\n'
					}
				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_a, index1);


		let content_b = [
			{
				text: 'B]',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: "Interest Amount for " + item.int_days + " days @ " + item.discount_percent + " % p.a. \n (From " + dut_dt + " to " + discount_date + ")"
					},

				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: item.total_charges_system + '\n\n'
					},

				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_b, index1);

		//this.swiftCharges('C]', data, item.swift_charges, item.swift_cgst, item.swift_sgst);

		this.totalCharges(item, flag);

		// this.checkedByEnteredBy(item);

		// Updated Voucher
		if (flag == 2) {
			let content_sr_no = "C]";
			// Additional Charges
			if (item.additional_charges != null && Number(item.additional_charges) > 0) {
				content_sr_no = "D]";
				this.additionalCharges("C]", item);
			}
			//this.shortExcessDebitedByBank(content_sr_no, item);
		}
		pdfMake.createPdf(this.docDefinition).open();
	}

	additionalCharges(section, item) {
		let content_arr = [
			{
				text: section,
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				text: "Additional Charges: " + item.additional_header,
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: item.additional_charges,
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index = searchInArray(this.docDefinition.content[0].table.body, "Total Charges");
		insertToArray(this.docDefinition.content[0].table.body, content_arr, index - 1);
	}

	shortExcessDebitedByBank(section, item) {
		let textObj = [
			{
				text: "Short/Excess Debited By Bank:\n"
			},
			{
				ul: []
			}
		];

		let amountObj = {
			text: ""
		};

		// Short/Excess - ILC Opening Amount
		if (item.update_ilc_open_amt_inr != null && item.update_ilc_open_amt_inr != item.ilc_open_amt_inr) {
			let obj = this.getShortExcess(item.ilc_open_amt_inr, item.update_ilc_open_amt_inr, "ILC Opening Amount");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - ILC Opening Charges
		if (item.update_ilc_open_charges != null && item.update_ilc_open_charges != item.ilc_open_charges) {
			let obj = this.getShortExcess(item.ilc_open_charges, item.update_ilc_open_charges, "ILC Opening Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - ILC Opening Swift Charges
		if (item.update_ilc_open_swift != null && item.update_ilc_open_swift != item.ilc_open_swift) {
			let obj = this.getShortExcess(item.ilc_open_swift, item.update_ilc_open_swift, "Swift Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - ILC Amend Amount
		if (item.update_ilc_amt_inr != null && item.update_ilc_amt_inr != item.ilc_open_amt_inr) {
			let obj = this.getShortExcess(item.ilc_open_amt_inr, item.update_ilc_amt_inr, "ILC Amount");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Amend Value Change
		if (item.update_amd_ch_value_change != null && item.update_amd_ch_value_change != item.ilc_open_amt_inr) {
			let obj = this.getShortExcess(item.ilc_open_amt_inr, item.update_amd_ch_value_change, "Value Change");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Amend Date Change
		if (item.update_amd_ch_date_change != null && item.update_amd_ch_date_change != item.da_ilc_open_charges_value) {
			let obj = this.getShortExcess(item.da_ilc_open_charges_value, item.update_amd_ch_date_change, "Date Change");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Amend Clause Change
		if (item.update_ammend_clause_charges != null && item.update_ammend_clause_charges != item.ammend_clause) {
			let obj = this.getShortExcess(item.ammend_clause, item.update_ammend_clause_charges, "Clause Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Amendment Swift Charges
		if (item.update_swift_charges != null && item.update_swift_charges != item.ammend_swift) {
			let obj = this.getShortExcess(item.ammend_swift, item.update_swift_charges, "Swift Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Bill of Exchange Amount
		if (item.update_bex_amount != null && item.update_bex_amount != item.bex_amount) {
			let obj = this.getShortExcess(item.bex_amount, item.update_bex_amount, "Bill of Exchange Amount");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Remittance Charges
		if (item.update_remit_charges != null && item.update_remit_charges != item.remit_charges) {
			let obj = this.getShortExcess(item.remit_charges, item.update_remit_charges, "Remittance Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Bill of Acceptance Charges
		if (item.update_boa_charges != null && item.update_boa_charges != item.boa_charges) {
			let obj = this.getShortExcess(item.boa_charges, item.update_boa_charges, "Bill of Acceptance Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Discrepancy Charges
		if (item.update_discrepancy_charges != null && item.update_discrepancy_charges != item.discrepancy_charges) {
			let obj = this.getShortExcess(item.discrepancy_charges, item.update_discrepancy_charges, "Discrepancy Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Remittance Swift Charges
		if (item.update_swift_charges != null && item.update_swift_charges != item.swift_charges) {
			let obj = this.getShortExcess(item.swift_charges, item.update_swift_charges, "Swift Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		// Short/Excess - Total Bank Charges
		if (item.total_charges_bank != null && item.total_charges_bank != item.total_charges_system) {
			let obj = this.getShortExcess(item.total_charges_system, item.total_charges_bank, "Total Charges");
			textObj[1].ul.push(obj.text);
			amountObj.text = amountObj.text + "\n" + obj.amount;
		}

		let content_arr = [
			{
				text: section,
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [textObj],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [amountObj],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];

		var index = searchInArray(this.docDefinition.content[0].table.body, "Total Charges");
		insertToArray(this.docDefinition.content[0].table.body, content_arr, index - 1);
	}

	checkedByEnteredBy(item) {
		let checkedBy = item.checkedBy != null ? item.checkedBy.checkedBy : "";
		let enteredBy = item.enteredBy != null ? item.enteredBy.enteredBy : "";

		let content_checked_entered = [
			{
				columns: [
					{
						width: '*',
						alignment: 'center',
						text: [
							{
								text: 'Checked By: '
							},
							{
								text: checkedBy,
								bold: true
							}
						]
					},
					{
						width: '*',
						alignment: 'center',
						text: [
							{
								text: 'Entered By: '
							},
							{
								text: enteredBy,
								bold: true
							}
						]
					},
				],
				colSpan: 3,
				alignment: 'center'
			}, {}, {}
		];
		var index = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_checked_entered, index);
	}

	swiftCharges(section, data, charges, cgst, sgst) {
		let content = [
			{
				text: section,
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				stack: [
					{
						text: 'Swift Charges\n'
					},
					{
						ul: [
							{
								text: 'CGST @ ' + data.cgstDbValue + '% on Swift Charges\n'
							},
							{
								text: 'CGST @ ' + data.sgstDbValue + '% on Swift Charges'
							}
						]
					}
				],
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: [
					{
						text: charges + '\n'
					},
					{
						text: cgst + '\n'
					},
					{
						text: sgst + '\n'
					}
				],
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content, index1);
	}

	getCgstSgst(cgstSgst, data, value, on) {
		let content_arr = [
			{
				text: '',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				text: cgstSgst + ' @ ' + data.sgstDbValue + '% on ' + on,
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: value,
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		return content_arr;
	}

	totalCharges(item, flag) {
		let content_total_charges = [
			{
				text: '',
				alignment: 'center',
				border: [true, false, true, false]
			},
			{
				text: 'Total Charges',
				alignment: 'left',
				border: [false, false, true, false]
			},
			{
				text: item.total_charges_system,
				alignment: 'right',
				border: [false, false, true, false]
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_total_charges, index1);

		let content_total_system = [
			{
				text: '',
				alignment: 'center',
				border: [true, false, true, true]
			},
			{
				text: (flag == 1) ? 'TOTAL CHARGES BY SYSTEM' : 'TOTAL CHARGES BY BANK',
				alignment: 'left'
			},
			{
				text: item.total_charges_system,
				alignment: 'right'
			}
		];
		var index1 = this.docDefinition.content[0].table.body.length;
		insertToArray(this.docDefinition.content[0].table.body, content_total_system, index1);
	}

	getShortExcess(originalValue, updatedValue, text) {
		let sign = "";
		let diff = 0;

		if (Number(originalValue) > Number(updatedValue)) {
			diff = Number(originalValue) - Number(updatedValue);
			sign = "-";
		} else if (Number(originalValue) < Number(updatedValue)) {
			diff = Number(updatedValue) - Number(originalValue);
			sign = "+";
		}

		let data = {
			text: text,
			amount: sign + diff.toFixed(3)
		}
		return data;
	}

}
