import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { ForwardBookService } from '../forward-booking/forward-book-service';
import { UtilizationService } from '../utilisation-chart/utilization-service';

@Component({
	selector: 'app-forward-covered',
	templateUrl: './forward-covered.component.html',
	styleUrls: ['./forward-covered.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		ForwardBookService,
		UtilizationService
	]
})
export class ForwardCoveredComponent implements OnInit {

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	add_hedge: boolean = false;
	edit_hedge: boolean = false;
	delete_hedge: boolean = false;
	serverUrl: string;
	user: UserDetails;
	isLoading = false;
	isCollapsed: boolean = false;
	links: string[] = [];
	cols = [];
	hedging_details = [];
	hedging_list = [];


	id: number;
	book_date: any;
	currency: any;
	bank_name: any;
	from_date: any;
	to_date: any;
	final_rate: any;
	spot_rate: any;
	amount: any;
	cancel_amount: any;
	token: any;
	margin: any;
	list = [];
	cols2 = [];
	filteredValuess: any;
	supp_charge = 0;
	conf_charge = 0;
	total_amount = 0;
	tt_amount = 0;
	total_hedge_amount = 0;


	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	balance_remain = 0;
	tt_hedge_amt = 0;


	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		public forwardBookService: ForwardBookService,
		public utilizationService: UtilizationService
	) {

		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.add_hedge = (this.links.indexOf('add hedge') > -1);
		this.edit_hedge = (this.links.indexOf('edit hedge') > -1);
		this.delete_hedge = (this.links.indexOf('delete hedge') > -1);
		this.cols = [
			{ field: 'PaymentDueDate', header: 'Payment Due Date', style: '150px' },
			{ field: 'SupplierName', header: 'Supplier Name', style: '200px' },
			{ field: 'InvoiceNo', header: 'Invoice Number', style: '100px' },
			{ field: 'Amount', header: 'Amount', style: '100px' },
			{ field: 'SupplierCharges', header: 'Supplier Charges', style: '100px' },
			{ field: 'ConfirmationCharges', header: 'Confirmation Charges', style: '100px' },
			{ field: '', header: 'Total', style: '100px' },
			{ field: 'balanceAfterHedge', header: 'Balance', style: '100px' },
		];

		this.cols2 = [
			{ field: 'PaymentDueDate', header: 'Payment Due Date', style: '150px' },
			{ field: 'InvoiceNo', header: 'Invoice Number', style: '100px' },
			{ field: 'Supplier', header: 'Supplier Name', style: '200px' },
			{ field: 'hedge_amount', header: 'Hedge Amount', style: '100px' }
		];
	}

	ngOnInit() {
		this.route.params.subscribe((params: Params) => {
			this.id = +params['id'];
		});

		this.getOneForwadBook();

	}

	getOneForwadBook() {
		this.forwardBookService.getOneForwardBook(this.id)
			.subscribe(response => {
				 console.log(response ," responseresponse");
				this.book_date = response[0]['booking_date'];
				this.currency = response[0]['CurrencyName'];
				this.bank_name = response[0]['spipl_bank_name'];
				this.from_date = response[0]['from_date'];
				this.to_date = response[0]['to_date'];
				this.final_rate = response[0]['final_rate'];
				this.spot_rate = response[0]['spot_rate'];
				this.amount = response[0]['amount'];
				this.cancel_amount = response[0]['cancel_amount'];
				this.token = response[0]['token'];
				this.margin = response[0]['margin'];

				if (response[0]['hedging_details'] !== '') {
					this.hedging_details = JSON.parse(response[0]['hedging_details']);
					for (const val of this.hedging_details) {
						this.total_hedge_amount = this.total_hedge_amount + Number(val.hedge_amount);
					}
				}



				this.getPaymentDetails();

			});


	}

	/** This function returns payment detail list for the forward book currency with that it returns the hedging list  */
	getPaymentDetails() {
		this.list = [];
		this.supp_charge = 0;
		this.conf_charge = 0;
		this.total_amount = 0;
		this.tt_amount = 0;
		this.balance_remain = 0;

		this.utilizationService.getPaymentList('', this.from_date, this.to_date, '')
			.subscribe(result => {
				if (result.code == 101) {

				} else {
					console.log(result, "paymentlist");
					this.isLoading = false;
					this.filteredValuess = result;
					let tt_amount = 0;
				
					for (let i = 0; i < result.length; i++) {
						//console.log(result[i],"ires")


						console.log(result[i]['BankName'] ,  this.bank_name, "Spipl Bank")

						if (result[i]['CurrencyName'] === this.currency && result[i]['BankName'] === this.bank_name ) {

							let supplier_charge = 0;
							let confirmation_charge = 0;
							let balance_after_hedge = 0;

							tt_amount = Number(result[i]['Amount']);

							if (result[i]['SupplierCharges']) {
								supplier_charge = Number(result[i]['SupplierCharges']);
							}
							if (result[i]['ConfirmationCharges']) {
								confirmation_charge = Number(result[i]['ConfirmationCharges']);
							}

							if (result[i]['balanceAfterHedge']) {
								balance_after_hedge = Number(result[i]['balanceAfterHedge']);
							}

							this.tt_amount = this.tt_amount + tt_amount;
							this.balance_remain = this.balance_remain + balance_after_hedge;
							if (result[i]['SupplierCharges']) {
								this.supp_charge = this.supp_charge + supplier_charge;
							}
							if (result[i]['ConfirmationCharges']) {
								this.conf_charge = this.conf_charge + confirmation_charge;
							}
							this.total_amount = this.total_amount + tt_amount + supplier_charge + confirmation_charge;

							result[i]['Total'] = tt_amount + supplier_charge + confirmation_charge;

							//console.log(tt_amount  , supplier_charge  , confirmation_charge,"cahrges");
								
							this.list.push(result[i]);

							//console.log(this.list ,"everyRecords ")

						}

						//console.log(this.list ,"list");
						
						this.hedging_list = [];
						
						this.tt_hedge_amt = 0;
						if (this.hedging_details.length > 0) {
							for (const val of this.list) {
								//console.log(this.hedging_details,"this.hedging_details11")
								for (const hedge of this.hedging_details) {
									if (hedge.nid == val.nid && ( hedge.pi_id == val.pi_id && hedge.payment_term_id == val.payment_term_id) && hedge.payment_status == val.StatusPayment) {
										//  console.log(val);
										hedge.Supplier = val.SupplierName;
										hedge.InvoiceNo = val.InvoiceNo;
										hedge.PaymentDueDate = val.PaymentDueDate;
										this.tt_hedge_amt = this.tt_hedge_amt + Number(hedge.hedge_amount);
										this.hedging_list.push(hedge);
									}
								}
							}
						}

						console.log(this.hedging_list , "this.hedging_list");
					}

					console.log(this.list,"listlist")

				}
			});
	}




	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.tt_amount = 0;
		this.supp_charge = 0;
		this.conf_charge = 0;
		this.total_amount = 0;
		this.balance_remain = 0;

		this.filteredValuess = event.filteredValue;
		// console.log( this.filteredValuess);
		for (let i = 0; i < this.filteredValuess.length; i++) {
			this.tt_amount = this.tt_amount + Number(this.filteredValuess[i]['Amount']);
			if (this.filteredValuess[i]['SupplierCharges']) {
				this.supp_charge = this.supp_charge + Number(this.filteredValuess[i]['SupplierCharges']);
			}

			if (this.filteredValuess[i]['balanceAfterHedge']) {
				this.balance_remain = this.balance_remain + Number(this.filteredValuess[i]['balanceAfterHedge']);
			}
			if (this.filteredValuess[i]['ConfirmationCharges']) {
				this.conf_charge = this.conf_charge + Number(this.filteredValuess[i]['ConfirmationCharges']);
			}
			this.total_amount = this.total_amount + this.filteredValuess[i]['Total'];
		}
	}


	/**  This function headge individual invoices , entered amount is compare with balance amount remain for that invoice number after hedge and with (total hedge amount for that forward book - entered amount - cancel amount) */
	hedgeInvoice(amount, item) {
		console.log(amount,item,"Neha-Hedge");
		// let hedge_amount = 0;
		let total_hedge_amount = 0;
		const amt = amount.target.value;
		for (const val of this.hedging_details) {
			// if (item.nid == val.nid) {
			//   hedge_amount = hedge_amount + Number(val.hedge_amount);
			// //  console.log(hedge_amount);
			// }
			total_hedge_amount = total_hedge_amount + Number(val.hedge_amount);
		}

		const condition1 = item.balanceAfterHedge;
		// const condition1 = item.Total - hedge_amount;
		const condition2 = this.amount - total_hedge_amount - this.cancel_amount;

		console.log(((Math.round(condition1 * 100)) / 100) ,((Math.round(condition2 * 100)) / 100 ), ((Math.round(amt * 100)) / 100) ,
		"nehehe");
		if (((Math.round(condition1 * 100)) / 100) >= ((Math.round(amt * 100)) / 100) && ((Math.round(condition2 * 100)) / 100 ) >= ((Math.round(amt * 100)) / 100)) {


			// const formData: any = new FormData();
			// formData.append('nid', item.nid);
			// formData.append('payment_status', item.StatusPayment);
			// formData.append('amount', amt);
			// formData.append('forward_book_id', this.id);

			let formData: any = {
				nid: item.nid,
				pi_id:item.pi_id,
				payment_term_id:item.payment_term_id,
				payment_status: item.StatusPayment,
				amount: amt,
				forward_book_id: this.id,
			};


			this.forwardBookService.hedgeInvoice(formData)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getOneForwadBook();
				});
		} else {
			this.toasterService.pop('error', 'Error', 'Amount Execeeded');
			this.getOneForwadBook();
		}




	}


	hedgeInvoiceEdit(value, item) {
		console.log(value,item,"Neha- Hedge");
		let hedge_amount = 0;
		let total_hedge_amount = 0;
		const amt = value.target.value;
		for (const val of this.hedging_details) {
			if (item.nid == val.nid) {
				hedge_amount = hedge_amount + Number(val.hedge_amount);
				//  console.log(hedge_amount);
			}
			total_hedge_amount = total_hedge_amount + Number(val.hedge_amount);
		}

		//  const condition1 = hedge_amount - Number(item.hedge_amount);
		console.log(this.amount, total_hedge_amount, this.cancel_amount, item.hedge_amount, "hedge amount");
		const condition2 = this.amount - total_hedge_amount - this.cancel_amount - Number(item.hedge_amount);


		//   console.log(condition1);

		if (condition2 > amt) {


			// const formData: any = new FormData();
			// formData.append('nid', item.nid);
			// formData.append('payment_status', item.payment_status);
			// formData.append('amount', amt);
			// formData.append('forward_book_id', this.id);

			let formData: any = {
				nid: item.nid,
				pi_id:item.pi_id,
				payment_term_id:item.payment_term_id,
				payment_status: item.payment_status,
				amount: amt,
				forward_book_id: this.id,
			};



			this.forwardBookService.hedgeInvoiceEdit(formData)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getOneForwadBook();
				});
		} else {
			this.toasterService.pop('error', 'Error', 'Amount Execeeded');
			this.getOneForwadBook();
		}


	}


	onDeleteHedge(item) {
		if (item) {

			// const formData: any = new FormData();
			//   formData.append('nid', item.nid);
			//   formData.append('payment_status', item.payment_status);
			//   formData.append('forward_book_id', this.id);

			let formData: any = {
				nid: item.nid,
				payment_status: item.payment_status,
				forward_book_id: this.id,
			};



			this.forwardBookService.deleteHedge(formData)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getOneForwadBook();
				});
		}
	}

	onBack() {
		this.router.navigate(['forex/forward-booking']);
	}



}
