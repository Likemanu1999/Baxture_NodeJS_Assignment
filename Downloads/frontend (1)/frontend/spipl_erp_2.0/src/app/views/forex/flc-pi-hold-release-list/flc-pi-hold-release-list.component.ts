import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';


import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { ProformaInvoiceService } from '../proforma-invoice/proforma-invoice-service';
import { PaymentTermService } from '../../masters/payment-term-master/payment-term-service';
// import { CreateLcService, CreateLcList } from './create-lc-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';
import { Table } from 'primeng/table';



import { TemplateService } from '../../masters/template-editor/template-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import {
	 flcProformaInvoice, 
} from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';
import { HelperService } from '../../../_helpers/helper_service';

@Component({
	selector: 'app-flc-pi-hold-release-list',
	templateUrl: './flc-pi-hold-release-list.component.html',
	styleUrls: ['./flc-pi-hold-release-list.component.scss'],
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		SpiplBankService,
		MainSubOrgService,
		ProformaInvoiceService,
		PaymentTermService,
		// CreateLcService,
		OrgBankService,
		// IndentPIService,
		TemplateService,
		ExportService,
		CrudServices,
		MessagingService,
		HelperService
	]
})
export class FlcPiHoldReleaseListComponent implements OnInit {

	@ViewChild('dt', { static: false }) table: Table;

	
	serverUrl: string;
	user: UserDetails;
	
	isLoading = false;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	public today = new Date();


	fileData: any = new FormData();
	pi_flag = [];
	spipl_bank = [];
	status = [];
	holdReleaseData = [{ dataLabel: 'All', dataValue: 3 }, { dataLabel: 'Hold', dataValue: 1 }, { dataLabel: 'Release', dataValue: 0 }];
	hold_Release_Data_Status: any;
	lc_data = [];
	globalLcData = [];
	checkedList = [];
	pi_id_list = [];
	paymentTerm = [];
	qtyRate = [];
	quantity = [];
	org_bank = [];
	one_pi = [];
	item = [];
	tomail = [];
	ccMail = [];
	exportColumns: any[];

	// filter values
	pi_flag_status = 0;
	startDate: Date
	endDate: Date
	availability = 0;
	supplier = 0;
	bank = 0;
	non_pending_check = 0;
	totalRecords = 0;

	lookup = {};
	supplier_list = [];
	buyer_list = [];
	lookup_bank = {};
	lookup_buyer = {};
	lookup_port = {};
	destports = [];
	loadports = [];
	lookup_load_port = [];

	lookup_grade = {}
	grade_arr = [];
	lookup_mainGrade = {};
	mainGrade_arr = [];

	pistatus = {};
	piarr = [];
	banks = [];

	// lc form details
	buyerBankName: string;
	buyerBankAddress: string;
	buyerOrgAddress: string;
	buyerOrgName: string;
	suppierOrgName: string;
	suppierOrgAddress: string;
	currency: string;
	destinationPort: string;

	firstAdvBank: string;
	firstAdvBankAddress: string;
	material_load_port: string;
	adv_bank_swift_code: string;
	buyerBankSwiftCode: string;
	gradeName: string;
	piInsuranceType: string;
	payment_term: string;
	totamount = 0;
	totquantity = 0;
	expiry = 0;
	latest_date = '';
	exp_date = '';
	total_qty = 0;
	tot_rate = 0;
	commision_amt = 0;
	commision_received = 0;

	mode: any;
	buyeriec: any;
	filteredValuess: any[];
	total_amt: number;
	tomailtext: string;
	ccmailtext: string;
	email: any;

	supplier_id: Number;
	spipl_bank_id: Number;
	available_with_bank_name: string;
	tolarance = [];
	transship = [];
	confirm = [];
	colss: any[];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	indentlcdoc: Array<File> = [];
	nondoc: Array<File> = [];
	indentAmendDoc: Array<File> = [];
	indentSwiftDoc: Array<File> = [];
	indent_pi_id: any;
	indent_invoive: any;
	indet_commission: any;
	indent_flag: any;
	footer_template = [];
	html_template = [];
	tot_amt: number;
	export_data: any[];
	submitted: boolean;
	checkData: any[];
	IndentSwiftList = [];
	indentSwiftid: any;
	swift_date: any;
	swift_commision_amt: any;
	appDate: any;

	lcpaymentTerm: string;
	sendMailPI: boolean;
	sendMailNON: boolean;

	piRegDoc: Array<File> = [];
	pi_id: any;
	port_list = [];
	destination_port_id = null;
	sc_lable: any;
	pi_registration_copy = [];


	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;
	currentYear: number;
	date = new Date();
	selected_date_range: any;



	constructor(
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private exportService: ExportService,
		private CrudServices: CrudServices) {

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		this.selected_date_range = [new Date("2022-11-01"), new Date(Number(this.currentYear + 1), 2, 31)];

		this.startDate = this.selected_date_range[0];
		this.endDate = this.selected_date_range[1];

		this.sc_lable = "Sales Contract List Hold/Release"
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();

		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
	
		this.colss = [
			{ field: 'proform_invoice_no', header: 'PI Invoice Number' },
			{ field: 'proform_invoice_date', header: 'PI Invoice Date' },
			{ field: 'piStage', header: 'PI Stage' },
			{ field: 'tentitive_departure_date', header: 'ETD' },
			{ field: 'arrival_date', header: 'ETA' },
			{ field: 'suppierOrgName', header: 'Supplier' },
			{ field: 'pi_quantity', header: 'Quantity' },
			{ field: 'mainGradeName', header: 'Main Grade' },
			{ field: 'gradeName', header: 'Grade' },
			{ field: 'destinationPort', header: 'Port' },
			{ field: 'purchase_hold_qty_flag', header: 'Hold/Release' },
		];
	}

	ngOnInit() {
		// this.getNotifications('FOREIGN_SALE_CONTRACT_DELETE');
		this.hold_Release_Data_Status = 1
		this.getPiList();
	}

	toggleHoldReleaseQty(rowId: any, purchase_hold_qty_flag: any) {
		this.CrudServices.postRequest<any>(flcProformaInvoice.setAllPiHoldRelease, {
			rowId: rowId,
			purchase_hold_qty_flag: purchase_hold_qty_flag
		}).subscribe((response) => {
			if (response.status == 200 && response.code == "100") {
				this.toasterService.pop('success', 'Success', "Data Updated Successfully");
				this.getPiList();
			} else {
				this.toasterService.pop('error', 'error', 'Something Bad Happend');
			}
		})
	}

	// get pi list
	getPiList() {
		this.isLoading = true;
		this.lc_data = [];
		this.CrudServices.postRequest<any>(flcProformaInvoice.getAllPiHoldRelease, {
			pi_flag: this.pi_flag_status,
			startDate: this.startDate,
			endDate: this.endDate,
			hold_Release_Data_Status: this.hold_Release_Data_Status
		}).subscribe((response) => {
			this.isLoading = false;
			for (const val of response) {
				val.destinationPort = val.port_master.destinationPort;
				val.gradeName = val.grade_master.gradeName;
				val.mainGradeName = val.grade_master.main_grade.main_grade_name;
				val.suppierOrgName = val.supp_org.suppierOrgName;
				val.arrival_date = val.tentitive_arrival_date;
				if (val.rel_non_pis.length > 0 && val.rel_non_pis[0].non_negotiable.materialReceivedFlag == 1) {
					
					val.arrival_date = val.rel_non_pis[0].non_negotiable.arrival_date ? val.rel_non_pis[0].non_negotiable.arrival_date : val.tentitive_arrival_date;
					val.piStage = "Material Received";
					val.contRecv = val.rel_non_pis[0].non_negotiable.container_details.length ? val.rel_non_pis[0].non_negotiable.container_details[0].cont_received_date : ''
					val.pistageFlag = 1;
				}
				else {
					val.pistageFlag = 0;
					if (val.rel_non_pis.length > 0 && val.rel_non_pis[0].non_negotiable.bill_of_ladings.length > 0 &&
						val.rel_non_pis[0].non_negotiable.bill_of_ladings[0].bStatus == 2) {
						val.piStage = "In Bond";
					} else {
						if (val.rel_non_pis.length > 0 && val.rel_non_pis[0].non_negotiable.bill_of_ladings.length > 0 &&
							val.rel_non_pis[0].non_negotiable.bill_of_ladings[0].bStatus !== 2) {
							val.piStage = "In Transite";
						}
						else {
							if (val.pi_flag == 1 && val.lc_id == null) {
								val.piStage = "LC Not Issue";
							} else {

								if (val.rel_non_pis.length == 0 && val.lc_id !== null) {
									val.piStage = "NON Pending-LC";
								} else {
									if (val.pi_flag == 2 && val.lc_id == null && val.rel_non_pis.length == 0) {
										val.piStage = "NON Pending-Non LC";
									} else {
										if (val.pi_flag == 3) {
											val.piStage = "Indent";
										}
									}
								}
							}
						}
					}
				}

				if(val.forward_sale_pi==1)
				{
					val.pitype="Import Surisha PI";
				}else if(val.high_seas_pi==1)
				{
					val.pitype="HighSeas PI";
				}else 
				{
					val.pitype="Regular PI";
				}
				this.lc_data.push(val);

				// filter list

				if (!(val.supp_org.suppierOrgName in this.lookup)) {
					this.lookup[val.supp_org.suppierOrgName] = 1;
					this.supplier_list.push({ 'suppierOrgName': val.supp_org.suppierOrgName });
				}

				//destinationPort
				if (!(val.port_master.destinationPort in this.lookup_port)) {
					this.lookup_port[val.port_master.destinationPort] = 1;
					this.destports.push({ 'destinationPort': val.port_master.destinationPort });
				}


				if (!(val.grade_master.gradeName in this.lookup_grade)) {
					this.lookup_grade[val.grade_master.gradeName] = 1;
					this.grade_arr.push({ 'gradeName': val.grade_master.gradeName });
				}


				if (!(val.grade_master.main_grade.main_grade_name in this.lookup_mainGrade)) {
					this.lookup_mainGrade[val.grade_master.main_grade.main_grade_name] = 1;
					this.mainGrade_arr.push({ 'mainGradeName': val.grade_master.main_grade.main_grade_name });
				}

				if (!(val.piStage in this.pistatus)) {
					this.pistatus[val.piStage] = 1;
					this.piarr.push({ 'piStage': val.piStage });
				}
			}

			// let filterdata = this.lc_data.filter(val => val.pistageFlag == 0);
			// this.lc_data = filterdata;
			this.globalLcData = this.lc_data;
			this.checkData = this.lc_data;
			this.totalRecords = this.lc_data.length;
			this.totalCalculation(this.lc_data);
		});

	}

	// on submit filter values
	// onSubmit($e, name, id) {

	// 	this.checkedList = [];
	// 	this.lc_form = false;
	// 	this.pi_id_list = [];
	// 	this.qtyRate = [];
	// 	this.quantity = [];
	// 	this.item = [];
	// 	this.available_with_bank_name = '';
	// 	this.addForm.reset();
	// 	if ($e) {
	// 		this[name] = $e[id];
	// 	} else {
	// 		this[name] = 0;
	// 	}

	// 	if (this.pi_flag_status !== 0 && this.availability === 0) {
	// 		this.lc_data = this.filterFlag(this.globalLcData);
	// 		this.sc_lable = "Sales Contract List Hold-Releae";
	// 	} else if (this.pi_flag_status !== 0 && this.availability !== 0) {
	// 		this.sc_lable = "Create LC : Available Sales Contract List Hold-Releae";
	// 		this.lc_data = this.filterFlag_availability(this.globalLcData);
	// 	} else {
	// 		this.lc_data = this.globalLcData;
	// 		this.sc_lable = "Sales Contract List Hold-Releae";
	// 	}
	// 	this.checkData = this.lc_data;
	// 	// console.log(this.checkData, "checkdata");
	// 	this.totalCalculation(this.lc_data);
	// }

	// checkNonPending(event) {
	// 	if (event.currentTarget.checked) {
	// 		this.non_pending_check = 1;
	// 		this.sc_lable = "NON Pending List For LC/NON LC Sales Contracts";
	// 	} else {
	// 		this.non_pending_check = 0;
	// 		this.sc_lable = "Sales Contract List Hold-Releae";
	// 	}
	// 	this.getPiList();
	// }


	// filterFlag(row) {
	// 	return row.filter(data => data.pi_flag === this.pi_flag_status);
	// }

	// filterFlag_availability(row) {
	// 	if (this.pi_flag_status === 1) {

	// 		if (this.availability === 1) {
	// 			return row.filter(data => data.pi_flag === this.pi_flag_status && data.lc_id == null);
	// 		} else if (this.availability === 2) {
	// 			return row.filter(data => data.pi_flag === this.pi_flag_status && data.lc_id != null);
	// 		} else {
	// 			return row.filter(data => data.pi_flag === this.pi_flag_status);
	// 		}
	// 	}

	// 	if (this.pi_flag_status === 2) {
	// 		return row.filter(data => data.pi_flag === this.pi_flag_status);
	// 	}

	// 	if (this.pi_flag_status === 3) {
	// 		return row.filter(data => data.pi_flag === this.pi_flag_status);
	// 	}
	// }

	// // conver string to array
	// getDocsArray(docs) {
	// 	if (docs != null || docs != '') {
	// 		return JSON.parse(docs);
	// 	} else {
	// 		return null;
	// 	}
	// 	//return null;
	// }

	// edit pi

	// date conversion
	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	totalCalculation(data) {
		this.totalRecords = data.length;
		this.total_qty = 0;
		if (this.non_pending_check == 1) {

			this.total_qty = this.someFunction(data)
		} else {
			this.total_qty = data.reduce((sum, item) => sum + Number(item.pi_quantity), 0);
		}
	}

	someFunction(data) {
		return data.reduce(function (sum, item) {
			return (item.half_pending_non == 0) ? sum + item.pi_quantity : sum + item.half_pending_non;
		}, 0);
	}

	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;
		this.checkData = this.filteredValuess;
		this.totalCalculation(this.filteredValuess);
	}

	exportData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let rate = 0;
		let indent_comm = 0;
		let indent_comm_received = 0;
		let amount = 0;

		for (const val of this.checkData) {
			let lc_tt_details = '';
			let etd_eta = '';
			let flag = '';
			etd_eta = 'ETD:' + val.tentitive_departure_date + 'ETA :' + val.tentitive_arrival_date;
			// if (val.pi_flag === 1 && val.lc_expiry_date) {
			// 	lc_tt_details = 'Lc Expiry Date: ' + val.lc_expiry_date + '\nBank Lc No:' + val.bank_lc_no + '\nLc Opening Date:' + val.lc_opening_date;
			// } else if (val.pi_flag === 2) {

			// 	//non_lc_swift_tt_details
			// 	if (val.non_lc_swift_details !== null) {
			// 		//this.getDocsArray(val.non_lc_swift_details)
			// 		for (const swiftdtt of val.non_lc_swift_details) {
			// 			lc_tt_details = lc_tt_details + '\nREF No: ' + swiftdtt.non_lc_swift_ref_no + '\nSwift Date:' + swiftdtt.non_lc_swift_date;
			// 		}
			// 	}

			// }

			if (val.pi_flag === 1) {
				flag = 'LC PI';
			} else if (val.pi_flag === 2) {
				flag = 'Non Lc PI';
			} else if (val.pi_flag === 3) {
				flag = 'Indent PI';
			}
			data = {
				'PI Invoice Number': val.proform_invoice_no,
				'Supplier': val.suppierOrgName,
				'Quantity': val.pi_quantity,
				// 'Amount': Number(val.pi_quantity) * Number(val.pi_rate),
				'Main Grade': val.mainGradeName,
				'Grade': val.gradeName,
				'Port': val.destinationPort,
				'Hold/Release': val.purchase_hold_qty_flag == 0 ? 'Release' : 'Hold'
			};
			this.export_data.push(data);
			qty = qty + Number(val.pi_quantity);
			rate = rate + Number(val.pi_rate);
			amount = amount + Number(val.pi_quantity) * Number(val.pi_rate);

			indent_comm = indent_comm + Number(val.indent_commision_amt_usd);
			indent_comm_received = indent_comm_received + Number(val.indentComissionReceived);

		}

		const foot = {
			'PI Invoice Number': '',
			'Supplier': 'Total',
			'Quantity': qty,
			'Main Grade': '',
			'Grade': '',
			'Port': '',
			'Hold/Release': ''
		};
		this.export_data.push(foot);
	}

	exportExcel() {
		this.export_data = [];
		this.exportData();
		this.exportService.exportExcel(this.export_data, 'PI List Hold-Release');
	}

	exportPdf() {
		this.export_data = [];
		this.exportData();
		this.exportColumns = this.colss.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'PI List Hold-Release');
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

	getData($e) {
		this.startDate = $e[0];
		this.endDate = $e[1];
	}

	holdFlagChange(event) {
		if (this.hold_Release_Data_Status === null) {
			this.hold_Release_Data_Status = 3;
		}
	}
}
