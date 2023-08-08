import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ViewChildren, QueryList, ElementRef, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { Consignments, EmailTemplateMaster, FileUpload, Lot_coa, NonNegotiable, percentage_master, PortMaster, salesPurchaseLinking, shipmentType, SubOrg } from '../../../shared/apis-path/apis-path';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { staticValues } from '../../../shared/common-service/common-service';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';

@Component({
	selector: 'app-material-received-chart',
	templateUrl: './material-received-chart.component.html',
	styleUrls: ['./material-received-chart.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		ExportService,
		ConfirmationService
	]
})
export class MaterialReceivedChartComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('myModalCoa', { static: false }) public myModalCoa: ModalDirective;
	@ViewChild('myModalCoaMail', { static: false }) public myModalCoaMail: ModalDirective;
	@ViewChild('editNonModal', { static: false }) public editNonModal: ModalDirective;
	@ViewChild('serchModal', { static: false }) public serchModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Change?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'right';
	public closeOnOutsideClick: boolean = true;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	serverUrl: string;
	user: UserDetails;
	isLoading = false;
	links: string[] = [];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	addLotForm: FormGroup;
	searchForm: FormGroup;
	editNonForm: FormGroup;
	non_list = [];
	cols: { field: string; header: string; style: string; }[];
	non_arr: any;
	non_invoice_no: any;
	colsLot: { field: string; header: string; style: string; }[];
	non_id: any;
	lot_list = [];
	coaDocs: Array<File> = [];
	coa_copy: any;
	ccText: any;
	bccText: any;
	coaTemplate: any;
	subject: any;
	from: any;
	footer: any;
	shipping_line: any;
	arrival_date: any;
	_selectedColumns: any[];
	igm_date: any;

	lookup = {};
	lookup_grade = {};
	lookup_bank = {};
	lookup_noting = {};
	lookup_shipping = {};
	lookup_type = {};

	lookup_port = {};


	lookup_main_grade = {};
	main_grade_arr = [];

	supplier = [];
	grades = [];
	banks = [];
	supplier_list = [];
	notingMaterial = [];
	shippingLines = [];
	piTypes = [];
	ports = [];


	bsRangeValue: Date[];
	bsRangeValue1: Date[];
	date = new Date();
	currentYear: number;
	non_received_date: any;
	status: { id: number; name: string; color: string; }[];
	fromInvoiceDate: string;
	toInvoiceDate: string;
	flag1: string;
	gloobalList: any[];
	allDocRecvDt: boolean;
	listType: { id: number; name: string; }[];
	list_type: number;
	delivery_challan: boolean;
	excel_export: boolean;
	pdf_export: boolean;
	bl_list: boolean;
	be_list: boolean;
	lot_add: boolean;
	coa_upload: boolean;
	coa_mail_send: boolean;
	filteredValuess: any[];
	export_purchase_list = [];
	exportColumns: { title: any; dataKey: any; }[];
	port_list = [];
	shipmentType: any;
	// data: { port_id: any; invoice_no: any; shippine_line_id: any; import_type: any; bl_no: any; be_no: any; lot_no: any; };
	displayPop: boolean = false;
	data: { invoice_no: any; shippine_line_id: any; import_type: any; bl_no: any; be_no: any; be_dt: any; lot_no: any; };
	totalQty: any;
	selectedPort = [];
	port = 1;
	port_id: any;
	verify_original_docs_rcv_forex: boolean;
	shipping_details: boolean;
	purchase_hold_link: boolean;
	document_verification_details: boolean;
	noOfFreeDays: number = 14;
	bl_edit: boolean;
	grade_name: any;
	ccMail = [];
	tomail = [];
	email = [];
	isLoadingMail: boolean;
	shipping_line_list: any;
	fromArrivalDate: string;
	toArrivalDate: string;
	totCharges: number;
	totNOC: any;
	totChargesWithoutFob: any;
	totalQtyWithoutFob: any;
	totNOCWithoutFob: any;
	endorseDocs: Array<File> = [];
	add_charges: boolean = false;
	upload_endorse_copy: boolean = false;
	totBcdLic: any;
	totalReceived: any;
	premium = [];
	ex_rate_bcd: any;
	select_status: any;
	previourArrivalDate: any;
	isForwardPi: number;
	pi_id_list: any[];
	emailSubject: any;
	emailFooterTemplete: any;
	emailBodyTemplete: any;
	emailFrom: any;
	magangementSurishaEmailSales_Company_ID_3: any = staticValues.magangementSurishaEmailSales_Company_ID_3;
	valueDate: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig: any = staticValues.datePickerConfigNew;
	maxDate: any = new Date();

	page_title: any = "Confirm IGM"
	// popoverMessage: string = 'Are you sure, you want to confirm?';

	constructor(private router: Router, private toasterService: ToasterService,
		private permissionService: PermissionService,
		private exportService: ExportService,
		private loginService: LoginService,
		private confirmationService: ConfirmationService,
		public datepipe: DatePipe, private crudServices: CrudServices) {


		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;


		this.excel_export = (this.links.indexOf('Material Excel Export') > -1);
		this.pdf_export = (this.links.indexOf('Material Pdf Export') > -1);
		this.delivery_challan = (this.links.indexOf('Delivery Challan') > -1);
		this.bl_list = (this.links.indexOf('BL List') > -1);
		this.be_list = (this.links.indexOf('BE list') > -1);
		this.bl_edit = (this.links.indexOf('BL edit') > -1);
		this.lot_add = (this.links.indexOf('Lot add') > -1);
		this.coa_upload = (this.links.indexOf('COA upload') > -1);
		this.coa_mail_send = (this.links.indexOf('COA Mail Send') > -1);
		this.shipping_details = (this.links.indexOf('Non Shipping Details') > -1);
		this.document_verification_details = (this.links.indexOf('Non Doc Verification Details') > -1);

		this.purchase_hold_link = (this.links.indexOf('purchase_hold_link') > -1);

		this.upload_endorse_copy = (this.links.indexOf('Upload Endorse Copy') > -1);

		this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
			this.port_list = response;


			if (localStorage.getItem('selected_port_arrival')) {
				this.port = Number(localStorage.getItem('selected_port_arrival'));
			} else {
				this.port = 1;
			}


		})
		this.listType = [{ id: 0, name: 'Pending' }, { id: 1, name: 'Completed' }];
		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));

		this.bsRangeValue = [new Date(moment().format('YYYY-04-01')),
		new Date(moment().add(1, 'years').endOf('month').format('YYYY-03-31'))];

		this.list_type = 0;
		this.cols = [

			{ field: 'port_name', header: 'Port', style: '200' },
			{ field: 'id', header: 'Non No.', style: '180' },
			{ field: 'non_received_date', header: 'Received Date Non', style: '150' },
			{ field: 'ad_code', header: 'AD CoDe', style: '200' },
			{ field: 'sub_org_name', header: 'Name of Supplier', style: '200' },
			{ field: 'invoice_no', header: 'Invoice No', style: '150' },
			{ field: 'non_revised_copy', header: 'Revise Non Copy', style: '200' },
			{ field: 'bl_invoices', header: 'Bill of Lading', style: '200' },
			{ field: 'main_grade_name', header: 'Main Grade', style: '150' },
			{ field: 'grade_name', header: 'Grade', style: '150' },
			{ field: 'tot_non_qty', header: 'Quantity', style: '100' },
			{ field: 'material_received_qty', header: 'Received Qty', style: '100' },
			{ field: 'rate', header: 'Rate/MT', style: '100' },
			{ field: 'arrival_date', header: 'Arrival Date', style: '180' },
			{ field: 'igm', header: 'IGM', style: '150' },
			{ field: 'noting_of_material', header: 'Noting Of Material', style: '200' },
			{ field: 'be_invoices', header: 'Bill of Entry', style: '200' },
			{ field: 'required_lic_amount', header: 'Required License Amount', style: '100' },
			{ field: 'lot', header: 'Lot Details', style: '200' },
			{ field: 'pi_type', header: 'Source', style: '120' },
			{ field: 'pi_no', header: 'PI Number', style: '100' },
			{ field: 'pi_date', header: 'PI Date', style: '100' },

		];

		this.colsLot = [
			{ field: 'lot_no', header: 'Lot Number', style: '100' }
		];
		this.status = [{ id: 1, name: 'In Bond', color: '#B4D8ED' }, { id: 2, name: 'High Seas Sales', color: '#F0F4C3' }, { id: 3, name: 'Half Inbond', color: '#FFCCBC' }, { id: 4, name: 'Inbond + High Seas', color: '#80CBC4' }, { id: 5, name: 'CIF', color: '#E6E6FA' }, { id: 6, name: 'FOB', color: '#FFFAF0' }, { id: 7, name: 'DPD', color: '#FFF0F5' }, { id: 8, name: 'CFR', color: '#FFE4E1' }, { id: 9, name: 'CFS', color: '#E6E6FA' }, { id: 10, name: 'Bond to be', color: '#ffcccc' }];
		this.addLotForm = new FormGroup({
			'lot_no': new FormControl(null, Validators.required)
		})

		if (localStorage.getItem('selected_col_arrival_chart')) {
			this._selectedColumns = JSON.parse(localStorage.getItem('selected_col_arrival_chart'));
		} else {
			this._selectedColumns = this.cols;
		}

		this.editNonForm = new FormGroup({
			'shiping_line_id': new FormControl(null),
			'free_time_bl_dt': new FormControl(null),
			'arrival_date': new FormControl(null),
			'all_docs_rcev_from_forex_dt': new FormControl(null),
			'verify_original_docs_rcv_forex': new FormControl(null),
			'file_no': new FormControl(null),
			'rbi_rate': new FormControl(null),
			'purchase_date': new FormControl(null),
			'premium': new FormControl(null),
			'freedays': new FormControl(null),
			'endorse_invoice_copy': new FormControl(null),
			'fob_freight_lic': new FormControl(null),
			'fob_insurance_lic': new FormControl(null),
		});


		this.searchForm = new FormGroup({
			'port_id': new FormControl(null),
			'shippine_line_id': new FormControl(null),
			'invoice_no': new FormControl(null),
			'lot_no': new FormControl(null),
			'import_type': new FormControl(null),
			'bl_no': new FormControl(null),
			'be_no': new FormControl(null),
			'be_dt': new FormControl(null),

		});
		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 88 }).subscribe(response => {

			// this.shipping_line = response;
			this.shipping_line_list = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });
		})

		this.crudServices.getOne<any>(percentage_master.getByType, { type: 'BCD Exchange Rate' }).subscribe(res => {
			if (res.length) {
				this.ex_rate_bcd = res[0].percent_value;
			}
		})



	}

	ngOnInit() {
		this.getPremium();

	}

	confirm(item: any) {
		this.displayPop = true;
		// this.selectedItemForStatus = item;
		const msg = '<strong>Are you sure, you want to Change?</strong>';
		this.confirmationService.confirm({
			message: msg,
			header: 'Warning',

			accept: () => {
				this.igmReceived(item);
				//   if (item.req_flag == 1) {
				// 	if (this.req_amount <= item.req_amount) {
				// 	  this.updateStatus(1, item.id, item, this.req_amount);
				// 	} else {
				// 	  this.toasterService.pop('warning', 'warning', 'Amount Exeeded')
				// 	}
				//   } else {
				// 	this.updateStatus(1, item.id, item, this.req_amount);
				//   }

			},
		});



	}
	onReject() {
		// this.updateStatus(2, this.selectedItemForStatus.id, this.selectedItemForStatus, this.req_amount);
		this.displayPop = false;
	}
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue))
			this.uploadSuccess.emit(false);
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.bsRangeValue = dateValue.range;
		// this.selected_date_range = dateValue.range;

	}

	igmReceived(rowData) {
		rowData['igm'] = this.igm_date ? this.igm_date : Date.now();
		this.crudServices.updateData<any>(NonNegotiable.update_non, rowData).subscribe(response => {
			this.getNonList();
		})
	}

	onAction(value: any) {
		this.valueDate = value;
		this.viewDealModal.show();
	}
	closeModal() {
		this.viewDealModal.hide();
	}
	onSelect($e, state) {


		this.non_list = [];
		if ($e == null && state === '1') {
			this.fromInvoiceDate = '';
			this.toInvoiceDate = '';
		}

		if ($e == null && state === '3') {
			this.fromArrivalDate = '';
			this.toArrivalDate = '';
		}

		if ($e == null && state === '2') {
			this.list_type = null;

		}


		if ($e) {
			if (state === '1') {
				this.fromInvoiceDate = $e[0];
				this.toInvoiceDate = $e[1];
			}

			if (state === '3') {
				this.fromArrivalDate = $e[0];
				this.toArrivalDate = $e[1];
			}

			if (state === '2') {
				this.list_type = $e;
			}


		}

		this.getNonList();





	}

	onSelectPort($e) {

		this.port = $e;
		localStorage.setItem('selected_port_arrival', $e);
		this.getNonList();
		// this.getSearchList();
	}

	checkStatus(event) {
		this.non_list = this.gloobalList;

		if (event) {
			this.non_list = this.filterFlag(event);

			this.CalculateTotal(this.non_list);
		} else {
			this.CalculateTotal(this.non_list);
		}



	}



	filterFlag(event) {
		return this.non_list.filter(data => data.statusType == event);
	}

	shipmentReceived(check) {
		this.non_list = this.gloobalList;
		if (check) {
			this.non_list = this.non_list.filter(data => data.material_received_date_logistics != null && data.material_received_date_logistics != '')

		}
		this.CalculateTotal(this.non_list);
	}

	getNonList() {
		this.isLoading = true;

		let filter = {};

		let port: number;



		if (localStorage.getItem('selected_port_arrival')) {
			port = Number(localStorage.getItem('selected_port_arrival'));
		} else {
			port = this.port;
		}

		filter["invoice_date_from"] = this.convert(this.fromInvoiceDate);
		filter["invoice_date_to"] = this.convert(this.toInvoiceDate);

		filter["arrival_date_from"] = this.convert(this.fromArrivalDate);
		filter["arrival_date_to"] = this.convert(this.toArrivalDate);
		filter["material_received_flag"] = this.list_type;
		filter["port_id"] = port;


		this.crudServices.getOne<any>(NonNegotiable.getMaterialArrivalDet, filter).subscribe(response => {
			this.isLoading = false;
			this.non_list = [];
			this.selectedPort = [];
			this.totalQty = 0;
			this.totalReceived = 0;
			this.totNOC = 0;
			this.totCharges = 0;

			this.totChargesWithoutFob = 0;
			this.totalQtyWithoutFob = 0;
			this.totNOCWithoutFob = 0;
			console.log(response);
			for (let element of response) {
				let be_invoices = '';
				let bl_invoices = '';
				let blremark = '';
				let lot_no = '';
				let arr = [];
				let status = '';
				let tot_non_qty = 0;
				let rate = 0;
				let pitype = '';
				let eta = '';
				let required_lic_amount = 0;
				// let UnitName ='';be_dt
				// let CurrencyName ='';
				let material_received_date_logistics = '';
				let be_copy = [];
				if (element.bill_of_entries != null) {
					for (let val of element.bill_of_entries) {
						if (val.deleted == 0) {
							be_invoices = be_invoices + val.be_no  + ' ' + val.be_dt;
							if (val.be_copy) {
								for (let doc of JSON.parse(val.be_copy)) {
									be_copy.push(doc)
								}
							}
						}

					}
				}

				if (element.rel_non_pis != null && element.rel_non_pis.length > 0) {
					tot_non_qty = element.rel_non_pis.reduce((sum, item) => sum + Number(item.pi_qty), 0);
					let pi_rate = element.rel_non_pis.reduce((sum, item) => sum + Number(item.flc_proforma_invoice.pi_rate), 0);
					rate = pi_rate / element.rel_non_pis.length;
					pitype = element.rel_non_pis[0].flc_proforma_invoice.pi_flag;
					element.eta = element.rel_non_pis[0].flc_proforma_invoice.tentitive_arrival_date;
					element.UnitName = element.rel_non_pis[0].flc_proforma_invoice.unit_mt_drum_master.unitName;
					element.CurrencyName = element.rel_non_pis[0].flc_proforma_invoice.currency_master.currName;
					element.incoTerm = element.rel_non_pis[0].flc_proforma_invoice.pi_insurance_type.incoTerm;

					element.high_seas_order_id = element.rel_non_pis[0].flc_proforma_invoice.sales_orders[0] ? element.rel_non_pis[0].flc_proforma_invoice.sales_orders[0].id : '';

					element.tot_non_qty = tot_non_qty;
					element.pi_type = pitype;
					element.rate = rate;
					element.eta = eta;

					let count_high_seas_pi = 0;
					element.pi_no = ''
					element.pi_date = ''
					element.pi_id = [];					
					// let date_pi = (element.invoice_date  || element.invoice_date !== null || element.invoice_date !== undefined);	
					let date_pi = '';
					if (element.invoice_date === null) {					
						date_pi = "N/A"; 
					  }
					  else if (element.invoice_date.trim() === "") {						
						date_pi = "N/A"; 
					  }
					  else {						
						date_pi = element.invoice_date;
					  }
								  
					for (let elem_relNonPi of element.rel_non_pis) {
						count_high_seas_pi = count_high_seas_pi + elem_relNonPi.high_seas_pi;
						element.pi_no = elem_relNonPi.flc_proforma_invoice.proform_invoice_no; 
						element.pi_date = elem_relNonPi.flc_proforma_invoice.proform_invoice_date;
						element.pi_id.push(elem_relNonPi.flc_proforma_invoice.id);
					}

					if (count_high_seas_pi > 0) {
						element.high_seas_pi = element.rel_non_pis[0].high_seas_pi;
					} else {
						element.high_seas_pi = 0;
					}

					element.forward_sale_pi = element.rel_non_pis[0].flc_proforma_invoice.forward_sale_pi;

					element.purchase_hold_qty_flag = element.rel_non_pis[0].flc_proforma_invoice.purchase_hold_qty_flag;



				}



				if (element.lot_coas != null) {
					for (let val of element.lot_coas) {

						lot_no = lot_no + val.lot_no + ' ';


					}
				}
				let shipmentArr = [];
				let blArray = [];
				let noc = 0;
				let received_noc = '';
				let material_received_qty = 0;
				let noting_of_material = '';
				let cha = '';
				let highSeasShipment: boolean = false;

				if (element.bill_of_ladings != null) {

					for (let val of element.bill_of_ladings) {
						if (val.deleted == 0) {
							let noc_received = [];

							if (val.shipment_type == 2) {
								highSeasShipment = true;
							}

							if (val.notingOfMaterial) {
								noting_of_material = noting_of_material + val.notingOfMaterial.sub_org_name + ' ';
							}
							if (val.cha) {
								cha = cha + val.cha.sub_org_name + ' ';
							}

							if (val.to_be_bond) {
								element.toBeBond = true;
								//element.colorCode = '#B4D8ED';

							}


							if (val.container_details != null) {
								let existsCount = 0;
								if (val.container_details.length) {
									noc += val.container_details.length;
								}

								noc_received = val.container_details.filter(item => item.cont_received_date != null);
								existsCount = val.container_details.filter(item => item.deliver_challan_mail_date != null).length;
								if (existsCount = val.container_details.length) {
									element.mail_sent_delivery = val.container_details[0].deliver_challan_mail_date;

								}
							}


							let type = `(${element.incoTerm})`;
							if (element.incoTerm.trim() == 'CIF') {

								element.statusType = 5
							}

							if (element.incoTerm.trim() == 'FOB') {
								element.statusType = 6
							}

							if (element.incoTerm.trim() == 'CFR') {
								element.statusType = 8
							}


							if (val.material_in_bond_status == 4) {
								type += " (CFS)"
								element.statusType = 9
							}

							if (val.material_in_bond_status == 5) {
								type += " (DPD)"
								element.statusType = 7
							}
							bl_invoices = bl_invoices + val.bill_lading_no + '\n' + type + '\n';
							// blremark = blremark + val.remark != null ? val.remark : '';						
							blremark = blremark + (val.remark != null ? ' ' + val.remark : '');



							material_received_date_logistics = val.material_received_date_logistics;
							received_noc = (noc_received.length > 0 ? '\n Cont. received:' + noc_received.length : '');
							material_received_qty = noc_received.reduce((sum, data) => sum + data.net_wt, 0)
							shipmentArr.push(val.shipment_type);

							blArray.push(val);

							if (val.material_in_bond_status == 2 && val.shipment_type == 1) {
								element.colorCode = '#B4D8ED';
								status = status + 'INB :' + val.bl_qauntity + '\n';
								arr.push(1);
							} else

								if (val.material_in_bond_status == 2 && val.shipment_type == 2) {
									element.colorCode = '#B4D8ED';
									status = status + 'INB :' + val.bl_qauntity + '\n';
									status = status + 'HS :' + val.bl_qauntity + '\n';

									arr.push(2);
								} else

									if (val.material_in_bond_status != 2 && val.shipment_type == 2) {
										element.colorCode = '#F0F4C3';
										status = status + 'HS :' + val.bl_qauntity + '\n';

										arr.push(3);
									} else

										if (val.material_in_bond_status != 2 && val.shipment_type == 1) {

											arr.push(4);
										}



							if (arr.length == 1) {
								switch (arr[0]) {
									case 1: element.colorCode = '#B4D8ED'; break;
									case 2: element.colorCode = '#B4D8ED'; break;
									case 3: element.colorCode = '#F0F4C3'; break;
									case 4: element.colorCode = ''; break;
								}
							}

							if (arr.length > 1) {
								let group = [];
								for (let val of arr) {
									var a = group.indexOf(val);

									if (a < 0) {
										group.push(val);
									}
								}
								element.colorCode = this.checkForColor(group);
							}

						}

					}


				}

				element.shipmentArr = shipmentArr;
				element.noting_of_material = noting_of_material;
				element.cha = cha;

				let bcd_percent = element.sub_org_master.bcd_lic_percent;
				let ex_rate = 0
				if (this.ex_rate_bcd) {
					ex_rate = this.ex_rate_bcd
				} else {
					ex_rate = 80
				}

				if (be_invoices == '' && highSeasShipment == false) {
					let amount = ((element.tot_non_qty * element.rate) + Number(element.fob_freight_lic)) * ex_rate
					if (bcd_percent != null && bcd_percent != undefined) {
						let BCD = amount * (bcd_percent / 100);
						required_lic_amount = BCD

					} else {
						let BCD = amount * 10 / 100;
						required_lic_amount = BCD

					}


				}
				element.required_lic_amount = required_lic_amount + Number(element.fob_insurance_lic)




				if (element.colorCode == '#B4D8ED') {
					element.statusType = 1;
				} else

					if (element.colorCode == '#F0F4C3') {
						element.statusType = 2;
					} else

						if (element.colorCode == '#FFCCBC') {
							element.statusType = 3;
						} else

							if (element.colorCode == '#80CBC4') {
								element.statusType = 4;
							}


				if (element.toBeBond && element.colorCode != '#B4D8ED') {
					element.statusType = 10;
					element.colorCode = '#ffcccc'
				}




				let today = new Date();
				let noOfDays = 0;
				let noOfDaysShip = 0;
				if (element.arrival_date) {
					const arrivalDate = moment(element.arrival_date);
					const toDate = moment(this.datepipe.transform(today, 'yyyy-MM-dd'));

					if (arrivalDate < toDate) {
						noOfDays = Math.abs(arrivalDate.diff(toDate, 'days'));

					}
				}

				if (element.date_of_shipment) {
					const date_of_shipment = moment(element.date_of_shipment);
					const toDate = moment(this.datepipe.transform(today, 'yyyy-MM-dd'));

					if (date_of_shipment < toDate) {
						noOfDaysShip = Math.abs(date_of_shipment.diff(toDate, 'days'));

					}

				}




				if (blArray.length > 0) {
					element.fontStyle = "";
					element.fontColor = "";

				} else {
					element.fontStyle = "bold";
					element.fontColor = "red";
				}


				element.sub_org_name = element.sub_org_master.sub_org_name;
				if (element.shippingLine) {
					element.shipping_line = element.shippingLine.sub_org_name;
				}

				element.bank_name = element.spipl_bank.bank_name;
				element.ad_code = element.spipl_bank.ad_code;
				element.port_name = element.port_master.port_name;
				element.email = element.port_master.email;
				element.grade_name =
					element.grade_master.grade_name;

				element.main_grade_name =
					element.grade_master ? element.grade_master.main_grade.name : null;

				const name = element.sub_org_name;
				const grade = element.grade_name;
				const main_grade_name = element.main_grade_name;
				const bank = element.bank_name;
				const noting = element.noting_of_material;
				const shipping = element.shipping_line;
				const pi_type = element.pi_type;
				const port_name = element.port_name;

				if (!(name in this.lookup)) {
					this.lookup[name] = 1;
					this.supplier_list.push({ 'sub_org_name': name });
				}

				if (!(main_grade_name in this.lookup_main_grade)) {
					this.lookup_main_grade[main_grade_name] = 1;
					this.main_grade_arr.push({ 'main_grade_name': main_grade_name });
				}


				if (!(grade in this.lookup_grade)) {
					this.lookup_grade[grade] = 1;
					this.grades.push({ 'grade_name': grade });
				}



				if (!(bank in this.lookup_bank)) {
					this.lookup_bank[bank] = 1;
					this.banks.push({ 'bank_name': bank });
				}

				if (!(noting in this.lookup_noting)) {
					this.lookup_noting[noting] = 1;
					this.notingMaterial.push({ 'noting_of_material': noting });
				}

				if (!(shipping in this.lookup_shipping)) {
					this.lookup_shipping[shipping] = 1;
					this.shippingLines.push({ 'shipping_line': shipping });
				}

				if (!(pi_type in this.lookup_type)) {
					this.lookup_type[pi_type] = 1;
					this.piTypes.push({ 'pi_type': pi_type });
				}

				if (!(port_name in this.lookup_port)) {
					this.lookup_port[port_name] = 1;

					this.ports.push({ 'port_name': port_name });
				}

				let total_cha_cfs_shipping_terminal = 0;
				let storage = 0;
				let storageQty = 0;
				let total_charges_without_fob = 0
				let fobCharge = 0

				if (element.logistics_charges.length > 0) {


					// let cfscharge = element.logistics_charges.reduce((sum, item) => sum + (Number(item.cfs_charges) + Number(item.cfs_grount_rent)+ (Number(item.scanning_charges) + Number(item.cfs_sgst) + Number(item.cfs_cgst)), 0));
					let cfscharge = element.logistics_charges.reduce((sum, item) => sum + (Number(item.cfs_charges) + Number(item.cfs_grount_rent) + Number(item.scanning_charges) + Number(item.examination_charges) + Number(item.cfs_sgst) + Number(item.cfs_cgst)), 0);
					let terminal = element.logistics_charges.reduce((sum, item) => sum + (Number(item.first_shifting_terminal) + Number(item.second_shifting_terminal) + Number(item.terminal_grount_rent) + Number(item.toll_charges) + Number(item.terminal_cgst) + Number(item.terminal_sgst) + Number(item.terminal_igst)), 0);

					let shipping = element.logistics_charges.reduce((sum, item) => sum + (Number(item.shipping_charges) + Number(item.shipping_grount_rent) + Number(item.shipping_other_charges) + Number(item.shipping_igst) + Number(item.shipping_sgst) + Number(item.shipping_cgst)), 0);

					let fob = element.logistics_charges.reduce((sum, item) => sum + (Number(item.fob_charges) + Number(item.fob_cgst) + Number(item.fob_sgst)), 0);
					let citpl = element.logistics_charges.reduce((sum, item) => sum + (Number(item.citpl_charges) + Number(item.citpl_cgst) + Number(item.citpl_sgst)), 0);


					total_cha_cfs_shipping_terminal = cfscharge + terminal + shipping + fob + citpl;
					total_charges_without_fob = cfscharge + terminal + shipping + citpl;
					fobCharge = fob
				}
				let transportercharges = 0;
				let bondCharges = 0;
				let chacharge = 0;

				if (element.logistics_bond_charges.length > 0) {
					bondCharges = element.logistics_bond_charges.reduce((sum, item) => sum + (Number(item.charge_rate) + Number(item.sgst) + Number(item.cgst)), 0);


				}

				if (element.transporter_charges.length > 0) {
					transportercharges = element.transporter_charges.reduce((sum, item) => sum + (Number(item.rate) + Number(item.sgst) + Number(item.cgst) + Number(item.empty_lift_off) + Number(item.detention)), 0);


				}

				if (element.cha_charges.length > 0) {
					chacharge = element.cha_charges.reduce((sum, item) => sum + (Number(item.cha_charges) + Number(item.cha_other_charges) + Number(item.edi) + Number(item.general_stamp) + Number(item.cha_sgst) + Number(item.cha_cgst)), 0);


				}

				if (element.logistics_storage_charges.length > 0) {
					storage = element.logistics_storage_charges.reduce((sum, item) => sum + (Number(item.storage_charges) + Number(item.storage_sgst) + Number(item.storage_cgst)), 0);

					storageQty = element.logistics_storage_charges.reduce((sum, item) => sum + (Number(item.storage_qty)), 0);

				}

				total_cha_cfs_shipping_terminal += transportercharges + bondCharges + chacharge;
				total_charges_without_fob += transportercharges + bondCharges + chacharge;



				element.be_invoices = be_invoices;
				element.bl_invoices = bl_invoices;
				element.blremark = blremark;
				element.received_noc = received_noc;
				element.material_received_qty = material_received_qty;
				element.bl_list = blArray;
				element.noc = noc;
				element.lot_no = lot_no;
				element.status = status;
				element.days = noOfDays;
				element.noOfDaysShip = noOfDaysShip;
				element.be_copy = be_copy;
				element.material_received_date_logistics = material_received_date_logistics;
				element.total_cha_cfs_shipping_terminal = total_cha_cfs_shipping_terminal;
				element.fobCharge = fobCharge;
				element.fob_per_mt = Number(element.fobCharge / element.tot_non_qty).toFixed(2);
				element.fob_per_cont = Number(element.fobCharge / noc).toFixed(2);
				element.charges_per_mt = Number(total_charges_without_fob / element.tot_non_qty).toFixed(2);
				element.charges_per_cont = Number(total_charges_without_fob /
					noc).toFixed(2)


				element.total_charges_without_fob = total_charges_without_fob;



				element.storage_charges_mt = Number(storage / storageQty).toFixed(2);
				element.storage = storage;
				element.storageQty = storageQty;
				element.charges = `Total Charges/MT:
				${Math.round(element.charges_per_mt)} ,
				Total Charges/Cont:${element.charges_per_cont}, Storage Charges/MT :  (Qty: ${storageQty})
				: ${element.storage_charges_mt} , FOB/MT : ${element.fob_per_mt} , FOB/cont : ${element.fob_per_cont}`;

				this.non_list.push(element);

			}


			let non_filter_array = [];
			if (this.purchase_hold_link) {
				non_filter_array = this.non_list.filter(val => val.purchase_hold_qty_flag == 0);
			} else {
				non_filter_array = this.non_list;
			}
			this.non_list = non_filter_array;


			this.gloobalList = this.non_list;
			this.CalculateTotal(this.non_list);

			this.getSearchList();

			if (this.select_status) {
				this.checkStatus(this.select_status)
			}

		})
	}

	CalculateTotal(data) {
		this.totalQty = data.reduce((sum, item) => sum + Number(item.tot_non_qty), 0);
		this.totalReceived = data.reduce((sum, item) => sum + Number(item.material_received_qty), 0);
		this.totNOC = data.reduce((sum, item) => sum + Number(item.noc), 0);
		this.totCharges = data.reduce((sum, item) => sum + Number(item.total_cha_cfs_shipping_terminal), 0);
		this.totBcdLic = data.reduce((sum, item) => sum + Number(item.required_lic_amount), 0);

		// let dataFob = data.filter(x => {
		// 	if (x.incoTerm == 'FOB') {
		// 		return x;
		// 	}
		// });


		this.totChargesWithoutFob = data.reduce((sum, item) => sum + Number(item.total_charges_without_fob), 0);
	}

	checkForColor(group) {

		let result1 = [1, 3].every(i => group.includes(i)); if (result1) return '#80CBC4'; // in bond + hs
		let result2 = [1, 2].every(i => group.includes(i)); if (result2) return '#B4D8ED'; // in bond
		let result3 = [2, 3].every(i => group.includes(i)); if (result3) return '#FFCCBC'; // half inbond
		let result4 = [1, 4].every(i => group.includes(i)); if (result4) return '#FFCCBC'; // half INB

	}



	addBl(item) {
		//this.router.navigate(['logistics/bill-of-lading/' + item.id]);

		this.router.navigate([]).then(result => { window.open('/#/logistics/bill-of-lading/' + item.id, '_blank'); });
	}

	addBe(item) {
		this.router.navigate([]).then(result => { window.open('/#/logistics/bill-of-entry/' + item.id, '_blank'); });
		// this.router.navigate(['logistics/bill-of-entry/' + item.id]);
	}
	addCoaCopy(event: any) {
		this.coaDocs = <Array<File>>event.target.files;

	}

	addEndorseCopy(event: any) {
		this.endorseDocs = <Array<File>>event.target.files;

	}

	addLot(item) {
		this.non_invoice_no = item.invoice_no;
		this.non_id = item.id;
		this.getLot(item.id);
		this.myModal.show();

	}


	oncloseModal() {
		this.non_invoice_no = '';
		this.non_id = 0;
		this.addLotForm.reset();
		this.myModal.hide();
	}

	oncloseCoa() {
		this.non_id = 0;
		this.non_invoice_no = '';
		this.myModalCoa.hide();
	}

	uploadCoa(item) {

		this.non_id = item.id;
		this.non_invoice_no = item.invoice_no;
		this.myModalCoa.show();
	}

	onSubmitLot() {
		let data = {
			lot_no: this.addLotForm.value.lot_no,
			n_id: this.non_id
		}

		this.crudServices.addData<any>(Lot_coa.add, data).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getLot(this.non_id);
				this.addLotForm.reset();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
		})
	}


	getLot(id) {
		this.lot_list = [];

		this.crudServices.getOne<any>(Lot_coa.getAll, { n_id: id }).subscribe(response => {

			if (response.length > 0) {
				this.lot_list = response;
			} else {
				this.lot_list = [];
			}
		})

	}

	deleteLot(item, i) {
		if (item.id) {
			this.crudServices.deleteData<any>(Lot_coa.delete, { id: item.id }).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.lot_list.splice(i, 1);
				} else {
					this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
				}
			})
		}
	}

	updateLot(event, id) {

		if (confirm('Are you sure ')) {
			this.crudServices.updateData<any>(Lot_coa.update, { id: id, lot_no: event.target.value }).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getLot(this.non_id);
					this.addLotForm.reset();
				} else {
					this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
				}
			})

		}


	}

	addDays(days) {
		if (days) {
			let date = new Date(this.editNonForm.value.arrival_date);
			date.setDate(date.getDate() + Number(days.target.value));

			this.editNonForm.patchValue({ 'free_time_bl_dt': date });
		}



	}

	editNon(item) {
		this.previourArrivalDate = null;
		this.isForwardPi = 0;
		this.pi_id_list = []

		this.allDocRecvDt = false;
		this.verify_original_docs_rcv_forex = false;
		if (item.forward_sale_pi == 1) {
			this.getEmailTemplate()
			this.previourArrivalDate = item.arrival_date;
			this.isForwardPi = 1;
			this.pi_id_list = item.pi_id
		}

		this.editNonForm.patchValue({
			shiping_line_id: item.shipping_line_id,
			free_time_bl_dt: item.free_time_bl_dt ? new Date(item.free_time_bl_dt) : null,
			arrival_date: item.arrival_date ? new Date(item.arrival_date) : null,
			rbi_rate: item.rbi_rate,
			file_no: item.file_no,
			purchase_date: item.purchase_date ? new Date(item.purchase_date) : null,
			all_docs_rcev_from_forex_dt: item.all_docs_recv_from_forex_dt != null ? true : false,
			verify_original_docs_rcv_forex: item.verify_original_docs_rcv_forex ? true : false,
			fob_freight_lic: item.fob_freight_lic,
			fob_insurance_lic: item.fob_insurance_lic,


		})


		if (item.all_docs_recv_from_forex_dt != null && item.all_docs_recv_from_forex_dt) {
			this.allDocRecvDt = true;


		}

		if (item.verify_original_docs_rcv_forex == 1) {
			this.verify_original_docs_rcv_forex = true;
		}
		this.non_id = item.id;

		this.editNonModal.show();
	}

	onEditNon() {
		if (this.non_id) {
			let arr = this.premium;
			if (this.editNonForm.value.purchase_date) {
				arr = arr.filter(item => (new Date(item.from_date) <= new Date(this.editNonForm.value.purchase_date)) && (new Date(item.to_date) >= new Date(this.editNonForm.value.purchase_date)))
				if (arr.length > 1) {
					arr = arr.sort((a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime())
				}
			}
			let data = {
				id: this.non_id,
				shipping_line_id: this.editNonForm.value.shiping_line_id,
				free_time_bl_dt: this.datepipe.transform(this.editNonForm.value.free_time_bl_dt, 'yyyy-MM-dd'),
				arrival_date: this.datepipe.transform(this.editNonForm.value.arrival_date, 'yyyy-MM-dd'),
				purchase_date: this.datepipe.transform(this.editNonForm.value.purchase_date, 'yyyy-MM-dd'),
				rbi_rate: this.editNonForm.value.rbi_rate,
				file_no: this.editNonForm.value.file_no,
				fob_freight_lic: this.editNonForm.value.fob_freight_lic,
				fob_insurance_lic: this.editNonForm.value.fob_insurance_lic,
			}

			if (arr.length) {
				data['premium'] = arr[0].percent_value;
			}
			if (this.editNonForm.value.all_docs_rcev_from_forex_dt) {

				if (!this.allDocRecvDt) {
					let date = new Date();
					data['all_docs_recv_from_forex_dt'] = this.datepipe.transform(date, 'yyyy-MM-dd');
				}

			} else {
				data['all_docs_recv_from_forex_dt'] = null;
			}

			if (this.editNonForm.value.verify_original_docs_rcv_forex) {
				let date = new Date();
				data['verify_original_docs_rcv_forex'] = 1;
			} else {
				data['verify_original_docs_rcv_forex'] = 0;
			}

			let fileData: any = new FormData();
			const document1: Array<File> = this.endorseDocs;

			const arrivalDate = this.editNonForm.value.arrival_date != null ? moment(this.editNonForm.value.arrival_date).format('YYYY-MM-DD') : null;
			if (document1.length > 0) {
				for (let i = 0; i < document1.length; i++) {
					fileData.append('endorse_invoice_copy', document1[i], document1[i]['name']);
				}
				this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let fileDealDocs1 = [];
					let filesList1 = [];
					if (res.uploads.endorse_invoice_copy) {
						filesList1 = res.uploads.endorse_invoice_copy;
						for (let i = 0; i < filesList1.length; i++) {
							fileDealDocs1.push(filesList1[i].location);
						}
						data['endorse_invoice_copy'] = JSON.stringify(fileDealDocs1);

						this.crudServices.updateData<any>(NonNegotiable.update_non, data).subscribe(response => {
							if (arrivalDate && (this.previourArrivalDate == null || this.previourArrivalDate != arrivalDate)) {
								let body = {
									n_id: this.non_id,
									arrival_date: this.editNonForm.value.arrival_date
								}
								let whastappbody = {
									n_id: this.non_id,
									arrival_date: this.editNonForm.value.arrival_date,
									status: this.previourArrivalDate == null ? 'Newly Added' : 'Revised'
								}

								this.crudServices.addData<any>(NonNegotiable.updateArrival, body).subscribe(response => {
									this.crudServices.postRequest<any>(NonNegotiable.sendArrivalWhastapp, whastappbody).subscribe(ressend => {
										console.log(ressend.data);
									})

								})
							}
							if (this.isForwardPi == 1) {

								if (this.editNonForm.value.arrival_date) {
									this.sendMailShipmentImport(this.datepipe.transform(this.editNonForm.value.arrival_date, 'yyyy-MM-dd'));
								}

							}
							this.toasterService.pop(response.message, response.message, response.data);
							this.oncloseModalNon();
						})
					}
				})
			} else {
				this.crudServices.updateData<any>(NonNegotiable.update_non, data).subscribe(response => {
					if (arrivalDate && (this.previourArrivalDate == null || this.previourArrivalDate != arrivalDate)) {
						let body = {
							n_id: this.non_id,
							arrival_date: this.editNonForm.value.arrival_date
						}

						let whastappbody = {
							n_id: this.non_id,
							arrival_date: this.editNonForm.value.arrival_date,
							status: this.previourArrivalDate == null ? 'Newly Added' : 'Revised'
						}

						this.crudServices.addData<any>(NonNegotiable.updateArrival, body).subscribe(response => {
							this.crudServices.postRequest<any>(NonNegotiable.sendArrivalWhastapp, whastappbody).subscribe(ressend => {
								console.log(ressend.data);
							})
						})
					}


					if (this.isForwardPi == 1) {
						if (this.editNonForm.value.arrival_date) {
							this.sendMailShipmentImport(this.datepipe.transform(this.editNonForm.value.arrival_date, 'yyyy-MM-dd'));
						}
					}

					this.toasterService.pop(response.message, response.message, response.data);
					this.oncloseModalNon();
				})
			}





		}
	}

	async getEmailTemplate() {
		this.emailSubject = undefined;
		this.emailFooterTemplete = undefined;
		this.emailBodyTemplete = undefined;
		let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'surisha order processing' });
		let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
		await forkJoin([headerRed, footer_req]).subscribe(response => {
			if (response[0].length > 0) {
				this.emailBodyTemplete = response[0][0].custom_html;
				this.emailSubject = response[0][0].subject;
				this.emailFrom = response[0][0].from_name;
			}
			if (response[1].length > 0) {
				this.emailFooterTemplete = response[1][0].custom_html;
			}
		})
	}
	sendMailShipmentImport(arrival_date) {

		if (this.previourArrivalDate == null || this.previourArrivalDate != arrival_date) {

			this.crudServices.getOne(salesPurchaseLinking.getLinkDataAgainstPi, { pi_id: this.pi_id_list }).subscribe(res => {
				if (res['data'].length) {
					for (let val of res['data']) {
						if (val.so_no != undefined && val.so_cover_qty != undefined && val.grade_name != undefined && val.booking_date != undefined && val.port_name != undefined) {
							let emails = [...this.magangementSurishaEmailSales_Company_ID_3]
							if (val.email_office && val.email_office != null) {
								emails.push(val.email_office)
							}



							// if (val.temp_email! = null) {
							//   let mails = val.temp_email.split(',')
							//   for (let mail of mails) {
							//     emails.push(mail)
							//   }
							// }
							let emailTemplateBody = this.emailBodyTemplete;
							let emailTemplateSubject = this.emailSubject



							let obj = {
								SO_NO: val.so_no,
								QTY: val.so_cover_qty + ' ' + val.unit_type,
								GRADE: val.grade_name,
								TODAY: moment(val.booking_date).format('DD-MM-YYYY'),
								SUPPLIER: val.sub_org_name,
								COUNTRY: val.country_of_origin,
								PORT: val.port_name,
								ETA: moment(arrival_date).format('DD-MM-YYYY')
							}

							for (const key in obj) {
								emailTemplateBody = emailTemplateBody.replace(new RegExp('{' + key + '}', 'g'), obj[key]);
							}
							let etd = ''
							if (val.etd != null) {
								etd = `<strong>ETD&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : ${moment(val.etd).format('DD-MM-YYYY')}</strong></span></span></p>`
							}
							const SO_NO = /{SO_NO}/gi;
							emailTemplateSubject = emailTemplateSubject.replace(SO_NO, val.so_no);

							const ETD = /{ETD}/gi;
							emailTemplateBody = emailTemplateBody.replace(ETD, etd);



							let emailBody = {

								tomail: emails,
								subject: emailTemplateSubject,
								bodytext: emailTemplateBody + this.emailFooterTemplete,

							}




							this.crudServices.postRequest<any>(Consignments.sendSurishaMail, emailBody).subscribe((response) => {
								this.toasterService.pop('success', 'SHIPMNENT PLANNING UPDATE  !', ' MAIL SEND SUCCESS!')
							});
						}

					}


				}

			})

		}


	}

	getPremium() {
		this.crudServices.getOne<any>(percentage_master.getByType, { type: "Logistics Premium" }).subscribe(response => {
			this.premium = response


		})
	}


	oncloseModalNon() {
		this.editNonModal.hide();
		this.editNonForm.patchValue({ 'freedays': null });
		this.non_id = 0;
		this.getNonList();
	}

	uploadCoaCopy() {
		let fileData: any = new FormData();
		const document1: Array<File> = this.coaDocs;

		if (document1.length > 0) {
			for (let i = 0; i < document1.length; i++) {
				fileData.append('coa_copy', document1[i], document1[i]['name']);
			}
		}




		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {


			let fileDealDocs1 = [];
			let filesList1 = [];
			let data = {};

			if (res.uploads.coa_copy) {
				filesList1 = res.uploads.coa_copy;
				for (let i = 0; i < filesList1.length; i++) {
					fileDealDocs1.push(filesList1[i].location);
				}
				data['coa_copy'] = JSON.stringify(fileDealDocs1);

			}

			if (data['coa_copy']) {
				data['id'] = this.non_id;
				this.crudServices.updateData<any>(NonNegotiable.updateCoaCopy, data).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
						this.oncloseCoa();
						this.getNonList();
					} else {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
					}
				})

			} else {
				this.toasterService.pop('warning', 'warning', 'No File Uloaded');
			}




		})

	}

	getType(val) {
		if (val == 1) {
			return "Lc PI";
		}

		if (val == 2) {
			return "Non Lc PI";
		}

		if (val == 3) {
			return "Indent PI";
		}
	}

	getDocArray(val) {
		return JSON.parse(val);
	}

	openCoaMail(item) {
		this.grade_name = item.grade_master != null ? item.grade_master.grade_name : null;
		let email = item.port_master != null ? item.port_master.email_coa : null;
		if (email != null) {
			this.email = email.split(',');
		}
		this.non_id = item.id;
		this.coa_copy = item.coa_copy;
		this.getTemplate();
		this.myModalCoaMail.show();
	}

	oncloseCoaMail() {
		this.grade_name = '';
		this.non_id = 0;
		this.coa_copy = '';
		this.ccText = '';
		this.bccText = '';
		this.tomail = [];
		this.ccMail = [];
		this.myModalCoaMail.hide();
	}

	sendMail() {

		if (this.ccText != null && this.ccText != undefined && this.ccText != '') {
			let ccText = [];
			let bccText = [];
			let attachment = [];

			let html = '';
			if (this.ccText) {
				ccText = this.ccText.split(",");
			}

			if (this.bccText) {
				bccText = this.bccText.split(",");
			}



			if (this.coa_copy) {
				const files = JSON.parse(this.coa_copy);
				for (let j = 0; j < files.length; j++) {
					const test = files[j].split('/');
					attachment.push({ 'filename': test[4], 'path': files[j] });
				}
			}

			html = this.coaTemplate + this.footer;

			let arr = { 'from': this.from, 'to': ccText, 'cc': bccText, 'subject': this.subject, 'html': html, 'attachments': attachment };
			this.isLoadingMail = true;
			this.crudServices.postRequest<any>(Lot_coa.sendEmail, { mail_object: arr, n_id: this.non_id }).subscribe(response => {
				this.isLoadingMail = false;
				this.toasterService.pop(response.message, response.message, response.data);
				this.oncloseCoaMail();
			})

		} else {
			this.toasterService.pop('warning', 'warning', 'Enter Email Address ');
		}

	}

	getTemplate() {
		this.coaTemplate = '';
		this.subject = '';
		this.from = '';
		this.footer = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'COA' }).subscribe(response => {

			this.coaTemplate = response[0].custom_html;
			this.subject = response[0].subject;
			this.from = response[0].from_name;

			const re = /{INVOICE_NO}/gi;

			this.subject = this.subject.replace(re, this.grade_name);

		})

		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
			this.footer = response[0].custom_html;

		})
	}

	deliveryChallan(id) {
		this.router.navigate(['logistics/delivery-challan/' + id]);
	}


	LicenseKnockOff(data) {
		let n_id = data.id;
		this.router.navigate(["logistics/knock-of-license", n_id]);
	}

	// multiselect filter
	onchange(event, name) {


		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	// date filter
	onDateSelect($event, name) {
		this.table.filter(this.convert($event), name, 'equals');
	}

	onIgmDateSelect($event) {
		this.igm_date =  $event
	}

	convert(date) {
		return this.datepipe.transform(date, 'yyyy-MM-dd');
	}


	// call on each filter set local storage for colums
	@Input() get selectedColumns(): any[] {
		localStorage.setItem('selected_col_arrival_chart', JSON.stringify(this._selectedColumns));
		return this._selectedColumns;
	}

	set selectedColumns(val: any[]) {
		this._selectedColumns = this.cols.filter(col => val.includes(col));
	}

	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}

	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;
		this.CalculateTotal(event.filteredValue)

	}



	// data exported for pdf excel download
	exportData() {
		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.non_list;
		} else {
			arr = this.filteredValuess;
		}
		for (let i = 0; i < arr.length; i++) {
			const export_data = {};
			for (let j = 0; j < this._selectedColumns.length; j++) {
				if (this._selectedColumns[j]['field'] == 'port_name') {
					let cha = arr[i]['cha'] ? '\n , CHA : ' + arr[i]['cha'] : ''
					export_data[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']] + cha;
				} else if (this._selectedColumns[j]['field'] == 'sub_org_name') {
					export_data[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']] + '\n , Shipping Line : ' + arr[i]['shipping_line'];
				} else if (this._selectedColumns[j]['field'] == 'invoice_no') {
					let pi = ''
					pi += arr[i]['high_seas_pi'] == 1 ? '\n , High Seas PI' : ''
					pi += arr[i]['forward_sale_pi'] == 1 ? '\n  ,Import Surisha PI' : '';
					pi += arr[i]['toBeBond'] ? '\n  ,Bond To Be' : '';

					let date = arr[i]['all_docs_recv_from_forex_dt'] != null ? `\n , Ori Rec By Logistics  :  ${this.datepipe.transform(arr[i]['all_docs_recv_from_forex_dt'], 'dd/MM/yyyy')} ` : ''
					export_data[this._selectedColumns[j]['header']] = arr[i]['invoice_no'] + date + pi;
				} else if (this._selectedColumns[j]['field'] == 'id') {
					let date = arr[i]['non_recv_sent_cha'] != null ? `\n , Non To CHA Dt  :  ${this.datepipe.transform(arr[i]['non_recv_sent_cha'], 'dd/MM/yyyy')} ` : ''
					export_data[this._selectedColumns[j]['header']] = arr[i]['id'] + date;
				} else if (this._selectedColumns[j]['field'] == 'ad_code') {
					let date = arr[i]['original_doc_received_date'] != null ? `\n , Original Doc Recv from Bank :  ${this.datepipe.transform(arr[i]['original_doc_received_date'], 'dd/MM/yyyy')} ` : ''
					export_data[this._selectedColumns[j]['header']] = arr[i]['ad_code'] + '\n ,' + arr[i]['bank_name'] + date;
				} else if (this._selectedColumns[j]['field'] == 'non_revised_copy') {
					let copy = ''
					if (arr[i]['revise_non_details'] != null) {

						for (let val of arr[i]['revise_non_details']) {
							copy += '\n  Mail Sent:' + this.datepipe.transform(val['revise_non_sent_dt'], 'dd/MM/yyyy')
						}

					}
					export_data[this._selectedColumns[j]['header']] = copy;

				}

				else if (this._selectedColumns[j]['field'] == 'arrival_date') {
					let date = arr[i]['date_of_shipment'] != null ? `\n , Shipment Date:  ${this.datepipe.transform(arr[i]['date_of_shipment'], 'dd/MM/yyyy')}  (${arr[i]['noOfDaysShip']}) Days` : ''
					export_data[this._selectedColumns[j]['header']] = arr[i]['arrival_date'] + '\n ,' + arr[i]['bank_name'] + date;
				}

				else {
					export_data[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];
				}


			}
			export_data['Noc'] = arr[i]['noc'];
			export_data['charges'] = arr[i]['charges'];
			 export_data['BL Remark'] = arr[i]['blremark'];		
			
	



			this.export_purchase_list.push(export_data);


		}

		for (let j = 0; j < this._selectedColumns.length; j++) {
			if (this._selectedColumns[j]['field'] == 'tot_non_qty') {
				foot[this._selectedColumns[j]['header']] = `Total Qty: ${this.totalQty}`;

			} else {
				foot[this._selectedColumns[j]['header']] = '';
			}
		}

		foot['Noc'] = `Total NOC: ${this.totNOC}`;
		foot['charges'] = `Total Charges:${Number(this.totCharges)} , Average/MT: ${Number(this.totCharges / this.totalQty).toFixed(2)} and Average/Cont: ${Number(this.totCharges / this.totNOC).toFixed(2)}`;


		this.export_purchase_list.push(foot);


	}

	// download doc ,pdf , excel

	exportPdf() {
		this.export_purchase_list = [];
		this.exportData();
		this.exportColumns = this._selectedColumns.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_purchase_list, 'Arrival-chart');
	}

	exportExcel() {
		this.export_purchase_list = [];
		this.exportData();
		this.exportService.exportExcel(this.export_purchase_list, 'Arrival-chart');
	}

	openSearch() {
		this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
			this.port_list = response;
		})
		this.crudServices.getAll<any>(shipmentType.getAll).subscribe(response => {
			this.shipmentType = response;
		})
		this.serchModal.show();
	}

	oncloseModalSearch() {
		this.serchModal.hide();
		this.getNonList();
	}

	getSearchList() {
		let port: number;

		if (localStorage.getItem('selected_port_arrival')) {
			port = JSON.parse(localStorage.getItem('selected_port_arrival'));
		} else {
			port = this.port;
		}

		// this.data = {
		// 	port_id: port,
		// 	invoice_no: this.searchForm.value.invoice_no,
		// 	shippine_line_id: this.searchForm.value.shippine_line_id,
		// 	import_type: this.searchForm.value.import_type,
		// 	bl_no: this.searchForm.value.bl_no,
		// 	be_no: this.searchForm.value.be_no,
		// 	lot_no: this.searchForm.value.lot_no,

		// }

		this.data = {

			invoice_no: this.searchForm.value.invoice_no,
			shippine_line_id: this.searchForm.value.shippine_line_id,
			import_type: this.searchForm.value.import_type,
			bl_no: this.searchForm.value.bl_no,
			be_no: this.searchForm.value.be_no,
			be_dt: this.searchForm.value.be_dt,
			lot_no: this.searchForm.value.lot_no,

		}



		this.serchModal.hide();
		this.advanceSearch();

	}

	mailto(check, val) {
		this.ccText = '';
		if (check) {
			this.tomail.push(val);
		} else {
			this.tomail.splice(this.tomail.indexOf(val), 1);
		}
		for (let i = 0; i < this.tomail.length; i++) {
			this.ccText = this.ccText + this.tomail[i] + ',';
		}
	}

	ccmail(check, val) {
		this.bccText = '';
		if (check) {
			this.ccMail.push(val);
		} else {
			this.ccMail.splice(this.ccMail.indexOf(val), 1);
		}
		for (let i = 0; i < this.ccMail.length; i++) {
			this.bccText = this.bccText + this.ccMail[i] + ',';
		}
	}

	ccmailvalue($e) {
		this.bccText = $e.target.value;
	}

	tomailvalue($e) {
		this.ccText = $e.target.value;
	}

	advanceSearch() {
		this.non_list = this.gloobalList;
		// if (this.data.port_id && this.data.port_id != null) {
		// 	this.non_list = this.non_list.filter(data => data.port_id == this.data.port_id);
		// }
		if (this.data.shippine_line_id && this.data.shippine_line_id != null) {
			this.non_list = this.non_list.filter(data => data.shipping_line_id == this.data.shippine_line_id);
		}

		if (this.data.bl_no && this.data.bl_no != null) {

			this.non_list = this.non_list.filter(data => data.bl_invoices.replace(/\s/g, "") == this.data.bl_no.replace(/\s/g, ""));
		}

		if (this.data.be_no && this.data.be_no != null) {

			this.non_list = this.non_list.filter(data => data.be_invoices.replace(/\s/g, "") == this.data.be_no.replace(/\s/g, ""));
		}

		

		if (this.data.invoice_no && this.data.invoice_no != null) {

			this.non_list = this.non_list.filter(data => data.invoice_no.replace(/\s/g, "") == this.data.invoice_no.replace(/\s/g, ""));
		}


		if (this.data.import_type && this.data.import_type != null) {

			this.non_list = this.non_list.filter(data => data.shipmentArr.includes(this.data.import_type));
		}

		if (this.data.lot_no && this.data.lot_no != null) {

			this.non_list = this.non_list.filter(data => data.lot_no.replace(/\s/g, "") == this.data.lot_no.replace(/\s/g, ""));
		}


	}

	addCharges(id) {
		if (id) {
			this.router.navigate(['logistics/add-charges/' + id]);
		}
	}




}
