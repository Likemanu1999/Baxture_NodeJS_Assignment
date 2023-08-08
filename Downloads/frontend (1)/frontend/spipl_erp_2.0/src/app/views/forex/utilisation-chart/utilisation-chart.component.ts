import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { UtilizationService } from './utilization-service';
import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ThemeService } from 'ng2-charts';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Ilc_Loc } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-utilisation-chart',
	templateUrl: './utilisation-chart.component.html',
	styleUrls: ['./utilisation-chart.component.css', './utilisation.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		UtilizationService,
		SpiplBankService,
		ToasterService,
		CrudServices,
		DatePipe
	],
})
export class UtilisationChartComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('nonLcPaymentroll', { static: false }) public nonLcPaymentroll: ModalDirective;
	@ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;

	lcUtilizationArray: any;
	DocAccepatnceArray: any;
	PaymentRollOverArray: any;


	spipl_bank = [];

	bank = 0;
	bsRangeValue: any = [];
	fromdate: string;
	todate: string;



	nId: number;
	pi_id: number;
	paymentStatus: number;
	payRate: number;
	non_lc_roll: boolean = false;

	rateUpdateForm: FormGroup;
	rateUpdateFormNonLcRoll: FormGroup;
	// private toasterService: ToasterService;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	LcUtilUSDRemain: number = 0;
	LcUtilINRRemain = 0;

	lc_amount_pending_USD: number = 0;
	lc_amount_pending_GBP: number = 0;
	lc_amount_pending_AED: number = 0;
	doc_acceptance_USD: number = 0;
	doc_acceptance_GBP: number = 0;
	doc_acceptance_AED: number = 0;
	roll_over_USD: number = 0;
	roll_over_GBP: number = 0;
	roll_over_AED: number = 0;
	roll_over_nonlc_USD: number = 0;
	roll_over_nonlc_GBP: number = 0;
	roll_over_nonlc_ADE: number = 0;



	DocAcceptancUSDeRemain: number;
	DocAcceptancINReRemain = 0;


	RollOverUSDeRemain: number;
	RollOverINRRemain = 0;

	CurrentTabId: number;
	PaymentRollOverNonLcArray: any;
	RollOverUSDeRemainNonLc: number;
	RollOverINRRemainNonLc = 0;
	ilcUtilizationList: any = [];
	bexList: any = [];
	totalInlandInrPending: number;
	totalboeInrPending: number = 0;
	currentYear: number;
	currdate = new Date();
	fedai_rate: any;

	constructor(private utilizationService: UtilizationService,
		private SpiplService: SpiplBankService,
		private toasterService: ToasterService,
		private crudServices: CrudServices,
		private datepipe: DatePipe,
	) {

		//our bank type -1
		this.SpiplService.getBankListType(1).subscribe((response) => {
			this.spipl_bank = response;
		});

		this.bank = 1;

		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		if (this.datepipe.transform(this.currdate, 'MM') > '03') {

            this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

        } else {

            this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

        }
		// this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];


		this.initForm();
	}

	ngOnInit() {

		// this.getLcDetailList();

	}

	initForm() {

		this.rateUpdateForm = new FormGroup({
			'Update_rate': new FormControl(null),
		});

		this.rateUpdateFormNonLcRoll = new FormGroup({
			'Update_rate_nonlc_roll': new FormControl(null),
		});

	}

	onSubmit($e, name, id) {

		if ($e) {
			this[name] = $e[id];
		} else {
			this[name] = 0;
		}


		if (this.tabGroup.selectedIndex === 0) {
			this.getLcDetailList();

		} else if (this.tabGroup.selectedIndex === 1) {
			this.getDocAcceptance();

		} else if (this.tabGroup.selectedIndex === 2) {
			this.getPaymentRollOver();
		} else if (this.tabGroup.selectedIndex === 3) {
			this.getPaymentRollOverNonLc();
		} else if (this.tabGroup.selectedIndex === 4) {

			this.getIlcUtilization();
		} else if (this.tabGroup.selectedIndex === 5) {

			this.getBoeIlc();
		}
	}


	onChangtab(event: MatTabChangeEvent) {
		this.non_lc_roll = false;
		const tab = event.tab.textLabel;
		//  console.log(tab);
		if (tab === 'LC Utilization') {
			// this.CurrentTabId = 1;
			this.getLcDetailList();
		}

		if (tab === 'Doc Acceptance') {
			// this.CurrentTabId = 2;
			this.getDocAcceptance();
		}

		if (tab === 'Payment Roll Over') {
			// this.CurrentTabId = 3;
			this.getPaymentRollOver();
		}

		if (tab === 'Non Lc Payment Roll Over') {
			this.non_lc_roll = true;
			this.getPaymentRollOverNonLc();
		}


		if (tab === 'Inland Lc') {

			this.getIlcUtilization();
		}


		if (tab === 'BOE ILC') {

			this.getBoeIlc();
		}




	}


	// LC Utilization
	getLcDetailList() {

		this.utilizationService.getLcUtilization(this.fromdate, this.todate, this.bank).subscribe((response1) => {
			console.log(response1, "LcUtil");
			this.lcUtilizationArray = response1;

			this.LcUtilINRRemain = 0;

			let lc_amount_inr_pending = 0;
			let lc_amount_usd_pending = 0;

			for (const iterator of this.lcUtilizationArray) {
				console.log(iterator.fedai_rate,"iterator.fedai_rate")
				
				// + Number(iterator.tolerance_plus_amount) - Number(iterator.tolerance_minus_amount)
				const lc_amount_usd = Number(iterator.lc_amount);
				this.fedai_rate=iterator.fedai_rate;

				//console.log(lc_amount_usd , "lc_amount_usdlc_amount_usd")
				const lc_rate = iterator.lc_rate;
				const lc_amount_inr = (lc_amount_usd * lc_rate);
				let non_arr = [];
				non_arr = iterator.Non_Deatails;



				const lookup = {};
				const currency = [];
				for (let item, i = 0; item = non_arr[i++];) {
					const name = item.CurrencyName;

					if (!(name in lookup)) {
						lookup[name] = 1;
						currency.push({ 'currency': name });
					}
				}

				//	console.log(currency,"currcurr")
				let curName = iterator.Currency_Name;
				//for (const curr of currency) {

				let sum_non_agaisnt_lc_inr = 0;
				let sum_non_against_lc_usd = 0;

				for (const Noniterator of non_arr) {
					if (Noniterator.CurrencyName == curName) {
						let non_rate = 0;
						if (Noniterator.non_rate) {
							non_rate = Noniterator.non_rate;
						}

						const non_inr_amt = (non_rate * Noniterator.tot_non_amt);
						sum_non_agaisnt_lc_inr += non_inr_amt;
						sum_non_against_lc_usd += Noniterator.tot_non_amt;
					}
				}


				const remain_amount_lc_usd = Number(lc_amount_usd) - Number(sum_non_against_lc_usd);
				const remain_amount_lc_inr = Number(lc_amount_inr) - Number(sum_non_agaisnt_lc_inr);

				console.log(remain_amount_lc_inr, "remain_amount_lc_inr")

				lc_amount_usd_pending += remain_amount_lc_usd;
				lc_amount_inr_pending += remain_amount_lc_inr;

				//console.log(lc_amount_usd,sum_non_against_lc_usd , "sum_non_against_lc_usd");
				// this.LcUtilUSDRemain = lc_amount_usd_pending;
				// this.LcUtilINRRemain = lc_amount_inr_pending;


				this['lc_amount_pending_' + curName] = lc_amount_usd_pending ? lc_amount_usd_pending : 0;
				//this.LcUtilINRRemain = this.LcUtilINRRemain + lc_amount_inr_pending;
				//}

				//console.log(this.lc_amount_pending_USD, "lc_amount_pending_USD");



			}
			this.LcUtilINRRemain = lc_amount_inr_pending;
			//console.log(this.LcUtilINRRemain,"this.LcUtilINRRemain")
			console.log(lc_amount_inr_pending, "lc_amount_inr_pending")



		});

		// if (this.CurrentTabId === 1) {
		//   this.getLcDetailList();
		// }
	}

	// Doc Accepatnce
	getDocAcceptance() {

		this.utilizationService.getDocAccepatnce(this.fromdate, this.todate, this.bank).subscribe((response) => {
			console.log(response, "DocAccepatnceArray");
			this.DocAccepatnceArray = response;
			this.DocAcceptancINReRemain = 0;


			let DocAcc_inr_pending = 0;
			let DocAcc_usd_pending = 0;


			for (const iterator of this.DocAccepatnceArray) {

				let doc_non_arr = [];
				doc_non_arr = iterator.Non_details;
				console.log(iterator.Non_details, "doc_non_arr");


				const lookup = {};
				const currency = [];
				for (let item, i = 0; item = doc_non_arr[i++];) {
					const name = item.CurrencyName;

					if (!(name in lookup)) {
						lookup[name] = 1;
						currency.push({ 'currency': name });
					}
				}


				let curName = iterator.Currency_Name;

				//	for (const curr of currency) {


				let sum_credit_inr = 0;
				let sum_debit_inr = 0;
				let sum_credit_usd = 0;
				let sum_debit_usd = 0;
				for (const DocNoniterator of doc_non_arr) {
					if (DocNoniterator.CurrencyName == curName) {

						console.log(DocNoniterator, "DocNoniterator");
						let DocNonRate = 0;
						if (DocNoniterator.rate) {
							DocNonRate = DocNoniterator.rate;
						}
						const CreditAmountINR = (DocNonRate * DocNoniterator.credit_amt);
						const DebitAmountINR = (DocNonRate * DocNoniterator.debit_amt);

						const CreditAmountUSD = DocNoniterator.credit_amt;
						const DebitAmountUSD = DocNoniterator.debit_amt;

						console.log(CreditAmountUSD, DebitAmountUSD, "CreditAmountUSD");

						sum_credit_inr += CreditAmountINR;
						sum_debit_inr += DebitAmountINR;
						sum_credit_usd += CreditAmountUSD;
						sum_debit_usd += DebitAmountUSD;
					}
				}

				DocAcc_inr_pending += (Number(sum_credit_inr) - Number(sum_debit_inr));
				DocAcc_usd_pending += (Number(sum_credit_usd) - Number(sum_debit_usd));

				console.log(DocAcc_usd_pending);

				this['doc_acceptance_' + curName] = DocAcc_usd_pending ? DocAcc_usd_pending : 0;
				//this.DocAcceptancINReRemain = this.DocAcceptancINReRemain + DocAcc_inr_pending;



				//}


			}
			this.DocAcceptancINReRemain = DocAcc_inr_pending;

		});

		//  if (this.CurrentTabId === 2){
		//     this.getDocAcceptance();

		//   }
	}

	// Payment Roll Over
	getPaymentRollOver() {

		this.utilizationService.getPaymentRollOver(this.fromdate, this.todate, this.bank).subscribe((response3) => {
			console.log(response3, "response3");
			this.PaymentRollOverArray = response3;
			this.RollOverINRRemain = 0;




			for (const iterator of this.PaymentRollOverArray) {

				let rollOver_non_arr = [];
				rollOver_non_arr = iterator.Non_details;


				const lookup = {};
				const currency = [];
				for (let item, i = 0; item = rollOver_non_arr[i++];) {
					const name = item.CurrencyName;

					if (!(name in lookup)) {
						lookup[name] = 1;
						currency.push({ 'currency': name });
					}
				}

				for (const curr of currency) {

					let sum_credit_inr = 0;
					let sum_debit_inr = 0;
					let sum_credit_usd = 0;
					let sum_debit_usd = 0;

					let RollOver_inr_pending = 0;
					let RollOver_usd_pending = 0;

					for (const RollOveriterator of rollOver_non_arr) {
						if (RollOveriterator.CurrencyName == curr.currency) {

							let RollOverNonRate = 0;
							if (RollOveriterator.rate) {
								RollOverNonRate = RollOveriterator.rate;
							}

							const CreditAmountINR = (RollOverNonRate * RollOveriterator.credit_amt);
							const DebitAmountINR = (RollOverNonRate * RollOveriterator.debit_amt);

							const CreditAmountUSD = RollOveriterator.credit_amt;
							const DebitAmountUSD = RollOveriterator.debit_amt;

							sum_credit_inr += CreditAmountINR;
							sum_debit_inr += DebitAmountINR;
							sum_credit_usd += CreditAmountUSD;
							sum_debit_usd += DebitAmountUSD;


						}

					}
					RollOver_inr_pending += (sum_credit_inr - sum_debit_inr);
					RollOver_usd_pending += (sum_credit_usd - sum_debit_usd);

					this['roll_over_' + curr.currency] = RollOver_usd_pending ? RollOver_usd_pending : 0;
					this.RollOverINRRemain = this.RollOverINRRemain + RollOver_inr_pending;
				}



			}

		});

		// if (this.CurrentTabId === 3){
		//   this.getPaymentRollOver();
		// }

	}



	// Payment Roll Over
	getPaymentRollOverNonLc() {

		this.utilizationService.getPaymentRollOverNonLc(this.bank).subscribe((response4) => {
			console.log(response4, "response4");
			this.PaymentRollOverNonLcArray = response4;
			this.RollOverINRRemainNonLc = 0;


			const lookup = {};
			const currency = [];
			for (let item, i = 0; item = this.PaymentRollOverNonLcArray[i++];) {
				const name = item.CurrencyName;

				if (!(name in lookup)) {
					lookup[name] = 1;
					currency.push({ 'currency': name });
				}
			}



			for (const curr of currency) {



				let sum_credit_inr_non_lc = 0;
				let sum_debit_inr_non_lc = 0;
				let sum_credit_usd_non_lc = 0;
				let sum_debit_usd_non_lc = 0;

				let RollOver_inr_pending = 0;
				let RollOver_usd_pending = 0;

				for (const RollOveriterator of this.PaymentRollOverNonLcArray) {

					if (RollOveriterator.CurrencyName == curr.currency) {

						//console.log(RollOveriterator.credit_amt ,RollOveriterator.debit_amt ,"CR DR");

						let RollOverNonRate = 0;
						if (RollOveriterator.rate) {
							RollOverNonRate = (RollOveriterator.rate);
						}


						const CreditAmountINR = ((RollOverNonRate) * (RollOveriterator.credit_amt));
						const DebitAmountINR = ((RollOverNonRate) * (RollOveriterator.debit_amt));

						console.log(CreditAmountINR, DebitAmountINR, "CR DR INR ");
						const CreditAmountUSD = RollOveriterator.credit_amt;
						const DebitAmountUSD = RollOveriterator.debit_amt;

						sum_credit_inr_non_lc += CreditAmountINR;
						sum_debit_inr_non_lc += DebitAmountINR;
						sum_credit_usd_non_lc += CreditAmountUSD;
						sum_debit_usd_non_lc += DebitAmountUSD;


						//console.log(sum_credit_inr_non_lc,sum_debit_inr_non_lc,"pending");
						console.log(RollOver_inr_pending, "RollOver_inr_pending")

					}



				}

				RollOver_inr_pending += ((sum_credit_inr_non_lc) - (sum_debit_inr_non_lc));
				RollOver_usd_pending += ((sum_credit_usd_non_lc) - (sum_debit_usd_non_lc));

				console.log(RollOver_usd_pending, RollOver_inr_pending, "pn");
				this['roll_over_nonlc_' + curr.currency] = RollOver_usd_pending;
				this.RollOverINRRemainNonLc = this.RollOverINRRemainNonLc + RollOver_inr_pending;
			}

		});

		// if (this.CurrentTabId === 3){
		//   this.getPaymentRollOver();
		// }

	}





	onchange() {
		if (this.bsRangeValue[0]) {
			this.fromdate = this.convert(this.bsRangeValue[0]);
			this.todate = this.convert(this.bsRangeValue[1]);
		}

		if (this.tabGroup.selectedIndex === 0) {
			this.getLcDetailList();

		} else if (this.tabGroup.selectedIndex === 1) {
			this.getDocAcceptance();

		} else if (this.tabGroup.selectedIndex === 2) {
			this.getPaymentRollOver();
		} else if (this.tabGroup.selectedIndex === 3) {
			this.getPaymentRollOverNonLc();
		} else if (this.tabGroup.selectedIndex === 4) {

			this.getIlcUtilization();
		} else if (this.tabGroup.selectedIndex === 5) {

			this.getBoeIlc();
		}

	}

	convert(date) {
		if(date != null) {
			return this.datepipe.transform(date ,'yyyy-MM-dd');
		} else {
			return null;
		}
	}


	onEdit(id: number, payment_status: number, rate: number) {

		this.nId = id;
		this.paymentStatus = payment_status;
		this.payRate = rate;
		if (id != null) {
			this.rateUpdateForm = new FormGroup({
				'Update_rate': new FormControl(rate),
			});
			this.myModal.show();
		}
	}

	onEditNonLc(id: number, payment_status: number, rate: number) {
		this.pi_id = id;
		this.paymentStatus = payment_status;
		this.payRate = rate;
		if (id != null) {
			this.rateUpdateFormNonLcRoll = new FormGroup({
				'Update_rate_nonlc_roll': new FormControl(rate),
			});
			this.nonLcPaymentroll.show();
		}
	}
	onUpdateNonLcUpdate() {
		this.utilizationService.UpdatePaymentRateNonLcRoll(this.pi_id, this.paymentStatus, this.rateUpdateFormNonLcRoll.value.Update_rate_nonlc_roll).subscribe((response) => {
			if (this.tabGroup.selectedIndex == 3) {
				this.getPaymentRollOverNonLc();
			}
			this.toasterService.pop(response.message, 'Success', response.data);
			this.nonLcPaymentroll.hide();

		});
	}


	onUpdate() {


		this.utilizationService.UpdatePaymentRate(this.nId, this.paymentStatus, this.rateUpdateForm.value.Update_rate).subscribe((response) => {
			// this.getRoles();
			// this.getLcDetailList();

			if (this.tabGroup.selectedIndex == 0) {
				this.getLcDetailList();
			} else if (this.tabGroup.selectedIndex == 1) {
				this.getDocAcceptance();

			} else if (this.tabGroup.selectedIndex == 2) {
				this.getPaymentRollOver();
			} else if (this.tabGroup.selectedIndex == 3) {
				this.getPaymentRollOverNonLc();
			}


			this.toasterService.pop(response.message, 'Success', response.data);
			this.myModal.hide();
			// console.log(response);
		});

	}

	getInrRate(credit, debit, rate) {
		let rt;
		if (rate !== undefined) {
			rt = rate;
		} else {
			rt = 0;
		}
		// console.log(rate);
		return (credit + debit) * rt;

	}

	getIlcUtilization() {
		this.ilcUtilizationList = [];
		this.crudServices.getOne<any>(Ilc_Loc.getIlcUtilization, {
			from_date: this.fromdate,
			to_date: this.todate,
			spipl_bank_id: this.bank
		}).subscribe(response => {
			console.log(response);


			let TotalOpeningAmt = 0;
			let TotalPaymentAmt = 0;

			response.forEach(element => {
				let amt = 0;



				if (element.ilc_proforma_invoices.length > 0) {
					element.ilc_proforma_invoices.forEach(element2 => {
						if (element2.local_deal_pis.length > 0) {
							element2.local_deal_pis.forEach(element3 => {
								amt = amt + element3.amount;
							});

						}
					});
				}

				TotalOpeningAmt = TotalOpeningAmt + (amt + element.advance_tolerance_amt - element.short_tolerance_amt);

				element.subOrgName = element.ilc_proforma_invoices[0].sub_org_master.sub_org_name;

				element.ilcAmount = amt;
				element.limitUtilization = amt;
				let be_amount = 0;
				let bexListDetail = [];
				if (element.bill_of_exchanges.length > 0) {
					element.bill_of_exchanges.forEach(bex => {

						let be_amount_utilize = 0;

						bex.local_pi_deal_bexes.forEach(bexAmt => {
							be_amount = be_amount + bexAmt.amount;
							be_amount_utilize = be_amount_utilize + bexAmt.amount;
						});



						bex.be_no = bex.be_no;
						bex.be_date = bex.be_date;
						bex.dut_dt = bex.dut_dt;
						bex.bank_ref_no = bex.bank_ref_no;
						bex.be_amount = be_amount_utilize;

						bex.grade = bex.local_pi_deal_bexes[0].local_purchase_deal.grade;
						bex.limitUtilization = (amt + element.advance_tolerance_amt - element.short_tolerance_amt) - be_amount;
						bexListDetail.push(bex);

						TotalPaymentAmt = TotalPaymentAmt + be_amount_utilize;


					});

				}


				element.bexList = bexListDetail;

				this.ilcUtilizationList.push(element);




			});
			console.log(TotalOpeningAmt, 'open');
			console.log(TotalPaymentAmt, 'payment');


			this.totalInlandInrPending = TotalOpeningAmt - TotalPaymentAmt;

		})
	}


	getBoeIlc() {
		this.crudServices.getOne<any>(Ilc_Loc.getIlcUtilization, {
			from_date: this.fromdate,
			to_date: this.todate,
			spipl_bank_id: this.bank
		}).subscribe(response => {

			console.log(response);

			this.totalboeInrPending = 0;
			let TotalPaymentAmt = 0;
			this.bexList = [];
			response.forEach(element => {
				let amt = 0;
				let be_amount_utilize = 0;

				if (element.bill_of_exchanges != null) {

					element.bill_of_exchanges.forEach(bex => {
						let be_amount = 0;
						let totAmtDebit = 0;


						if (bex.deleted == 0) {


							bex.local_pi_deal_bexes.forEach(bexAmt => {
								be_amount = be_amount + bexAmt.amount;
								be_amount_utilize = be_amount_utilize + bexAmt.amount;
							});


							bex.subOrgName = element.ilc_proforma_invoices[0].sub_org_master.sub_org_name;
							bex.ilc_opening_date = element.ilc_opening_date;
							bex.ilc_bank_no = element.ilc_bank_no;
							bex.ilcAmount = amt;
							bex.be_no = bex.be_no;
							bex.be_date = bex.be_date;
							bex.dut_dt = bex.dut_dt;
							bex.bank_ref_no = bex.bank_ref_no;
							bex.grade = bex.local_pi_deal_bexes[0].local_purchase_deal.grade;
							bex.be_amount_credit = be_amount;
							bex.be_amount_debit = 0;
							bex.limitUtilization = be_amount;

							this.bexList.push(bex);

							// TotalPaymentAmt = TotalPaymentAmt + be_amount;


							if (bex.status == 1) {
								totAmtDebit = be_amount;

								let val = {};
								val['subOrgName'] = element.ilc_proforma_invoices[0].sub_org_master.sub_org_name;
								val['ilc_opening_date'] = element.ilc_opening_date;
								val['ilc_bank_no'] = element.ilc_bank_no;
								val['ilcAmount'] = amt;
								val['be_no'] = bex.be_no;
								val['be_date'] = bex.be_date;
								val['dut_dt'] = bex.dut_dt;
								val['bank_ref_no'] = bex.bank_ref_no;
								val['grade'] = bex.local_pi_deal_bexes[0].local_purchase_deal.grade;
								val['be_amount_credit'] = be_amount;
								val['be_amount_debit'] = 0;
								val['limitUtilization'] = be_amount - totAmtDebit;

								val['be_amount_credit'] = 0;
								val['be_amount_debit'] = be_amount;

								this.bexList.push(val);
								console.log(this.bexList);

							}




						}
						TotalPaymentAmt = TotalPaymentAmt + be_amount - totAmtDebit;


					});

				}




			});
			console.log(TotalPaymentAmt, 'ydsdfsdfsdz');


			this.totalboeInrPending = this.totalboeInrPending + TotalPaymentAmt;

		})
	}


	getStatus(status) {
		switch (Number(status)) {
			case 0: {
				return 'Pending';
				break;
			}
			case 1: {
				return 'Remitted ';
				break;
			}

			case 11: {
				return 'Roll over taken';
				break;
			}

			case 2: {
				return ' Roll Over';
				break;
			}
			case 3: {
				return 'Roll over remit';
				break;
			}


			default: {
				return '';
				break;
			}
		}
	}




}
