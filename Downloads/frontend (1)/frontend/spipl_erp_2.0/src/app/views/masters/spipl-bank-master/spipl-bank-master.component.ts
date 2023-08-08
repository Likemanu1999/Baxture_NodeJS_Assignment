
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';

@Component({
	selector: 'app-spipl-bank-master',
	templateUrl: './spipl-bank-master.component.html',
	styleUrls: ['./spipl-bank-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		LoginService
	],
})
export class SpiplBankMasterComponent implements OnInit {
	public filterQuery = '';
	filterArray = ['bank_name', 'bank_phone', 'gst_no', 'bank_address', 'account_no', 'ifsc_code'];
	isLoading = false;
	count = 0;
	serverUrl: string;
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
	add_new_click: boolean = false;
	user: UserDetails;
	links: string[] = [];
	spiplBankForm: FormGroup;
	data: any = [];
	mode = 'Add';
	bank_type: { id: number; type: string; }[];

	ckeConfig: any;
	mycontent: string;

	@ViewChild('myEditor', { static: false }) myEditor: any;
	keys: string;
	ilc_keys: string;
	lc_template: boolean;
	ilc_template: string;
	fd_creation_keys: string;
	fd_renew_keys: string;
	fd_liquidation_keys: string;


	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private crudServices: CrudServices,
	) {
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.lc_template = (this.links.indexOf('lc template') > -1);

		this.bank_type = [{ id: 1, type: 'Our Bank' }, { id: 2, type: 'Advising Bank' }, { id: 3, type: 'Negotiable Bank' }, { id: 4, type: 'Funding Bank' }];
		this.spiplBankForm = new FormGroup({

			'bank_name': new FormControl(null, Validators.required),
			'bank_address': new FormControl(null, Validators.required),
			'account_no': new FormControl(null),
			'swiftcode': new FormControl(null),
			'bank_phone': new FormControl(null),
			'bank_email': new FormControl(null),
			'ifsc_code': new FormControl(null),
			'credit_limit': new FormControl(null),
			'ad_code': new FormControl(null),
			'short_form': new FormControl(null),
			'gst_no': new FormControl(null),
			'branch_code': new FormControl(null),
			'id': new FormControl(null),
			'lc_template': new FormControl(null),
			'ilc_template': new FormControl(null),
			'fd_creation_template': new FormControl(null),
			'fd_liquidation_template': new FormControl(null),
			'fd_renew_template': new FormControl(null),
			'bank_type': new FormControl(null, Validators.required),

		});
		this.ckeConfig = {
			'editable': true, 'spellcheck': true, 'height': '400px', // you can also set height 'minHeight': '100px',
		};
		this.getSpiplBank();
	}

	ngOnInit() {
		this.keys = '{adv_bank_swift_code} ,{availableBank}, {bankAccountNo} , {billOfLanding} , {buyerBankAddress} , {buyerBankName} , {buyerBankSwiftCode} , {buyerGst} , {buyerOrgAddress} , {buyerOrgName} , {buyerPan} , {buyeriec} , {confirmation} , {currency} , {dateOfExpiry} , {dateOfShipment} , {decriptionOfItems} , {descriptionOfItems2} , {firstAdvBank} , {firstAdvBankAddress} , {gradeName} , {invoiceDate} , {itemsWithGst} , {material_load_port} , {partialShipment} , {paymentTerm} , {piInsuranceType} , {portOfDischarge} , {portOfShipment} , {productCategory} , {spipl_bank_id} , {suppierOrgAddress} , {suppierOrgName} , {supplier_id} , {tolarance} , {totalAmount} , {transhipment} ';

		this.ilc_keys = '{IlcDate},{IlcAmount},{ExpiryDate},{SupplierName},{SupplierAddress},{PaymentTerms},{LatestDateOfShipment},{AdvisingBankName},{AdvisingBankAddress},{NegotiatingBankName},{NegotiatingBankAddress},{PIDetails},{PlaceOfLoading},{PlaceOfDestination},{Transhipment},{PartialShipment}';
		this.fd_creation_keys = '{fd_make_dt},{fd_details}',
			this.fd_renew_keys = '{fd_renew_dt},{fd_details}';
		this.fd_liquidation_keys = '{fd_release_dt},{fd_details}';
	}


	onEdit(id: number) {
		this.mode = 'Edit';
		if (id) {
			this.add_new_click = true;
			let bank_name = '';
			let bank_address = '';
			let account_no = '';
			let swiftcode = '';
			let bank_phone = '';
			let bank_email = '';
			let ifsc_code = '';
			let credit_limit = '';
			let ad_code = '';
			let short_form = '';
			let gst_no = '';
			let branch_code = '';
			let bank_type: number;


			this.crudServices.getOne<any>(SpiplBankMaster.getOne, {
				id: id
			}).subscribe((response) => {
				bank_name = response[0]['bank_name'];
				bank_address = response[0]['bank_address'];
				account_no = response[0]['account_no'];
				bank_phone = response[0]['bank_phone'];
				swiftcode = response[0]['swiftcode'];
				bank_email = response[0]['bank_email'];
				ifsc_code = response[0]['ifsc_code'];
				credit_limit = response[0]['credit_limit'];
				ad_code = response[0]['ad_code'];
				short_form = response[0]['short_form'];
				gst_no = response[0]['gst_no'];
				branch_code = response[0]['branch_code'];
				bank_email = response[0]['bank_email'];
				bank_type = response[0]['bank_type'];

				this.spiplBankForm.controls['bank_name'].setValue(bank_name);
				this.spiplBankForm.controls['bank_address'].setValue(bank_address);
				this.spiplBankForm.controls['account_no'].setValue(account_no);
				this.spiplBankForm.controls['bank_phone'].setValue(bank_phone);
				this.spiplBankForm.controls['swiftcode'].setValue(swiftcode);
				this.spiplBankForm.controls['ifsc_code'].setValue(ifsc_code);
				this.spiplBankForm.controls['credit_limit'].setValue(credit_limit);
				this.spiplBankForm.controls['ad_code'].setValue(ad_code);
				this.spiplBankForm.controls['short_form'].setValue(short_form);
				this.spiplBankForm.controls['gst_no'].setValue(gst_no);
				this.spiplBankForm.controls['bank_email'].setValue(bank_email);
				this.spiplBankForm.controls['branch_code'].setValue(branch_code);
				this.spiplBankForm.controls['bank_type'].setValue(bank_type);
				this.spiplBankForm.controls['id'].setValue(id);
				this.spiplBankForm.controls['fd_creation_template'].setValue(response[0]['fd_creation_template']);
				this.spiplBankForm.controls['fd_liquidation_template'].setValue(response[0]['fd_liquidation_template']);
				this.spiplBankForm.controls['fd_renew_template'].setValue(response[0]['fd_renew_template']);
				this.mycontent = response[0]['lc_template'];
				this.ilc_template = response[0]['ilc_template'];


			});

		}
	}

	onSubmit() {

		if (this.spiplBankForm.invalid) {
			return false;
		} else {

			const data = {
				bank_name: this.spiplBankForm.value.bank_name,
				bank_address: this.spiplBankForm.value.bank_address,
				account_no: this.spiplBankForm.value.account_no,
				swiftcode: this.spiplBankForm.value.swiftcode,
				bank_phone: this.spiplBankForm.value.bank_phone,
				bank_email: this.spiplBankForm.value.bank_email,
				ifsc_code: this.spiplBankForm.value.ifsc_code,
				credit_limit: this.spiplBankForm.value.credit_limit,
				ad_code: this.spiplBankForm.value.ad_code,
				short_form: this.spiplBankForm.value.short_form,
				gst_no: this.spiplBankForm.value.gst_no,
				branch_code: this.spiplBankForm.value.branch_code,
				lc_template: this.spiplBankForm.value.lc_template,
				ilc_template: this.spiplBankForm.value.ilc_template,
				fd_creation_template: this.spiplBankForm.value.fd_creation_template,
				fd_liquidation_template: this.spiplBankForm.value.fd_liquidation_template,
				fd_renew_template: this.spiplBankForm.value.fd_renew_template,
				bank_type: this.spiplBankForm.value.bank_type,
				id: this.spiplBankForm.value.id
			}
			if (this.spiplBankForm.value.id) {
				this.crudServices.updateData<any>(SpiplBankMaster.update, data).subscribe((response) => {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						this.add_new_click = false;
						this.getSpiplBank();
						this.onReset();

					}
				});
			} else {
				this.crudServices.addData<any>(SpiplBankMaster.add, data).subscribe((response) => {

					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						this.add_new_click = false;
						this.getSpiplBank();
						this.onReset();

					}
				});
			}
		}
	}


	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(SpiplBankMaster.delete, {
				id: id
			}).subscribe((response) => {
				this.getSpiplBank();
				this.toasterService.pop(response.message, 'Success', response.data);
			});

		}
	}


	getSpiplBank() {
		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe((response) => {
			this.data = response;
		});
	}

	addNew() {
		this.add_new_click = true;
	}
	onReset() {
		this.mode = 'Add';
		this.mycontent = '';
		this.spiplBankForm.reset();
	}
	onBack() {
		this.onReset();
		this.add_new_click = false;
	}

	onChangeEditor(editor) {
		this.mycontent = editor;
	}

	copyRecord(item) {

		const data = {
			bank_name: item.bank_name,
			bank_address: item.bank_address,
			account_no: item.account_no,
			swiftcode: item.swiftcode,
			bank_phone: item.bank_phone,
			bank_email: item.bank_email,
			ifsc_code: item.ifsc_code,
			credit_limit: item.credit_limit,
			ad_code: item.ad_code,
			short_form: item.short_form,
			gst_no: item.gst_no,
			branch_code: item.branch_code,
			lc_template: item.lc_template,
			ilc_template: item.ilc_template,
			bank_type: item.bank_type,
			id: item.id
		}

		this.crudServices.addData<any>(SpiplBankMaster.add, data).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			if (response.code === '100') {
				this.add_new_click = false;
				this.getSpiplBank();
				this.onReset();
			}
		});


	}

}
