import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { ProformaInvoiceService } from '../proforma-invoice/proforma-invoice-service';
import { NonLcService } from './non-lc-service';
import { NonService } from '../lc-in-operation/non-service';
import { FileUpload, flcProformaInvoice, LetterofCreditCrud, nonLcPi, nonNegotiable, Notifications, NotificationsUserRel, UsersNotification } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';

import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { MessagingService } from '../../../service/messaging.service';


@Component({
	selector: 'app-non-lc-pi',
	templateUrl: './non-lc-pi.component.html',
	styleUrls: ['./non-lc-pi.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		ProformaInvoiceService,
		NonLcService,
		NonService,
		CrudServices,
		MessagingService
	]
})
export class NonLcPiComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('paymentDateModal', { static: false }) public paymentDateModal: ModalDirective;
	@ViewChild('paymentDateModalNON', { static: false }) public paymentDateModalNON: ModalDirective;
	@ViewChild('nonModal', { static: false }) public nonModal: ModalDirective;
	@ViewChild('ReviseNonModal', { static: false }) public ReviseNonModal: ModalDirective;
	@ViewChild('chargeModal', { static: false }) public chargeModal: ModalDirective;
	@ViewChild('conformPopUp', { static: false }) public conformPopUp: ModalDirective;


	myContent: string;
	converted: any;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	public today = new Date();

	id: number;
	serverUrl: string;
	user: UserDetails;
	links: any;
	isLoading = false;

	// Pi Details
	buyerBankName: any;
	buyerOrgName: any;
	suppierOrgName: any;
	currency: any;
	destinationPort: any;
	gradeName: any;
	payment_term: any;
	isCollapsed: boolean = false;
	proform_invoice_no: any;
	total_pi_amount: number;
	pi_quantity: any;
	pi_rate: any;
	high_seas_pi: any;
	forward_sale_pi: any;
	purchase_hold_qty_flag: any;
	nonlc_applicaton_date_db: any;

	addSwiftDetailForm: FormGroup;
	addPaymentDateForm: FormGroup;
	addPaymentDateFormNON: FormGroup;
	addNonForm: FormGroup;
	reviseNonForm: FormGroup;
	docs: Array<File> = [];
	nondoc: Array<File> = [];
	revisedoc: Array<File> = [];

	// arrays
	payment_term_list = [];

	Non_details = [];
	pt_id: any;
	invoiceQty: any;

	// PARMARZKAJAL0256
	// PARMARZKAJAL0265

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	swiftDetails = [];
	swift_date: any;
	ref_no_swift: any;
	dbSwiftDetailId: any;
	nonlcPayAmount: any;
	payment_due_dt: any;
	add_payment_due_dt: any;
	grade_id: any;
	destination_port_id: any;
	supplier_id: any;
	buyer_bank_id: any;
	pi_id_qty: { pi_id: any; pi_qty: any; pi_rate: any, high_seas_pi: any, forward_sale_pi: any, purchase_hold_qty_flag: any }[];
	pi_id_qty_new: { pi_id: any; pi_qty: any; pi_rate: any, high_seas_pi: any, forward_sale_pi: any, purchase_hold_qty_flag: any }[];
	lc_id: any;
	pi_id: any;
	shipmentDate: any;
	invoiceDate: any;
	receivedDate: any;
	invoiceNo: any;
	remark: any;
	nonid: any;
	non_id: number;
	supplier_charge: any;
	confirm_charge: any;
	payment_days = 0;
	roll_over_status: any;
	nonLcNid: any;


	payment_due_date: any;
	payment_non_lc: any;
	payment_status = 0;
	payment_roll_over_date: any;
	ETD: any;
	ETA: any;
	swift_rmk: any;
	nonlc_rate: any;
	non_delete: boolean;
	non_edit: boolean;
	create_non: boolean;
	reset: boolean;
	edit_swift: boolean;
	delete_swift: boolean;
	non_revise: boolean;
	update_status: boolean;
	payment_roll_over: any;
	paymentTerm: any;
	buyerBankSwiftCode: any;
	buyerBankAddress: any;
	BuyerBankAcc: any;
	firstAdvBank: any;
	firstAdvBankAddress: any;
	adv_bank_swift_code: any;
	adv_account_no: any;
	actual_payment_due_date: any;
	nonAmount_db: any;


	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;
	c_pi_id: any;
	c_pi_qty: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private piService: ProformaInvoiceService,
		private nonLcService: NonLcService,
		private nonService: NonService,
		private CrudServices: CrudServices,
		private MessagingService: MessagingService
	) {
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.non_edit = (this.links.indexOf('non-lc non edit') > -1);
		this.non_delete = (this.links.indexOf('non-lc non delete') > -1);
		this.create_non = (this.links.indexOf('non-lc create non') > -1);
		this.reset = (this.links.indexOf('non-lc reset status') > -1);
		this.edit_swift = (this.links.indexOf('non-lc edit swift') > -1);
		this.delete_swift = (this.links.indexOf('non-lc delete swift') > -1);
		this.non_revise = (this.links.indexOf('non-lc non revise') > -1);
		this.update_status = (this.links.indexOf('non-lc update status') > -1);



		this.route.params.subscribe((params: Params) => {
			this.id = +params['pi_id'];
		});

		this.addPaymentDateForm = new FormGroup({
			'add_payment_date': new FormControl(null, Validators.required),
		});

		this.addPaymentDateFormNON = new FormGroup({
			'nonlc_applicaton_date': new FormControl(null, Validators.required),
		});



		this.addSwiftDetailForm = new FormGroup({

			'id': new FormControl(null),
			'non_lc_swift_date': new FormControl(null, Validators.required),
			'non_lc_swift_ref_no': new FormControl(null, Validators.required),
			'payment_date': new FormControl(null, Validators.required),
			'actual_payment_due_date': new FormControl(null),
			'non_lc_swift_upload': new FormControl(null),
			'remark': new FormControl(null),
			'nonlc_rate': new FormControl(0),
		});

		this.addNonForm = new FormGroup({
			'invoice_no': new FormControl(null, Validators.required),
			'invoice_date': new FormControl(null, Validators.required),
			'non_received_date': new FormControl(null, Validators.required),
			'date_of_shipment': new FormControl(null, Validators.required),
			'non_rmk': new FormControl(null),
			'non_copy': new FormControl(null),
			'invoice_qty': new FormControl(null),
		});

		this.reviseNonForm = new FormGroup({

			'discrepancy_note': new FormControl(null, Validators.required),
			'non_revised_copy': new FormControl(null, Validators.required)
		});


	}

	ngOnInit() {
		this.getOnePi();
		this.getNonDetails();


		this.payment_roll_over = [{ 'value': 2, 'label': 'Roll Over' }, { 'value': 3, 'label': 'Roll Over Remit' }];

	}

	getOnePi() {
		this.CrudServices.postRequest<any>(flcProformaInvoice.getOnePi, {
			id: this.id
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				console.log(response, "piDetails1");
				this.pi_id = response[0]['id'];
				this.buyerBankName = response[0]['buyerBankName'];
				this.buyerBankSwiftCode = response[0]['buyerBankSwiftCode'];
				this.buyerBankAddress = response[0]['buyerBankAddress'];
				this.BuyerBankAcc = response[0]['BuyerBankAcc'];

				this.firstAdvBank = response[0]['firstAdvBank'];
				this.firstAdvBankAddress = response[0]['firstAdvBankAddress'];
				this.adv_bank_swift_code = response[0]['adv_bank_swift_code'];
				this.adv_account_no = response[0]['adv_account_no'];



				this.suppierOrgName = response[0]['suppierOrgName'];
				this.currency = response[0]['currency'];
				this.destinationPort = response[0]['destinationPort'];
				this.gradeName = response[0]['gradeName'];
				this.payment_term = response[0]['paymentTerm'];
				this.proform_invoice_no = response[0]['proform_invoice_no'];
				this.total_pi_amount = response[0]['total_pi_amount'];
				this.pi_quantity = response[0]['pi_quantity'];
				this.pi_rate = response[0]['pi_rate'];
				this.high_seas_pi = response[0]['high_seas_pi'];
				this.forward_sale_pi = response[0]['forward_sale_pi'];
				this.purchase_hold_qty_flag = response[0]['purchase_hold_qty_flag'];
				this.grade_id = response[0]['grade_id'];
				this.destination_port_id = response[0]['destination_port_id'];
				this.supplier_id = response[0]['supplier_id'];
				this.buyer_bank_id = response[0]['buyer_bank_id'];
				this.lc_id = response[0]['lc_id'];
				this.ETD = response[0]['tentitive_departure_date'];
				this.ETA = response[0]['tentitive_arrival_date'];
				if (response[0]['non_lc_swift_tt_details']) {
					this.swiftDetails = response[0]['non_lc_swift_tt_details'];
				}
				this.pi_id_qty = [
					{
						pi_id: this.pi_id,
						pi_qty: this.pi_quantity,
						pi_rate: this.pi_rate,
						high_seas_pi: this.high_seas_pi,
						forward_sale_pi: this.forward_sale_pi,
						purchase_hold_qty_flag: this.purchase_hold_qty_flag
					}];
				this.getPaymentTerm();
			}

		});
	}

	// getPaymentTerm() {

	//   this.payment_term_list = [];
	//   const arr = [];
	//   let data = [];
	//   this.isLoading = true;
	//   this.nonLcService.getNonLcList(this.id)
	//     .subscribe(response => {
	//       this.isLoading = false;
	//       if (this.swiftDetails.length > 0) {
	//       for (const pt of response) {
	//        // arr = [];
	//         for (const val of this.swiftDetails) {
	//           if ( pt.pt_id == val.payment_term_id ) {
	//             const foundIndex = arr.findIndex(({ pt_id }) => pt_id ===  pt.pt_id);
	//             arr.splice(foundIndex, 1);
	//             pt.non_lc_swift_date = val.non_lc_swift_date;
	//             pt.non_lc_swift_ref_no = val.non_lc_swift_ref_no;
	//             pt.payment_date = val.payment_date;
	//             pt.non_lc_swift_upload = val.non_lc_swift_upload;
	//             pt.remark = val.remark;
	//             arr.push(pt);

	//           } else {
	//              data = arr.find(ob => ob['pt_id'] ==  pt.pt_id );
	//            if ( !data ) {
	//             arr.push(pt);
	//            }
	//           }

	//         }
	//   }
	//       this.payment_term_list = arr;
	//     } else {
	//       this.payment_term_list = response;
	//     }

	//     });






	// }


	getPaymentTerm() {

		this.payment_term_list = [];
		const arr = [];
		let data = [];
		this.isLoading = true;

		this.CrudServices.postRequest<any>(nonLcPi.getPaymentTermList, {
			id: this.id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.isLoading = false;
				console.log(response, "resNEha");
				console.log(this.swiftDetails, "swiftD");

				if (this.swiftDetails.length > 0) {
					for (const pt of response) {
						// arr = [];
						for (const val of this.swiftDetails) {
							if (pt.pt_id == val.payment_term_id) {

								const foundIndex = arr.findIndex(({ pt_id }) => pt_id === pt.pt_id);
								console.log(foundIndex, "index");

								if (foundIndex > -1) {
									arr.splice(foundIndex, 1);
								}

								//
								pt.non_lc_swift_date = val.non_lc_swift_date;
								pt.dbNonSwiftId = val.id;
								pt.non_lc_swift_ref_no = val.non_lc_swift_ref_no;
								pt.payment_date = val.payment_date;
								pt.non_lc_swift_upload = val.non_lc_swift_upload;
								pt.remark = val.remark;
								pt.balance_payterm = val.payment_term_master.balance_payterm;
								pt.nonlc_rate = val.nonlc_rate;
								pt.actual_payment_due_date = val.actual_payment_due_date;



								//pt.payAmount = val.piAmount;
								arr.push(pt);



							} else {

								if (arr.length > 0) {
									data = arr.find(ob => ob['pt_id'] === pt.pt_id);
									if (!data) {
										arr.push(pt);
									}
								} else {
									arr.push(pt);
								}

							}

						}
					}

					console.log(arr, "rraa 2---");
					this.payment_term_list = arr;
				} else {
					this.payment_term_list = response;
				}
			}

		});

		// this.nonLcService.getNonLcList(this.id)
		// 	.subscribe(response => {
		// 		this.isLoading = false;
		// 		console.log(response, "res");
		// 		console.log(this.swiftDetails, "swiftD");

		// 		if (this.swiftDetails.length > 0) {
		// 			for (const pt of response) {
		// 				// arr = [];
		// 				for (const val of this.swiftDetails) {
		// 					if (pt.pt_id == val.payment_term_id) {

		// 						const foundIndex = arr.findIndex(({ pt_id }) => pt_id === pt.pt_id);
		// 						console.log(foundIndex, "index");

		// 						if (foundIndex > -1) {
		// 							arr.splice(foundIndex, 1);
		// 						}

		// 						//
		// 						pt.non_lc_swift_date = val.non_lc_swift_date;
		// 						pt.dbNonSwiftId = val.id;
		// 						pt.non_lc_swift_ref_no = val.non_lc_swift_ref_no;
		// 						pt.payment_date = val.payment_date;
		// 						pt.non_lc_swift_upload = val.non_lc_swift_upload;
		// 						pt.remark = val.remark;
		// 						pt.balance_payterm = val.payment_term_master.balance_payterm;
		// 						pt.nonlc_rate = val.nonlc_rate;

		// 						//pt.payAmount = val.piAmount;
		// 						arr.push(pt);



		// 					} else {

		// 						if (arr.length > 0) {
		// 							data = arr.find(ob => ob['pt_id'] === pt.pt_id);
		// 							if (!data) {
		// 								arr.push(pt);
		// 							}
		// 						} else {
		// 							arr.push(pt);
		// 						}

		// 					}

		// 				}
		// 			}

		// 			console.log(arr, "rraa 2---");
		// 			this.payment_term_list = arr;
		// 		} else {
		// 			this.payment_term_list = response;
		// 		}

		// 	});






	}

	getNonDetails() {

		this.CrudServices.postRequest<any>(nonLcPi.getNonLcNon, {
			id: this.id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.Non_details = response;
				console.log(response, "nonDeti");

				console.log(response, "nonnego");
				if (response.length) {
					this.payment_status = response[0]['payment_status'];
					this.payment_roll_over_date = response[0]['payment_due_date'];
				}
			}
		});
		// this.nonLcService.getNonDetails(this.id)
		// 	.subscribe(response => {
		// 		this.Non_details = response;
		// 		console.log(response, "nonnego");
		// 		if (response) {
		// 			this.payment_status = response[0]['payment_status'];
		// 			this.payment_roll_over_date = response[0]['payment_due_date'];
		// 		}
		// 	});
	}

	convert(str) {
		if (str) {
			const date = new Date(str),
				mnth = ('0' + (date.getMonth() + 1)).slice(-2),
				day = ('0' + date.getDate()).slice(-2);
			return [date.getFullYear(), mnth, day].join('-');
		} else {
			return '';
		}
	}



	addDocs(event: any) {
		this.docs = <Array<File>>event.target.files;
	}


	addNonDocs(event: any) {
		this.nondoc = <Array<File>>event.target.files;
	}


	addRevisedCopy(event: any) {
		this.revisedoc = <Array<File>>event.target.files;
	}


	swiftModal(id: number) {

		this.getNotifications('NON_LC_SWIFT_DETAILS_UPDATE');

		this.pt_id = id;
		this.myModal.show();

		console.log(this.payment_term_list, "PaymentLIST");
		for (const val of this.payment_term_list) {
			//console.log(this.payment_term_list)
			if (val.pt_id == this.pt_id) {
				this.swift_date = val.non_lc_swift_date;
				this.dbSwiftDetailId = val.dbNonSwiftId;
				this.ref_no_swift = val.non_lc_swift_ref_no;
				this.payment_due_dt = val.payment_date;
				this.actual_payment_due_date = val.actual_payment_due_date;
				this.swift_rmk = val.remark;
				this.nonlc_rate = val.nonlc_rate;
			}
		}
	}

	paymentDate(id: number) {
		this.getNotifications('NON_LC_APPLICATION_ADVANCE');
		this.pt_id = id;
		this.paymentDateModal.show();
		console.log(this.payment_term_list, "PaymentLIST");
		for (const val of this.payment_term_list) {
			//console.log(this.payment_term_list)
			if (val.pt_id == this.pt_id) {
				this.payment_due_dt = val.payment_date;
				this.nonlcPayAmount = val.piAmount;
				this.paymentTerm = val.pay_term;
				console.log(this.nonlcPayAmount, "piamtts");
			}
		}
	}

	getNotifications(name) {
		this.notification_tokens = [];
		this.notification_id_users = []
		this.notification_users = [];

		this.CrudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				console.log(this.notification_details, "received details")
				this.CrudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					console.log(notificationUser, 'DATA');

					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);
								console.log(this.notification_tokens, this.notification_id_users)
							}
						});
					}
				});
			}
		})
	}

	async generateNotification(data, id) {
		console.log(this.notification_details, 'DIKSHA************');
		if (this.notification_details != undefined) {
			let body = {
				notification: data,
				registration_ids: this.notification_tokens
			};

			console.log(body, 'BODY****************');


			await this.MessagingService.sendNotification(body).then((response) => {
				if (response) {
					console.log(response);

					this.saveNotifications(body['notification'], id)
				}
				this.MessagingService.receiveMessage();
				this.message = this.MessagingService.currentMessage;

			})

		}
	}

	saveNotifications(notification_body, id) {
		console.log(id, 'DATA');

		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: id,
				table_name: 'flc_proforma_invoice',
			})
		}
		console.log(this.notification_users, "this.notification_users")
		this.CrudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

	paymentDateNON(n_id: number) {
		this.getNotifications('NON_LC_APPLICATION_CREDIT');

		this.nonLcNid = n_id;

		this.CrudServices.postRequest<any>(nonLcPi.getNonLcNonCreditDet, {
			n_id: n_id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {

				this.nonlc_applicaton_date_db = response.nonlc_applicaton_date;
				this.nonAmount_db = response.non_amount;
			}
		});

		console.log(this.Non_details, "Non_detailsNon_details")


		this.paymentDateModalNON.show();

	}

	onPaymentDateNON() {

		this.downloadNON();

		let formData: any = {
			nonlc_applicaton_date: this.convert(this.addPaymentDateFormNON.value.nonlc_applicaton_date),
			n_id: this.nonLcNid,
			pi_id: this.id
		};

		this.CrudServices.postRequest<any>(nonNegotiable.updateNonLcCreditPaymentDate, formData).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.paymentDateModalNON.hide();
				this.getOnePi();
				this.getNonDetails();
			} else {


				let NonDetailsNew: any = [];
				NonDetailsNew = this.Non_details.find(item => item.id === this.nonLcNid);
				let data = {
					"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
					"body": `Non-LC Credit Application Created Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
					"click_action": "#"
				}
				this.generateNotification(data, 1);

				this.toasterService.pop(response.message, response.message, response.data);
				this.paymentDateModalNON.hide();
				this.getOnePi();
				this.getNonDetails();
			}
		});

	}


	downloadNON() {
		const date = new Date(this.addPaymentDateFormNON.value.nonlc_applicaton_date),
			mnth = ('0' + (date.getMonth() + 1)).slice(-2),
			day = ('0' + date.getDate()).slice(-2);
		let paymentConvertDate = [day, mnth, date.getFullYear()].join('/');


		const newstr = '<html><head><title></title></head><body data-gr-ext-installed="" data-new-gr-c-s-check-loaded="14.997.0"><table align="center" class="Table" style="background:white; border:undefined; width:85.0%"><tbody><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">Date:' + paymentConvertDate + '</span></span></span></p></td></tr><tr><td style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">To,<br />' + this.buyerBankName + '<br /><br />' + this.buyerBankAddress + ' </span></span></span></span></p></td><td style="background-color:white">&nbsp;</td><td style="background-color:white">&nbsp;</td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black"><br />Sub:- TT 90 DAYS AFTER ON BOARD DATE  Payment of ' + this.suppierOrgName + ' for USD ' + this.nonAmount_db + ' </span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black"><br />Dear Sir/Madam,</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">We are making ' + this.paymentTerm + ' Payment of ' + this.suppierOrgName + ' for USD ' + this.nonAmount_db + ' against Proforma Invoice No: ' + this.proform_invoice_no + ' </span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">We request you to please debit our Account No: ' + this.BuyerBankAcc + ' for making the above payment.</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">The details of Beneficiary are given below:</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">BENEFICIARY :' + this.suppierOrgName + '</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><table class="Table" style="border:undefined"><tbody><tr><td><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">ACCOUNT DETAILS:</span></span></span></p></td><td><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">' + this.firstAdvBank + '</span></span></span></p></td></tr><tr><td>&nbsp;</td><td><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">' + this.firstAdvBankAddress + '<br />SWIFT: ' + this.adv_bank_swift_code + '<br />ACCOUNT NO: ' + this.adv_account_no + '<br />IBAN NO :<br />CORRESPONDING BANK :</span></span></span></p></td></tr></tbody></table></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">Thanking You,</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">For Sushila Parmar International Pvt.Ltd.<br /><br /><br /><br /><br /><br />Authorized Signatory</span></span></span></span></p></td></tr></tbody></table></body></html>';
		let html_document = '<!DOCTYPE html><html><head><title></title>';
		html_document += '</head><body>' + newstr + '</body></html>';
		this.converted = htmlDocx.asBlob(html_document, { orientation: 'potrait' });
		saveAs(this.converted, 'SwiftApplication');
	}

	download() {


		const date = new Date(this.addPaymentDateForm.value.add_payment_date),
			mnth = ('0' + (date.getMonth() + 1)).slice(-2),
			day = ('0' + date.getDate()).slice(-2);
		let paymentConvertDate = [day, mnth, date.getFullYear()].join('/');


		const newstr = '<html><head><title></title></head><body data-gr-ext-installed="" data-new-gr-c-s-check-loaded="14.997.0"><table align="center" class="Table" style="background:white; border:undefined; width:85.0%"><tbody><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">Date:' + paymentConvertDate + '</span></span></span></p></td></tr><tr><td style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">To,<br />' + this.buyerBankName + '<br /><br />' + this.buyerBankAddress + ' </span></span></span></span></p></td><td style="background-color:white">&nbsp;</td><td style="background-color:white">&nbsp;</td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black"><br />Sub:- TT 90 DAYS AFTER ON BOARD DATE  Payment of ' + this.suppierOrgName + ' for USD ' + this.nonlcPayAmount + ' </span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black"><br />Dear Sir/Madam,</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">We are making ' + this.paymentTerm + ' Payment of ' + this.suppierOrgName + ' for USD ' + this.nonlcPayAmount + ' against Proforma Invoice No: ' + this.proform_invoice_no + ' </span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">We request you to please debit our Account No: ' + this.BuyerBankAcc + ' for making the above payment.</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">The details of Beneficiary are given below:</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">BENEFICIARY :' + this.suppierOrgName + '</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><table class="Table" style="border:undefined"><tbody><tr><td><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">ACCOUNT DETAILS:</span></span></span></p></td><td><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">' + this.firstAdvBank + '</span></span></span></p></td></tr><tr><td>&nbsp;</td><td><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt">' + this.firstAdvBankAddress + '<br />SWIFT: ' + this.adv_bank_swift_code + '<br />ACCOUNT NO: ' + this.adv_account_no + '<br />IBAN NO :<br />CORRESPONDING BANK :</span></span></span></p></td></tr></tbody></table></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">Thanking You,</span></span></span></span></p></td></tr><tr><td colspan="3" style="background-color:white"><p style="margin-left:0in; margin-right:0in"><span style="font-size:7.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:12.0pt"><span style="color:black">For Sushila Parmar International Pvt.Ltd.<br /><br /><br /><br /><br /><br />Authorized Signatory</span></span></span></span></p></td></tr></tbody></table></body></html>';
		let html_document = '<!DOCTYPE html><html><head><title></title>';
		html_document += '</head><body>' + newstr + '</body></html>';
		this.converted = htmlDocx.asBlob(html_document, { orientation: 'potrait' });
		saveAs(this.converted, 'SwiftApplication');
	}

	onPaymentDate() {


		this.download();


		//if (!this.addPaymentDateForm.invalid) {
		let formData: any = {
			payment_date: this.convert(this.addPaymentDateForm.value.add_payment_date),
			non_lc_swift_date: this.convert(this.addPaymentDateForm.value.add_payment_date),
			payment_term_id: this.pt_id,
			pi_id: this.id,
			amount: this.nonlcPayAmount,
			n_id: this.nonid
		};


		this.CrudServices.postRequest<any>(nonLcPi.addPaymentDate, formData).subscribe((response) => {
			if (response.code === "101") {

				this.toasterService.pop(response.message, response.message, response.data);
				this.paymentDateModal.hide();
				this.getOnePi();
				this.getNonDetails();
			} else {

				let data = {
					"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
					"body": `Non-LC Advance Application Created Against ${this.suppierOrgName} of Sales Contract No. : ${this.proform_invoice_no} `,
					"click_action": "#"
				}
				this.generateNotification(data, 1);

				this.toasterService.pop(response.message, response.message, response.data);
				this.paymentDateModal.hide();
				this.getOnePi();
				this.getNonDetails();
			}
		});
		// this.nonLcService.addPaymentDetails(formData).subscribe((response) => {
		// 	console.log(response, "resonse");
		// 	if (response.code === '100') {
		// 		this.toasterService.pop(response.message, response.message, response.data);
		// 		this.paymentDateModal.hide();
		// 		this.getOnePi();
		// 		this.getNonDetails();
		// 	} else {
		// 		this.toasterService.pop(response.message, response.message, response.data);
		// 		this.paymentDateModal.hide();
		// 		this.getOnePi();
		// 		this.getNonDetails();
		// 	}
		// });

		//}
	}

	onSubmitSwift() {


		if (!this.addSwiftDetailForm.invalid) {

			//   const formData: any = new FormData();
			//   formData.append('non_lc_swift_date', this.convert(this.addSwiftDetailForm.value.non_lc_swift_date));
			//   formData.append('payment_date', this.convert(this.addSwiftDetailForm.value.payment_date));
			//   formData.append('non_lc_swift_ref_no', this.addSwiftDetailForm.value.non_lc_swift_ref_no);
			//   formData.append('payment_term_id', this.pt_id);
			//   formData.append('piid', this.id);
			//   formData.append('remark', this.addSwiftDetailForm.value.remark);

			let formData: any = {
				non_lc_swift_date: this.convert(this.addSwiftDetailForm.value.non_lc_swift_date),
				payment_date: this.convert(this.addSwiftDetailForm.value.payment_date),
				non_lc_swift_ref_no: this.addSwiftDetailForm.value.non_lc_swift_ref_no,
				actual_payment_due_date: this.addSwiftDetailForm.value.actual_payment_due_date,
				payment_term_id: this.pt_id,
				//id: this.dbSwiftDetailId,

				pi_id: this.id,
				remark: this.addSwiftDetailForm.value.remark,
				nonlc_rate: this.addSwiftDetailForm.value.nonlc_rate
			};



			console.log(this.dbSwiftDetailId, "idddddd")

			const fileData = new FormData();

			const document: Array<File> = this.docs;
			if (document.length > 0) {
				for (let i = 0; i < document.length; i++) {
					fileData.append('non_lc_swift_upload', document[i], document[i]['name']);
				}
				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.non_lc_swift_upload;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						formData['non_lc_swift_upload'] = JSON.stringify(files);
						this.saveNonLcSwift(formData);
					}
				});
			} else {

				this.CrudServices.postRequest<any>(nonLcPi.updateSwiftDetails, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {

						let data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Non-LC Swift Details Updated Against ${this.suppierOrgName} of Sales Contract No. : ${this.proform_invoice_no} `,
							"click_action": "#"
						}
						this.generateNotification(data, 1);

						this.toasterService.pop(response.message, response.message, response.data);
						this.oncloseModal();
						this.getOnePi();
						//	this.getPaymentTerm();
						this.getNonDetails();
					}

				});

				// this.nonLcService.addSwiftDetails(formData).subscribe((response) => {
				// 	console.log(response, "resonse");
				// 	this.toasterService.pop(response.message, response.message, response.data);
				// 	if (response.code === '100') {
				// 		this.oncloseModal();
				// 		this.getOnePi();
				// 		//	this.getPaymentTerm();
				// 		this.getNonDetails();
				// 	}
				// });
			}


		}


	}

	saveNonLcSwift(form) {

		this.CrudServices.postRequest<any>(nonLcPi.updateSwiftDetails, form).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {

				let data = {
					"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
					"body": `Non-LC Swift Details Updated Against ${this.suppierOrgName} of Sales Contract No. : ${this.proform_invoice_no} `,
					"click_action": "#"
				}
				this.generateNotification(data, 1);

				this.toasterService.pop(response.message, response.message, response.data);
				this.oncloseModal();
				this.getOnePi();
				//this.getPaymentTerm();
				this.getNonDetails();
			}
		});

		// this.nonLcService.addSwiftDetails(form).subscribe((response) => {
		// 	this.toasterService.pop(response.message, response.message, response.data);
		// 	if (response.code === '100') {
		// 		this.oncloseModal();
		// 		this.getOnePi();
		// 		//this.getPaymentTerm();
		// 		this.getNonDetails();
		// 	}
		// });

	}

	onSubmitNon() {
		if (!this.addNonForm.invalid) {

			this.pi_id_qty_new = [
				{
					pi_id: this.pi_id,
					pi_qty: this.addNonForm.value.invoice_qty,
					pi_rate: this.pi_rate,
					high_seas_pi: this.high_seas_pi,
					forward_sale_pi: this.forward_sale_pi,
					purchase_hold_qty_flag: this.purchase_hold_qty_flag
				}];

			let formData: any = {
				invoice_no: this.addNonForm.value.invoice_no,
				invoice_date: this.convert(this.addNonForm.value.invoice_date),
				non_received_date: this.convert(this.addNonForm.value.non_received_date),
				date_of_shipment: this.convert(this.addNonForm.value.date_of_shipment),
				//payment_due_date: '',
				non_rmk: this.addNonForm.value.non_rmk,
				pi_id_qty: JSON.stringify(this.pi_id_qty_new),
				grade_id: this.grade_id,
				port_id: this.destination_port_id,
				lc_id: this.lc_id,
				supplier_id: this.supplier_id,
				spipl_bank_id: this.buyer_bank_id,
				id: this.nonid,
			};

			const fileData = new FormData();
			const document: Array<File> = this.nondoc;
			if (document.length > 0) {
				for (let i = 0; i < document.length; i++) {
					fileData.append('non_copy', document[i], document[i]['name']);
				}

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.non_copy;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						formData['non_copy'] = JSON.stringify(files);
						this.saveNonLcNon(formData);
					}
				});
			} else {
				if (this.nonid) {

					this.CrudServices.postRequest<any>(nonNegotiable.updateNon, formData).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							let NonDetailsNew: any = [];
							NonDetailsNew = this.Non_details.find(item => item.id === this.nonid);
							let data = {
								"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
								"body": `Non-LC Non-Negotiable Revised Document Deleted Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
								"click_action": "#"
							}
							this.generateNotification(data, 1);

							this.toasterService.pop(response.message, response.message, response.data);
							this.addNonForm.reset();
							this.getOnePi();
							//this.getPaymentTerm();
							this.getNonDetails();
							this.nonModal.hide();
						}

					});


				} else {
					if (document.length > 0) {
						this.CrudServices.postRequest<any>(nonNegotiable.createNon, formData).subscribe((response) => {
							if (response.code === "101") {
								this.toasterService.pop(response.message, response.message, response.data);
							} else {
								let NonDetailsNew: any = [];
								NonDetailsNew = this.Non_details.find(item => item.id === this.nonid);
								let data = {
									"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
									"body": `Non-LC Non-Negotiable Revised Document Deleted Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
									"click_action": "#"
								}
								this.generateNotification(data, 1);
								this.toasterService.pop(response.message, response.message, response.data);
								this.addNonForm.reset();
								this.getOnePi();
								//this.getPaymentTerm();
								this.getNonDetails();
								this.nonModal.hide();
							}
						});



					} else {
						this.toasterService.pop('error', 'error', 'Upload Non-Negotiable Document');
					}

				}

			}


		}
	}


	saveNonLcNon(form) {

		if (this.nonid) {

			this.CrudServices.postRequest<any>(nonNegotiable.updateNon, form).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					let NonDetailsNew: any = [];
					NonDetailsNew = this.Non_details.find(item => item.id === this.nonid);
					let data = {
						"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
						"body": `Non-LC Non-Negotiable Revised Document Deleted Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
						"click_action": "#"
					}
					this.generateNotification(data, 1);
					this.toasterService.pop(response.message, response.message, response.data);
					this.addNonForm.reset();
					this.getOnePi();
					//this.getPaymentTerm();
					this.getNonDetails();
					this.nonModal.hide();
				}
			});

			// this.nonService.updateNon(form).subscribe((response) => {
			// 	this.toasterService.pop(response.message, response.message, response.data);
			// 	if (response.code === '100') {
			// 		this.addNonForm.reset();
			// 		this.getOnePi();
			// 		//this.getPaymentTerm();
			// 		this.getNonDetails();
			// 		this.nonModal.hide();
			// 	}
			// });

		} else {
			const document: Array<File> = this.nondoc;
			if (document.length > 0) {

				this.CrudServices.postRequest<any>(nonNegotiable.createNon, form).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, response.message, response.data);
						this.addNonForm.reset();
						this.getOnePi();
						//this.getPaymentTerm();
						this.getNonDetails();
						this.nonModal.hide();
					}
				});

				// this.nonService.addNon(form).subscribe((response) => {
				// 	this.toasterService.pop(response.message, response.message, response.data);
				// 	if (response.code === '100') {
				// 		this.addNonForm.reset();
				// 		this.getOnePi();
				// 		//this.getPaymentTerm();
				// 		this.getNonDetails();
				// 		this.nonModal.hide();
				// 	}
				// });

			} else {
				this.toasterService.pop('error', 'error', 'Upload Non-Negotiable Document');
			}

		}

	}

	oncloseModal() {
		this.myModal.hide();
		this.pt_id = '';
		this.addSwiftDetailForm.reset();
		this.getOnePi();
		//this.getPaymentTerm();
		this.getNonDetails();
	}

	// non creation

	createNon() {
		this.nonModal.show();
	}

	//id :this.dbSwiftDetailId,
	onDeletePt(id: number) {

		this.getNotifications('NON_LC_SWIFT_DETAILS_DELETE');
		if (id) {

			console.log(this.payment_term_list, "PaymentLIST");

			console.log(id, "delswiftid");

			this.CrudServices.postRequest<any>(nonLcPi.deleteSwift, {
				swift_id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					setTimeout(() => {
						let data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Non-LC Swift Details Deleted Against ${this.suppierOrgName} of Sales Contract No. : ${this.proform_invoice_no} `,
							"click_action": "#"
						}
						this.generateNotification(data, 1);
					}, 2000);

					this.toasterService.pop(response.message, response.message, response.data);
					this.getOnePi();
					this.getPaymentTerm();
				}
			});

			// this.nonLcService.deleteSwift(id)
			// 	.subscribe(response => {
			// 		this.toasterService.pop(response.message, response.message, response.data);
			// 		this.getOnePi();
			// 		this.getPaymentTerm();
			// 	});
		}
	}


	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}


	onEditNon(id: number) {
		this.getNotifications('NONLC_NON_NEGOTIABLE_UPDATED');
		if (id) {
			this.nonModal.show();
			this.CrudServices.postRequest<any>(nonNegotiable.getOneNon, {
				id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					console.log(response, "OneNON");

					this.shipmentDate = response[0]['date_of_shipment'];
					this.invoiceDate = response[0]['invoice_date'];
					this.receivedDate = response[0]['non_received_date'];
					this.invoiceNo = response[0]['invoice_no'];
					this.invoiceQty = response[0]['totalNonQty'];
					this.remark = response[0]['non_rmk'];
					this.nonid = response[0]['id'];
				}
			});
		}
	}

	onDeleteNon(id: number) {
		this.getNotifications('NONLC_NON_NEGOTIABLE_DELETED');
		if (id) {
			this.CrudServices.postRequest<any>(nonNegotiable.deleteNon, {
				id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {

					setTimeout(() => {
						let NonDetailsNew: any = [];
						NonDetailsNew = this.Non_details.find(item => item.id === id);
						console.log(this.Non_details, "NonDetailsNew");
						let data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Non-LC Non-Negotiable Revised Document Deleted Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
							"click_action": "#"
						}
						this.generateNotification(data, 1);
						this.getNonDetails();
					}, 2000);

					this.toasterService.pop(response.message, response.message, response.data);
					this.getOnePi();
					//this.getPaymentTerm();

				}
			})

		}

	}


	ReviseNon(item) {
		this.getNotifications('NONLC_NON_NEGOTIABLE_REVISED_DOCUMENT_UPDATE');

		this.non_id = item.id;
		this.reviseNonForm.patchValue({
			discrepancy_note: item.discrepancy_note
		})
		this.ReviseNonModal.show();
	}
	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}


	onSubmitReviseCopy() {


		if (!this.reviseNonForm.invalid) {
			// const formData: any = new FormData();
			// formData.append('discrepancy_note', this.reviseNonForm.value.discrepancy_note);
			// formData.append('id', this.non_id);

			let formData: any = {
				discrepancy_note: this.reviseNonForm.value.discrepancy_note,
				id: this.non_id,
			};


			const fileData = new FormData();
			const document: Array<File> = this.revisedoc;
			if (document.length > 0) {
				for (let i = 0; i < document.length; i++) {
					fileData.append('non_revised_copy', document[i], document[i]['name']);
				}

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.non_revised_copy;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						formData['non_revised_copy'] = files;
						this.saveRevisedNonLcNon(formData);
					}
				});
			} else {
				this.CrudServices.postRequest<any>(nonNegotiable.updateReviseNon, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {


						let NonDetailsNew: any = [];
						NonDetailsNew = this.Non_details.find(item => item.id === this.non_id);
						let data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Non-LC Non-Negotiable Revised Document Updated Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
							"click_action": "#"
						}
						this.generateNotification(data, 1);

						this.toasterService.pop(response.message, response.message, response.data);
						this.ReviseNonModal.hide();
						this.reviseNonForm.reset();
						this.getNonDetails();

					}
				})
			}
		}
	}

	saveRevisedNonLcNon(form) {

		this.CrudServices.postRequest<any>(nonNegotiable.updateReviseNon, form).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {

				let NonDetailsNew: any = [];
				NonDetailsNew = this.Non_details.find(item => item.id === this.non_id);
				let data = {
					"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
					"body": `Non-LC Non-Negotiable Revised Document Updated Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
					"click_action": "#"
				}
				this.generateNotification(data, 1);

				this.toasterService.pop(response.message, response.message, response.data);
				this.ReviseNonModal.hide();
				this.reviseNonForm.reset();
				this.getNonDetails();
			}
		});
	}
	update_charge(item) {
		console.log(item, "chargess");
		// this.payment_due_date = item.payment_date;
		// this.payment_non_lc = item.piAmount;
		this.pt_id = item.pt_id

		let formData: any = {
			payment_term_id: this.pt_id,
			pi_id: this.id
		}
		this.CrudServices.postRequest<any>(nonLcPi.getNonLcRollOverPaymentDetails, formData).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.payment_days = response[0]['credit_days'];
				this.confirm_charge = response[0]['confirmation_charges'];
				this.supplier_charge = response[0]['supplier_charges'];
				this.roll_over_status = response[0]['payment_status'];
			}
		});

		// this.nonService.getNonLcRollOverPayment(formData).subscribe((response) => {
		// 	// console.log(response);
		// 	this.payment_days = response[0]['credit_days'];
		// 	this.confirm_charge = response[0]['confirmation_charges'];
		// 	this.supplier_charge = response[0]['supplier_charges'];
		// 	this.roll_over_status = response[0]['payment_status'];
		// });

		this.chargeModal.show();
	}
	updateChargeNew(payment_days, confirm_charge, supplier_charge, roll_over_status) {
		console.log(payment_days, confirm_charge, supplier_charge, roll_over_status, this.pt_id, this.id, "paymentdddd");

		let formData: any = {
			payment_days: payment_days,
			confirm_charge: confirm_charge,
			supplier_charge: supplier_charge,
			roll_over_status: roll_over_status,
			payment_term_id: this.pt_id,
			pi_id: this.id,
		};

		this.CrudServices.postRequest<any>(nonLcPi.UpdatePaymentStatusNonLc, formData).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.payment_days = 0;
				this.getOnePi();
				this.getNonDetails();
				this.chargeModal.hide();
			}

		});

		// this.nonService.updatePaymentStatusNonLc(formData).subscribe((response) => {
		// 	this.toasterService.pop(response.message, response.message, response.data);
		// 	this.payment_days = 0;
		// 	this.getOnePi();
		// 	this.getNonDetails();
		// 	this.chargeModal.hide();
		// });

	}
	updateCharge(no_days) {
		if (this.Non_details.length > 0) {
			const nonId = this.Non_details[0]['id'];
			const formData: any = new FormData();
			formData.append('id', nonId);
			formData.append('payment_status', 2);
			formData.append('no_days', no_days);
			formData.append('nonlc_payment_due_date', this.payment_due_date);
			formData.append('nonlcPayment', this.payment_non_lc);
			if (this.payment_due_date !== '') {
				if (confirm('Are you sure to change Payment Status to Roll Over ')) {

					this.CrudServices.postRequest<any>(nonNegotiable.UpdatePaymentStatus, formData).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							this.toasterService.pop(response.message, response.message, response.data);
							this.payment_days = 0;
							this.getOnePi();
							this.getPaymentTerm();
							this.getNonDetails();
							this.chargeModal.hide();
						}
					});

					// this.nonService.updatePaymentStatus(formData).subscribe((response) => {
					// 	this.toasterService.pop(response.message, response.message, response.data);
					// 	this.payment_days = 0;
					// 	this.getOnePi();
					// 	this.getPaymentTerm();
					// 	this.getNonDetails();
					// 	this.chargeModal.hide();
					// });

				} else {
					this.payment_days = 0;
					this.chargeModal.hide();
				}
			} else {
				this.toasterService.pop('error', 'error', 'Some Fields are remaining');
			}
		} else {
			this.chargeModal.hide();
			this.toasterService.pop('error', 'error', 'Create Non Before Status Update to roll over');
		}

	}

	onResetRollOver() {
		const nonId = this.Non_details[0]['id'];
		if (nonId) {
			if (confirm('Are you sure to Reset the Roll Over Changes ')) {
				this.nonLcService.resetRollOver(nonId)
					.subscribe(response => {
						this.toasterService.pop(response.message, response.message, response.data);
						this.getOnePi();
						this.getPaymentTerm();
						this.getNonDetails();
					});

			}

		}
	}

	onback() {
		this.router.navigate(['forex/flc-pi-list']);
	}



	// delete_revise_non_path(id, path) {

	// 	console.log(id, path, "pathid");

	// 	this.CrudServices.postRequest<any>(nonNegotiable.deleteReviseNonPath, {
	// 		path: path,
	// 		id: id
	// 	}).subscribe((response) => {
	// 		this.toasterService.pop(response.message, response.message, response.data);
	// 		this.getOnePi();
	// 		this.getPaymentTerm();
	// 		this.getNonDetails();

	// 	});

	// };

	delete_revise_non_path(id, n_id) {

		this.getNotifications('NONLC_NON_NEGOTIABLE_REVISED_DOCUMENT_DELETED');

		this.CrudServices.postRequest<any>(nonNegotiable.deleteReviseNonPath, {
			id: id
		}).subscribe((response) => {

			setTimeout(() => {
				let NonDetailsNew: any = [];
				NonDetailsNew = this.Non_details.find(item => item.id === n_id);
				let data = {
					"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
					"body": `Non-LC Non-Negotiable Revised Document Deleted Against  ${this.suppierOrgName} For Non-Negotiable No. : ${NonDetailsNew.invoice_no} `,
					"click_action": "#"
				}
				this.generateNotification(data, 1);
			}, 2000);

			this.toasterService.pop(response.message, response.message, response.data);
			this.getOnePi();
			this.getPaymentTerm();
			this.getNonDetails();

		});

	};

	conformPopUpMethod(pi_id, pi_qty) {
		this.conformPopUp.show();
		this.c_pi_id = pi_id;
		this.c_pi_qty = pi_qty;
	}

	updatePiQtyTolerance(pi_id, pi_qty) {
		// this.popUpConfirmationFlag = confirm('Are you Sure ? Do you want to Adjust Tolereance for  this PI');


		// if (this.popUpConfirmationFlag) {
		console.log('pi_id', pi_id);
		console.log('pi_qty', pi_qty);
		// this.onSubmitNon();
		this.CrudServices.postRequest<any>(LetterofCreditCrud.adjustToleranceAgainstPi, {
			pi_id: pi_id,
			pi_qty: pi_qty
		}).subscribe((response) => {
			this.toasterService.pop(response.data, response.data, response.data);
			//this.getDetails(this.lc_id);
			this.getOnePi();
			this.getPaymentTerm();
			this.getNonDetails();
		});
		this.conformPopUp.hide();

		// }




	}

	updateNon() { }

}
