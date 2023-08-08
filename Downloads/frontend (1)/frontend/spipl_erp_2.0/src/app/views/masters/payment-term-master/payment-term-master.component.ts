import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PaymentTermMaster } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-payment-term-master',
	templateUrl: './payment-term-master.component.html',
	styleUrls: ['./payment-term-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [ToasterService, PermissionService, CrudServices],
})
export class PaymentTermMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	paymentTermForm: FormGroup;
	updatePaymentTermForm: FormGroup;
	submitted = false;
	updated = false;
	within = false;
	baseline = false;
	usanceatsight = false;
	percent: boolean = false;
	pay_days: boolean = false;
	nonlc_balance: boolean = false;


	update_cont_type: string;
	error: any;
	public data: any = [];
	public filterQuery = '';
	filterArray = [];
	isLoading = false;
	private toasterService: ToasterService;
	pt_id: number;
	subscription: Subscription;
	subscriptionConfirm: Subscription;
	count = 0;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	advance_credit_payment = [];
	on_within = [];
	baseline_date = [];
	balance_payterm = [];
	usance_sight = [];
	pay_type = [];
	payType: any;
	advcrd: number;
	per: any;
	base: any;
	with: any;
	payday: any;
	balancepay: any;
	usance: any;




	constructor(

		toasterService: ToasterService,
		private permissionService: PermissionService,
		private crudServices: CrudServices
	) {

		this.toasterService = toasterService;
		this.initForm();
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.getPaymentTerm();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	ngOnInit(): void {
	}

	initForm() {


		this.advance_credit_payment = [{ 'value': 1, 'label': 'Credit' }, { 'value': 2, 'label': 'Advance' }, { 'value': 3, 'label': 'Balance' }, { 'value': 4, 'label': 'LC' }];
		this.on_within = [{ 'value': 1, 'label': 'On' }, { 'value': 2, 'label': 'Within' }, { 'value': 3, 'label': 'After' }];
		this.baseline_date = [{ 'value': 'Bill of lading Date', 'label': 'Bill of lading Date' }, { 'value': 'Bill of Exchange Date ', 'label': 'Bill of Exchange Date ' }, { 'value': 'shipment Date ', 'label': 'shipment Date ' }, { 'value': 'Deal Date ', 'label': 'Deal Date ' }, { 'value': 'Invoice Date ', 'label': 'Invoice Date ' }];
		this.balance_payterm = [{ 'value': 'Document Acceptance', 'label': 'Document Acceptance' }, { 'value': 'Material Shipment', 'label': 'Material Shipment' }, { 'value': 'Material Received', 'label': 'Material Received' }];
		this.usance_sight = [{ 'value': 'TT', 'label': 'TT' }, { 'value': 'Usance', 'label': 'Usance' }, { 'value': 'at sight', 'label': 'at sight' }];
		this.pay_type = [{ 'value': 1, 'label': 'LC Payment Term' }, { 'value': 2, 'label': 'Non-LC Payment Term' },
		{ 'value': 3, 'label': 'Local Purchase' }, { 'value': 4, 'label': 'Sales Payment Term' }];

		this.paymentTermForm = new FormGroup({
			'pay_val': new FormControl(null),
			'pay_type': new FormControl(null, Validators.required),
			'pay_percentage': new FormControl(null),
			'balance_payterm': new FormControl(null),
			'usance_sight': new FormControl(null),
			'baseline_date': new FormControl(null),
			'on_within': new FormControl(null),
			'advance_credit_payment': new FormControl(null, Validators.required)
		});

		this.updatePaymentTermForm = new FormGroup({
			'update_pay_val': new FormControl(null),
			'update_pay_type': new FormControl(null, Validators.required),
			'update_pay_percentage': new FormControl(null),
			'update_nonlc_balance': new FormControl(null),
			'update_usance_sight': new FormControl(null),
			'update_baseline_date': new FormControl(null),
			'update_on_within': new FormControl(null),
			'update_advance_credit_payment': new FormControl(null, Validators.required)
		});
	}
	getPaymentTerm() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(PaymentTermMaster.getAll)
			.subscribe(
				(data) => {
					this.isLoading = false;
					this.data = data;
				}
			);
	}

	// convenience getter for easy access to form fields
	get f() { return this.paymentTermForm.controls; }
	get g() { return this.updatePaymentTermForm.controls; }

	onReset() {
		this.submitted = false;
		this.baseline = false;
		this.within = false;
		this.percent = false;
		this.paymentTermForm.reset();
	}

	getPaymentType(pay_type: number) {
		if (pay_type === 1) {
			return 'LC Payment Term';
		} else if (pay_type === 2) {
			return 'NoN LC Payment Term';
		} else if (pay_type === 3) {
			return 'Local Purchase';
		}
		else if (pay_type === 4) {
			return 'Sales Payment Term';
		}
	}


	onSubmit() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.paymentTermForm.invalid) {
			return;
		}
		this.crudServices.addData<any>(PaymentTermMaster.add, {
			credit_days: this.paymentTermForm.value.pay_val,
			pay_type: this.paymentTermForm.value.pay_type,
			within_on: this.paymentTermForm.value.on_within,
			baseline_date: this.paymentTermForm.value.baseline_date,
			percentage: this.paymentTermForm.value.pay_percentage,
			balance_payterm: this.paymentTermForm.value.balance_payterm,
			usance_sight: this.paymentTermForm.value.usance_sight,
			advance_credit_payment: this.paymentTermForm.value.advance_credit_payment
		}).subscribe((response) => {
			this.onReset();
			this.getPaymentTerm();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

	onEdit(pt_id: number) {

		if (pt_id != null) {
			this.per = '';
			this.base = '';
			this.with = '';
			this.payday = '';
			this.balancepay = '';
			this.usance = '';
			this.advcrd = 0;

			this.pt_id = pt_id;
			let pay_val;
			let pay_type;
			let within;
			let percent;
			let baseline;
			let nonlc_balance;
			let usanceatsight;

			this.baseline = false;
			this.within = false;
			this.percent = false;
			this.nonlc_balance = false;
			this.usanceatsight = false;

			this.crudServices.getOne<any>(PaymentTermMaster.getOne, {
				pt_id: pt_id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					pt_id = response['pt_id'];
					pay_val = response[0]['pay_val'];
					pay_type = response[0]['pay_type'];
					within = response[0]['on_within'];
					nonlc_balance = response[0]['balance_payterm'];
					usanceatsight = response[0]['usance_sight'];
					baseline = response[0]['baseline_date'];
					percent = response[0]['pay_percentage'];
					// this.updatePaymentTermForm.controls.pay_type.setValue(2);

					this.per = percent;
					this.base = baseline;
					this.with = within;
					this.payday = pay_val;
					this.balancepay = nonlc_balance;
					this.usance = usanceatsight;

					this.payType = pay_type;


					//pay_val !== 0 ||
					if (usanceatsight != null) { //Credit
						if (usanceatsight == 'at sight') {
							this.usanceatsight = true;
						} else if (usanceatsight == 'Usance' || usanceatsight == 'TT') {
							this.usanceatsight = true;
							this.baseline = true;
							this.within = true;
							this.pay_days = true;
						}
						this.advcrd = 1;
					} else if (usanceatsight == null && pay_val != 0) {
						this.baseline = true;
						this.within = true;
						this.pay_days = true;
						this.advcrd = 1;
					}
					else if (pay_val === 0) { //percentage
						if (nonlc_balance.length) {
							this.within = true;
							this.percent = true;
							this.nonlc_balance = true;
							this.pay_days = false;
							this.advcrd = 3;
						} else {
							this.within = false;
							this.nonlc_balance = false;
							this.percent = true;
							this.pay_days = false;
							this.advcrd = 2;
						}
					} else {
						this.baseline = false;
						this.within = false;
						this.percent = false;
						this.pay_days = false;
						this.nonlc_balance = false;
						this.usanceatsight = false;
					}
				}

			}, errorMessage => {
				this.error = errorMessage.message;
			});
			this.myModal.show();
		}
	}


	onUpdate() {
		this.updated = true;
		if (this.updatePaymentTermForm.invalid) {
			return;
		}
		if (this.updatePaymentTermForm.dirty) {
			this.crudServices.updateData<any>(PaymentTermMaster.update, {
				pt_id: this.pt_id,
				credit_days: this.updatePaymentTermForm.value.update_pay_val,
				pay_type: this.updatePaymentTermForm.value.update_pay_type,
				within_on: this.updatePaymentTermForm.value.update_on_within,
				baseline_date: this.updatePaymentTermForm.value.update_baseline_date,
				percentage: this.updatePaymentTermForm.value.update_pay_percentage,
				advance_credit_payment: this.updatePaymentTermForm.value.update_advance_credit_payment,
				balance_payterm: this.updatePaymentTermForm.value.update_nonlc_balance,
				usance_sight: this.updatePaymentTermForm.value.update_usance_sight,

			}).subscribe((response) => {
				this.getPaymentTerm();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}


	onDelete(pt_id: number) {
		if (pt_id) {
			this.crudServices.deleteData<any>(PaymentTermMaster.delete, {
				pt_id: pt_id
			}).subscribe((response) => {
				this.getPaymentTerm();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	adv_credit(event) {
		this.baseline = false;
		this.within = false;
		this.percent = false;
		this.pay_days = false;
		this.nonlc_balance = false;
		this.usanceatsight = false;
		if (event) {
			if (event['value'] === 1) {
				this.baseline = true;
				this.within = true;
				this.pay_days = true;
				this.usanceatsight = true;
			} else if (event['value'] === 2) {
				this.percent = true;
			} else if (event['value'] === 3) {
				this.nonlc_balance = true;
				this.percent = true;
			} else if (event['value'] === 4) {
				this.pay_days = true;
				this.baseline = true;
				this.paymentTermForm.patchValue({
					advance_credit_payment: 1,
					balance_payterm: null,
					baseline_date: null,
					on_within: 0,
					pay_percentage: 0,
					usance_sight: null
				});
			} else {
				this.baseline = false;
				this.within = false;
				this.percent = false;
				this.pay_days = false;
				this.nonlc_balance = false;
				this.usanceatsight = false;
			}
		}
	}

	usance_sight_change(event) {
		if (event) {
			{
				if (event['value'] === 'Usance' || event['value'] === 'TT') {
					this.baseline = true;
					this.within = true;
					this.pay_days = true;
				} else if (event['value'] === 'at sight') {
					this.baseline = false;
					this.within = false;
					this.pay_days = false;
				}

			}

		}
	}

}
