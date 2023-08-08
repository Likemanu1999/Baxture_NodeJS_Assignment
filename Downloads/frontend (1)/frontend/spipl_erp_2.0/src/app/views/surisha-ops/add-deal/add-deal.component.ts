import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { GenerateSoPvcService } from '../../../shared/generate-doc/generate-so-pvc';
import {
	GradeMaster,
	dealOffer,
	foreignSupplier,
	PortMaster,
	CountryMaster,
	MainGrade,
	SubOrg
} from '../../../shared/apis-path/apis-path';
import { CommonService, staticValues } from '../../../shared/common-service/common-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-add-deal',
	templateUrl: './add-deal.component.html',
	styleUrls: ['./add-deal.component.scss'],
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		CommonService,
		Calculations,
		CurrencyPipe,
		AmountToWordPipe,
		GenerateSoPvcService
	]
})

export class AddDealComponent implements OnInit {
	@ViewChild("addNewCustomerModal", { static: false }) public addNewCustomerModal: ModalDirective;
	@ViewChild("summaryModal", { static: false }) public summaryModal: ModalDirective;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 50000
	});

	datePickerConfig: any = staticValues.datePickerConfig;
	paymentTypesList: any = staticValues.payment_types;
	deliveryTermsList: any = staticValues.delivery_terms;
	currenciesList: any = staticValues.currencies;
	companyList: any = staticValues.companies;

	user: UserDetails;
	role_id: any = null;
	links: string[] = [];
	grade_list: any = [];
	country_list: any = [];
	port_list: any = [];
	suppilier_list: any = [];

	offerForm: FormGroup;

	page_title: any = "Add Offer";
	data: any = null;
	selectedZone: any = null;
	currency_change_access: boolean = false;
	editMode: boolean = false;
	enableCompany: any = false;

	company_id: any = null;
	magangementSPIPLWhatsappNumbers: any = staticValues.magangementSPIPLWhatsappNumbersSales;
	magangementSSurishaWhatsappNumbers: any = staticValues.magangementSSurishaWhatsappNumbersSales;
	grade_name: any;

	constructor(toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices) {
		this.initForm();
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.role_id = this.user.userDet[0].role_id;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}
		this.company_id = this.user.userDet[0].company_id;
		if (this.role_id == 1) {
			this.enableCompany = true;
		} else {
			this.enableCompany = false;
		}
		this.links = this.user.links;
		let links_res = this.links.find(x => x == 'currency_change_access');
		this.currency_change_access = (links_res != null) ? true : false;
		const perms = this.permissionService.getPermission();

		this.route.params.subscribe((params: Params) => {
			if (params["record"] != null) {
				this.data = JSON.parse(params["record"]);
				this.editMode = true;
				this.page_title = "Edit deal Offer";
				this.offerForm.patchValue({
					info: this.data.information,
					arrival: this.data.arrival,
					country_id: this.data.country_id,
					supplier_id: this.data.supplier_id,
					grade_id: this.data.grade_id,
					quantity: this.data.quantity,
					offerValid: moment(this.data.offer_end).format('YYYY-MM-DD'),
					delivery_term_id: this.data.delivery_term_id,
					sector: this.data.sector,
					offer_rate: this.data.offer_rate,
					port_id: this.data.port_id
				});

				console.log(this.data);
				
				this.grade_name =  this.data.grade_name;
			}
		});
		this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
			this.grade_list = response;

		});
		this.crudServices.getAll<any>(PortMaster.getAll).subscribe((response) => {
			this.port_list = response;

		});
		this.crudServices.getAll<any>(CountryMaster.getAll).subscribe((response) => {
			this.country_list = response.data;
		});
		this.crudServices.getRequest<any>(SubOrg.getPetrochemicalManufacture).subscribe(response => {
			this.suppilier_list = response;
		});
	}

	ngOnInit() {

	}
	initForm() {
		this.offerForm = new FormGroup({
			info: new FormControl(null, Validators.required),
			arrival: new FormControl(null, Validators.required),
			port_id: new FormControl(null, Validators.required),
			country_id: new FormControl(null, Validators.required),
			supplier_id: new FormControl(null, Validators.required),
			grade_id: new FormControl(null, Validators.required),
			quantity: new FormControl(null, Validators.required),
			offerValid: new FormControl(null, Validators.required),
			delivery_term_id: new FormControl(null, Validators.required),
			sector: new FormControl(null, Validators.required),
			offer_rate: new FormControl(null, Validators.required)
		});
		// this.offerForm.get('supplier_id').disable()
	}

	changeDropdown(event) {
		this.offerForm.patchValue({
			info: event.mfi,
			supplier_id: event.main_org_master.org_id,
			sector: event.grade_category.grade_category
		});
		this.grade_name = event.grade_name;
		let payload = {id : event.main_org_master.org_id};
		this.crudServices.getOne<any>(SubOrg.getAllCountries, payload).subscribe(response => {	
			this.offerForm.patchValue({
				country_id: response.data[0].country_id,
			});
		});
	}

	onSubmit() {
		if (!this.offerForm.valid) {
			return
		}
		else {
			let data = {
				information: this.offerForm.value.info,
				arrival: this.offerForm.value.arrival,
				port_id: this.offerForm.value.port_id,
				country_id: this.offerForm.value.country_id,
				supplier_id: this.offerForm.value.supplier_id,
				grade_id: this.offerForm.value.grade_id,
				delivery_term_id: this.offerForm.value.delivery_term_id,
				sector: this.offerForm.value.sector,
				offer_rate: this.offerForm.value.offer_rate,
				offer_end: this.offerForm.value.offerValid,
				quantity: this.offerForm.value.quantity,
				grade_name: this.grade_name
			}

			if (this.editMode) {
				let payload = {
					id: this.data.id,
					data: data
				}
				this.crudServices.updateData(dealOffer.update, payload).subscribe(result => {
					this.toasterService.pop('success', 'Success', result['data']);
					this.offerForm.reset();
					this.router.navigate(["surisha-ops/deal-offer"]);
				});
			} else {
				this.crudServices.addData(dealOffer.add, data).subscribe(result => {
					this.toasterService.pop('success', 'Success', result['data']);
					this.offerForm.reset();
					this.router.navigate(["surisha-ops/deal-offer"]);
				});
			}

		}
	}
}