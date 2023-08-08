
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';
import { PaymentTermService } from '../../masters/payment-term-master/payment-term-service';
import { GradeMasterService } from '../../masters/grade-master/grade-master-service';
import { PortMasterService } from '../../masters/port-master/port-master-service';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { Currency } from '../../../shared/dropdown-services/currency';
import { Unit } from '../../../shared/dropdown-services/unit';
import { Packing } from '../../../shared/dropdown-services/packing';
import { Pi_insurance } from '../../../shared/dropdown-services/pi_insurance';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { AddGradeService } from '../add-grade-port/add-grade-service';

import { ProformaInvoiceService, ProformaInvoiceList } from './proforma-invoice-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { CommonApis, FileUpload, GradeMaster, MaterialLoadPortMaster, PortMaster, SpiplBankMaster, SubOrg, gradeAssortment, subOrgRespectiveBank, flcProformaInvoice, PaymentTermMaster, ValueStore, Notifications, NotificationsUserRel, UsersNotification, HighSeasOrders, TransnationalSales } from '../../../shared/apis-path/apis-path';
import { Subscription } from 'rxjs';
import { timeStamp } from 'console';
import { MessagingService } from '../../../service/messaging.service';




@Component({
	selector: 'app-proforma-invoice',
	templateUrl: './proforma-invoice.component.html',
	styleUrls: ['./proforma-invoice.component.css'],
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		SpiplBankService,
		OrgBankService,
		PaymentTermService,
		GradeMasterService,
		PortMasterService,
		SelectService,
		MainSubOrgService,
		AddGradeService,
		ProformaInvoiceService,
		CrudServices,
		MessagingService
	]
})
export class ProformaInvoiceComponent implements OnInit, OnDestroy {
	add_new_click: boolean = false;
	preview: boolean = false;
	isLoading = false;
	count = 0;
	bsValue: Date = new Date();
	dateInputFormat = 'Y-m-d';
	public yearMask = [/\d/, /\d/, /\d/, /\d/];
	filterQuery = '';
	filterArray = [];
	data: ProformaInvoiceList;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	material_load_port: string;

	public today = new Date();
	serverUrl: string;
	user: UserDetails;
	links: string[] = [];
	addPIForm: FormGroup;
	edit_pi = false;
	delete_pi = false;
	// dropdowns
	spipl_bank = [];
	org_bank = [];
	import_load_port = [];
	month = [];
	paymentTerm = [];
	grade_list = [];
	port_list = [];
	sub_org = [];
	highseas_orders = [];

	sub_org_indent = [];
	pi_flag = [];
	highSeasPi: boolean = false;

	forwardSalePi: boolean = false;
	transnationalSalePi: boolean = false;


	// dropdowns
	unit_list: Unit;
	currency: Currency;
	packing: Packing;

	pi_insurance: Pi_insurance;
	id: number;
	date = new Date();

	payTermBasedOnFlag: boolean = false;
	quantity_limit: boolean = false;

	// sub organization
	sub_org_id: number;
	sub_org_name: string;
	org_address: string;

	// form variable
	docs: Array<File> = [];
	spiplbank: string;
	first_adv_bank: string;
	second_adv_bank: string;
	month_name: string;
	pay: string;
	port: string;
	unit: string;
	grade_value = '';
	insurance: string;
	packing_mat: string;
	docsview: string;
	currentYear: Number;
	currentMonth: Number;
	flag: string;
	curr: string;
	pi_qty: number = 0;
	pirate: number = 0;
	total_amt: any = 0;



	buyer: string;
	// buyer_company: number;
	buyer_address: string;

	// ga details
	ga_grade: String;
	ga_port: String;
	ga_quantity = 0;
	ga_rate: Number;
	balance_ga: string;
	fs_deal_id: Number;
	remainig_qty = 0;


	arv_date = '';
	rmk = '';
	invoice_no = '';
	invoice_date = '';
	dep_date = '';
	load_port = '';
	our_sub_org_id: any;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});


	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;
	optradio: any = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private messagingService: MessagingService,
		private CrudServices: CrudServices
	) {

		console.log("step 1");
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.edit_pi = (this.links.indexOf('edit pi') > -1);
		this.delete_pi = (this.links.indexOf('delete pi') > -1);




		this.CrudServices.getAll<any>(MaterialLoadPortMaster.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.import_load_port = response.data;
			}
		});

		//Get Our bank - banktype 1 for our bank
		this.CrudServices.getOne<any>(SpiplBankMaster.bankType, {
			bank_type: 1
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.spipl_bank = response;
			}

		});

		// this.SpiplService.getBankListType(1).subscribe((response) => {
		// 	this.spipl_bank = response;
		// 	console.log(response, "bankkkk");
		// });



		//Get LC payment Term paytype 1 for LC
		// this.paymentTermService.getPaymentTermType(1).subscribe((response) => {
		//   this.paymentTerm = response;
		//   console.log(response,"paym");
		// });

		this.CrudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.grade_list = response;
			}
		});

		// this.gradeService.getGrades().subscribe((response) => {
		// 	console.log(response, "Grades");
		// 	this.grade_list = response;
		// });

		this.CrudServices.getAll<any>(PortMaster.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.port_list = response;
			}
		});

		// this.portservice.getData().subscribe((response) => {
		// 	this.port_list = response;
		// });


		this.CrudServices.getAll<any>(CommonApis.getAllCurrency).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.currency = response;
			}
		});

		// this.selectService.getCurrency().subscribe((response) => {
		// 	this.currency = response;

		// });

		this.CrudServices.getAll<any>(CommonApis.getAllMaterialPack).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.packing = response;
			}
		});

		// this.selectService.getPacking().subscribe((response) => {
		// 	this.packing = response;

		// });

		this.CrudServices.getAll<any>(CommonApis.getPiInsurance).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.pi_insurance = response;
			}
		});
		// this.selectService.getPiInsurance().subscribe((response) => {
		// 	this.pi_insurance = response;
		// });

		this.CrudServices.getAll<any>(CommonApis.getAllUnitDrumMt).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.unit_list = response;
			}

		});
		// this.selectService.getUnit().subscribe((response) => {
		// 	this.unit_list = response;
		// });

		// this.CrudServices.getAll<any>(SubOrg.get_sub_org).subscribe((response) => {
		// 	if (response.code === "101") {
		// 		this.toasterService.pop(response.message, response.message, response.data);
		// 	} else {
		// 		this.sub_org = response;
		// 	}

		// });

		this.CrudServices.postRequest<any>(SubOrg.getSubOrgListNew, {
			category_id: 61
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sub_org_indent = response;
				//this.addPIForm.patchValue({buyer_id : 25 });
				this.setSelectedOnEdit(25, this.sub_org_indent, 'sub_org_name', 'buyer', 'sub_org_id');
			}

		});

		this.CrudServices.postRequest<any>(SubOrg.getSubOrgListNew, {
			category_id: 51
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sub_org = response;

			}

		});

		// this.subOrgService.getSubOrg().subscribe((response) => {
		// 	this.sub_org = response;
		// 	// this.setSelectedOnEdit('4', this.sub_org, 'sub_org_name', 'buyer', 'sub_org_id');
		// });






		this.month = [
			{ 'name': 'January', 'id': 1 },
			{ 'name': 'February', 'id': 2 },
			{ 'name': 'March', 'id': 3 },
			{ 'name': 'April', 'id': 4 },
			{ 'name': 'May', 'id': 5 },
			{ 'name': 'June', 'id': 6 },
			{ 'name': 'July', 'id': 7 },
			{ 'name': 'August', 'id': 8 },
			{ 'name': 'September', 'id': 9 },
			{ 'name': 'October', 'id': 10 },
			{ 'name': 'November', 'id': 11 },
			{ 'name': 'December', 'id': 12 },
		];

		this.pi_flag = [{ 'name': 'LC PI', 'id': 1 }, { 'name': 'NON-LC PI', 'id': 2 }, { 'name': 'Indent PI', 'id': 3 }];

		this.addPIForm = new FormGroup({

			'proform_invoice_no': new FormControl(null, Validators.required),
			'proform_invoice_date': new FormControl(null, Validators.required),
			'buyer_id': new FormControl(null),
			'supplier_id': new FormControl(null, Validators.required),
			'first_advising_bank_id': new FormControl(null, Validators.required),
			'second_advising_bank_id': new FormControl(null, Validators.required),
			'buyer_bank_id': new FormControl(null),
			'shipment_year': new FormControl(null, Validators.required),
			'shipment_month': new FormControl(null, Validators.required),
			'payment_term': new FormControl(null, Validators.required),
			'material_load_port': new FormControl(null, Validators.required),
			'destination_port_id': new FormControl(null, Validators.required),
			'pi_quantity': new FormControl(null, Validators.required),
			'pi_rate': new FormControl(null, Validators.required),
			'total_pi_amount': new FormControl(null, Validators.required),
			'currency_id': new FormControl(null, Validators.required),
			'pi_insurance_id': new FormControl(null, Validators.required),
			'unit_id': new FormControl(null, Validators.required),
			'material_pack_id': new FormControl(null, Validators.required),
			'remark': new FormControl(null),
			'pi_copy': new FormControl(null),
			'pi_flag': new FormControl(null, Validators.required),
			'grade_id': new FormControl(null, Validators.required),
			'tentitive_departure_date': new FormControl(null),
			'tentitive_arrival_date': new FormControl(null),
			'grade_assort_id': new FormControl(null),
			'high_seas_pi': new FormControl(null),
			'forward_sale_pi': new FormControl(null),
			'transnational_sale_pi': new FormControl(null),
			'pi_high_seas_id': new FormControl(null),

			'id': new FormControl(null)
		});


		this.CrudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			console.log(response, "valuestore");
			for (let elem of response) {
				if (elem.thekey == "our_sub_org_id") {
					this.our_sub_org_id = elem.value;
					this.addPIForm.controls['buyer_id'].setValue(Number(elem.value));
					this.CrudServices.postRequest<any>(SubOrg.get_one_sub_org, {
						sub_org_id: this.our_sub_org_id
					}).subscribe((res) => {
						this.buyer = res[0]['sub_org_name'];
						this.buyer_address = res[0]['org_address'];
					});
				}
			}

			console.log(this.our_sub_org_id, "this.our_sub_org_id DEBUG_VIEW")
		});

		this.CrudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
			status: 0
		}).subscribe(res => {
			if (res.code === "101") {
				this.toasterService.pop(res.message, res.message, res.data);
			} else {
				console.log(res, "highSeasOrder")
				this.highseas_orders = res.data;

			}
		});

	}

	ngOnInit() {
		console.log("step 2");




		this.route.params.subscribe((params: Params) => {
			this.id = +params['ga_id'];

			this.CrudServices.getOne<any>(gradeAssortment.getSupplierDetail, {
				id: this.id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.sub_org_id = response[0]['sub_org_id'];
					this.sub_org_name = response[0]['sub_org_name'];
					this.org_address = response[0]['org_address'];
					this.addPIForm.controls['supplier_id'].setValue(this.sub_org_id);



					this.CrudServices.getOne<any>(subOrgRespectiveBank.getPerticularOrgBank, {
						sub_org_id: this.sub_org_id
					}).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							this.org_bank = response;
						}
					});
					// this.BankService.getOrgBank(this.sub_org_id)
					// 	.subscribe((result) => {
					// 		this.org_bank = result;
					// 	});
				}

			});

			// this.addGradeService.getSupplierDetail(this.id).subscribe((response) => {
			// 	this.sub_org_id = response[0]['sub_org_id'];
			// 	this.sub_org_name = response[0]['sub_org_name'];
			// 	this.org_address = response[0]['org_address'];
			// 	this.addPIForm.controls['supplier_id'].setValue(this.sub_org_id);
			// 	this.BankService.getOrgBank(this.sub_org_id)
			// 		.subscribe((result) => {
			// 			this.org_bank = result;
			// 		});
			// });

			this.CrudServices.getOne<any>(gradeAssortment.getOneGa, {
				id: this.id
			}).subscribe((response) => {

				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.ga_grade = response[0]['grade_name'];
					this.ga_port = response[0]['port_name'];
					this.ga_quantity = Number(response[0]['ga_quantity']);
					this.ga_rate = response[0]['ga_rate'];
					this.fs_deal_id = response[0]['fs_deal_id'];
				}

				this.get_pi();

			});

			// this.addGradeService.getGa(this.id).subscribe((response) => {
			// 	if (response) {
			// 		this.ga_grade = response[0]['grade_name'];
			// 		this.ga_port = response[0]['port_name'];
			// 		this.ga_quantity = Number(response[0]['ga_quantity']);
			// 		this.ga_rate = response[0]['ga_rate'];
			// 		this.fs_deal_id = response[0]['fs_deal_id'];
			// 	}
			// 	this.get_pi();
			// });
		});

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		this.currentMonth = Number(this.datepipe.transform(this.date, 'M'));
		this.setSelectedOnEdit(this.currentMonth, this.month, 'name', 'month_name', 'id');


	}


	onEdit(id: number) {
		this.add_new_click = true;
		this.preview = true;

		if (id) {
			let buyer_id: number;
			let proform_invoice_no: string;
			let proform_invoice_date: string;
			let supplier_id: Number;
			let first_advising_bank_id: Number;
			let second_advising_bank_id: Number;
			let buyer_bank_id: Number;
			let shipment_year: Number;
			let shipment_month: string;
			let material_load_port: string;
			let destination_port_id: Number;
			let pi_quantity: string;
			let pi_rate: string;
			let total_pi_amount = '';
			let currency_id: Number;
			let pi_insurance_id: Number;
			let unit_id: Number;
			let material_pack_id: Number;
			let remark: string;
			let pi_copy: string;
			let grade_id: Number;
			let tentitive_departure_date: string;
			let tentitive_arrival_date: string;
			let grade_assort_id: Number;
			let high_seas_pi: Number;
			let piflag: Number;
			let pi_high_seas_id: Number;

			this.CrudServices.getOne<any>(flcProformaInvoice.getOnePi, {
				id: id
			}).subscribe((response) => {

				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {


					buyer_id = response[0]['buyer_id'];
					pi_high_seas_id = response[0]['pi_high_seas_id'];
					proform_invoice_no = response[0]['proform_invoice_no'];
					proform_invoice_date = response[0]['proform_invoice_date'];
					supplier_id = response[0]['supplier_id'];
					first_advising_bank_id = response[0]['first_advising_bank_id'];
					second_advising_bank_id = response[0]['second_advising_bank_id'];
					buyer_bank_id = response[0]['buyer_bank_id'];
					shipment_year = response[0]['shipment_year'];
					shipment_month = response[0]['shipment_month'];
					if (response[0]['pi_flag'] === 2) {
						this.addPIForm.controls['payment_term'].setValue(response[0]['payment_term']);
					} else {
						this.addPIForm.controls['payment_term'].setValue(Number(response[0]['payment_term']));
					}

					material_load_port = response[0]['material_load_port'];
					destination_port_id = response[0]['destination_port_id'];
					pi_quantity = response[0]['pi_quantity'];
					pi_rate = response[0]['pi_rate'];
					total_pi_amount = response[0]['total_pi_amount'];
					currency_id = response[0]['currency_id'];
					pi_insurance_id = response[0]['pi_insurance_id'];
					unit_id = response[0]['unit_id'];
					material_pack_id = response[0]['material_pack_id'];
					remark = response[0]['remark'];
					piflag = response[0]['pi_flag'];

					if (response[0]['pi_copy']) {
						pi_copy = JSON.parse(response[0]['pi_copy']);
					}
					grade_id = response[0]['grade_id'];
					tentitive_departure_date = response[0]['tentitive_departure_date'];
					tentitive_arrival_date = response[0]['tentitive_arrival_date'];
					grade_assort_id = response[0]['grade_assort_id'];
					console.log(response[0]['high_seas_pi'], "highSeas")
					high_seas_pi = response[0]['high_seas_pi'];

					if (response[0]['high_seas_pi']) {
						this.CrudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
							status: 0
						}).subscribe(res => {
							if (res.code === "101") {
								this.toasterService.pop(res.message, res.message, res.data);
							} else {
								console.log(res, "highSeasOrder")
								this.highseas_orders = res.data;

							}
						});
						this.highSeasPi = true;
					} else {
						this.highSeasPi = false;
					}

					if (response[0]['forward_sale_pi']) {
						this.CrudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
							status: 0
						}).subscribe(res => {
							if (res.code === "101") {
								this.toasterService.pop(res.message, res.message, res.data);
							} else {
								console.log(res, "highSeasOrder")
								this.highseas_orders = res.data;

							}
						});
						this.forwardSalePi = true;
					} else {
						this.forwardSalePi = false;
					}


					if (response[0]['transnational_sale_pi']) {
						this.transnationalSalePi = true;

						this.CrudServices.getOne<any>(TransnationalSales.getTransnationalSalesOrders, {}).subscribe(response => {

							this.highseas_orders = response.map(item => {
								item.soid_custname = `${item.id}- ${item.customer}`;
								return item;
							})
							console.log(this.highseas_orders);


						})

					} else {
						this.transnationalSalePi = false;
					}

					this.addPIForm.controls['buyer_id'].setValue(buyer_id);
					this.addPIForm.controls['pi_high_seas_id'].setValue(pi_high_seas_id);
					this.addPIForm.controls['proform_invoice_no'].setValue(proform_invoice_no);
					this.addPIForm.controls['proform_invoice_date'].setValue(proform_invoice_date);
					this.addPIForm.controls['supplier_id'].setValue(supplier_id);
					this.addPIForm.controls['first_advising_bank_id'].setValue(first_advising_bank_id);
					this.addPIForm.controls['buyer_bank_id'].setValue(buyer_bank_id);
					this.addPIForm.controls['second_advising_bank_id'].setValue(second_advising_bank_id);
					this.addPIForm.controls['shipment_year'].setValue(shipment_year);
					this.addPIForm.controls['shipment_month'].setValue(shipment_month);
					this.addPIForm.controls['material_load_port'].setValue(material_load_port);
					this.addPIForm.controls['pi_quantity'].setValue(pi_quantity);
					this.addPIForm.controls['pi_rate'].setValue(pi_rate);
					this.addPIForm.controls['total_pi_amount'].setValue(total_pi_amount);
					this.addPIForm.controls['currency_id'].setValue(currency_id);
					this.addPIForm.controls['pi_insurance_id'].setValue(pi_insurance_id);
					this.addPIForm.controls['unit_id'].setValue(unit_id);
					this.addPIForm.controls['material_pack_id'].setValue(material_pack_id);
					this.addPIForm.controls['remark'].setValue(remark);
					this.addPIForm.controls['grade_id'].setValue(grade_id);
					this.addPIForm.controls['destination_port_id'].setValue(destination_port_id);
					this.addPIForm.controls['tentitive_departure_date'].setValue(tentitive_departure_date);
					this.addPIForm.controls['tentitive_arrival_date'].setValue(tentitive_arrival_date);
					this.addPIForm.controls['pi_flag'].setValue(piflag);
					this.addPIForm.controls['remark'].setValue(remark);
					this.addPIForm.controls['id'].setValue(id);
					this.addPIForm.controls['high_seas_pi'].setValue(high_seas_pi);


					if (pi_copy) {
						let html = '';
						this.docsview = '';
						for (const val of pi_copy) {
							html = html + '<a href="' + this.serverUrl + val + '" class="btn btn-danger btn-sm " target="_blank">Uploaded Doc</a>';
							this.docsview = this.docsview + html;
						}
					}


					this.spiplbank = response[0]['buyerBankName'];
					this.first_adv_bank = response[0]['firstAdvBank'];
					this.second_adv_bank = response[0]['secondAdvBank'];
					this.pay = response[0]['paymentTerm'];
					this.port = response[0]['destinationPort'];
					this.load_port = response[0]['loadPort'];
					this.curr = response[0]['currency'];
					this.unit = response[0]['unit'];
					this.grade_value = response[0]['gradeName'];
					this.insurance = response[0]['piInsuranceType'];
					this.packing_mat = response[0]['materialPackType'];
					this.flag = response[0]['materialPackType'];
					this.packing_mat = response[0]['materialPackType'];
					this.buyer = response[0]['buyerOrgName'];
					this.sub_org_name = response[0]['suppierOrgName'];
					this.sub_org_id = Number(response[0]['supplier_id']);
					this.org_address = response[0]['suppierOrgAddress'];
					this.setSelectedOnEdit(shipment_month, this.month, 'name', 'month_name', 'id');
					this.setSelectedOnEdit(piflag, this.pi_flag, 'name', 'flag', 'id');

				}
			});


		}


	}

	onSubmit() {
		if (!this.addPIForm.invalid) {

			let paymentArray = [];
			if (this.addPIForm.value.pi_flag != 2) {
				paymentArray.push(this.addPIForm.value.payment_term);
			} else {

				paymentArray = this.addPIForm.value.payment_term;

			}

			let remarkdb = '';
			if (this.addPIForm.value.remark !== null) {
				remarkdb = this.addPIForm.value.remark;
			}

			let highSeasPiFlag = 0;
			if (this.addPIForm.value.high_seas_pi) {
				highSeasPiFlag = 1;
			}


			let forwardSalePiFlag = 0;
			if (this.addPIForm.value.forward_sale_pi) {
				forwardSalePiFlag = 1;
			}


			let transnationalSalePiFlag = 0;
			if (this.addPIForm.value.transnational_sale_pi) {
				transnationalSalePiFlag = 1;
			}



			let gradeConditionCheckFlag = this.grade_list.filter((item) => item.company_id == 1).filter((item2) => item2.grade_id == this.addPIForm.value.grade_id).length > 0;
			console.log(this.addPIForm.value.forward_sale_pi, "forward_sale_pi_Flag");
			console.log(gradeConditionCheckFlag, "gradeConditionCheckFlag");
			let purchase_hold_qty_flag = 0;
			if ((this.addPIForm.value.forward_sale_pi === null || this.addPIForm.value.forward_sale_pi === false) && gradeConditionCheckFlag === true) {
				purchase_hold_qty_flag = 1
			}
			console.log(purchase_hold_qty_flag, "purchase_hold_qty_flag");

			let formData: any = {
				proform_invoice_no: this.addPIForm.value.proform_invoice_no,
				proform_invoice_date: this.convert(this.addPIForm.value.proform_invoice_date),
				buyer_id: this.addPIForm.value.buyer_id,
				pi_high_seas_id: this.addPIForm.value.pi_high_seas_id,
				supplier_id: this.addPIForm.value.supplier_id,
				first_advising_bank_id: this.addPIForm.value.first_advising_bank_id,
				second_advising_bank_id: this.addPIForm.value.second_advising_bank_id,
				buyer_bank_id: this.addPIForm.value.buyer_bank_id,
				shipment_year: this.addPIForm.value.shipment_year,
				shipment_month: this.addPIForm.value.shipment_month,
				payment_term: paymentArray,
				material_load_port: this.addPIForm.value.material_load_port,
				destination_port_id: this.addPIForm.value.destination_port_id,
				pi_quantity: this.addPIForm.value.pi_quantity,
				pi_rate: this.addPIForm.value.pi_rate,
				total_pi_amount: this.addPIForm.value.total_pi_amount,
				currency_id: this.addPIForm.value.currency_id,
				pi_insurance_id: this.addPIForm.value.pi_insurance_id,
				unit_id: this.addPIForm.value.unit_id,
				material_pack_id: this.addPIForm.value.material_pack_id,
				grade_id: this.addPIForm.value.grade_id,
				tentitive_departure_date: this.addPIForm.value.tentitive_departure_date ? this.convert(this.addPIForm.value.tentitive_departure_date) : null,
				tentitive_arrival_date: this.addPIForm.value.tentitive_arrival_date ? this.convert(this.addPIForm.value.tentitive_arrival_date) : null,
				grade_assort_id: this.id,
				pi_flag: this.addPIForm.value.pi_flag,
				id: this.addPIForm.value.id,
				remark: remarkdb,
				high_seas_pi: highSeasPiFlag,
				transnational_sale_pi: transnationalSalePiFlag,
				forward_sale_pi: forwardSalePiFlag,
				purchase_hold_qty_flag: purchase_hold_qty_flag,
				po_link_bal_qty: this.addPIForm.value.pi_quantity
			}

			console.log(formData, "highseaflag");
			const fileData = new FormData();
			const document: Array<File> = this.docs;
			if (document.length > 0) {
				for (let i = 0; i < document.length; i++) {
					fileData.append('pi_copy', document[i], document[i]['name']);
				}

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.pi_copy;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						formData['pi_copy'] = JSON.stringify(files);
						this.saveData(formData);
					}
				});
			} else {
				if (this.addPIForm.value.id) {

					this.CrudServices.getOne<any>(flcProformaInvoice.updatePi, formData).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {

							this.toasterService.pop(response.message, response.message, response.data);
							if (response.code === '100') {
								this.add_new_click = false;
								this.onReset();
								this.get_pi();
							}
						}
					});


				} else {

					this.CrudServices.getOne<any>(flcProformaInvoice.addProdformaInvoice, formData).subscribe((response) => {

						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							this.toasterService.pop(response.message, response.message, response.data);
							if (response.code === '100') {

								let port = this.port_list.filter(item => item.id = formData.destination_port_id);
								let port_name = "";
								if (port.length) {
									port_name = port[0].port_name;
								}

								let data = {
									"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
									"body": `Proforma invoice : ${formData.proform_invoice_no} added for ${this.sub_org_name}, Port: ${port_name}`,
									"click_action": "#"
								}


								this.generateNotification(data, 1);



								this.add_new_click = false;
								this.onReset();
								this.get_pi();
							}
						}
					});

				}
			}



		}
	}


	saveData(form) {

		if (this.addPIForm.value.id) {

			this.CrudServices.getOne<any>(flcProformaInvoice.updatePi, form).subscribe((response) => {

				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						this.add_new_click = false;
						this.onReset();
						this.get_pi();
					}
				}
			});



		} else {



			this.CrudServices.getOne<any>(flcProformaInvoice.addProdformaInvoice, form).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						let port = this.port_list.filter(item => item.id = form.destination_port_id);
						let port_name = "";
						if (port.length) {
							port_name = port[0].port_name;
						}

						let data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Proforma invoice : ${form.proform_invoice_no} added for ${this.sub_org_name}, Port: ${port_name}`,
							"click_action": "#"
						}


						this.generateNotification(data, 1);


						this.add_new_click = false;
						this.onReset();
						this.get_pi();
					}
				}

			});

		}
	}

	onDelete(id: number) {

		if (id) {
			this.CrudServices.getOne<any>(flcProformaInvoice.deletePi, {
				id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.get_pi();
					this.toasterService.pop(response.message, 'Success', response.data);
				}
			});

		}
	}

	get_pi() {
		this.isLoading = true;

		this.CrudServices.getOne<any>(flcProformaInvoice.getPiAgainstOneGa, {
			grade_assort_id: this.id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.isLoading = false;
				this.data = response;
				console.log(response, "responseresponse");
				if (response) {
					this.getRemainingQuantity(response);
				}
			}
		});


	}

	getRemainingQuantity(item) {
		let pi_qty = 0;
		for (const val of item) {
			pi_qty = pi_qty + Number(val.pi_quantity);
		}
		if (this.ga_quantity > 0) {
			this.remainig_qty = Number(this.ga_quantity) - Number(pi_qty);
		}
	}

	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}

	onReset() {
		this.addPIForm.reset();
		this.preview = false;
		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		this.currentMonth = Number(this.datepipe.transform(this.date, 'M'));
		this.addPIForm.controls['supplier_id'].setValue(this.sub_org_id);
		this.addPIForm.controls['shipment_month'].setValue(this.currentMonth);
		this.addPIForm.controls['shipment_year'].setValue(this.currentYear);
		this.addPIForm.controls['buyer_id'].setValue(4);
		this.setSelectedOnEdit(this.datepipe.transform(this.date, 'M'), this.month, 'name', 'month_name', 'id');
		this.setSelectedOnEdit('61', this.sub_org, 'sub_org_name', 'buyer', 'sub_org_id');

		this.spiplbank = '';
		this.first_adv_bank = '';
		this.second_adv_bank = '';
		this.pay = '';
		this.port = '';
		this.unit = '';
		this.grade_value = '';
		this.insurance = '';
		this.packing_mat = '';
		this.docsview = '';
		this.curr = '';

	}




	addNew() {
		this.getNotifications('ADD_PROFORMA_INVOICE');
		this.add_new_click = true;

	}

	addDocs(event: any) {
		this.docs = <Array<File>>event.target.files;
	}

	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	public setSelectedStatus($e, name, htmlname) {
		if ($e) {
			this[htmlname] = $e[name];
			if (htmlname === 'flag') {
				if ($e[name] === 'NON-LC PI') {
					this.payTermBasedOnFlag = true;

					this.CrudServices.getOne<any>(PaymentTermMaster.getOneByType, {
						pay_type: 2
					}).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							this.paymentTerm = response;
						}
					});

					// this.paymentTermService.getPaymentTermType(2).subscribe((response) => {
					// 	this.paymentTerm = response;
					// });

				} else {
					this.CrudServices.getOne<any>(PaymentTermMaster.getOneByType, {
						pay_type: 1
					}).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							this.paymentTerm = response;
						}
					});

					// this.paymentTermService.getPaymentTermType(1).subscribe((response) => {
					// 	this.paymentTerm = response;
					// });
					this.payTermBasedOnFlag = false;
				}
			}
			if (htmlname === 'buyer') {
				this.buyer_address = $e['org_address'];
			}
			// if(htmlname === 'material_load_port')
			// {
			// 	// this.CrudServices.postRequest<any>(MaterialLoadPortMaster.getOne,{
			// 	// 	id: 
			// 	// }).subscribe((res)=>{
			// 	// 	this.load_port=res[0]['material_load_port']
			// 	// });
			// }
		} else {
			this[htmlname] = '';
			if (htmlname === 'buyer') {
				this.buyer_address = '';
			}

			if (htmlname === 'flag') {
				this.payTermBasedOnFlag = false;
			}
		}

	}

	public setTerm($e) {
		this.pay = '';
		if ($e) {
			for (const val of $e) {
				this.pay = this.pay + val['pay_term'] + '/';
			}
		}
	}

	public setSelectedOnEdit(value, dataarr, name, htmlname, id) {
		if (dataarr && value) {
			const status = [] = dataarr.find(s => s[id] === value);
			if (status) {
				this[htmlname] = status[name];
			}
		}
	}

	onBack() {
		this.add_new_click = false;

		this.onReset();

	}

	onPreview() {
		this.preview = true;
	}


	convert(date) {
		if (date != null) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return null;
		}
	}

	calculate_total() {
		this.quantity_limit = false;
		if (this.pi_qty <= this.remainig_qty) {
			this.total_amt = (Number(this.pi_qty) * Number(this.pirate)).toFixed(3);
		} else {
			this.quantity_limit = true;
			this.pi_qty = 0;
			this.total_amt = 0;
		}

	}
	onBackToList() {
		this.router.navigate(['forex/add-grade-port/' + this.fs_deal_id]);
	}


	getFlag(val: Number) {
		switch (val) {
			case 1: {
				return ' LC PI ';
				break;
			}
			case 2: {
				return 'Non LC PI';
				break;
			}
			case 3: {
				return 'Indent PI';
				break;
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


	generateNotification(data, id) {
		console.log(this.notification_details, 'DIKSHA');
		if (this.notification_details != undefined) {
			let body = {
				notification: data,
				registration_ids: this.notification_tokens
			};

			console.log(body, 'BODY');


			this.messagingService.sendNotification(body).then((response) => {
				if (response) {
					console.log(response);

					this.saveNotifications(body['notification'], id)
				}
				this.messagingService.receiveMessage();
				this.message = this.messagingService.currentMessage;

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
				table_name: 'bill_of_lading',
			})
		}
		console.log(this.notification_users, "this.notification_users")
		this.CrudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}



	checkType($e) {
		console.log($e.checked, $e.name, "checkType")

		// if ($e.checked == 'true' && $e.name == 'high_seas_pi') {
		// 	this.forwardSalePi = false;
		// 	this.transnationalSalePi = false;

		// } else if ($e.checked == 'true' && $e.name == 'forward_sale_pi') {

		// 	this.highSeasPi = false;
		// 	this.transnationalSalePi = false;
		// } else if ($e.checked == 'true' && $e.name == 'transnational_sale_pi') {

		// 	this.forwardSalePi = false;
		// 	this.highSeasPi = false;
		// }

		if ($e.checked) {
			if ($e.name == 'high_seas_pi') {
				this.CrudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
					status: 0
				}).subscribe(res => {
					if (res.code === "101") {
						this.toasterService.pop(res.message, res.message, res.data);
					} else {
						console.log(res, "highSeasOrder")
						this.highseas_orders = res.data;

					}
				});

				this.addPIForm.patchValue({ forward_sale_pi: false, transnational_sale_pi: false })
				// this.forwardSalePi = false;
				// this.transnationalSalePi = false;

			} else if ($e.name == 'forward_sale_pi') {
				// this.highSeasPi = false;
				// this.transnationalSalePi = false;
				this.CrudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
					status: 0
				}).subscribe(res => {
					if (res.code === "101") {
						this.toasterService.pop(res.message, res.message, res.data);
					} else {
						console.log(res, "highSeasOrder")
						this.highseas_orders = res.data;

					}
				});
				this.addPIForm.patchValue({ high_seas_pi: false, transnational_sale_pi: false })

			} else if ($e.name == 'transnational_sale_pi') {
				// this.forwardSalePi = false;
				// this.highSeasPi = false;

				this.CrudServices.getOne<any>(TransnationalSales.getTransnationalSalesOrders, { pi_id: null }).subscribe(response => {

					this.highseas_orders = response.map(item => {
						item.soid_custname = `${item.id}- ${item.customer}`;
						return item;
					})
					console.log(this.highseas_orders);


				})

				this.addPIForm.patchValue({ high_seas_pi: false, forward_sale_pi: false })

			}
		}

	}

	ngOnDestroy() {

	}




}
