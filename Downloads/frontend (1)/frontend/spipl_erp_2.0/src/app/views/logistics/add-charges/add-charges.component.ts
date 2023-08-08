import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { billOfLading, chacharges, FileUpload, GodownMaster, logistics_charges, PercentageDetails, SubOrg } from '../../../shared/apis-path/apis-path';

import * as moment from 'moment';
import { HelperService } from '../../../_helpers/helper_service';
import { forkJoin } from 'rxjs';
@Component({
	selector: 'app-add-charges',
	templateUrl: './add-charges.component.html',
	styleUrls: ['./add-charges.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		HelperService
	]
})
export class AddChargesComponent implements OnInit {
	bl_id: number;
	bl_quantity: any;
	containers: any;
	bl_no: any;
	bl_date: any;
	material_in_bond_status: any;
	port_id: any;
	setflag: number;
	port_name: number;
	container_size: string;
	status_type: number;
	rate_per_cont: number;
	agency_rate: number;
	bond_rate: number;
	addForm: FormGroup;
	bondForm: FormGroup;
	crane_charges: any;
	other: any;
	shippin_lines = [];
	cfs_list: any;
	terminal: any;
	cha_list: any;
	cha: any;
	n_id: any;
	cgst_percent: number;
	sgst_percent: number;
	bondArr: FormArray;
	bond_id: any;
	bond_insurance: any;

	temp_from_date: any = null;
	temp_to_date: any = null;
	index: any;
	from_index: any;
	to_index: any;
	no_of_cont: any;
	accessible_val: any;
	duty: any;
	transporterForm: FormGroup;
	transporter_charges = [];
	trasporter = [];
	transporterArr: FormArray;
	cha_name: any;
	terminal_name: any;
	godown_name: any;
	cfs: any;
	shippinLine: any;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	be_list = [];
	godown = [];
	cha_id: any;
	chaRate = 0;
	cfs_id: any;
	cfsRate = 0;
	terminal_id: any;
	shiftingRate = 0;
	igst_percent: any;
	charges_submited_flag = 0;
	shipping_cgst: boolean = false;
	shipping_sgst: boolean = false;
	shipping_igst: boolean = false;
	terminal_cgst: boolean = false;
	terminal_sgst: boolean = false;
	terminal_igst: boolean = false;
	chaArr: FormArray;
	chaForm: FormGroup;
	load_cross_charges: any;
	cfs_doc: Array<File> = [];
	shipping_doc: Array<File> = [];
	terminal_doc: Array<File> = [];
	storage_doc: Array<File> = [];
	cfsFile = [];
	shippingFile = [];
	terminalFile = [];
	storageFile = [];
	chaFile = [];
	transporterFile = [];
	bondFile = [];
	FOB: any;
	fob_doc: Array<File> = [];
	fob_name: any;
	fobFile = [];
	gsttype = [];
	taxtype = 2;

	user: UserDetails;
	links: string[] = [];
	add_charges: boolean;
	cgst_percent_cha: any;
	sgst_percent_cha: any;
	igst_percent_cha: any;
	taxtypecha = 2;
	cgst_percent_cfs: number;
	sgst_percent_cfs: number;
	igst_percent_cfs: any;
	taxtypecfs = 2;
	cgst_percent_bond: any;
	sgst_percent_bond: any;
	igst_percent_bond: any;
	taxtypebond = 2;
	cgst_percent_storage: any;
	cgst_percent_fob: any;
	sgst_percent_storage: any;
	sgst_percent_fob: any;
	igst_percent_storage: any;
	igst_percent_fob: any;
	cgst_percent_shipping: any;
	cgst_percent_terminal: any;
	sgst_percent_shipping: any;
	sgst_percent_terminal: any;
	igst_percent_shipping: any;
	igst_percent_terminal: any;
	taxtypestorage = 2;
	taxtypefob = 2;
	taxtypeshipping = 2;
	taxtypeterminal = 2;
	storageForm: FormGroup;
	storageArr: FormArray;



	constructor(private toasterService: ToasterService,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		public datepipe: DatePipe,
		private loginService: LoginService,
		private crudServices: CrudServices, private deleteFile: HelperService) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.add_charges = (this.links.indexOf('Add Charges Bill of Lading') > -1);


		this.addForm = new FormGroup({


			cfs_charges: new FormControl(0),
			cfs_cgst: new FormControl(0),
			cfs_sgst: new FormControl(0),
			remark_cfs: new FormControl(null),
			cfs_doc: new FormControl(null),


			scanning_charges: new FormControl(0),
			examination_charges: new FormControl(0),
			cfs_grount_rent: new FormControl(0),
			first_shifting_terminal: new FormControl(0),
			second_shifting_terminal: new FormControl(0),
			terminal_grount_rent: new FormControl(0),
			toll_charges: new FormControl(0),
			terminal_cgst: new FormControl(0),
			terminal_sgst: new FormControl(0),
			terminal_igst: new FormControl(0),
			remark_terminal: new FormControl(null),
			terminal_doc: new FormControl(null),
			shipping_charges: new FormControl(0),
			shipping_grount_rent: new FormControl(0),
			shipping_other_charges: new FormControl(0),
			shipping_cgst: new FormControl(0),
			shipping_sgst: new FormControl(0),
			shipping_igst: new FormControl(0),
			remark_shipping: new FormControl(null),
			shipping_doc: new FormControl(null),

			//cha_total: new FormControl(0),
			cfs_total: new FormControl(0),
			terminal_total: new FormControl(0),
			shipping_total: new FormControl(0),

			// storage_charges: new FormControl(0),
			// storage_godown: new FormControl(0),
			// storage_qty: new FormControl(0),
			// storage_cgst: new FormControl(0),
			// storage_sgst: new FormControl(0),
			// storage_remark: new FormControl(null),
			// storage_doc: new FormControl(null),
			// storage_total: new FormControl(0),



			fob_charges: new FormControl(0),
			fob_cgst: new FormControl(0),
			fob_sgst: new FormControl(0),
			fob_remark: new FormControl(null),
			fob_total: new FormControl(0),
			fob_doc: new FormControl(null),

			citpl_charges: new FormControl(0),
			citpl_cgst: new FormControl(0),
			citpl_sgst: new FormControl(0),
			citpl_total: new FormControl(0)



		})
		this.setFormArray();


	}

	ngOnInit() {

		this.route.params.subscribe((params: Params) => {
			this.bl_id = +params['bl_id'];

		});




		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
			this.godown = response;
		})

		this.crudServices.getAll<any>(PercentageDetails.getGstTaxType).subscribe(response => {
			this.gsttype = response;
		})

		this.getBl();





		//




	}

	setFormArray() {


		this.bondForm = this.fb.group({

			bondArr: this.fb.array([

			]),
		});

		this.chaForm = this.fb.group({

			chaArr: this.fb.array([

			]),
		});

		this.transporterForm = this.fb.group({

			transporterArr: this.fb.array([

			]),
		});

		this.storageForm = this.fb.group({

			storageArr: this.fb.array([

			]),
		});

	}

	setTaxValue(detail_type, val) {


		this.crudServices.getOne<any>(PercentageDetails.getOne, { detail_type: detail_type }).subscribe(response => {

			if (response) {
				response.forEach(element => {
					if (element.percent_type === 'cgst') {
						this.cgst_percent = element.percent_value;
						if (val == 'cha') {
							this.cgst_percent_cha = element.percent_value;
						}

						if (val == 'cfs') {
							this.cgst_percent_cfs = element.percent_value;
						}

						if (val == 'bond') {
							this.cgst_percent_bond = element.percent_value;
						}

						if (val == 'storage') {
							this.cgst_percent_storage = element.percent_value;
						}
						if (val == 'fob') {
							this.cgst_percent_fob = element.percent_value;
						}
						if (val == 'shipping') {
							this.cgst_percent_shipping = element.percent_value;

						}

						if (val == 'terminal') {
							this.cgst_percent_terminal = element.percent_value;
						}
					}

					if (element.percent_type === 'sgst') {
						this.sgst_percent = element.percent_value;
						if (val == 'cha') {
							this.sgst_percent_cha = element.percent_value;
						}

						if (val == 'cfs') {
							this.sgst_percent_cfs = element.percent_value;
						}
						if (val == 'bond') {
							this.sgst_percent_bond = element.percent_value;
						}

						if (val == 'storage') {
							this.sgst_percent_storage = element.percent_value;
						}
						if (val == 'fob') {
							this.sgst_percent_fob = element.percent_value;
						}

						if (val == 'shipping') {
							this.sgst_percent_shipping = element.percent_value;
						}

						if (val == 'terminal') {
							this.sgst_percent_terminal = element.percent_value;
						}



					}

					if (element.percent_type === 'gst') {
						this.igst_percent = element.percent_value;
						if (val == 'cha') {
							this.igst_percent_cha = element.percent_value;
						}

						if (val == 'cfs') {
							this.igst_percent_cfs = element.percent_value;
						}
						if (val == 'bond') {
							this.igst_percent_bond = element.percent_value;
						}
						if (val == 'storage') {
							this.igst_percent_storage = element.percent_value;
						}

						if (val == 'fob') {
							this.igst_percent_fob = element.percent_value;
						}

						if (val == 'shipping') {
							this.igst_percent_shipping = element.percent_value;
						}

						if (val == 'terminal') {
							this.igst_percent_terminal = element.percent_value;
						}


					}


				});
			}




			// this.getBl();

		})


	}



	getBl() {
		this.crudServices.getOne<any>(billOfLading.getOneBl, { id: this.bl_id }).subscribe(response => {

			this.bl_quantity = response[0].bl_qauntity;
			this.n_id = response[0].n_id;
			this.bl_id = response[0].id;
			this.cha_id = response[0].cha_id;
			this.charges_submited_flag = response[0].charges_submited_flag;
			this.cfs_id = response[0].cfs_dpd;
			this.terminal_id = response[0].terminal_id;
			this.containers = response[0].container_details.length;
			this.bl_no = response[0].bill_lading_no;
			this.bl_date = response[0].bl_date;
			this.material_in_bond_status = response[0].material_in_bond_status;
			this.port_id = response[0].non_negotiable.port_id;
			this.port_name = response[0].non_negotiable.port_master.port_name;
			if (response[0].shipment_status_master != null) {
				this.status_type = response[0].shipment_status_master.type;
			}

			this.bond_id = response[0].bond_id;
			this.no_of_cont = response[0].container_details.length;

			if (response[0].cha != null) {
				this.cha_name = response[0].cha.sub_org_name;
			}

			if (response[0].cfsDpd != null) {
				this.cfs = response[0].cfsDpd.sub_org_name;
			}

			if (response[0].terminal != null) {
				this.terminal_name = response[0].terminal.sub_org_name
			}

			if (response[0].bondGodown != null) {
				this.godown_name = response[0].bondGodown.godown_name;
			}

			if (response[0].non_negotiable.shippingLine != null) {
				this.shippinLine = response[0].non_negotiable.shippingLine.sub_org_name;
			}



			if (response[0].fob != null) {
				this.fob_name = response[0].fob.sub_org_name
			}


			this.be_list = [];
			if (response[0].non_be_bls.length) {
				response[0].non_be_bls.forEach(element => {
					this.be_list.push(element.bill_of_entry)
				});

			}

			const qty_per_contr = this.bl_quantity / this.containers;  //Net wt
			this.setflag = 0;
			if (qty_per_contr <= 20) {
				// 20 ft.
				this.setflag = 1;
				this.container_size = '20FT';
			} else {   //40 ft.
				this.setflag = 2;
				this.container_size = '40FT';
			}

			this.setTaxValue(this.taxtypecha, 'cha');
			this.setTaxValue(this.taxtypecfs, 'cfs');
			this.setTaxValue(this.taxtypebond, 'bond');

			this.setTaxValue(this.taxtypeshipping, 'shipping');
			this.setTaxValue(this.taxtypeterminal, 'terminal');
			this.setTaxValue(this.taxtypefob, 'fob');
			this.setTaxValue(this.taxtypestorage, 'storage');


			this.getTransporter();
			this.getChaCharges();
			this.get_cfs_terminal_charges();
			this.getBondCharges();
			this.getLoadingCrossing();
			this.getStorage();



		})

	}




	// FOR BOND -----------------------------------------------------------------------------------------------------------
	createItem(data): FormGroup {

		if (data == null) {

			return this.fb.group({
				from_date: new FormControl(null),
				to_date: new FormControl(null),
				weeks: new FormControl(null),
				be_id: new FormControl(null),
				noc: new FormControl(null),
				charge_rate: new FormControl(null),
				cgst: new FormControl(null),
				sgst: new FormControl(null),
				total: new FormControl(null),

			});
		} else {
			return this.fb.group({
				from_date: new FormControl(data.from_date != null ? new Date(data.from_date) : null),
				to_date: new FormControl(data.to_date != null ? new Date(data.to_date) : null),
				weeks: new FormControl(data.weeks),
				be_id: new FormControl(data.be_id),
				noc: new FormControl(data.noc),
				charge_rate: new FormControl(data.charge_rate),
				cgst: new FormControl(data.cgst),
				sgst: new FormControl(data.sgst),
				total: new FormControl(Number(data.charge_rate) + Number(data.cgst) + Number(data.sgst)),

			});
		}


	}
	addRow(): void {


		this.bondArr = this.bondForm.get('bondArr') as FormArray;
		this.bondArr.push(this.createItem(null));
	}

	delete(index: number) {
		this.bondArr = this.bondForm.get('bondArr') as FormArray;
		this.bondArr.removeAt(index);

	}

	getBondCharges() {

		let response1 = this.crudServices.getOne<any>(chacharges.getChargeMaster, {
			port_id: this.port_id,
			bond_id: this.bond_id,
			container_type: this.setflag,
			charges_head_id: 2,
			bl_date: this.bl_date
		})

		let response2 = this.crudServices.getOne<any>(logistics_charges.getBondData, { n_id: this.n_id, bl_id: this.bl_id })

		forkJoin([response1, response2]).subscribe(([data1, data2]) => {
			if (data1.length) {
				this.bond_rate = data1[0].rate;
				this.bond_insurance = data1[0].bond_insurance_percent;
			}
			this.bondArr = this.bondForm.get('bondArr') as FormArray;
			if (data2.length > 0) {
				data2.forEach(element => {

					this.bondArr.push(this.createItem(element));
					if (element.percent_type) {
						this.taxtypebond = element.percent_type
					}


				});
			} else {

				this.bondArr.push(this.createItem(null));
			}
		})




	}

	getFromDate(event, i) {
		this.temp_from_date = event;
		this.from_index = i;
		this.calculateDays();
	}

	getToDate(event, i) {
		this.temp_to_date = event;
		this.to_index = i;
		this.calculateDays();
	}

	calculateDays() {
		let days = 0;
		let weeks = 0;
		if (this.from_index == this.to_index) {
			if (this.temp_from_date != null && this.temp_to_date != null) {
				days = moment(this.temp_to_date).diff(moment(this.temp_from_date), 'days') + 1;
				weeks = moment(this.temp_to_date).diff(moment(this.temp_from_date), 'weeks') + 1;
				((this.bondForm.controls.bondArr as FormArray).at(this.from_index) as FormGroup).get('weeks').patchValue(weeks);
				// this.bondChargesCalculation();
			}

		}


	}



	bondChargesCalculation() {
		let bond_data = this.bondForm.value.bondArr;


		for (let i = 0; i < bond_data.length; i++) {
			const element = bond_data[i];


			let total = ((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).controls.charge_rate.value
			let cgst = total * (this.cgst_percent / 100);
			let sgst = total * (this.sgst_percent / 100);
			let total_cgst_sgst = Number(total) + Number(cgst) + Number(sgst);

			((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).get('cgst').patchValue(cgst.toFixed(2));
			((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).get('sgst').patchValue(sgst.toFixed(2));
			((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).get('total').patchValue(total_cgst_sgst.toFixed(2));

		}

	}

	bondChargesCalculationGst() {

		let bond_data = this.bondForm.value.bondArr;


		for (let i = 0; i < bond_data.length; i++) {
			const element = bond_data[i];


			let total = ((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).controls.charge_rate.value;
			let cgst = ((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).controls.cgst.value
			let sgst = ((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).controls.sgst.value
			let total_cgst_sgst = Number(total) + Number(cgst) + Number(sgst);

			((this.bondForm.controls.bondArr as FormArray).at(i) as FormGroup).get('total').patchValue(total_cgst_sgst.toFixed(2));

		}

	}
	//----------------------------------------------------------------------------------------------------------------

	// FOR CHA--------------------------------------------------------------------------------------------------------
	createItemCha(data): FormGroup {

		if (data == null) {
			let total = Number(this.chaRate) + Number(this.chaRate) * (this.cgst_percent_cha / 100) + Number(this.chaRate) * (this.sgst_percent / 100);

			return this.fb.group({
				cha_charges: new FormControl(this.chaRate),
				cha_other_charges: new FormControl(null),
				general_stamp: new FormControl(null),
				edi: new FormControl(null),
				cha_cgst: new FormControl(Number(this.chaRate) * (this.cgst_percent_cha / 100)),
				cha_sgst: new FormControl(Number(this.chaRate) * (this.sgst_percent_cha / 100)),
				remark_cha: new FormControl(null),
				cha_total: new FormControl(total),


			});
		} else {

			return this.fb.group({
				cha_charges: new FormControl(data.cha_charges),
				cha_other_charges: new FormControl(data.cha_other_charges),
				general_stamp: new FormControl(data.general_stamp),
				edi: new FormControl(data.edi),
				cha_cgst: new FormControl(data.cha_cgst),
				cha_sgst: new FormControl(data.cha_sgst),
				remark_cha: new FormControl(data.remark_cha),
				cha_total: new FormControl(Number(data.cha_charges) + Number(data.cha_other_charges) + Number(data.cha_cgst) + Number(data.cha_sgst) + Number(data.general_stamp) + Number(data.edi)),


			});
		}


	}



	addRowCha(): void {


		this.chaArr = this.chaForm.get('chaArr') as FormArray;
		this.chaArr.push(this.createItemCha(null));
	}


	deleteCha(index: number) {
		this.chaArr = this.chaForm.get('chaArr') as FormArray;
		this.chaArr.removeAt(index);

	}

	getChaCharges() {

		let response1 = this.crudServices.getOne<any>(chacharges.getChargeMaster, {
			port_id: this.port_id,
			shipping_agent_id: this.cha_id,
			container_type: this.setflag,
			charges_head_id: 1,
			bl_date: this.bl_date
		});

		let response2 = this.crudServices.getOne<any>(logistics_charges.getChaCharges, { bl_id: this.bl_id, n_id: this.n_id })


		forkJoin([response1, response2]).subscribe(([data1, data2]) => {
			if (data1.length) {
				this.chaRate = data1[0].rate * this.no_of_cont;

			}

			if (data2.length) {
				for (let val of data2) {

					this.chaArr = this.chaForm.get('chaArr') as FormArray;
					this.chaArr.push(this.createItemCha(val));

					if (val.percent_type) {
						this.taxtypecha = val.percent_type

					}
				}

			} else {
				this.chaArr = this.chaForm.get('chaArr') as FormArray;
				this.chaArr.push(this.createItemCha(null));

			}
		})


	}

	calculateChaGst(i) {
		let total = Number(((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).controls.cha_charges.value) + Number(((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).controls.cha_other_charges.value);
		let general_edi = Number(((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).controls.general_stamp.value) + Number(((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).controls.edi.value)
		let cgst = total * (this.cgst_percent_cha / 100);
		let sgst = total * (this.sgst_percent_cha / 100);
		let total_cgst_sgst = Number(total) + Number(cgst) + Number(sgst) + Number(general_edi);


		((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).get('cha_cgst').patchValue(cgst.toFixed(2));
		((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).get('cha_sgst').patchValue(sgst.toFixed(2));
		((this.chaForm.controls.chaArr as FormArray).at(i) as FormGroup).get('cha_total').patchValue(total_cgst_sgst.toFixed(2));

	}




	//---------------------------------------------------------------------------------------------------------------------




	//LOADING CROSSING CHARGES-------------------------------------------------------------------------------------------------

	getLoadingCrossing() {

		this.crudServices.getOne<any>(logistics_charges.getLoadingCrossingCharges, { bl_id: this.bl_id, n_id: this.n_id }).subscribe(response => {
			this.load_cross_charges = response[0].loading_crossing_charges;


		})

	}

	//--------------------------------------------------------------------------------------------------------------------------

	//FOR SINGLE CHARGES------------------------------------------------------------------------------------------------------

	get_cfs_terminal_charges() {
		let response1 = this.crudServices.getOne<any>(chacharges.getChargeMaster, {
			port_id: this.port_id,
			shipping_agent_id: this.cfs_id,
			container_type: this.setflag,
			charges_head_id: 3,
			bl_date: this.bl_date
		})

		let response2 = this.crudServices.getOne<any>(chacharges.getChargeMaster, {
			port_id: this.port_id,
			shipping_agent_id: this.terminal_id,
			container_type: this.setflag,
			charges_head_id: 4,
			bl_date: this.bl_date
		})

		let response3 = this.crudServices.getOne<any>(chacharges.getCharges, { bl_id: this.bl_id, n_id: this.n_id })

		forkJoin([response1, response2, response3]).subscribe(([data1, data2, data3]) => {

			if (data1.length) {
				this.cfsRate = data1[0].rate * this.no_of_cont;

			}

			if (data2.length) {
				this.shiftingRate = data2[0].rate * this.no_of_cont;

			}


			if (data3.length) {

				let object = {};
				for (let key in data3[0]) {
					if (key != 'cfs_doc' && key != 'shipping_doc' && key != 'terminal_doc' && key != 'storage_doc' && key != 'fob_doc') {
						object[key] = data3[0][key]
						if (key == 'percent_type_cfs') {
							this.taxtypecfs = data3[0][key] ? data3[0][key] : 2
						}
						if (key == 'percent_type_storage') {
							this.taxtypestorage = data3[0][key] ? data3[0][key] : 2
						}
						if (key == 'percent_type_fob') {
							this.taxtypefob = data3[0][key] ? data3[0][key] : 2
						}
						if (key == 'percent_type_shipping') {
							this.taxtypeshipping = data3[0][key] ? data3[0][key] : 2
						}
						if (key == 'percent_type_terminal') {
							this.taxtypeterminal = data3[0][key] ? data3[0][key] : 2
						}
					}



				}



				this.addForm.patchValue(object);
				this.cfsFile = data3[0].cfs_doc != null ? JSON.parse(data3[0].cfs_doc) : [];
				this.shippingFile = data3[0].shipping_doc != null ? JSON.parse(data3[0].shipping_doc) : [];
				this.fobFile = data3[0].fob_doc != null ? JSON.parse(data3[0].fob_doc) : [];
				this.terminalFile = data3[0].terminal_doc != null ? JSON.parse(data3[0].terminal_doc) : [];
				this.storageFile = data3[0].storage_doc != null ? JSON.parse(data3[0].storage_doc) : [];
				this.chaFile = data3[0].cha_doc != null ? JSON.parse(data3[0].cha_doc) : [];
				this.bondFile = data3[0].bond_doc != null ? JSON.parse(data3[0].bond_doc) : [];
				this.transporterFile = data3[0].transporter_doc != null ? JSON.parse(data3[0].transporter_doc) : [];



				this.shipping_cgst = data3[0].shipping_cgst ? true : false;
				this.shipping_sgst = data3[0].shipping_sgst ? true : false;
				this.shipping_igst = data3[0].shipping_igst ? true : false;

				this.terminal_cgst = data3[0].terminal_cgst ? true : false;
				this.terminal_sgst = data3[0].terminal_sgst ? true : false;
				this.terminal_igst = data3[0].terminal_igst ? true : false;


				if (this.cfs != undefined) {
					if (data3[0].cfs_charges == null || data3[0].cfs_charges == 0) {
						this.addForm.patchValue({ cfs_charges: this.cfsRate })
						this.calculateGST(2)
					}
				}

				if (this.terminal_name != undefined) {
					if (data3[0].first_shifting_terminal == null || data3[0].first_shifting_terminal == 0) {
						this.addForm.patchValue({ first_shifting_terminal: this.shiftingRate })
						this.calculateGST(4)
					}
				}
				this.totalCharges();
			}

		})
	}



	totalCharges() {


		let cha_total = Number(this.addForm.value.cha_charges) + Number(this.addForm.value.cha_other_charges) + Number(this.addForm.value.cha_cgst) + Number(this.addForm.value.cha_sgst);
		let cfs_total = Number(this.addForm.value.cfs_charges) + Number(this.addForm.value.scanning_charges) + Number(this.addForm.value.examination_charges) + Number(this.addForm.value.cfs_grount_rent) + Number(this.addForm.value.cfs_cgst) + Number(this.addForm.value.cfs_sgst);
		let terminal_total = Number(this.addForm.value.first_shifting_terminal) + Number(this.addForm.value.second_shifting_terminal) + Number(this.addForm.value.terminal_grount_rent) + Number(this.addForm.value.toll_charges) + Number(this.addForm.value.terminal_igst) + this.addForm.value.terminal_cgst + this.addForm.value.terminal_sgst;

		let shipping_total = Number(this.addForm.value.shipping_charges) + Number(this.addForm.value.shipping_grount_rent) + Number(this.addForm.value.shipping_other_charges) + Number(this.addForm.value.shipping_igst) + Number(this.addForm.value.shipping_cgst) + Number(this.addForm.value.shipping_sgst);

		// let storage_total = Number(this.addForm.value.storage_charges) + Number(this.addForm.value.storage_cgst) + Number(this.addForm.value.storage_sgst);


		let fob_total = Number(this.addForm.value.fob_charges) + Number(this.addForm.value.fob_cgst) + Number(this.addForm.value.fob_sgst);

		let citpl_total = Number(this.addForm.value.citpl_charges) + Number(this.addForm.value.citpl_cgst) + Number(this.addForm.value.citpl_sgst);




		this.addForm.patchValue({
			cha_total: cha_total,
			cfs_total: cfs_total,
			terminal_total: terminal_total,
			shipping_total: shipping_total,
			//storage_total: storage_total,
			fob_total: fob_total,
			citpl_total: citpl_total,
		})


	}

	calculateGST(val) {



		if (val == 2) {
			let cfs = this.addForm.value.cfs_charges;
			let scanning = this.addForm.value.scanning_charges;
			let examination = this.addForm.value.examination_charges;
			let grount = this.addForm.value.cfs_grount_rent;
			let cgst = (Number(cfs) + Number(scanning) + Number(examination) + Number(grount)) * (this.cgst_percent_cfs / 100);
			let sgst = (Number(cfs) + Number(scanning) + Number(examination) + Number(grount)) * (this.sgst_percent_cfs / 100);
			this.addForm.patchValue({ cfs_cgst: cgst, cfs_sgst: sgst });
			this.totalCharges();
		}

		if (val == 3) {
			let shipping = Number(this.addForm.value.shipping_charges) + Number(this.addForm.value.shipping_grount_rent) + Number(this.addForm.value.shipping_other_charges);
			//	let shipping_grount_rent = this.addForm.value.shipping_grount_rent;
			let cgst = shipping * (this.cgst_percent_shipping / 100);
			let sgst = shipping * (this.sgst_percent_shipping / 100);
			let igst = shipping * (this.igst_percent_shipping / 100);
			this.addForm.patchValue({ shipping_cgst: cgst, shipping_sgst: sgst, shipping_igst: igst });
			this.totalCharges();
		}

		if (val == 4) {
			let first = this.addForm.value.first_shifting_terminal;
			let second = this.addForm.value.second_shifting_terminal;
			let grount = this.addForm.value.terminal_grount_rent;
			let toll_charges = this.addForm.value.toll_charges;
			let cgst = (Number(first) + Number(second) + Number(grount) + Number(toll_charges)) * (this.cgst_percent_terminal / 100);
			let sgst = (Number(first) + Number(second) + Number(grount) + Number(toll_charges)) * (this.sgst_percent_terminal / 100);
			let igst = (Number(first) + Number(second) + Number(grount) + Number(toll_charges)) * (this.igst_percent_terminal / 100);

			this.addForm.patchValue({ terminal_cgst: cgst, terminal_sgst: sgst, terminal_igst: igst });
			this.totalCharges();
		}

		// if (val == 5) {
		// 	let storage = this.addForm.value.storage_charges;
		// 	let cgst = storage * (this.cgst_percent_storage / 100);
		// 	let sgst = storage * (this.sgst_percent_storage / 100);
		// 	this.addForm.patchValue({ storage_cgst: cgst, storage_sgst: sgst });
		// 	this.totalCharges();
		// }


		if (val == 6) {
			let fob = this.addForm.value.fob_charges;
			let cgst = fob * (this.cgst_percent_fob / 100);
			let sgst = fob * (this.sgst_percent_fob / 100);
			this.addForm.patchValue({ fob_cgst: cgst, fob_sgst: sgst });
			this.totalCharges();
		}

		if (val == 7) {
			let citpl = this.addForm.value.citpl_charges;
			let cgst = citpl * (this.cgst_percent / 100);
			let sgst = citpl * (this.sgst_percent / 100);
			this.addForm.patchValue({ citpl_cgst: cgst, citpl_sgst: sgst });
			this.totalCharges();
		}



	}

	//---------------------------------------------------------------------------------------------------------------------


	//TRANSPORTER SET VALUE -------------------------------------------------------------------------------------------------

	getTransporter() {

		let response1 = this.crudServices.getOne<any>(logistics_charges.getTransporter, {
			bl_id: this.bl_id, port_id: this.port_id,
			container_type: this.setflag,
			charges_head_id: 5,
			bl_date: this.bl_date
		})

		let response2 = this.crudServices.getOne<any>(logistics_charges.getTransporterCharges, { bl_id: this.bl_id, n_id: this.n_id })

		forkJoin([response1, response2]).subscribe(([data1, data2]) => {
			this.trasporter = data1;
			this.transporter_charges = data2;

			let data = [];

			this.transporterArr = this.transporterForm.get('transporterArr') as FormArray;



			this.trasporter.forEach(element => {

				if (this.transporter_charges.length) {
					data = this.transporter_charges.filter(data => data.transporter_id === element.transporter_id)
				}

				if (data.length) {

					let total = Number(data[0].rate) + Number(data[0].detention) + Number(data[0].empty_lift_off) + Number(data[0].cgst) + Number(data[0].sgst);
					this.transporterArr.push(this.fb.group({
						transporter_name: new FormControl(element.sub_org_name),
						transporter_id: new FormControl(element.transporter_id),
						original_rate: new FormControl(element.original_rate),
						cgst_percent: new FormControl(element.cgst_percent),
						sgst_percent: new FormControl(element.sgst_percent),
						bl_id: new FormControl(this.bl_id),
						n_id: new FormControl(this.n_id),
						rate: new FormControl(data[0].rate),
						detention: new FormControl(data[0].detention),
						empty_lift_off: new FormControl(data[0].empty_lift_off),
						remark_transporter: new FormControl(data[0].remark_transporter),
						noc: new FormControl(data[0].noc),
						cgst: new FormControl(data[0].cgst),
						sgst: new FormControl(data[0].sgst),
						total: new FormControl(total),

					}))
				} else {
					this.transporterArr.push(this.fb.group({
						transporter_name: new FormControl(element.sub_org_name),
						transporter_id: new FormControl(element.transporter_id),
						original_rate: new FormControl(element.original_rate),
						cgst_percent: new FormControl(element.cgst_percent),
						sgst_percent: new FormControl(element.sgst_percent),
						bl_id: new FormControl(this.bl_id),
						n_id: new FormControl(this.n_id),
						rate: new FormControl(null),
						detention: new FormControl(null),
						empty_lift_off: new FormControl(null),
						remark_transporter: new FormControl(null),
						noc: new FormControl(null),
						cgst: new FormControl(null),
						sgst: new FormControl(null),
						total: new FormControl(null),

					}))
				}

			});
		})



	}
	calculateTransporterCharge(index) {
		//	((this.bondForm.controls.bondArr as FormArray).at(index) as FormGroup).get('charge_rate').patchValue(total);

		let rate = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.original_rate.value;
		let noc = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.noc.value;
		let detention = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.detention.value;

		let cgst_per = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.cgst_percent.value;
		let sgst_per = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.sgst_percent.value;

		let empty_lift_off = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.empty_lift_off.value;
		let charge = noc * rate;
		let Total = Number(charge) + Number(empty_lift_off) + Number(detention);
		let cgst = Total * ((cgst_per) / 100);
		let sgst = Total * ((sgst_per) / 100);

		let total_cgst_sgst = Total + cgst + sgst;

		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('rate').patchValue(charge);
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('cgst').patchValue(cgst);
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('sgst').patchValue(sgst);
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('total').patchValue(total_cgst_sgst);

	}

	calculateTransporter2(index) {
		let rate = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.rate.value;
		//	let noc = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.noc.value;
		let detention = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.detention.value;

		let empty_lift_off = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.empty_lift_off.value;
		//	let charge = noc * rate;
		let cgst_per = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.cgst_percent.value;
		let sgst_per = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.sgst_percent.value;
		let Total = Number(rate) + Number(empty_lift_off) + Number(detention);
		let cgst = Total * ((cgst_per) / 100);
		let sgst = Total * ((sgst_per) / 100);
		let total_cgst_sgst = Total + Number(cgst) + Number(sgst);

		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('cgst').patchValue(Number(cgst));
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('sgst').patchValue(Number(sgst));
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('total').patchValue(total_cgst_sgst);

	}

	calculateTransporterGstTotal(index) {
		let rate = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.rate.value;
		//	let noc = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.noc.value;
		let detention = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.detention.value;

		let empty_lift_off = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.empty_lift_off.value;
		//	let charge = noc * rate;
		let Total = Number(rate) + Number(empty_lift_off) + Number(detention);
		let cgst = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.cgst.value;
		let sgst = ((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).controls.sgst.value;

		let total_cgst_sgst = Total + Number(cgst) + Number(sgst);

		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('cgst').patchValue(Number(cgst));
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('sgst').patchValue(Number(sgst));
		((this.transporterForm.controls.transporterArr as FormArray).at(index) as FormGroup).get('total').patchValue(total_cgst_sgst);

	}
	//--------------------------------------------------------------------------------------------------
	//STORAGE CHARGES-------------------------------------------------------------------------------------------------------------
	createItemStorage(data): FormGroup {

		if (data != null) {
			let total = Number(data.storage_charges) + Number(data.storage_cgst) + Number(data.storage_sgst);
			return this.fb.group({
				storage_charges: new FormControl(data.storage_charges),
				storage_qty: new FormControl(data.storage_qty),
				storage_cgst: new FormControl(data.storage_cgst),
				storage_sgst: new FormControl(data.storage_sgst),
				storage_remark: new FormControl(data.storage_remark),
				storage_godown: new FormControl(data.storage_godown),
				storage_total: new FormControl(total),

			})
		} else {

			return this.fb.group({
				storage_charges: new FormControl(null),
				storage_qty: new FormControl(null),
				storage_cgst: new FormControl(null),
				storage_sgst: new FormControl(null),
				storage_remark: new FormControl(null),
				storage_godown: new FormControl(null),
				storage_total: new FormControl(null),


			});
		}


	}



	addRowStorage(): void {
		this.storageArr = this.storageForm.get('storageArr') as FormArray;
		this.storageArr.push(this.createItemStorage(null));
	}


	deleteStorage(index: number) {
		this.storageArr = this.storageForm.get('storageArr') as FormArray;
		this.storageArr.removeAt(index);

	}
	getStorage() {



		this.crudServices.getOne<any>(logistics_charges.getStorageCharges, { bl_id: this.bl_id, n_id: this.n_id }).subscribe(response => {
			this.storageArr = this.storageForm.get('storageArr') as FormArray;

			if (response.length) {
				for (let element of response) {
					this.storageArr = this.storageForm.get('storageArr') as FormArray;
					this.storageArr.push(this.createItemStorage(element));

				}

			}


		})





	}
	calculateStorage(index) {
		let storage = ((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).controls.storage_charges.value;
		let cgst = storage * (this.cgst_percent_storage / 100);
		let sgst = storage * (this.sgst_percent_storage / 100);

		let total_cgst_sgst = Number(storage) + Number(cgst) + Number(sgst);

		((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).get('storage_cgst').patchValue(Number(cgst));
		((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).get('storage_sgst').patchValue(Number(sgst));
		((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).get('storage_total').patchValue(total_cgst_sgst);

	}

	calculateStorageGST(index) {
		let storage = ((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).controls.storage_charges.value;
		let cgst = ((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).controls.storage_cgst.value * (this.cgst_percent_storage / 100);
		let sgst = ((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).controls.storage_sgst.value * (this.sgst_percent_storage / 100);

		let total_cgst_sgst = Number(storage) + Number(cgst) + Number(sgst);

		((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).get('storage_cgst').patchValue(Number(cgst));
		((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).get('storage_sgst').patchValue(Number(sgst));
		((this.storageForm.controls.storageArr as FormArray).at(index) as FormGroup).get('storage_total').patchValue(total_cgst_sgst);

	}
	//----------------------------------------------------------------------------------------------------------------------------

	//SUBMIT CHARGESSS------------------------------------------------------------------------------------------------------------
	onSubmitCha() {


		let cha_data = this.chaForm.value.chaArr;
		let data = [];

		cha_data.forEach(element => {
			data.push({
				'bl_id': this.bl_id,
				'n_id': this.n_id,
				'cha_charges': element.cha_charges != '' ? element.cha_charges : 0,
				'cha_other_charges': element.cha_other_charges != '' ? element.cha_other_charges : 0,
				'general_stamp': element.general_stamp != '' ? element.general_stamp : 0,
				'edi': element.edi != '' ? element.edi : 0,
				'cha_cgst': element.cha_cgst != '' ? element.cha_cgst : 0,
				'remark_cha': element.remark_cha,
				'cha_sgst': element.cha_sgst != '' ? element.cha_sgst : 0,
				'gst_percent': this.igst_percent_cha,
				'percent_type': this.taxtypecha

			})
		});

		this.crudServices.addData<any>(logistics_charges.addChaData, data).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})

	}

	onSubmitTerminal() {

		let data = {
			'bl_id': this.bl_id,
			'n_id': this.n_id,
			'first_shifting_terminal': this.addForm.value.first_shifting_terminal,
			'second_shifting_terminal': this.addForm.value.second_shifting_terminal,
			'terminal_grount_rent': this.addForm.value.terminal_grount_rent,
			'toll_charges': this.addForm.value.toll_charges,
			'terminal_cgst': this.addForm.value.terminal_cgst,
			'terminal_sgst': this.addForm.value.terminal_sgst,
			'terminal_igst': this.addForm.value.terminal_igst,
			'remark_terminal': this.addForm.value.remark_terminal,
			'gst_percent_terminal': this.igst_percent_terminal,
			'percent_type_terminal': this.taxtypeterminal,


		}


		let fileData: any = new FormData();
		const document: Array<File> = this.terminal_doc;


		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('terminal_charges_doc', document[i], document[i]['name']);
			}



			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let filesList = [];

				if (res.uploads.terminal_charges_doc) {
					filesList = res.uploads.terminal_charges_doc;
					for (let i = 0; i < filesList.length; i++) {
						this.terminalFile.push(filesList[i].location);
					}

				}
				if (this.terminalFile.length) {
					data['terminal_doc'] = JSON.stringify(this.terminalFile);
				}
				this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
				})
			})
		} else {
			this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
			})
		}
	}

	onSubmitShipping() {


		let data = {
			'bl_id': this.bl_id,
			'n_id': this.n_id,
			'shipping_charges': this.addForm.value.shipping_charges,
			'shipping_other_charges': this.addForm.value.shipping_other_charges,
			'shipping_grount_rent': this.addForm.value.shipping_grount_rent,
			'shipping_cgst': this.addForm.value.shipping_cgst,
			'shipping_sgst': this.addForm.value.shipping_sgst,
			'shipping_igst': this.addForm.value.shipping_igst,
			'remark_shipping': this.addForm.value.remark_shipping,
			'gst_percent_shipping': this.igst_percent_shipping,
			'percent_type_shipping': this.taxtypeshipping,

		}

		let fileData: any = new FormData();
		const document: Array<File> = this.shipping_doc;


		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('shipping_charges_doc', document[i], document[i]['name']);
			}



			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let filesList = [];
				if (res.uploads.shipping_charges_doc) {
					filesList = res.uploads.shipping_charges_doc;
					for (let i = 0; i < filesList.length; i++) {
						this.shippingFile.push(filesList[i].location);
					}

				}
				if (this.shippingFile.length) {
					data['shipping_doc'] = JSON.stringify(this.shippingFile);
				}
				this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
				})
			})
		} else {
			this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
			})

		}




	}

	onSubmitCfs() {



		let data = {
			'bl_id': this.bl_id,
			'n_id': this.n_id,
			'cfs_charges': this.addForm.value.cfs_charges,
			'cfs_cgst': this.addForm.value.cfs_cgst,
			'cfs_sgst': this.addForm.value.cfs_sgst,
			'scanning_charges': this.addForm.value.scanning_charges,
			'examination_charges': this.addForm.value.examination_charges,
			'cfs_grount_rent': this.addForm.value.cfs_grount_rent,
			'remark_cfs': this.addForm.value.remark_cfs,
			'percent_type_cfs': this.taxtypecfs,
			'gst_percent_cfs': this.igst_percent_cfs

		}

		let fileData: any = new FormData();
		const document: Array<File> = this.cfs_doc;

		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('cfs_charges_doc', document[i], document[i]['name']);
			}



			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

				let filesList = [];

				if (res.uploads.cfs_charges_doc) {
					filesList = res.uploads.cfs_charges_doc;
					for (let i = 0; i < filesList.length; i++) {
						this.cfsFile.push(filesList[i].location);
					}

				}
				if (this.cfsFile.length) {
					data['cfs_doc'] = JSON.stringify(this.cfsFile);
				}
				this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
				})
			})
		} else {
			this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
			})
		}
	}

	submitBondCharges() {

		let bond_data = this.bondForm.value.bondArr;
		let data = [];

		bond_data.forEach(element => {
			data.push({
				'bl_id': this.bl_id,
				'n_id': this.n_id,
				'be_id': element.be_id,
				'from_date': this.datepipe.transform(element.from_date, 'yyyy-MM-dd'),
				'to_date': this.datepipe.transform(element.to_date, 'yyyy-MM-dd'),
				'weeks': element.weeks,
				'noc': element.noc != '' ? element.noc : 0,
				'charge_rate': element.charge_rate != '' ? element.charge_rate : 0,
				'cgst': element.cgst != '' ? element.cgst : 0,
				'sgst': element.sgst != '' ? element.sgst : 0,
				'percent_type': this.taxtypebond,
				'gst_percent': this.igst_percent_bond

			})
		});



		this.crudServices.addData<any>(logistics_charges.addbond, data).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})


	}

	submitTransporterCharges() {

		let transporter_data = this.transporterForm.value.transporterArr;
		let data = [];

		transporter_data.forEach(element => {
			data.push({
				'bl_id': this.bl_id,
				'n_id': this.n_id,
				'transporter_id': element.transporter_id,
				'detention': element.detention != '' ? element.detention : 0,
				'empty_lift_off': element.empty_lift_off != '' ? element.empty_lift_off : 0,
				'remark_transporter': element.remark_transporter,
				'noc': element.noc != '' ? element.noc : 0,
				'rate': element.rate != '' ? element.rate : 0,
				'cgst': element.cgst != '' ? element.cgst : 0,
				'sgst': element.sgst != '' ? element.sgst : 0,
			})
		});

		this.crudServices.addData<any>(logistics_charges.addTransporterData, data).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})


	}

	onSubmitStorage() {

		let storage_data = this.storageForm.value.storageArr;
		let data = [];

		storage_data.forEach(element => {
			data.push({

				'bl_id': this.bl_id,
				'n_id': this.n_id,
				'storage_charges': element.storage_charges,
				'storage_godown': element.storage_godown,
				'storage_qty': element.storage_qty,
				'storage_remark': element.storage_remark,
				'storage_cgst': element.storage_cgst,
				'storage_sgst': element.storage_sgst,
				'gst_percent_storage': this.igst_percent_storage,
				'percent_type_storage': this.taxtypestorage,

			})
		});

		this.crudServices.addData<any>(logistics_charges.addStorageData, data).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})

		// let data = {
		// 	'bl_id': this.bl_id,
		// 	'n_id': this.n_id,
		// 	'storage_charges': this.addForm.value.storage_charges,
		// 	'storage_godown': this.addForm.value.storage_godown,
		// 	'storage_qty': this.addForm.value.storage_qty,
		// 	'storage_remark': this.addForm.value.storage_remark,
		// 	'storage_cgst': this.addForm.value.storage_cgst,
		// 	'storage_sgst': this.addForm.value.storage_sgst,
		// 	'gst_percent_storage': this.igst_percent_storage,
		// 	'percent_type_storage': this.taxtypestorage,

		// }

		// let fileData: any = new FormData();
		// const document: Array<File> = this.storage_doc;

		// if (document.length > 0) {
		// 	for (let i = 0; i < document.length; i++) {
		// 		fileData.append('storage_charges_doc', document[i], document[i]['name']);
		// 		console.log(fileData, 'DATA');
		// 	}



		// 	this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {



		// 		let filesList = [];

		// 		if (res.uploads.storage_charges_doc) {
		// 			filesList = res.uploads.storage_charges_doc;
		// 			for (let i = 0; i < filesList.length; i++) {
		// 				this.storageFile.push(filesList[i].location);
		// 			}

		// 		}
		// 		if (this.storageFile.length) {
		// 			data['storage_doc'] = JSON.stringify(this.storageFile);
		// 		}
		// 		//
		// 		console.log(data);
		// 		this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
		// 			console.log(response);

		// 			this.toasterService.pop(response.message, response.message, response.data);
		// 		})
		// 	})
		// } else {

		// 	this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
		// 		console.log(response);

		// 		this.toasterService.pop(response.message, response.message, response.data);
		// 	})

		// }




	}

	onSubmitFob() {
		let data = {
			'bl_id': this.bl_id,
			'n_id': this.n_id,
			'fob_charges': this.addForm.value.fob_charges,
			'fob_cgst': this.addForm.value.fob_cgst,
			'fob_sgst': this.addForm.value.fob_sgst,
			'fob_remark': this.addForm.value.fob_remark,
			'gst_percent_fob': this.igst_percent_fob,
			'percent_type_fob': this.taxtypefob,

		}

		let fileData: any = new FormData();
		const document: Array<File> = this.fob_doc;

		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('fob_charges_doc', document[i], document[i]['name']);
			}



			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let filesList = [];

				if (res.uploads.fob_charges_doc) {
					filesList = res.uploads.fob_charges_doc;
					for (let i = 0; i < filesList.length; i++) {
						this.fobFile.push(filesList[i].location);
					}

				}
				if (this.fobFile.length) {
					data['fob_doc'] = JSON.stringify(this.fobFile);
				}

				this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
				})
			})
		} else {

			this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
			})

		}

	}

	onSubmitCitpl() {


		let data = {
			'bl_id': this.bl_id,
			'n_id': this.n_id,
			'citpl_charges': this.addForm.value.citpl_charges,
			'citpl_cgst': this.addForm.value.citpl_cgst,
			'citpl_sgst': this.addForm.value.citpl_sgst,

		}

		this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {

			this.toasterService.pop(response.message, response.message, response.data);
		})


	}

	//--------------------------------------------------------------------------------------------------------------------



	setZero(e, val) {

		if (e.target.value == undefined || e.target.value == null || e.target.value == '') {
			let obj = {};
			obj[val] = 0;
			this.addForm.patchValue(obj);
			e.target.value = 0;
		}
	}


	onSubmitFlag(event) {

		let val = 0
		if (event) {
			val = 1;
		}

		this.crudServices.updateData<any>(billOfLading.updateChargesStatus, { data: { charges_submited_flag: val }, bl_id: this.bl_id }).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop('error', 'error', 'Something went wrong');
			}
		})

	}

	taxApplied(event, name, taxtype) {
		let val = 0

		if (event) {
			if (name == 'shipping') {
				if (taxtype == 'cgst') {
					let shipping = Number(this.addForm.value.shipping_charges) + Number(this.addForm.value.shipping_grount_rent);
					let cgst = shipping * (this.cgst_percent_shipping / 100);
					this.addForm.patchValue({ shipping_cgst: cgst });
					this.totalCharges();
				}

				if (taxtype == 'sgst') {
					let shipping = Number(this.addForm.value.shipping_charges) + Number(this.addForm.value.shipping_grount_rent);
					let sgst = shipping * (this.sgst_percent_shipping / 100);
					this.addForm.patchValue({ shipping_sgst: sgst });
					this.totalCharges();

				}
				if (taxtype == 'igst') {
					let shipping = Number(this.addForm.value.shipping_charges) + Number(this.addForm.value.shipping_grount_rent);
					let igst = shipping * (this.igst_percent_shipping / 100);
					this.addForm.patchValue({ shipping_igst: igst });
					this.totalCharges();

				}
			}

			if (name == 'terminal') {
				if (taxtype == 'cgst') {
					let first = this.addForm.value.first_shifting_terminal;
					let second = this.addForm.value.second_shifting_terminal;
					let grount = this.addForm.value.terminal_grount_rent;
					let cgst = (Number(first) + Number(second) + Number(grount)) * (this.cgst_percent_terminal / 100);
					this.addForm.patchValue({ terminal_cgst: cgst });
					this.totalCharges();
				}

				if (taxtype == 'sgst') {
					let first = this.addForm.value.first_shifting_terminal;
					let second = this.addForm.value.second_shifting_terminal;
					let grount = this.addForm.value.terminal_grount_rent;
					let sgst = (Number(first) + Number(second) + Number(grount)) * (this.sgst_percent_terminal / 100);
					this.addForm.patchValue({ terminal_sgst: sgst });
					this.totalCharges();

				}
				if (taxtype == 'igst') {
					let first = this.addForm.value.first_shifting_terminal;
					let second = this.addForm.value.second_shifting_terminal;
					let grount = this.addForm.value.terminal_grount_rent;
					let igst = (Number(first) + Number(second) + Number(grount)) * (this.igst_percent_terminal / 100);
					this.addForm.patchValue({ terminal_igst: igst });
					this.totalCharges();

				}
			}
		}
		else {
			if (name == 'shipping') {
				if (taxtype == 'cgst') {

					this.addForm.patchValue({ shipping_cgst: 0 });
					this.totalCharges();
				}

				if (taxtype == 'sgst') {
					this.addForm.patchValue({ shipping_sgst: 0 });
					this.totalCharges();

				}
				if (taxtype == 'igst') {
					this.addForm.patchValue({ shipping_igst: 0 });
					this.totalCharges();

				}
			}

			if (name == 'terminal') {
				if (taxtype == 'cgst') {

					this.addForm.patchValue({ terminal_cgst: 0 });
					this.totalCharges();
				}

				if (taxtype == 'sgst') {
					this.addForm.patchValue({ terminal_sgst: 0 });
					this.totalCharges();

				}
				if (taxtype == 'igst') {
					this.addForm.patchValue({ terminal_igst: 0 });
					this.totalCharges();

				}
			}
		}



	}

	//DOCUMENT UPLOAD AND REMOVE --------------------------------------------------------------------------

	cfsDoc(event: any) {
		this.cfs_doc = <Array<File>>event.target.files;
	}

	shippingDoc(event: any) {
		this.shipping_doc = <Array<File>>event.target.files;
	}

	terminalDoc(event: any) {
		this.terminal_doc = <Array<File>>event.target.files;
	}

	// storageDoc(event: any) {
	// 	this.storage_doc = <Array<File>>event.target.files;
	// }

	fobDoc(event: any) {
		this.fob_doc = <Array<File>>event.target.files;
	}


	documentUpload(event: any, FolderName, FieldName, fileArr) {
		let Document = <Array<File>>event.target.files;
		let fileData: any = new FormData();
		for (let i = 0; i < Document.length; i++) {
			fileData.append(FolderName, Document[i], Document[i]['name']);
		}


		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
			let filesList = [];
			let data = {
				'bl_id': this.bl_id,
				'n_id': this.n_id
			}

			if (res.uploads[FolderName]) {
				filesList = res.uploads[FolderName];
				for (let i = 0; i < filesList.length; i++) {
					this[fileArr].push(filesList[i].location);
				}

			}
			if (this[fileArr].length) {
				data[FieldName] = JSON.stringify(this[fileArr]);
			}
			this.crudServices.updateData<any>(chacharges.updateCharges, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
			})
		})
	}

	deleteInvoice(arr, doc, name) {

		this.deleteFile.deleteDoc(arr, doc, name, { 'bl_id': this.bl_id, 'n_id': this.n_id }, chacharges.updateCharges).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data)
		})

	}

	//----------------------------------------------------------------------------------------------------------------------






}
