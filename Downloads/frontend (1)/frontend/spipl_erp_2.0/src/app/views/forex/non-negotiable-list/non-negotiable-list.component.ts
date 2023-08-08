import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, Input, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';


import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { ProformaInvoiceService, ProformaInvoiceList } from '../proforma-invoice/proforma-invoice-service';
import { CreateLcService, CreateLcList } from '../lc-creation/create-lc-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';
import { NonService, NonList } from '../lc-in-operation/non-service';
import { GradeMasterService } from '../../masters/grade-master/grade-master-service';
import { Subscription } from 'rxjs';
import { UtilizationService } from '../utilisation-chart/utilization-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { TemplateService } from '../../masters/template-editor/template-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, PortMaster } from '../../../shared/apis-path/apis-path';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
	selector: 'app-non-negotiable-list',
	templateUrl: './non-negotiable-list.component.html',
	styleUrls: ['./non-negotiable-list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		SpiplBankService,
		MainSubOrgService,
		ProformaInvoiceService,
		CreateLcService,
		OrgBankService,
		NonService,
		GradeMasterService,
		UtilizationService,
		ExportService,
		TemplateService,
		CrudServices
	]
})
export class NonNegotiableListComponent implements OnInit, AfterViewInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('myModalPending', { static: false }) public myModalPending: ModalDirective;
	@ViewChild('chargeModal', { static: false }) public chargeModal: ModalDirective;
	@ViewChild('paymentStatusModal', { static: false }) public paymentStatusModal: ModalDirective;
	@ViewChild('originalDocModal', { static: false }) public originalDocModal: ModalDirective;
	// @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];



	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Change?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	public today = new Date();

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	serverUrl: string;
	user: UserDetails;
	isLoading = false;
	links: string[] = [];

	// table declarations
	cols: { field: string; header: string; }[];
	statuses: { label: string; value: number; }[];
	non_list: any;
	supplier = [];
	grades = [];
	ports = [];
	banks = [];
	payment_status = [];
	_selectedColumns: any[];
	exportColumns: any[];
	total_qty = 0;
	total_amt = 0;
	selected_col_non = [];

	ship_date: any;
	non_rev_date: any;
	org_doc_rev_date: any;
	pay_due_date: any;
	arrival_date: any;
	lc_expiry_date: any;


	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});


	@ViewChild('dt', { static: false }) table: Table;


	supplier_list = [];
	subscription: Subscription;
	lookup = {};
	lookup_grade = {};
	lookup_port = {};
	lookup_bank = {};
	lookup_currency = {};
	export_non_list = [];
	filteredValuess: any;
	bsRangeValue: Date[];
	bsRangeValue2: Date[];
	bsRangeValue3: Date[];
	bsRangeValue4: Date[];
	fromInvoiceDate: any;
	toInvoiceDate: any;
	fromNonReceivedDate: any;
	toNonReceivedDate: any;
	flag1: string;
	flag2: string;
	flag3: string;
	fromOriginalReceiveDate: any;
	toOriginalReceiveDate: any;
	flag4: string;
	fromShipmentDate: any;
	toShipmentDate: any;
	checkedList = [];
	tomail = [];
	ccMail = [];
	tomailtext: string;
	ccmailtext: string;
	sub: string;
	note: string;
	original_flag: boolean = false;
	email = [];
	non_id: any;
	// supplier_charge: any;
	// confirm_charge: any;
	// payment_days = 0;
	mode: any;
	pay_status: any;
	payment_details = [];
	original_pending_flag = false;
	non_receive: boolean;
	non_revise_mail: boolean;
	non_org_pending_mail: boolean;
	non_ori_receive_mail: boolean;
	non_excel: boolean;
	non_pdf: boolean;
	currentYear: number;
	date = new Date();
	html_template = [];
	footer_template: any;
	paymentDetails: any;
	nonLcPayment: any;
	lc_id: number;
	currency = [];

	originalDocDate: string;
	docReferenceNumber: string;
	nonIDOriginalDoc: number;
	lcid: number;

	NonPaymentStageArray: any;

	docs: Array<File> = [];
	nonLcCReditdocs: Array<File> = [];

	paymentStatusForm: FormGroup;
	port_list = [];
	global_list = [];
	port: any;

	nonlcCreditNid: any;
	nonlcCreditPiid: any;




	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private nonService: NonService,
		private utilizationService: UtilizationService,
		private exportService: ExportService,
		private templateService: TemplateService,
		private CrudServices: CrudServices,
	) {

		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.non_receive = (this.links.indexOf('non receive mail') > -1);
		this.non_revise_mail = (this.links.indexOf('non revise mail') > -1);
		this.non_org_pending_mail = (this.links.indexOf('non org pending mail') > -1);
		this.non_ori_receive_mail = (this.links.indexOf('non ori receive mail') > -1);
		this.non_excel = (this.links.indexOf('non excel') > -1);
		this.non_pdf = (this.links.indexOf('non pdf') > -1);

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));

		this.bsRangeValue = [];
		//	this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		if (this.datepipe.transform(this.date, 'MM') > '03') {

			this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		} else {

			this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}
		this.bsRangeValue3 = [];
		this.bsRangeValue4 = [];


		this.CrudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
			this.port_list = response;


		})


		this.statuses = [
			{ label: 'Pending', value: 0 },
			{ label: 'Remitted', value: 1 },
			{ label: 'Roll Over', value: 2 },
			{ label: 'Roll Over Remit', value: 3 },

		];


		this.cols = [
			{ field: 'sub_org_name', header: 'Supplier Name' },
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'non_revised_copy', header: 'Non Revised Copy' },
			{ field: 'discrepancy_note', header: 'Non Revised Remark' },
			{ field: 'invoice_no', header: 'Invoice Number' },
			{ field: 'tot_non_qty', header: 'Total Quantity' },
			{ field: 'UnitName', header: 'Unit' },
			{ field: 'tot_non_amt', header: 'Total Amount' },
			{ field: 'CurrencyName', header: 'Currency' },
			{ field: 'grade_name', header: 'Grade Name' },
			{ field: 'date_of_shipment', header: 'Shipment Date' },
			{ field: 'arrival_date', header: 'Arrival Date' },
			{ field: 'non_received_date', header: 'Non Received Date' },
			{ field: 'original_doc_received_date', header: 'Original Doc Received Date' },
			{ field: 'payment_due_date', header: 'Payment Due Date' },
			{ field: 'docket_no', header: 'Docket No' },
			{ field: 'payment_status', header: 'Payment Status' },
			{ field: 'non_rmk', header: 'Non Remark' },
			{ field: 'port_name', header: 'Port' },
			{ field: 'payment_charge', header: 'Payment Charges' },
			// { field: 'non_recv_sent_cha', header: 'Non Received Mail' },


		];

		if (localStorage.getItem('selected_col_non')) {
			this._selectedColumns = JSON.parse(localStorage.getItem('selected_col_non'));
		} else {
			this._selectedColumns = this.cols;
		}
		this.fromInvoiceDate = this.bsRangeValue[0];
		this.toInvoiceDate = this.bsRangeValue[1];
		this.fromNonReceivedDate = this.bsRangeValue2[0];
		this.toNonReceivedDate = this.bsRangeValue2[1];


		this.templateService.getOneTemplate(2)
			.subscribe(response => {
				this.footer_template = response;
			});


		this.paymentStatusForm = new FormGroup({

			'pay_status': new FormControl(null),
			'payment_days': new FormControl(null),
			'supplier_charge': new FormControl(null),
			'confirm_charge': new FormControl(null),
			'intrest_schedule': new FormControl(null),
			'nonlc_swift_copy': new FormControl(null),
			'nonlc_swift_ref_no': new FormControl(null),
			'nonlc_rate': new FormControl(null),

		});


	}
	ngAfterViewInit(): void {
	}
	ngOnInit() {

	}

	getNonData() {
		this.uncheckAll();
		this.non_list = [];
		this.total_qty = 0;
		this.total_amt = 0;
		this.isLoading = true;
		// const formData: any = new FormData();
		// formData.append('non_received_date_from', this.convert(this.fromNonReceivedDate));
		// formData.append('non_received_date_to', this.convert(this.toNonReceivedDate));
		// formData.append('payment_due_date_from', this.convert(this.fromInvoiceDate));
		// formData.append('payment_due_date_to', this.convert(this.toInvoiceDate));
		// formData.append('original_doc_received_date_from', this.convert(this.fromOriginalReceiveDate));
		// formData.append('original_doc_received_date_to', this.convert(this.toOriginalReceiveDate));
		// formData.append('date_of_shipment_from', this.convert(this.fromShipmentDate));
		// formData.append('date_of_shipment_to', this.convert(this.toShipmentDate));
		// if (this.original_pending_flag) {
		//   formData.append('ori_pen_sta', this.original_pending_flag);
		// }

		let dbOriPenSta: boolean;
		if (this.original_pending_flag) {
			dbOriPenSta = this.original_pending_flag;
		}
		let formData: any = {
			non_received_date_from: this.convert(this.fromNonReceivedDate),
			non_received_date_to: this.convert(this.toNonReceivedDate),
			payment_due_date_from: this.convert(this.fromInvoiceDate),
			payment_due_date_to: this.convert(this.toInvoiceDate),
			original_doc_received_date_from: this.convert(this.fromOriginalReceiveDate),
			original_doc_received_date_to: this.convert(this.toOriginalReceiveDate),
			date_of_shipment_from: this.convert(this.fromShipmentDate),
			date_of_shipment_to: this.convert(this.toShipmentDate),
			ori_pen_sta: dbOriPenSta,
			port_id: this.port
		}

		if (this.flag1 === '1' && this.flag2 === '2' && this.flag3 === '3' && this.flag4 === '4') {
			this.subscription = this.nonService.getAllNon(formData).subscribe(res => {
				this.isLoading = false;
				if (res.length > 0) {

					console.log(res, "getAllNon")
					this.getNon(res);
				}
			});
		}
	}


	// head filter for fromdate - todate called at start
	onSelect($e, state) {

		if ($e == null && state === '4') {
			this.fromShipmentDate = '';
			this.toShipmentDate = '';
		}

		if ($e == null && state === '3') {
			this.fromOriginalReceiveDate = '';
			this.toOriginalReceiveDate = '';
		}
		if ($e == null && state === '1') {
			this.fromInvoiceDate = '';
			this.toInvoiceDate = '';
		}
		if ($e == null && state === '2') {
			this.fromNonReceivedDate = '';
			this.toNonReceivedDate = '';
		}

		if ($e == null && state === '6') {
			this.port = null;
		}
		if ($e) {
			if (state === '1') {
				this.flag1 = '1';
				this.fromInvoiceDate = $e[0];
				this.toInvoiceDate = $e[1];
			}
			if (state === '2') {
				this.flag2 = '2';
				this.fromNonReceivedDate = $e[0];
				this.toNonReceivedDate = $e[1];
			}
			if (state === '3') {
				this.flag3 = '3';
				this.fromOriginalReceiveDate = $e[0];
				this.toOriginalReceiveDate = $e[1];
			}
			if (state === '4') {
				this.flag4 = '4';
				this.fromShipmentDate = $e[0];
				this.toShipmentDate = $e[1];
			}

			if (state === '5') {
				this.original_pending_flag = $e.currentTarget.checked;
			}

			if (state == '6') {
				this.port = $e.id;
			}
		}
		this.getNonData();

	}



	// total set non_list
	getNon(non_list) {
		this.non_list = non_list;
		// console.log(this.non_list);
		this.total_qty = 0;
		this.total_amt = 0;
		for (let i = 0; i < this.non_list.length; i++) {



			this.total_qty = this.total_qty + Number(this.non_list[i]['tot_non_qty']);
			this.total_amt = this.total_amt + Number(this.non_list[i]['tot_non_amt']);

			this.payment_status = [];
			if (Number(this.non_list[i].payment_status) === 0) {
				this.payment_status = [{ 'value': '0', 'label': 'Pending' }, { 'value': 1, 'label': 'Payment Remit' }, { 'value': 2, 'label': 'Payment Roll Over' }];
			}

			if (Number(this.non_list[i].payment_status) === 1 || Number(this.non_list[i].payment_status) === 3) {
				this.payment_status = [];
			}

			if (Number(this.non_list[i].payment_status) === 2) {
				this.payment_status = [{ 'value': '2', 'label': 'Payment Roll Over' }, { 'value': 3, 'label': 'Remit Payment Roll Over' }];
			}

			non_list[i]['paymentStatus'] = this.payment_status;

			//  this.NonPaymentStageArray=this.non_list[i]['NonPaymentStage'];
			//  console.log( this.NonPaymentStageArray ,"array");
		}

		this.global_list = this.non_list;
		this.filteredValuess = this.non_list;

		for (let item, i = 0; item = non_list[i++];) {
			const name = item.sub_org_name;
			const port = item.port_name;
			const grade = item.grade_name;
			const bank = item.bank_name;
			const currency = item.CurrencyName;
			if (!(name in this.lookup)) {
				this.lookup[name] = 1;
				this.supplier_list.push({ 'sub_org_name': name });
			}

			if (!(port in this.lookup_port)) {
				this.lookup_port[port] = 1;
				this.ports.push({ 'port_name': port });
			}

			if (!(grade in this.lookup_grade)) {
				this.lookup_grade[grade] = 1;
				this.grades.push({ 'grade_name': grade });
			}
			if (!(bank in this.lookup_bank)) {
				this.lookup_bank[bank] = 1;
				this.banks.push({ 'bank_name': bank });
			}

			if (!(currency in this.lookup_currency)) {
				this.lookup_currency[currency] = 1;
				this.currency.push({ 'CurrencyName': currency });
			}

			var dt = new Date();
			var prev5Days = new Date(item.arrival_date);
			prev5Days.setDate(prev5Days.getDate() - 6);

			console.log(dt, prev5Days, item.arrival_date, "Nehapawale")
			if ((dt.toISOString().split('T')[0]) >= (prev5Days.toISOString().split('T')[0]) && (prev5Days.toISOString().split('T')[0]) <= item.arrival_date) {
				item.arrivalStatus = 1;
			} else {
				item.arrivalStatus = 0;
			}

		}

	}

	// data exported for pdf excel download
	exportData() {

		let arr = [];
		const foot = {};
		let qty = 0;
		let amt = 0;
		if (this.filteredValuess === undefined) {
			arr = this.non_list;
		} else {
			arr = this.filteredValuess;
		}
		//  console.log(this.non_list);
		for (let i = 0; i < arr.length; i++) {
			const export_non = {};
			for (let j = 0; j < this._selectedColumns.length; j++) {
				export_non[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];

			}
			this.export_non_list.push(export_non);
			qty = qty + Number(arr[i]['tot_non_qty']);
			amt = amt + Number(arr[i]['tot_non_amt']);


		}

		for (let j = 0; j < this._selectedColumns.length; j++) {
			if (this._selectedColumns[j]['field'] === 'tot_non_qty') {
				foot[this._selectedColumns[j]['header']] = qty;

			} else if (this._selectedColumns[j]['field'] === 'tot_non_amt') {
				foot[this._selectedColumns[j]['header']] = amt;

			} else {
				foot[this._selectedColumns[j]['header']] = '';
			}
		}

		this.export_non_list.push(foot);



	}

	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}



	// download doc ,pdf , excel

	exportPdf() {
		this.export_non_list = [];
		this.exportData();
		this.exportColumns = this._selectedColumns.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_non_list, 'Non-Negotiable');
	}

	exportExcel() {
		this.export_non_list = [];
		this.exportData();
		this.exportService.exportExcel(this.export_non_list, 'Non-Negotiable');
	}


	// date filter
	onDateSelect($event, name) {
		this.table.filter(this.convert($event), name, 'equals');
	}

	formatDate(date) {
		let month = date.getMonth() + 1;
		let day = date.getDate();

		if (month < 10) {
			month = '0' + month;
		}

		if (day < 10) {
			day = '0' + day;
		}

		return date.getFullYear() + '-' + month + '-' + day;
	}
	// multiselect filter
	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			// console.log(arr);
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}

	getNonLCDocsArray(nonLcCReditdocs: string) {
		return JSON.parse(nonLcCReditdocs);
	}



	getStatus(status) {
		switch (status) {
			case 0: {
				return 'Pending';
				break;
			}
			case 1: {
				return 'Remitted ';
				break;
			}
			case 2: {
				return ' Roll Over';
				break;
			}
			case 3: {
				return 'Roll over remit';
				break;
			}
			default: {
				return '';
				break;
			}
		}
	}

	updateDocReceivedDate(originalDocDate, docReferenceNumber) {
		if (originalDocDate !== undefined && originalDocDate !== '') {
			this.nonService.updateOriginalReceivedDate(this.nonIDOriginalDoc, this.convert(originalDocDate), docReferenceNumber, this.lcid).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				this.resetOriginalDocFields();
				this.getNonData();
			});
		} else {
			this.toasterService.pop('error', 'error', 'Original Document Received date not entered');
		}


	}


	addOriginalDocReceivedDate(item) {
		this.nonIDOriginalDoc = item.id;
		this.lcid = item.lc_id;
		this.originalDocDate = item.original_doc_received_date;
		this.docReferenceNumber = item.doc_ref_no;
		this.originalDocModal.show();

	}

	resetOriginalDocFields() {
		this.nonIDOriginalDoc = 0;
		this.lcid = 0;
		this.originalDocDate = '';
		this.docReferenceNumber = '';
		this.originalDocModal.hide();

	}


	updateDocketNo($event, id) {
		//  console.log($event.target.value);

		if (confirm('Are you sure to Update Docket Number to  ' + $event.target.value)) {
			if (id && $event) {
				this.nonService.updateDocketNo(id, $event.target.value).subscribe((response) => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getNonData();
				});
			} else {
				this.getNonData();
			}
		} else {
			this.getNonData();
		}

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

	// set check item list
	onCheck(checked, item) {
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}

		//  console.log(this.checkedList);
	}


	// for all check box check
	onCheckAll(checked) {

		let arr = [];
		if (this.filteredValuess === undefined) {
			arr = this.non_list;
		} else {
			arr = this.filteredValuess;
		}
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				this.checkedList.push(val);
			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				this.checkedList.splice(this.checkedList.indexOf(val), 1);
			}
		}



		// console.log( this.checkedList);
	}

	// call on each filter set local storage for colums
	@Input() get selectedColumns(): any[] {
		localStorage.setItem('selected_col_non', JSON.stringify(this._selectedColumns));
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
		this.total_qty = 0;
		this.total_amt = 0;

		this.filteredValuess = event.filteredValue;
		// console.log( this.filteredValuess);
		for (let i = 0; i < this.filteredValuess.length; i++) {
			this.total_qty = this.total_qty + Number(this.filteredValuess[i]['tot_non_qty']);
			this.total_amt = this.total_amt + Number(this.filteredValuess[i]['tot_non_amt']);
		}





	}

	// mail check checkbox for non receive , non revise , non original receive doc
	non_receive_mail(mode) {

		console.log(this.checkedList, "CheckList");
		this.html_template = [];
		let msg = '';
		if (this.checkedList.length > 0) {
			let status = false;
			for (let i = 0; i < this.checkedList.length; i++) {
				// check port for non mail
				if (mode === '1') {
					if (this.checkedList[0]['port_id'] === this.checkedList[i]['port_id']) {
						status = true;
					} else {
						status = false;
						msg = 'Port not same for selected Non';
						break;
					}

				}
				// check port and doc of revise
				if (mode === '2') {
					if (this.checkedList[0]['port_id'] === this.checkedList[i]['port_id'] && this.checkedList[i]['revise_non_details'] !== null) {
						status = true;
					} else {
						status = false;
						msg = 'Port not same or Non Revised Copy not Added for selected Non';
						break;
					}

				}
				// check port and original date
				if (mode === '4') {
					if (this.checkedList[0]['port_id'] === this.checkedList[i]['port_id'] && this.checkedList[i]['original_doc_received_date'] !== '') {
						status = true;
					} else {
						status = false;
						msg = 'Port not same or Original Document Received Date not Added for selected Non';
						break;
					}

				}
			}

			// If true then Set text and email values of port
			if (status) {
				this.mode = mode;
				if (mode === '2') {
					this.getHtmlTemplate('3');
					this.sub = 'Revise Non Negotiable Documents';
					this.note = 'Request you to kindly note the above details at your end and also inform us ETA for the said shipments.';

				} else if (mode === '1') {
					this.getHtmlTemplate('1');
					this.sub = 'Non Negotiable Documents';
					this.note = 'Request you to kindly note the above details at your end and also inform us ETA for the said shipments.';

				} else if (mode === '4') {
					this.original_flag = true;
					this.getHtmlTemplate('4');

					this.sub = 'Original Documents ';
					this.note = 'Note: Kindly confirm the ETA for the same. ';
				}
				console.log(this.checkedList, "CheckLIstttt");

				this.email = this.checkedList[0]['email'].split(',');
				this.myModal.show();
			} else {
				// this.checkedList = [];
				this.toasterService.pop('error', 'error', msg);
			}

		} else {
			this.toasterService.pop('error', 'error', 'Please Select Checkbox');
		}

	}

	// mail send for non receive , non revise , non original receive doc (original receive send mail without document attach )


	send_non_receive_mail() {
		if (this.checkedList.length > 0 && this.tomailtext !== undefined && this.tomailtext !== '') {
			let html = '';
			let template_html = '';
			const non_id = [];
			const attachment = [];
			let arr = {};

			const re = /{PORT}/gi;
			const str = this.html_template[0]['subject'];
			const sub_temp = str.replace(re, this.checkedList[0]['port_name']);


			const subject = sub_temp;
			const from = this.html_template[0]['from_name'];
			const to = this.tomailtext;
			const cc = this.ccmailtext;
			html = html + '<table id="table"><tr><th>Sr.No</th><th>Customer Name</th><th>Invoice No.</th><th>Quantity in MT</th><th>Shipping Line</th><th>BL No</th><th>AD Code</th><th>Grade</th><th>Discrepancy Remark</th><th> Remark</th></tr>';
			for (let i = 0; i < this.checkedList.length; i++) {
				const shipping = this.checkedList[i]['shippingLine'] != null ? this.checkedList[i]['shippingLine'].sub_org_name : '';
				const discrepancy_note = this.checkedList[i]['discrepancy_note'] != null ? this.checkedList[i]['discrepancy_note'] : '';
				const remark = this.checkedList[i]['non_rmk'] != null ? this.checkedList[i]['non_rmk'] : '';
				let bl_no = '';
				if (this.checkedList[i]['bill_of_ladings'].length) {
					for (let bl of this.checkedList[i]['bill_of_ladings']) {
						bl_no = bl_no + bl.bill_lading_no + ' ';
					}
				}
				html = html + '<tr>';
				html = html + '<td>' + Number(i + 1) + '</td><td>' + this.checkedList[i]['sub_org_name'] + '</td><td>' + this.checkedList[i]['invoice_no'] + '</td><td>' + this.checkedList[i]['tot_non_qty'] + '</td><td>' + shipping + '</td><td>' + bl_no + '</td><td>' + this.checkedList[i]['ad_code'] + '</td><td>' + this.checkedList[i]['grade_name'] + '</td><td>' + discrepancy_note + '</td><td>' + remark + '</td>';
				html = html + '</tr>';

				non_id.push(this.checkedList[i]['id']);
			}


			html = html + '</table>';
			let html2 = '';
			const re2 = /{TABLE}/gi;
			template_html = this.html_template[0]['custom_html'];
			html2 = template_html.replace(re2, html);
			html2 = html2 + this.footer_template[0]['custom_html'];



			if (!this.original_flag) {
				for (let i = 0; i < this.checkedList.length; i++) {

					// for non mail non copy is send as attachment
					if (this.mode === '1') {
						if (this.checkedList[i]['non_copy']) {
							const files = JSON.parse(this.checkedList[i]['non_copy']);
							for (let j = 0; j < files.length; j++) {
								const test = files[j].split('/');

								attachment.push({ 'filename': test[4], 'path': files[j] });
							}
						}
					}

					// if revise then revise document is send as mail attachment
					if (this.mode === '2') {
						if (this.checkedList[i]['revise_non_details'] != null) {
							const files = this.checkedList[i]['revise_non_details'];
							for (let j = 0; j < files.length; j++) {
								const test = files[j].non_revised_copy.split('/');

								attachment.push({ 'filename': test[4], 'path': files[j].non_revised_copy });
							}
						}
					}

				}
			}
			arr = { 'from': from, 'to': to, 'cc': cc, 'subject': subject, 'html': html2, 'attachments': attachment };
			//  arr = { 'from' :  from  , 'to' : to , 'cc': cc ,  'subject' :  subject  ,  'html' : html2 } ;
			console.log(html2, 'DEBUG_VIEW');



			if (arr) {
				this.isLoading = true;
				this.nonService.sendNonMail(arr, non_id, this.mode).subscribe((response) => {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						this.isLoading = false;
						// this.checkedList = [];
						this.checkedList = [];
						this.tomail = [];
						this.ccMail = [];
						this.tomailtext = '';
						this.ccmailtext = '';
						this.mode = '';
						this.original_flag = false;
						this.myModal.hide();
						this.getNonData();

					} else {
						this.isLoading = false;
						// this.checkedList = [];
						this.checkedList = [];
						this.tomail = [];
						this.ccMail = [];
						this.tomailtext = '';
						this.ccmailtext = '';
						this.mode = '';
						this.original_flag = false;
						this.myModal.hide();
						this.getNonData();
					}
				});
			}


		} else {
			this.toasterService.pop('error', 'error', 'Check Email');
		}
	}



	// only for original pending mail check supplier and original doc date pending
	pendindMail() {
		this.html_template = [];

		if (this.checkedList.length > 0) {
			let status = false;
			for (let i = 0; i < this.checkedList.length; i++) {
				if (this.checkedList[0]['sub_org_id'] === this.checkedList[i]['sub_org_id'] && this.checkedList[i]['original_doc_received_date'] == null) {
					status = true;
				} else {
					status = false;
					break;
				}
			}
			if (status) {
				this.getHtmlTemplate('5');
				this.myModalPending.show();
			} else {
				// this.checkedList = [];
				this.toasterService.pop('error', 'error', 'Supplier not same for selected Non OR Original Doc already Received for selected NON ');
			}

		} else {
			this.toasterService.pop('error', 'error', 'Please Select  Checkbox ');
		}
	}

	// send mail to original pending
	original_pending_mail() {
		if (this.checkedList.length > 0 && this.tomailtext !== undefined && this.tomailtext !== '') {
			let html = '';
			let template_html = '';
			let arr = {};
			const non_id = [];
			const re = /{PORT}/gi;
			const str = this.html_template[0]['subject'];
			const sub_temp = str.replace(re, this.checkedList[0]['port_name']);
			const subject = sub_temp;
			const from = this.html_template[0]['from_name'];
			const to = this.tomailtext;
			const cc = this.ccmailtext;

			html = html + '<table id="table"><tr><th>Sr.No</th><th>Invoice No.</th><th>Qty.</th> <th>Amount</th><th>Port</th></tr>';
			for (let i = 0; i < this.checkedList.length; i++) {

				html = html + `<tr><td> ${Number(i + 1)} </td><td> ${this.checkedList[i]['invoice_no']} </td><td> ${this.checkedList[i]['tot_non_qty']} </td><td>USD ${this.checkedList[i]['tot_non_amt']} ==00</td><td> ${this.checkedList[i]['port_name']}</td>`;

				non_id.push(this.checkedList[i]['id']);
			}

			html = html + '</table>';
			let html2 = '';
			const re2 = /{TABLE}/gi;
			template_html = this.html_template[0]['custom_html'];
			html2 = template_html.replace(re2, html);
			html2 = html2 + this.footer_template[0]['custom_html'];


			arr = { 'from': from, 'to': to, 'cc': cc, 'subject': subject, 'html': html2 };
			// console.log(arr);
			this.mode = '3';
			if (arr) {
				this.isLoading = true;
				this.nonService.sendNonMail(arr, non_id, this.mode).subscribe((response) => {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						this.isLoading = false;
						// this.checkedList = [];
						this.checkedList = [];
						this.tomail = [];
						this.ccMail = [];
						this.tomailtext = '';
						this.ccmailtext = '';
						this.mode = '';
						this.myModalPending.hide();
						this.getNonData();

					} else {
						this.isLoading = false;
						// this.checkedList = [];
						this.checkedList = [];
						this.tomail = [];
						this.ccMail = [];
						this.tomailtext = '';
						this.ccmailtext = '';
						this.mode = '';
						this.myModalPending.hide();
						this.getNonData();
					}
				});
			}

		} else {
			this.toasterService.pop('error', 'error', 'Check Email');
		}
	}


	getHtmlTemplate(id) {
		if (id) {


			this.templateService.getOneTemplate(id)
				.subscribe(response => {
					//  console.log(response);
					this.html_template = response;

					//console.log(this.html_template , "html template")
				});
		}
	}

	// set mail variable for to and cc
	mailto(check, val) {
		//  console.log(check);
		this.tomailtext = '';
		if (check) {
			this.tomail.push(val);
		} else {
			this.tomail.splice(this.tomail.indexOf(val), 1);
		}

		for (let i = 0; i < this.tomail.length; i++) {
			this.tomailtext = this.tomailtext + this.tomail[i] + ',';
		}
		// console.log(this.tomail);
	}
	ccmail(check, val) {
		//  console.log(check);
		this.ccmailtext = '';
		if (check) {
			this.ccMail.push(val);
		} else {
			this.ccMail.splice(this.ccMail.indexOf(val), 1);
		}

		//  console.log( this.ccMail);
		for (let i = 0; i < this.ccMail.length; i++) {
			this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
		}

	}

	ccmailvalue($e) {
		this.ccmailtext = $e.target.value;
		//  console.log(this.ccmailtext);
	}

	tomailvalue($e) {
		this.tomailtext = $e.target.value;
		// console.log(this.tomailtext);
	}



	// close all open modal with data clear
	closeModal() {
		this.checkedList = [];
		this.tomail = [];
		this.ccMail = [];
		this.myModal.hide();
		this.myModalPending.hide();
		this.uncheckAll();
		this.getNonData();
	}

	// update charges

	update_charge(item) {
		this.payment_details = [];
		// console.log(item);
		this.non_id = item.id;
		// const arr = JSON.parse(item.payment_details);
		// for (const val of arr) {
		//    if (val.payment_status !== 0) {
		//      const label = this.getStatus(Number(val.payment_status));
		//   this.payment_details.push({'status': val.payment_status , 'label': label });
		//    }
		// }
		//  console.log( this.payment_details);
		this.chargeModal.show();
	}

	// updateCharge(sp_charge, con_charge, status) {

	// 	if (sp_charge !== '' && con_charge !== '' && this.pay_status !== '' && sp_charge !== undefined && con_charge !== undefined && this.pay_status !== undefined) {
	// 		this.subscription = this.utilizationService.UpdatePaymentCharges(this.non_id, status, sp_charge, con_charge).subscribe(res => {
	// 			this.toasterService.pop(res.message, res.message, res.data);
	// 			if (res.code === '100') {
	// 				this.closeChargeModal();
	// 			}
	// 		});
	// 	} else {
	// 		this.toasterService.pop('error', 'error', 'Some Fields are remaining');
	// 	}
	// }

	closeChargeModal() {
		this.non_id = '';
		this.lc_id = 0;
		this.nonLcPayment = '';
		this.paymentStatusForm.patchValue({
			pay_status: null,
			supplier_charge: null,
			confirm_charge: null,
		});


		//this.chargeModal.hide();
		this.paymentStatusModal.hide();
		this.getNonData();
	}


	// uncheck all checkbox

	uncheckAll() {

		this.inputs.forEach(check => {
			check.nativeElement.checked = false;
		});
	}

	changePaymentStatus(item) {

		console.log(item, "paymentItem");
		let payDetails = JSON.parse(item.NonPaymentStage);
		this.nonlcCreditNid = payDetails[0].n_id;
		this.nonlcCreditPiid = payDetails[0].pi_id;
		console.log(this.nonlcCreditNid, this.nonlcCreditPiid, JSON.parse(item.NonPaymentStage), "paymentItem1")
		// console.log(item);
		if (item.payment_status === 0 || item.payment_status === 2) {
			this.lc_id = item.lc_id;
			this.paymentDetails = JSON.parse(item.payment_details);
			// console.log(this.paymentDetails);
			if (this.lc_id === 0) {
				this.nonLcPayment = this.paymentDetails[0]['nonLcPayment'];
			}

			this.non_id = item.id;
			this.payment_details = item.paymentStatus;
			this.paymentStatusModal.show();
		}
	}



	// updatePaymentStatus(supp_sh, con_ch, st, pay_days) {


	// 	// const formData: any = new FormData();
	// 	// formData.append('id', this.non_id);
	// 	// formData.append('payment_status', st);
	// 	// formData.append('supplier_usance_interest', supp_sh);
	// 	// formData.append('confirmation_charges', con_ch);
	// 	// formData.append('no_days', pay_days);
	// 	// if (this.lc_id === 0) {
	// 	// formData.append('nonlcPayment', this.nonLcPayment);
	// 	// }
	// 	let nonlcPaymentdb = '';
	// 	if (this.lc_id === 0) {
	// 		nonlcPaymentdb = this.nonLcPayment;
	// 	}

	// 	let formData: any = {
	// 		id: this.non_id,
	// 		payment_status: st,
	// 		supplier_usance_interest: supp_sh,
	// 		confirmation_charges: con_ch,
	// 		no_days: pay_days,
	// 		nonlcPayment: nonlcPaymentdb
	// 	}


	// 	// if (this.non_id &&  supp_sh && st && con_ch )
	// 	if (this.non_id) {




	// 		if (confirm('Are you sure to change Payment Status to  ' + this.getStatus(st))) {

	// 			const fileData = new FormData();
	// 			const document: Array<File> = this.docs;
	// 			if (document.length > 0) {
	// 				for (let i = 0; i < document.length; i++) {
	// 					fileData.append('intrest_schedule', document[i], document[i]['name']);
	// 				}

	// 				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
	// 					let files = [];
	// 					let filesList = res.uploads.intrest_schedule;
	// 					if (filesList.length > 0) {
	// 						for (let i = 0; i < filesList.length; i++) {
	// 							files.push(filesList[i].location);
	// 						}
	// 						formData['intrest_schedule'] = JSON.stringify(files);
	// 						this.savePaymentDetails(formData);
	// 					}
	// 				});

	// 			} else {
	// 				this.savePaymentDetails(formData);

	// 			}

	// 		} else {
	// 			this.closeChargeModal();
	// 			//  this.getNonData();
	// 		}
	// 	} else {
	// 		this.toasterService.pop('error', 'error', 'Some Fields are remaining');
	// 	}
	// }


	savePaymentDetails(formData) {

		console.log(formData, "formData");
		this.nonService.updatePaymentStatus(formData).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.closeChargeModal();
			// this.getNonData();
		});

	}


	onPaymentStatusForm() {

		let nonlcPaymentdb = '';
		if (this.lc_id === 0) {
			nonlcPaymentdb = this.nonLcPayment;
		}

		let formData: any = {
			id: this.non_id,
			payment_status: this.paymentStatusForm.value.pay_status,
			supplier_usance_interest: this.paymentStatusForm.value.supplier_charge,
			confirmation_charges: this.paymentStatusForm.value.confirm_charge,
			no_days: this.paymentStatusForm.value.payment_days,
			nonlcPayment: nonlcPaymentdb,
			nonlc_swift_ref_no: this.paymentStatusForm.value.nonlc_swift_ref_no,
			nonlc_rate: this.paymentStatusForm.value.nonlc_rate,

		}

		if (this.non_id) {

			if (confirm('Are you sure to change Payment Status to  ' + this.getStatus(this.paymentStatusForm.value.payment_status))) {

				const fileData = new FormData();
				const document: Array<File> = this.docs;
				const NonLCdocument: Array<File> = this.nonLcCReditdocs;

				if (document.length > 0 || NonLCdocument.length > 0) {

					if (document.length > 0) {
						for (let i = 0; i < document.length; i++) {
							fileData.append('intrest_schedule', document[i], document[i]['name']);
						}
						this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
							let files = [];
							let filesList = res.uploads.intrest_schedule;
							if (filesList.length > 0) {
								for (let i = 0; i < filesList.length; i++) {
									files.push(filesList[i].location);
								}
								formData['intrest_schedule'] = JSON.stringify(files);
							}
						});

					}

					if (NonLCdocument.length > 0) {

						for (let i = 0; i < NonLCdocument.length; i++) {
							fileData.append('nonlc_swift_copy', NonLCdocument[i], NonLCdocument[i]['name']);
						}

						this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
							let nonLCCreditswiftfiles = [];
							let nonLCCreditswiftfilesList = res.uploads.nonlc_swift_copy;
							if (nonLCCreditswiftfilesList.length > 0) {
								for (let i = 0; i < nonLCCreditswiftfilesList.length; i++) {
									nonLCCreditswiftfiles.push(nonLCCreditswiftfilesList[i].location);
								}
								formData['nonlc_swift_copy'] = JSON.stringify(nonLCCreditswiftfiles);

							}
						});

					}


					this.savePaymentDetails(formData);

				}
				else {
					this.savePaymentDetails(formData);

				}

			} else {
				this.closeChargeModal();
				//  this.getNonData();
			}
		} else {
			this.toasterService.pop('error', 'error', 'Some Fields are remaining');
		}

	}

	onPaymentStatusChange($event) {
		console.log(this.non_list, "ResArray");

		let nonArray = this.non_list;
		let supplier_charges_status0111 = 0;
		let confirmation_charges_status0111 = 0;

		let supplier_charges_status23 = 0;
		let confirmation_charges_status23 = 0;
		let noCreditDays = 0;

		let nonlc_swift_ref_no_db = '';
		let nonlc_rate_db = '';


		console.log($event, "event")

		for (let elem of nonArray) {
			if (elem.id == this.non_id) {
				//console.log(elem.NonPaymentStage);
				//console.log(JSON.parse(elem.NonPaymentStage), "stage");

				if (elem.NonPaymentStage != "" || elem.NonPaymentStage != null) {

					let nonPayArr = JSON.parse(elem.NonPaymentStage)
					for (let elemNonPay of nonPayArr) {
						nonlc_swift_ref_no_db = elemNonPay.nonlc_swift_ref_no;
						nonlc_rate_db = elemNonPay.nonlc_rate;
						if (elemNonPay.payment_status == 0 || elemNonPay.payment_status == 11 || elemNonPay.payment_status == 1) {
							supplier_charges_status0111 = elemNonPay.supplier_charges;
							confirmation_charges_status0111 = elemNonPay.confirmation_charges;
						} else if (elemNonPay.payment_status == 2 || elemNonPay.payment_status == 3) {
							supplier_charges_status23 = elemNonPay.supplier_charges;
							confirmation_charges_status23 = elemNonPay.confirmation_charges;
							noCreditDays = elemNonPay.credit_days;
						}
					}

				}

			}
		}

		// if ($event == '') {
		// 	this.supplier_charge = 0;
		// 	this.confirm_charge = 0;

		// } else if ($event == 0 || $event == 1) {
		// 	this.supplier_charge = supplier_charges_status0111;
		// 	this.confirm_charge = confirmation_charges_status0111;

		// } else if ($event == 2 || $event == 3) {
		// 	this.supplier_charge = supplier_charges_status23;
		// 	this.confirm_charge = confirmation_charges_status23;
		// 	this.payment_days = noCreditDays;
		// }

		if ($event == '') {

			this.paymentStatusForm.patchValue({
				supplier_charge: 0,
				confirm_charge: 0,
			});

		} else if ($event == 0 || $event == 1) {


			this.paymentStatusForm.patchValue({
				supplier_charge: supplier_charges_status0111,
				confirm_charge: confirmation_charges_status0111,
			});

		} else if ($event == 2 || $event == 3) {


			this.paymentStatusForm.patchValue({
				supplier_charge: supplier_charges_status23,
				confirm_charge: confirmation_charges_status23,
				payment_days: noCreditDays
			});
		}

		this.paymentStatusForm.patchValue({
			nonlc_swift_ref_no: nonlc_swift_ref_no_db,
			nonlc_rate: nonlc_rate_db,

		});




	}


	addDocs(event: any) {
		this.docs = <Array<File>>event.target.files;
	}

	addCreditNonLCDocs(event: any) {
		this.nonLcCReditdocs = <Array<File>>event.target.files;
	}

}
