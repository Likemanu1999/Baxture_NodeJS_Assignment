

import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';

import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LiftingDetails } from '../../../shared/apis-path/apis-path';


@Component({
	selector: 'app-complete-lifting-list',
	templateUrl: './complete-lifting-list.component.html',
	styleUrls: ['./complete-lifting-list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		ExportService,
		DatePipe,
		CrudServices
	]
})
export class CompleteLiftingListComponent implements OnInit {

	serverUrl: string;
	user: UserDetails;
	addPaymentForm: FormGroup;
	links: any;
	lifitng_details = [];
	bsRangeValue: any;
	short_damage_flag: boolean;
	@ViewChild('dt', { static: false }) table: Table;

	// table filters
	purchase_invoice_date: string;
	material_received_date: string;
	lookup = {};
	lookup_godown = {};
	lookup_zone = {};
	supplier_list = [];
	lookup_garde_type = [];
	grade_type = [];
	godown = [];
	zones = [];
	lookup_delivery = {};
	delivery_terms = [];

	lookup_main_grade = {};
	main_grade = [];

	currentYear: number;
	date = new Date();

	isLoading: boolean = false;
	_selectedColumns: any[];

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	total_qty = 0;
	total_short_qty = 0;
	total_damage_qty = 0;
	rate = 0;
	filteredValuess: any[];
	export_lifting_list: any[];
	exportColumnsLifting: any[];
	cols_lift: { field: string; header: string; style: string; }[];
	lifting_date_from: string;
	lifting_date_to: string;
	status_short_damage_mat: boolean;

	global_lifting_list: any[];
	excel_lift: boolean = false;
	pdf_lift: boolean = false;
	material_date: boolean = false;
	material_rmk: boolean = false;
	company_id: any;
	role_id: any;
	company_filter: boolean;
	company: { label: string; id: number; }[];

	constructor(private route: ActivatedRoute,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private exportService: ExportService,
		private toasterService: ToasterService,
		private crudServices: CrudServices

	) {

		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;


		this.excel_lift = (this.links.indexOf('Complete Lifting List Export Excel') > -1);
		this.pdf_lift = (this.links.indexOf('Complete Lifting List Export PDF') > -1);
		this.material_date = (this.links.indexOf('Edit Local Lifting Material Received Date') > -1);
		this.material_rmk = (this.links.indexOf('Edit Lifting short damage material rmk') > -1);
		this.status_short_damage_mat = (this.links.indexOf('Short Damage List Lifting') > -1);
		this.company_filter = (this.links.indexOf('Local Company Filter') > -1);


		this.cols_lift = [
			{ field: 'purchase_invoice_no_dt', header: 'Purchase Invoice Number', style: '150px' },
			{ field: 'purchase_invoice_date', header: 'Purchase Invoice Date', style: '150px' },
			{ field: 'subOrgName', header: 'Supplier Name', style: '200px' },
			{ field: 'orgAddress', header: 'Supplier Address', style: '300px' },
			{ field: 'material_received_date', header: 'Material Received Date', style: '150px' },
			{ field: 'original_doc_recv_flag', header: 'Original Received', style: '100px' },
			{ field: 'godownName', header: 'Godown', style: '180px' },
			{ field: 'marketingPerson', header: 'Zone', style: '150px' },
			{ field: 'truck_no', header: 'Truck No', style: '100px' },
			{ field: 'mainGrade', header: 'Main Grade', style: '150px' },
			{ field: 'grade_name', header: 'Grade', style: '150px' },
			{ field: 'quantity', header: 'Quantity (MT)', style: '100px' },
			{ field: 'Rate', header: 'Deal Rate', style: '100px' },
			{ field: 'purchase_rate', header: 'Lifting Rate', style: '100px' },
			{ field: 'deliveryTerm', header: 'Delivery Term', style: '180px' },
			{ field: 'remark', header: 'Remark', style: '200px' },
			{ field: 'damage_material_qty', header: 'Damage Material Quantity', style: '150px' },
			{ field: 'short_material_qty', header: 'Short Material Quantity', style: '150px' },
			{ field: 'damage_short_dr_cr_note', header: 'Damage/Short Material Remark', style: '250px' },
			{ field: 'short_deb_credit_no', header: 'Short Debit/Credit Note No', style: '250px' },
			{ field: 'damage_deb_credit_no', header: 'Damage Debit/Credit Note No', style: '250px' },
			{ field: 'invoice_copy', header: 'Scan Copy', style: '100px' },
			{ field: 'original_copy', header: 'Original Recv Copy', style: '100px' },

		];
		this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }, { label: 'SURISHA', id: 3 }];
		this._selectedColumns = this.cols_lift

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {

			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		} else {

			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}
		//this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];



	}

	ngOnInit() {
		// this.getLiftingList();
	}


	// call on each filter set local storage for colums
	@Input() get selectedColumns(): any[] {

		return this._selectedColumns;
	}

	set selectedColumns(val: any[]) {
		this._selectedColumns = this.cols_lift.filter(col => val.includes(col));
	}

	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}


	onSelect(event, val) {

		if (event == null && val == 1) {
			this.lifting_date_from = '';
			this.lifting_date_to = '';
		}

		if (event && val == 1) {
			this.lifting_date_from = this.convert(event[0]);
			this.lifting_date_to = this.convert(event[1]);
		}




		this.getLiftingList();

	}


	onSelectShortDamage(event) {
		if (event) {
			this.status_short_damage_mat = true;
		} else {
			this.status_short_damage_mat = false;
		}
		this.getLiftingList();



		// if (event) {
		// 	this.lifitng_details = this.lifitng_details.filter(data => data.short_material_qty > 0 || data.damage_material_qty > 0);

		// 	console.log(this.lifitng_details);

		// } else {
		// 	this.lifitng_details = this.global_lifting_list;
		// }

	}


	getLiftingList() {
		this.isLoading = true;
		this.crudServices.getOne<any>(LiftingDetails.getAll, {
			lifting_date_from: this.lifting_date_from,
			lifting_date_to: this.lifting_date_to,
			status_short_damage_mat: this.status_short_damage_mat,
			company_id: this.company_id
		}).subscribe(response => {

			this.isLoading = false;
			this.lifitng_details = response.map(item => {
				item.purchase_invoice_no_dt = item.purchase_invoice_no + ' (' + item.local_purchase_id + ') ';
				item.local_purchase_id = item.local_purchase_id;
				item.subOrgName = item.sub_org_master != null ? item.sub_org_master.sub_org_name : item.local_purchase_deal.sub_org_master.sub_org_name;
				item.orgAddress = item.sub_org_master != null ? item.sub_org_master.org_address : item.local_purchase_deal.sub_org_master.org_address;
				item.grade_name = item.local_purchase_deal.grade_master != null ? item.local_purchase_deal.grade_master.grade_name : null;
				item.mainGrade = item.local_purchase_deal.grade_master != null ? item.local_purchase_deal.grade_master.main_grade.name : null


				// item.godownName = item.local_purchase_deal.godown != null ? item.local_purchase_deal.godown.godown_name : null;
				// item.godown_id = item.local_purchase_deal.godown_id;
				item.godownName = item.godown != null ? item.godown.godown_name : null;


				item.deliveryTerm = item.local_purchase_deal.delivery_term != null ? item.local_purchase_deal.delivery_term.term : null;
				item.marketingPerson = `${item.local_purchase_deal.purchaseAccHolder ? item.local_purchase_deal.purchaseAccHolder.first_name : ''}  ${item.local_purchase_deal.purchaseAccHolder ? item.local_purchase_deal.purchaseAccHolder.last_name : ''}`;

				item.sub_org_id = item.sub_org_id != null ? item.sub_org_id : item.local_purchase_deal.supplier_id;
				item.Rate = item.local_purchase_deal.rate;

				item.vendor_ref_number = item.local_purchase_deal.vendor_ref_number

				item.invoice_copy = item.purchase_invoice_copy != null ? 'YES' : 'NO'
				item.original_copy = item.original_doc_recv_flag ? 'YES' : 'NO'
				return item
			});

			this.setData(this.lifitng_details);
			this.global_lifting_list = this.lifitng_details;
			this.filteredValuess = this.lifitng_details;
		});
	}

	setData(data) {
		this.total_qty = 0;
		this.total_short_qty = 0;
		this.total_damage_qty = 0;
		this.rate = 0;
		this.total_qty = data.reduce((sum, item) => sum + item.quantity, 0);
		this.total_short_qty = data.reduce((sum, item) => sum + item.short_material_qty, 0);
		this.total_damage_qty = data.reduce((sum, item) => sum + item.damage_material_qty, 0);
		this.rate = data.reduce((sum, item) => sum + item.Rate, 0);
		for (let item, i = 0; item = data[i++];) {
			const name = item.subOrgName;
			const grade = item.grade_name;
			const mainGrade = item.mainGrade;
			const godown = item.godownName;
			const delivery = item.deliveryTerm;
			const zone = item.marketingPerson;


			if (!(delivery in this.lookup_delivery)) {
				this.lookup_delivery[delivery] = 1;
				this.delivery_terms.push({ 'deliveryTerm': delivery });
			}

			if (!(name in this.lookup)) {
				this.lookup[name] = 1;
				this.supplier_list.push({ 'subOrgName': name });
			}

			if (!(grade in this.lookup_garde_type)) {
				this.lookup_garde_type[grade] = 1;
				this.grade_type.push({ 'grade_name': grade });
			}

			if (!(mainGrade in this.lookup_main_grade)) {
				this.lookup_main_grade[mainGrade] = 1;
				this.main_grade.push({ 'mainGrade': mainGrade });
			}


			if (!(godown in this.lookup_godown)) {
				this.lookup_godown[godown] = 1;
				this.godown.push({ 'godownName': godown });
			}

			if (!(zone in this.lookup_zone)) {
				this.lookup_zone[zone] = 1;
				this.zones.push({ 'marketingPerson': zone });
			}




		}

	}






	getTerm(id) {

		switch (id) {
			case 1: {
				return '+GST ';
				break;
			}

			case 2: {
				return '+GST +Frt ';
				break;
			}
		}

	}



	convert(date) {
		if (date != null) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return null;
		}
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

	// date filter
	onDateSelect($event, name) {
		this.table.filter(this.convert($event), name, 'equals');
	}





	// data exported for pdf excel download
	exportDataLifting() {

		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.lifitng_details;
			//arr = this.lifitng_details.sort((a, b) => b.date - a.date)
		} else {
			arr = this.filteredValuess;
			//	arr = this.filteredValuess.sort((a, b) => b.date - a.date) ;
		}

		for (let i = 0; i < arr.length; i++) {
			const export_lifitng = {};
			for (let j = 0; j < this._selectedColumns.length; j++) {
				export_lifitng[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];
			}
			// export_lifitng['Invoice Copy'] = arr[i]['purchase_invoice_copy'] != null ? 'YES' : 'NO';

			this.export_lifting_list.push(export_lifitng);

		}


		for (let j = 0; j < this._selectedColumns.length; j++) {
			if (this._selectedColumns[j]['field'] === 'quantity') {
				foot[this._selectedColumns[j]['header']] = this.total_qty;
			} else if (this._selectedColumns[j]['field'] === 'Rate') {
				foot[this._selectedColumns[j]['header']] = this.rate;
			} else if (this._selectedColumns[j]['field'] === 'short_material_qty') {
				foot[this._selectedColumns[j]['header']] = this.total_short_qty;
			} else if (this._selectedColumns[j]['field'] === 'damage_material_qty') {
				foot[this._selectedColumns[j]['header']] = this.total_damage_qty;
			} else {
				foot[this._selectedColumns[j]['header']] = '';
			}

		}

		this.export_lifting_list.push(foot);

	}

	// download doc ,pdf , excel

	exportPdfLifting() {
		this.export_lifting_list = [];
		this.exportDataLifting();
		// console.log(this.export_lifting_list);
		this.exportColumnsLifting = this.cols_lift.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumnsLifting, this.export_lifting_list, 'lifting-list');
	}

	exportExcelLifting() {
		this.export_lifting_list = [];
		this.exportDataLifting();
		this.exportService.exportExcel(this.export_lifting_list, 'lifting-list');
	}

	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.total_qty = 0;
		this.total_short_qty = 0;
		this.total_damage_qty = 0;
		this.rate = 0;

		this.filteredValuess = event.filteredValue;
		this.total_qty = this.filteredValuess.reduce((sum, item) => sum + item.quantity, 0);
		this.total_short_qty = this.filteredValuess.reduce((sum, item) => sum + item.short_material_qty, 0);
		this.total_damage_qty = this.filteredValuess.reduce((sum, item) => sum + item.damage_material_qty, 0);
		this.rate = this.filteredValuess.reduce((sum, item) => sum + item.Rate, 0);

	}



	updateMaterialReceivedDate(id, date) {
		if (id) {
			this.crudServices.updateData<any>(LiftingDetails.verifyLocalPurchaseLIfting,
				{
					id: id,
					material_received_date: this.convert(date),
					surisha_stock_flag: this.company_id == 3 ? 1 : 0
				})
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
				});
		}
	}

	update(event, id, val, item) {

		if (event.target.value != null) {
			item[val] = event.target.value;
			if (val == 'damage_material_qty') {
				item[val] = Number(event.target.value) / 1000;
			}

			if (val == 'short_material_qty') {
				item[val] = Number(event.target.value) / 1000;
			}
			this.crudServices.updateData<any>(LiftingDetails.updateAdditionalDetails, item)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
				});
		}


	}

	getDocsArray(doc) {
		return JSON.parse(doc);
	}


}

