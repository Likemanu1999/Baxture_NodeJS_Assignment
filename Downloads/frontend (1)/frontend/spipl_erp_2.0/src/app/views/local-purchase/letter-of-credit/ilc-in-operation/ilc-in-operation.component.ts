import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { UserDetails } from '../../../login/UserDetails.model';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { LoginService } from '../../../login/login.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { FileUpload, Ilc_Bex, Ilc_Loc, PaymentTermMaster, SpiplBankMaster, SubOrg } from '../../../../shared/apis-path/apis-path';
import { staticValues } from '../../../../shared/common-service/common-service';

@Component({
	selector: 'app-ilc-in-operation',
	templateUrl: './ilc-in-operation.component.html',
	styleUrls: ['./ilc-in-operation.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		DatePipe,
		ToasterService,
		CrudServices
	]
})
export class IlcInOperationComponent implements OnInit {
	@ViewChild('openILcModal', { static: false }) public openILcModal: ModalDirective;
	@ViewChild('ammendModal', { static: false }) public ammendModal: ModalDirective;
	@ViewChild('boamodal', { static: false }) public boamodal: ModalDirective;
	serverUrl: string;
	user: UserDetails;
	links: any;
	modeLc: string = 'Edit';
	bexIndex: number;
	modeBex: string;
	ilcUpdate: boolean = false;
	ilcdoc: Array<File> = [];
	ammenddoc: Array<File> = [];
	acceptancedoc: Array<File> = [];
	ilc_list = [];
	lcDetail = [];

	// links permission
	edit_opt: boolean = false;
	del_opt: boolean = false;
	createboe: boolean;
	ilc_reset: boolean;
	ilc_open: boolean;
	ilc_discard: boolean;
	ilc_ammend: boolean;
	ilc_doc_download: boolean;
	create_ilc_boe: boolean;

	// filter array
	spipl_bank = [];
	sub_org = [];
	bsRangeValue: any = [];
	bsRangeValue2: any = [];
	currentYear: number;
	currdate = new Date();


	// filter variables
	supplier = 0;
	bank = 0;
	fromCreatedDate: string;
	toCreatedDate: string;
	fromOpeningDate: string;
	toOpeningDate: string;


	public filterQuery = '';
	filterArray = [];
	bex_details: any[];
	pi_details: any[];
	selected: number;

	IlcDate: string;
	SupplierName: string;
	IlcAmount: number;
	SupplierAddress: string;
	PaymentTerms: string;
	LatestDateOfShipment: string;
	ExpiryDate: string;
	ilc_opening_date: string;
	ilc_bank_no: string;
	ilc_ammend_copy: any[];
	ilc_ammend_dt: string;
	ilc_ammend_remark: string;
	lcQuantity: number;
	ilc_copy: any[];
	ilc_id: number;
	bexAmount: number = 0;
	currIndex: number;
	mainDetail: boolean = false;
	isCollapsed: boolean = false;
	docDownload: boolean = false;
	amt_credited_flag: boolean = false;

	spipl_bank_name: string;

	bex_id: number;
	conf_issue_dt: string;
	discount_date: string;
	margin_money: string;
	discount_rate: string;
	amt_credit_supplier: string;
	bex_amount: number;
	tolerance: any;
	advance_tolerance_amt: any;
	short_tolerance_amt: any;

	bex_deals: any = [];
	discountingArr: any = [];

	addOpenILcForm: FormGroup;
	addIlcAmendForm: FormGroup;
	billOfAcceptanceForm: FormGroup;

	datePickerConfig = staticValues.datePickerConfig;
	amendmentFlag = 0;
	amend_value: boolean = false;
	amend_days: boolean = false;
	amend_clause: boolean = false;

	paymentTermListAmmend: any = [];
	filterList = [{ id: 0, name: 'All' }, { id: 1, name: 'LC Open But BE Not Created ' }, { id: 2, name: 'BE Created but lc not yet discounted' }, { id: 3, name: 'LC Discounted' }]

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	date = new Date();
	company_id: number;
	role_id: number;
	isLoading: boolean;
	original_list_ilc: any = [];
	selectedFilter: any;

	constructor(
		private permissionService: PermissionService,
		private loginService: LoginService,
		private datepipe: DatePipe,
		private toasterService: ToasterService,
		private crudServices: CrudServices

	) {

		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();

		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.ilc_reset = (this.links.indexOf('Ilc Reset') > -1);
		this.ilc_open = (this.links.indexOf('Ilc Open') > -1);
		this.ilc_discard = (this.links.indexOf('Ilc Discard') > -1);
		this.ilc_ammend = (this.links.indexOf('Ilc Ammend') > -1);
		this.ilc_doc_download = (this.links.indexOf('Ilc Document Download') > -1);
		this.create_ilc_boe = (this.links.indexOf('Ilc Create Bill Of Exchange') > -1);

		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;


		this.addOpenILcForm = new FormGroup({
			'ilc_opening_date': new FormControl(null, Validators.required),
			'ilc_bank_no': new FormControl(null, Validators.required),
			'ilc_copy': new FormControl(null)
		});

		this.serverUrl = environment.serverUrl;
		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {

			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		} else {

			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}
		//this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		this.bsRangeValue2 = [];

		this.addIlcAmendForm = new FormGroup({
			'amendment_date': new FormControl(null, Validators.required),
			'ilc_amend_copy': new FormControl(null),
			'amendment_flag': new FormControl(false, Validators.requiredTrue),
			'amendment_amount': new FormControl(null),
			'shipment_date': new FormControl(null),
			'expiry_date': new FormControl(null),
			'payment_term': new FormControl(null),
			'remark': new FormControl(null)
		});

		this.billOfAcceptanceForm = new FormGroup({
			'conf_issue_dt': new FormControl(null, Validators.required),
			'discount_date': new FormControl(null),
			'margin_money': new FormControl(null),
			'discount_rate': new FormControl(null),
			'bex_accept_copy': new FormControl(null),
		});

		this.crudServices.getAll<any>(SubOrg.get_all_supplier).subscribe((response) => {
			this.sub_org = response;

		});

		this.crudServices.getAll<any>(PaymentTermMaster.getAll).subscribe((response) => {
			this.paymentTermListAmmend = response;
		});

		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe((response) => {
			this.spipl_bank = response;
		});

	}

	ngOnInit() {
		// 
	}

	onSubmit($e, variable, id, state) {
		this.ilc_list = [];
		this.mainDetail = false;

		if (state === 0 && $e !== undefined) {
			if (id) {
				this[variable] = $e[id];
			}
		}

		if (state === 0 && $e === undefined) {
			this[variable] = 0;
		}

		if (state === 1 && $e !== null) {
			this.fromCreatedDate = this.convert($e[0]);
			this.toCreatedDate = this.convert($e[1]);
		}
		if (state === 2 && $e !== null) {
			this.fromOpeningDate = this.convert($e[0]);
			this.toOpeningDate = this.convert($e[1]);
		}

		if (state === 1 && $e === null) {
			this.fromCreatedDate = '';
			this.toCreatedDate = '';
		}

		if (state === 2 && $e === null) {
			this.fromOpeningDate = '';
			this.toOpeningDate = '';
		}
		this.getILcList();
	}

	convert(date) {
		return this.datepipe.transform(date, 'yyyy-MM-dd');
	}

	getILcList() {
		this.lcDetail = [];
		this.mainDetail = false;
		this.selected = 0;
		this.IlcDate = '';
		this.SupplierName = '';
		this.IlcAmount = 0;
		this.lcQuantity = 0;
		this.SupplierAddress = '';
		this.PaymentTerms = '';
		this.LatestDateOfShipment = '';
		this.ExpiryDate = '';
		this.ilc_opening_date = '';
		this.ilc_bank_no = '';
		this.ilc_id = 0;
		this.ilc_ammend_copy = [];
		this.ilc_ammend_dt = '';
		this.ilc_ammend_remark = '';
		this.ilc_copy = [];
		this.spipl_bank_name = '';
		this.bexAmount = 0;

		this.isLoading = true

		this.crudServices.getOne<any>(Ilc_Loc.getAll, {
			lc_date_from: this.fromCreatedDate,
			lc_date_to: this.toCreatedDate,
			lc_opening_dt_from: this.fromOpeningDate,
			lc_opening_dt_to: this.toOpeningDate,
			spipl_bank_id: this.bank,
			company_id: this.role_id == 1 ? null : this.company_id

		}).subscribe(response => {
			console.log(response);

			this.ilc_list = response;
			this.original_list_ilc = response
			this.getFilterData()
			this.isLoading = false
			if (this.currIndex !== undefined) {
				this.getDetails(this.ilc_list[this.currIndex]);
			}

			// this.getDetails(response[0]);
		});



	}

	getFilterData() {
    console.log(this.selectedFilter);
	
		if (this.selectedFilter != null && this.selectedFilter != undefined) {
			this.mainDetail = false
			this.selected = 0
			this.ilc_list = this.original_list_ilc
			if (this.selectedFilter == 1) {
				this.ilc_list = this.ilc_list.filter(item => item.ilc_bank_no != null && item.bex_details.length == 0);

			}

			if (this.selectedFilter == 2) {
				let data = this.ilc_list.filter(item => item.bex_details.length != 0);
				let filterData = [];
				for (let item of data) {
					let status = 1
					for (let bex of item.bex_details) {
						

						if (bex.bex_deals && bex.bex_deals.length != 0) {
							let amount = bex.bex_deals.reduce((prv, next) => prv + Number(next.credited_amount), 0)
							console.log(amount);

							if (amount != 0) {
								status = 1
							} else {
								status = 0
								break;
							}
						} else {
							status = 0;
							break;
						}

					}
				

					if (status == 0) {
						filterData.push(item)
					}
				}
				this.ilc_list = filterData


			}

			if (this.selectedFilter == 3) {
				let data = this.ilc_list.filter(item => item.bex_details.length != 0);
				let filterData = [];
				for (let item of data) {
					let status = 1
					for (let bex of item.bex_details) {
						if (bex.bex_deals && bex.bex_deals.length != 0) {
						

							let amount = bex.bex_deals.reduce((prv, next) => prv + Number(next.credited_amount), 0)
							if (amount != 0) {
								status = 1
							} else {
								status = 0
								break;
							}


						} else {
							status = 0
							break;
						}
					}
					if (status) {
						filterData.push(item)
					}
				}
				this.ilc_list = filterData


			}
		}


	}

	isActive(item) {
		return this.selected === item;
	}

	setAmendFlag(item) {
		if (item.target.value == 1) {
			this.amend_value = item.target.checked;
			this.amend_clause = false;
		} else if (item.target.value == 2) {
			this.amend_days = item.target.checked;
			this.amend_clause = false;
		} else if (item.target.value == 3) {
			this.amend_value = false;
			this.amend_days = false;
			this.amend_clause = item.target.checked;
		}

		if (this.amend_value && !this.amend_days) {
			this.amendmentFlag = 1;
		} else if (this.amend_days && !this.amend_value) {
			this.amendmentFlag = 2;
		} else if (this.amend_days && this.amend_value) {
			this.amendmentFlag = 4;
		} else {
			this.amendmentFlag = 3;
		}
	}

	getDetails(item) {
		if (item.id) {
			this.lcDetail = [];
			this.ilc_ammend_copy = [];
			this.ilc_copy = [];
			this.mainDetail = true;
			this.selected = item['id'];
			this.IlcDate = item['ilc_date'];
			this.SupplierName = item['Supplier_Name'];
			this.IlcAmount = item['lcAmount'];
			this.lcQuantity = item['lcQuantity'];
			this.SupplierAddress = item['Supplier_Address'];
			this.PaymentTerms = item['paymentterm'];
			this.LatestDateOfShipment = item['latest_date_of_shipment'];
			this.ExpiryDate = item['ilc_expiry_date'];
			this.ilc_opening_date = item['ilc_opening_date'];
			this.ilc_bank_no = item['ilc_bank_no'];
			this.ilc_id = item['id'];
			this.tolerance = item['tolerance'];
			this.currIndex = this.ilc_list.indexOf(item);
			if (item['ilc_ammend_copy'] !== '') {
				this.ilc_ammend_copy = JSON.parse(item['ilc_ammend_copy']);
			}
			this.ilc_ammend_dt = item['ilc_ammend_dt'];
			this.ilc_ammend_remark = item['ilc_ammend_remark'];
			if (item['ilc_copy']) {
				this.ilc_copy = JSON.parse(item['ilc_copy']);
			}
			this.spipl_bank_name = item['spipl_bank_name'];
			this.lcDetail.push(item);
			this.pi_details = item['pi_details'];
			this.bex_details = item['bex_details'];
			this.advance_tolerance_amt = item['advance_tolerance_amt'];
			this.short_tolerance_amt = item['short_tolerance_amt'];
		}
	}

	advanceShortIlc() {
		if (confirm('Are you Sure ? Do you want to Advance or short This ILc ')) {
			if (this.bex_details.length > 0) {

				let sum = 0;
				sum = this.bex_details.reduce((add, item) => add + item.bex_amount, 0);

				const diff = this.IlcAmount - sum;


				if (diff > 0) {
					this.crudServices.updateData<any>(Ilc_Loc.updateAdvanceShort, {
						ilc_id: this.ilc_id,
						short_tolerance_amt: diff

					}).subscribe(response => {
						if (response.code == 100) {
							this.toasterService.pop(response.message, response.message, response.data);
							this.getILcList();
						} else {
							this.toasterService.pop('error', 'error', 'Something Went Wrong');
						}
					})

				} else if (diff < 0) {
					this.crudServices.updateData<any>(Ilc_Loc.updateAdvanceShort, {
						ilc_id: this.ilc_id,
						advance_tolerance_amt: sum - this.IlcAmount

					}).subscribe(response => {
						if (response.code == 100) {
							this.toasterService.pop(response.message, response.message, response.data);
							this.getILcList();
						} else {
							this.toasterService.pop('error', 'error', 'Something Went Wrong');
						}
					})
				}

			}
		}





	}


	advanceShortIlcDiscard() {
		if (confirm('Are you Sure ? Do you want to Advance or short This ILc ')) {
			this.crudServices.updateData<any>(Ilc_Loc.discardAdvanceShort, {
				ilc_id: this.ilc_id,

			}).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getILcList();
				} else {
					this.toasterService.pop('error', 'error', 'Something Went Wrong');
				}
			})
		}

	}


	openIlcModal() {

		this.openILcModal.show();
	}

	openAmmendModal() {
		this.ammendModal.show();
	}




	onEdit() {
		this.ilcUpdate = true;

	}


	addOpenILcCopy(event: any) {
		this.ilcdoc = <Array<File>>event.target.files;
	}


	addAmmendCopy(event: any) {
		this.ammenddoc = <Array<File>>event.target.files;
	}


	addAcceptanceCopy(event: any) {
		this.acceptancedoc = <Array<File>>event.target.files;
	}




	discardIlc() {
		if (confirm('Are you Sure ? Do you want to Discard This ILc ')) {
			this.crudServices.updateData<any>(Ilc_Loc.ilcDiscard, { ilc_id: this.ilc_id })
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.ilc_opening_date = '';
					this.ilc_bank_no = '';
					this.ilc_copy = [];
					this.ilc_ammend_dt = '';
					this.getILcList();
				});
		}
	}

	onSubmitOpenILcForm() {
		var data = {
			ilc_bank_no: this.addOpenILcForm.value.ilc_bank_no,
			ilc_opening_date: this.convert(this.addOpenILcForm.value.ilc_opening_date),
			ilc_id: this.ilc_id
		}


		let fileData: any = new FormData();
		const document: Array<File> = this.ilcdoc;

		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('local_purchase_ilc_open', document[i], document[i]['name']);

			}

		}


		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
			let fileDealDocs = [];
			let filesList = res.uploads.local_purchase_ilc_open;

			if (res.uploads.local_purchase_ilc_open) {
				for (let i = 0; i < filesList.length; i++) {
					fileDealDocs.push(filesList[i].location);
				}
				data['ilc_copy'] = JSON.stringify(fileDealDocs);
			}

			this.crudServices.updateData<any>(Ilc_Loc.ilcOpen, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				this.openILcModal.hide();
				this.getILcList();
			});

		})

	}


	onSubmitAmendForm() {
		let body = {
			data: {
				ilc_ammend_dt: this.addIlcAmendForm.value.amendment_date,
				ilc_ammend_copy: this.addIlcAmendForm.value.ilc_amend_copy,
				ilc_ammend_flag: this.amendmentFlag,
				ilc_ammend_remark: this.addIlcAmendForm.value.remark
			},
			ilc_id: this.ilc_id
		};

		if (this.amendmentFlag == 1) {
			body.data["ilc_ammend_amount"] = this.addIlcAmendForm.value.amendment_amount;
		} else if (this.amendmentFlag == 2) {
			body.data["ilc_ammend_ship_date"] = this.addIlcAmendForm.value.shipment_date;
			body.data["ilc_ammend_expiry_date"] = this.addIlcAmendForm.value.expiry_date;
			body.data["ilc_ammend_pay_term"] = this.addIlcAmendForm.value.payment_term;
		} else if (this.amendmentFlag == 4) {
			body.data["ilc_ammend_amount"] = this.addIlcAmendForm.value.amendment_amount;
			body.data["ilc_ammend_ship_date"] = this.addIlcAmendForm.value.shipment_date;
			body.data["ilc_ammend_expiry_date"] = this.addIlcAmendForm.value.expiry_date;
			body.data["ilc_ammend_pay_term"] = this.addIlcAmendForm.value.payment_term;
		}

		let fileData: any = new FormData();
		const document: Array<File> = this.ammenddoc;
		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('local_purchase_ilc_ammend', document[i], document[i]['name']);
			}
			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let fileDealDocs = [];
				let filesList = res.uploads.local_purchase_ilc_ammend;
				if (res.uploads.local_purchase_ilc_ammend) {
					for (let i = 0; i < filesList.length; i++) {
						fileDealDocs.push(filesList[i].location);
					}
					body.data['ilc_ammend_copy'] = JSON.stringify(fileDealDocs);
				}
				this.saveData(body);
			});
		} else {
			this.saveData(body);
		}
	}

	saveData(body) {
		this.crudServices.updateData<any>(Ilc_Loc.ilcAmmend, body).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.ammendModal.hide();
			this.getILcList();
		});
	}

	onDeleteBex(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(Ilc_Bex.delete, { id: id }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getILcList();
			});
		}
	}

	getStatusBex(status) {
		if (status === 0) {
			return '<span class="badge badge-danger">Pending</span>';
		} else if (status === 1) {
			return '<span class="badge badge-success">Remit</span>';
		}
	}


	onEditBex(index) {
		this.modeBex = 'Edit';
		this.bexIndex = index;
		this.createboe = true;
	}

	updateBOA(item) {
		if (item.id) {
			this.boamodal.show();
			this.discountingArr = [];
			this.bex_id = item.id;
			this.conf_issue_dt = item.conf_issue_dt;
			this.discount_date = item.discount_date;
			this.margin_money = item.margin_money;
			this.discount_rate = item.discount_rate;
			this.amt_credit_supplier = item.amt_credit_supplier;
			this.bex_amount = item.bex_amount;
			this.bex_deals = item.bex_deals;
		}
	}

	amtCreditedArr(event, item, index) {
		if (event.target.value) {
			if (event.target.value <= item.amount) {
				this.bex_deals[index].credited_amount = event.target.value;
			} else {
				event.target.value = 0;
			}
		}
	}

	amountCreditedValidation(event) {
		this.amt_credited_flag = false;
		if (event.target.value > this.bex_amount) {
			this.amt_credited_flag = true;
			this.amt_credit_supplier = null;
		}
	}

	onSubmitBexAcceptanceForm() {

		var data = {
			conf_issue_dt: this.convert(this.billOfAcceptanceForm.value.conf_issue_dt),
			discount_date: this.convert(this.billOfAcceptanceForm.value.discount_date),
			margin_money: this.billOfAcceptanceForm.value.margin_money,
			discount_rate: this.billOfAcceptanceForm.value.discount_rate,
			amt_credit_supplier: this.billOfAcceptanceForm.value.amt_credit_supplier,
			id: this.bex_id
		}
		const fileData: any = new FormData();
		const document: Array<File> = this.acceptancedoc;
		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('local_purchase_bex_acceptance', document[i], document[i]['name']);
			}
		}

		let dicountArr = [];

		this.bex_deals.forEach(element => {
			if (element.credited_amount) {
				dicountArr.push({
					pi_id: element.pi_id,
					bex_id: element.bex_id,
					deal_id: element.deal_id,
					credited_amount: element.credited_amount
				})
			} else {
				dicountArr.push({
					pi_id: element.pi_id,
					bex_id: element.bex_id,
					deal_id: element.deal_id,
					credited_amount: 0
				})
			}
		});


		if (dicountArr.length > 0) {
			data['dicountArr'] = dicountArr;
			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let fileDealDocs = [];
				let filesList = res.uploads.local_purchase_bex;

				if (res.uploads.local_purchase_bex) {
					for (let i = 0; i < filesList.length; i++) {
						fileDealDocs.push(filesList[i].location);
					}
					data['bex_accept_copy'] = JSON.stringify(fileDealDocs);
				}


				this.crudServices.addData<any>(Ilc_Bex.addbexAcceptance, data).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.boamodal.hide();
					this.getILcList();
				});

			})
		} else {
			this.toasterService.pop('warning', 'warning', 'Enter Amount');
		}

	}

	onDeleteIlc() {
		if (confirm('Are you Sure ? Do you want to Delete This ILc ')) {
			this.crudServices.updateData<any>(Ilc_Loc.delete, { ilc_id: this.ilc_id })
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getILcList();
				});
		}
	}


	BackFromLc(event) {
		this.ilcUpdate = event;
	}

	BackFromBex(event) {
		this.createboe = event;
		this.getILcList();
	}

	doc_download() {
		this.docDownload = true;
	}

	create_bill_ofExchage() {
		this.modeBex = 'Add';
		this.createboe = true;
	}


	collapsed(event: any): void {
		// console.log(event);
	}

	expanded(event: any): void {
		// console.log(event);
	}





}
