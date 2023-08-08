import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { SupplierDealService } from '../foreign-supplier-deal/supplier-deal-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { foreignSuppilerDeals } from "../../../shared/apis-path/apis-path";
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { DatePipe } from '@angular/common';
import { staticValues } from '../../../shared/common-service/common-service';
import { Table } from 'primeng/table';

@Component({
	selector: 'app-forex-supplier-list',
	templateUrl: './forex-supplier-list.component.html',
	styleUrls: ['./forex-supplier-list.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [

		PermissionService,
		LoginService,
		SupplierDealService,
		ExportService,
		CrudServices,
		ToasterService,
		

	]
})
export class ForexSupplierListComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table;
	isLoading = false;
	count = 0;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	user: UserDetails;
	links: string[] = [];
	lookup_supplier = {};
	serverUrl: string;
	supplier_list = [];
	supplier_name = [];
	view_deal_list = false;
	public filterQuery = '';
	filteredBookedTotal: number = 0;
	filteredConfirmedTotal: number = 0;
	filteredDifference : number = 0;
	filter: any = [];
	filterArray = ['sub_org_name'];
	export_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: any; }[];
	exportColumns: { title: string;}[];
	export_data = [];
	data: any;
	DetailsData : any;
	pdf_download: boolean = false;
	excel: boolean = false;
	currentYear: number;
	date = new Date();
	selected_date_range: Date[];
	datePickerConfig: any = staticValues.datePickerConfigNew;
	

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});



	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private supplierDealService: SupplierDealService,
		private exportService: ExportService,
		private CrudServices: CrudServices,
		private toasterService: ToasterService,
		private datepipe: DatePipe

	) {
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.view_deal_list = (this.links.indexOf('view deal list') > -1);
		this.pdf_download = (this.links.indexOf('pdf sales contract') > -1);
		this.excel = (this.links.indexOf('excel sales contract') > -1);

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		this.fetchForeignSupplierDeals();

		this.export_cols = [
			{ field: 'deal_dt', header: 'Supplier Name',sort:true, filter: true ,dropdown: [] ,  footer: false, total: 0, type: null},
			{ field: 'booked_qty', header: 'Booked Contracts (MT)',sort:false, filter: false, dropdown: [],  footer: false, total: 0, type: null},
			{ field: 'remaining_qty', header: 'Remaining Contracts (MT)',sort:false, filter: false, dropdown: [],  footer: false, total: 0, type: null },
		];	
	}

	
	ngOnInit() {
		this.fetchForeignSupplierDeals()
	}

	fetchForeignSupplierDeals() {
		this.isLoading = false;
		this.CrudServices.postRequest<any>(foreignSuppilerDeals.distinctForeignSupplier, {			
		}).subscribe((response) => {
			if (response.code === "101") {	
				for (let i = 0; i < response.length; i++){
				this.toasterService.pop(response.message, response.message, response.data);
				if (!(response[i].sub_org_name in this.lookup_supplier)) {
					this.lookup_supplier[response[i].sub_org_name] = 1;
					this.supplier_list.push({ 'sub_org_name': response[i].sub_org_name });					
				  }		
				  this.DetailsData= response.data		  
		     	}
				 this.pushDropdown(this.DetailsData);
				 this.footerTotal(this.DetailsData);
			} else {
				this.supplier_list = response;
				for (let i = 0; i < response.length; i++){
				if (!(response[i].sub_org_name in this.lookup_supplier)) {
					this.lookup_supplier[response[i].sub_org_name] = 1;
					this.supplier_list.push({ 'sub_org_name': response[i].sub_org_name });
				  }
		     	}
			}
			this.isLoading = false;
		});
	}

	convert(str) {
		if (str) {
			const date = new Date(str),
				month = ('0' + (date.getMonth() + 1)).slice(-2),
				day = ('0' + date.getDate()).slice(-2);
			return [date.getFullYear(), month, day].join('-');
		} else {
			return '';
		}
	}

	listDeals(id: number) {
		this.router.navigate(['forex/grade-assortment/' + id]);
	}

	addNew() {
		this.router.navigate(['forex/add-fs-deal']);
	}


	pushDropdown(arg) {	
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.export_cols.filter(col => col.filter == true);		
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;			
		});
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.export_cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			}
		});
	}

	customFilter(value, col, data) {				
		let res = this.table.filter(value, col, data);		
		this.footerTotal(this.data);		
	}

	onFilter(e, dt) {	
		this.DetailsData = []
		this.filteredBookedTotal = 0;
		this.filteredConfirmedTotal = 0;
		this.filteredDifference = 0
		this.DetailsData = this.table.filteredValue || this.supplier_list;
        this.filteredBookedTotal = this.DetailsData.reduce((total, item) => total + item.bookedContract, 0);
         this.filteredConfirmedTotal = this.DetailsData.reduce((total, item) => total + item.confirmedContract, 0);
         this.filteredDifference = this.filteredBookedTotal - this.filteredConfirmedTotal;
		this.footerTotal(dt.filteredValue);
	}	
	
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

	

	exportData() {
		let booked = 0;
		let confirmed = 0;
		let remaining = 0;
		this.export_data = [];
		for (const val of this.supplier_list) {
			const export_list = {
				'Supplier Name': val.sub_org_name,
				'Booked Contracts (MT)': val.bookedContract,
				'Confirm Contracts (MT)': val.confirmedContract,
				'Remaining Contracts (MT)': Number(val.bookedContract) - Number(val.confirmedContract)

			};
			this.export_data.push(export_list);
			booked = booked + Number(val.bookedContract);
			confirmed = confirmed + Number(val.confirmedContract);
			remaining = remaining + Number(val.bookedContract) - Number(val.confirmedContract);
		}

		const foot = {
			'Supplier Name': 'Total',
			'Booked Contracts (MT)': booked,
			'Confirm Contracts (MT)': confirmed,
			'Remaining Contracts (MT)': remaining
		};
		this.export_data.push(foot);

	}

	// download doc ,pdf , excel

	exportPdf() {
		this.exportData();
		this.exportColumns = this.export_cols.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Supplier-List');
	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_data, 'Supplier-List');
	}

	getData() {
		this.fetchForeignSupplierDeals();		
	}
}
