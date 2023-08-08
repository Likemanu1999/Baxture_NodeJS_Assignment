import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Params, ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToasterService, ToasterConfig } from "angular2-toaster";
import { CrudServices } from "../../../../shared/crud-services/crud-services";
import {
	SubOrg, CountryStateCityMaster, MainOrg, StaffMemberMaster, ProductMaster,
	OrganizationCategory, OrgUnitMaster, FileUpload, productsTagsMaster, SalesOrders, PortMaster
} from "../../../../shared/apis-path/apis-path";
import { staticValues } from "../../../../shared/common-service/common-service";
import { Calculations } from "../../../../shared/calculations/calculations";
import { AppModule } from "../../../../app.module";

@Component({
	selector: 'app-add-sub-org',
	templateUrl: './add-sub-org.component.html',
	styleUrls: ['./add-sub-org.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
		Calculations
	],
})
export class AddSubOrgComponent implements OnInit {

	fileData: FormData = new FormData();
	mode: string = "Add";
	box_title: string = "Sub-Orgnization";
	isLoading: boolean = false;
	isAdvancePayment: boolean = false;
	org_id: number = null
	sub_org_id: number = null
	orgRegistrationForm: FormGroup;
	mainOrg: any = [];
	unit_list: any = [];
	countries: any = [];
	ports:any=[];
	states: any = [];
	cities: any = [];
	staff: any = [];
	products: any = [];
	categories: any = [];
	product_tags: any = [];
	data: any = [];


	products_list = "";
	categories_list = "";
	product_tag_list = "";

	editmode: boolean = false;
	form_error = new Array();

	chqCopyUpload: Array<File> = [];
	mailCopyUpload: Array<File> = [];

	chq_status = staticValues.chq_status;
	product_type_list: any = staticValues.product_type_list;

	trade_manu = [];
	virtual_acc_no = false;


	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});
	purchase_acc_list: any = [];
	main_org_id: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private crudServices: CrudServices,
		private calculations: Calculations
	) {
		this.orgRegistrationForm = new FormGroup({
			org_id: new FormControl(null, Validators.required),
			org_unit: new FormControl(null, Validators.required),
			org_address: new FormControl(null, Validators.required),
			sub_org_name: new FormControl(null, Validators.required),
			country_id: new FormControl(null, Validators.required),
			state_id: new FormControl(null, Validators.required),
			city_id: new FormControl(null, Validators.required),
			location_village: new FormControl(null, Validators.required),
			pin_code: new FormControl(null),
			pan_no: new FormControl(null),
			tan_no: new FormControl(null),
			iec: new FormControl(null),
			gst_no: new FormControl(null),
			virtual_acc_no: new FormControl(null, [Validators.pattern('^[A-Za-z0-9]+$'), Validators.min(1), Validators.max(16)]),

			// Validators.pattern(this.virtualPattern)),
			product_id: new FormControl(null),
			category_id: new FormControl(null, Validators.required),
			product_tag_id: new FormControl(null),
			is_advance_payment: new FormControl(false),
			payment_term: new FormControl(null),
			chq_status: new FormControl(0),
			chq_no: new FormControl(null),
			chq_amount: new FormControl(null),
			base_limit: new FormControl(null),
			adhoc_limit: new FormControl(null),
			overdue_limit: new FormControl(null),
			sales_acc_holder: new FormControl(null),
			purchase_acc_holder: new FormControl(null),
			note: new FormControl(null),
			chq_scan_copy: new FormControl(null),
			intro_mail_scan_copy: new FormControl(null),
			chq_copy_hidden: new FormControl(null),
			mail_copy_hidden: new FormControl(null),
			trader_manufacture: new FormControl(null),
			product_type: new FormControl(null, Validators.required),
			port_id: new FormControl(null),
			transit_days: new FormControl(null),
			bcd_lic_percent: new FormControl(null),

			// bank details
			bank_name: new FormControl(null),
			bank_address: new FormControl(null),
			account_no: new FormControl(null),
			account_name: new FormControl(null),
			branch_name: new FormControl(null),
			swift_code: new FormControl(null),
			ifsc_code: new FormControl(null)
		});



		this.route.params.subscribe((params: Params) => {
			if (params.org_id !== undefined) {
				this.org_id = parseInt(params.org_id);
				this.orgRegistrationForm.patchValue({
					org_id: this.org_id
				});
			}

			if (params.sub_org_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.sub_org_id = params.sub_org_id;
				this.getSubOrgData();
			} else {
				this.editmode = false;
				this.mode = "Add";
			}
		});

		this.trade_manu = [{ name: 'Trader', id: 1 }, { name: 'Manufacture', id: 2 }];

	}


	get f() {
		return this.orgRegistrationForm.controls;
	}


	ngOnInit() {
		this.loadLists();
	}

	//*Check Form control Validations



	getSubOrgData() {
		this.crudServices.getOne(SubOrg.get_one_sub_org, {
			sub_org_id: this.sub_org_id,
		}).subscribe(response => {
			if (response[0].product_id) {
				this.products_list = response[0].product_id;
			}
			if (response[0].category_id) {
				this.categories_list = response[0].category_id;
			}

			if (response[0].product_tag_id) {
				this.product_tag_list = response[0].product_tag_id;
			}
			this.main_org_id = response[0].org_id;


			this.onCountryChange(response[0].country_id);
			this.onStateChange(response[0].state_id);

			this.orgRegistrationForm.patchValue({
				org_id: response[0].org_id,
				org_unit: response[0].org_unit,
				org_address: response[0].org_address,
				sub_org_name: response[0].sub_org_name,
				country_id: response[0].country_id,
				port_id:response[0].port_id,
				state_id: response[0].state_id,
				city_id: response[0].city_id,
				location_village: response[0].location_vilage,
				pin_code: response[0].pin_code,
				pan_no: response[0].pan_no,
				iec: response[0].iec,
				gst_no: response[0].gst_no,
				virtual_acc_no: response[0].virtual_acc_no,
				product_id: response[0].product_id,
				category_id: response[0].category_id,
				product_tag_id: response[0].product_tag_id,
				payment_term: response[0].payment_term,
				chq_status: response[0].chq_status,
				chq_no: response[0].chq_no,
				chq_amount: response[0].chq_amount,
				base_limit: response[0].base_limit,
				adhoc_limit: response[0].adhoc_limit,
				overdue_limit: response[0].overdue_limit,
				sales_acc_holder: response[0].sales_acc_holder,
				purchase_acc_holder: response[0].purchase_acc_holder,
				note: response[0].note,
				chq_copy_hidden: response[0].chq_scan_copy,
				mail_copy_hidden: response[0].intro_mail_scan_copy,
				trader_manufacture: response[0].trader_manufacture,
				product_type: response[0].product_type,
				transit_days: response[0].transit_days,
				bcd_lic_percent: response[0].bcd_lic_percent,
				tan_no: response[0].tan_no,
				bank_name: response[0].bank_name,
				bank_address: response[0].bank_address,
				account_no: response[0].account_no,
				account_name: response[0].account_name,
				branch_name: response[0].branch_name,
				swift_code: response[0].swift_code,
				ifsc_code: response[0].ifsc_code

			});
		});
	}

	loadLists() {
		this.getMainOrg();
		this.getUnit();
		this.getCountry();
		this.getPort();
		this.getMemberList();
		this.getProducts();
		this.getCategories();
		this.getProductsTags();
	}

	getMainOrg() {
		this.crudServices.getAll(MainOrg.getAll).subscribe(response => {
			this.mainOrg = response["data"];
		});
	}

	getUnit() {
		if (this.org_id) {
			this.crudServices.getOne<any>(OrgUnitMaster.getUnusedUnits, {
				org_id: this.org_id
			}).subscribe(response => {
				this.unit_list = response[0];
			});
		} else {
			this.crudServices.getAll<any>(OrgUnitMaster.getAll).subscribe(response => {
				this.unit_list = response;
			});
		}
	}

	getCountry() {
		this.crudServices.getAll(CountryStateCityMaster.getAllCountries).subscribe(response => {
			this.countries = response["data"];
		});
	}

	getPort(){
		this.crudServices.getAll(PortMaster.getAll).subscribe(response =>{
			this.ports = response;
		});
	}

	getMemberList() {
		this.crudServices.getAll(StaffMemberMaster.getAll).subscribe(response => {
			response["data"].map(item => item.first_name = item.first_name + ' ' + item.last_name);
			let data = response['data'].filter(item => item.active_status == 1)

			this.purchase_acc_list = data;
		});

		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: staticValues.marketing_role_ids
		}).subscribe(response => {
			response["data"].map(item => item.first_name = item.first_name + ' ' + item.last_name);
			this.staff = response.data;
		});

	}

	getProducts() {
		this.crudServices.getAll<any>(ProductMaster.getAll).subscribe(response => {
			this.products = response;
		})
	}
	getCategories() {
		this.crudServices.getAll<any>(OrganizationCategory.getAll).subscribe(res => {
			this.categories = res;
		});
	}

	getProductsTags() {
		this.crudServices.getAll<any>(productsTagsMaster.getAll).subscribe(res => {
			this.product_tags = res;
		});
	}

	onCountryChange(country_id) {
		this.crudServices.getOne(CountryStateCityMaster.getStates, {
			country_id: country_id,
		}).subscribe(response => {
			this.states = response["data"];
		});
	}

	onStateChange(state_id) {
		this.crudServices.getOne(CountryStateCityMaster.getCities, {
			state_id: state_id,
		}).subscribe(response => {
			this.cities = response["data"];
		});
	}

	onStateClear() {
		this.cities = null;
	}

	onCountryClear() {
		this.states = null;
	}

	onChangeBaseLimit(value) {
		let base_limit = Number(value);
		let adhoc_limit = (this.orgRegistrationForm.value.adhoc_limit == null) ? 0 : Number(this.orgRegistrationForm.value.adhoc_limit);
		this.calculateDueLimit(base_limit, adhoc_limit);
	}

	onChangeAdhocLimit(value) {
		let base_limit = (this.orgRegistrationForm.value.base_limit == null) ? 0 : Number(this.orgRegistrationForm.value.base_limit);
		let adhoc_limit = Number(value);
		this.calculateDueLimit(base_limit, adhoc_limit);
	}

	calculateDueLimit(base_limit, adhoc_limit) {
		let base_limit_20_percent = (Number(base_limit) * 0.20).toFixed(3);

		if (Number(base_limit_20_percent) > adhoc_limit) {
			this.orgRegistrationForm.patchValue({
				overdue_limit: Number(base_limit_20_percent)
			});
		} else {
			this.orgRegistrationForm.patchValue({
				overdue_limit: adhoc_limit
			});
		}
	}

	setAdvancePaymentTerm(value) {
		if (value == true) {
			this.isAdvancePayment = true;
			this.orgRegistrationForm.patchValue({
				payment_term: 0
			});
		} else {
			this.isAdvancePayment = false;
			this.orgRegistrationForm.patchValue({
				payment_term: null
			});
		}
	}

	onChangePaymentTerm(value) {
		if (value == 0) {
			this.isAdvancePayment = true;
			this.orgRegistrationForm.patchValue({
				is_advance_payment: true
			});
		} else {
			this.isAdvancePayment = false;
			this.orgRegistrationForm.patchValue({
				is_advance_payment: false
			});
		}
	}

	chequeCopyUploadEvent(event: any) {
		let files = <Array<File>>event.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append('org_cheque_copy', files[i], files[i]['name']);
		}
	}

	mailCopyUploadEvent(event: any) {
		let files = <Array<File>>event.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append('org_mail_copy', files[i], files[i]['name']);
		}
	}

	onSubmit() {
		const invalid = [];
		const controls = this.orgRegistrationForm.controls;

		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
				this.form_error = invalid;
			}
		}

		if (!this.orgRegistrationForm.invalid) {

			console.log(this.orgRegistrationForm.value)
			if (this.orgRegistrationForm.value.product_id) {
				this.products_list = this.orgRegistrationForm.value.product_id;
			}

			if (this.orgRegistrationForm.value.category_id) {
				this.categories_list = this.orgRegistrationForm.value.category_id;
			}


			if (this.orgRegistrationForm.value.product_tag_id) {
				this.product_tag_list = this.orgRegistrationForm.value.product_tag_id;
			}

			const formData = {
				org_id: this.orgRegistrationForm.value.org_id,
				org_unit: this.orgRegistrationForm.value.org_unit,
				sub_org_name: this.orgRegistrationForm.value.sub_org_name,
				org_address: this.orgRegistrationForm.value.org_address,
				country_id: this.orgRegistrationForm.value.country_id,
				port_id:this.orgRegistrationForm.value.port_id,
				state_id: this.orgRegistrationForm.value.state_id,
				city_id: this.orgRegistrationForm.value.city_id,
				location_vilage: this.orgRegistrationForm.value.location_village,
				pin_code: this.orgRegistrationForm.value.pin_code,
				sales_acc_holder: parseInt(this.orgRegistrationForm.value.sales_acc_holder),
				purchase_acc_holder: parseInt(this.orgRegistrationForm.value.purchase_acc_holder),
				pan_no: this.orgRegistrationForm.value.pan_no,
				tan_no: this.orgRegistrationForm.value.tan_no,
				iec: this.orgRegistrationForm.value.iec,
				gst_no: this.orgRegistrationForm.value.gst_no,
				virtual_acc_no: this.orgRegistrationForm.value.virtual_acc_no,
				payment_term: this.orgRegistrationForm.value.payment_term,
				base_limit: parseInt(this.orgRegistrationForm.value.base_limit),
				adhoc_limit: parseInt(this.orgRegistrationForm.value.adhoc_limit),
				overdue_limit: parseInt(this.orgRegistrationForm.value.overdue_limit),
				chq_no: parseInt(this.orgRegistrationForm.value.chq_no),
				chq_amount: parseInt(this.orgRegistrationForm.value.chq_amount),
				chq_status: parseInt(this.orgRegistrationForm.value.chq_status),
				note: this.orgRegistrationForm.value.note,
				trader_manufacture: this.orgRegistrationForm.value.trader_manufacture,
				product_type: this.orgRegistrationForm.value.product_type,
				transit_days: this.orgRegistrationForm.value.transit_days,
				bcd_lic_percent: this.orgRegistrationForm.value.bcd_lic_percent,
			};

			if (this.fileData.get("org_cheque_copy") != null || this.fileData.get("org_mail_copy") != null) {
				this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
					let filesCheque = [];
					let filesMail = [];
					let org_cheque_copy = res.uploads.org_cheque_copy;
					let org_mail_copy = res.uploads.org_mail_copy;
					if (org_cheque_copy != null) {
						if (org_cheque_copy.length > 0) {
							for (let i = 0; i < org_cheque_copy.length; i++) {
								filesCheque.push(org_cheque_copy[i].location);
							}
						}
					}
					if (org_mail_copy != null) {
						if (org_mail_copy.length > 0) {
							for (let i = 0; i < org_mail_copy.length; i++) {
								filesMail.push(org_mail_copy[i].location);
							}
						}
					}
					formData['chq_scan_copy'] = JSON.stringify(filesCheque);
					formData['intro_mail_scan_copy'] = JSON.stringify(filesMail);
					this.saveData(formData);
				});
			} else {
				this.saveData(formData);
			}
		}
	}

	saveData(sub_org_Data) {
		let body = {
			sub_org_Data: sub_org_Data,
			products: this.products_list,
			categories: this.categories_list,
			product_tags: this.product_tag_list
		}
		if (this.editmode) {
			body["sub_org_id"] = this.sub_org_id;
			body["main_org_id"] = this.main_org_id != sub_org_Data.org_id ? 1 : 0
			body["message"] = "Sub-Organisation Updated";
			this.crudServices.updateData<any>(SubOrg.update_sub_org, body).subscribe(response => {
				this.toasterService.pop(response['message'], "Success", response['data']);
				if (response.code === "100") {
					if (this.orgRegistrationForm.value.virtual_acc_no != null) {
						this.updateSalesOrderVANumber();
					} else {
						this.onReset();
						this.onBack();
					}
				}
			});
		} else {
			body["message"] = "New Sub-Organisation Added";
			let bank_data = {
				bank_name: this.orgRegistrationForm.value.bank_name,
				bank_address: this.orgRegistrationForm.value.bank_address,
				account_no: this.orgRegistrationForm.value.account_no,
				account_name: this.orgRegistrationForm.value.account_name,
				branch_name: this.orgRegistrationForm.value.branch_name,
				swift_code: this.orgRegistrationForm.value.swift_code,
				ifsc_code: this.orgRegistrationForm.value.ifsc_code,
			}

			body['bankDetails'] = bank_data
			this.crudServices.addData<any>(SubOrg.add_sub_org, body).subscribe(response => {
				if (response.code === "100") {
					this.toasterService.pop(response.message, response.message, response.data);
					this.onReset();
					this.onBack();
				} else if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, "Something Went Wrong");
				}
			}
			);
		}
	}

	updateSalesOrderVANumber() {
		this.crudServices.updateData<any>(SalesOrders.updateVirtualAccountNumber, {
			virtual_acc_no: this.orgRegistrationForm.value.virtual_acc_no,
			sub_org_id: this.sub_org_id
		}).subscribe(response => {
			this.onReset();
			this.onBack();
		});
	}

	onReset() {
		this.mode = "Add New";
		this.editmode = false;
		this.orgRegistrationForm.reset();
	}

	onBack() {
		this.onReset();
		this.router.navigate(["/masters/sub-org-list"]);
	}
}
