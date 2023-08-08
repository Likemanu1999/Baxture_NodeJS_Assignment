import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { Analytics } from '../../../shared/apis-path/apis-path';
import * as moment from 'moment';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { Table } from 'primeng/table';
import { element } from 'protractor';
import { ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';


@Component({
	selector: 'app-inactive-sales-accounts',
	templateUrl: './inactive-sales-accounts.component.html',
	styleUrls: ['./inactive-sales-accounts.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})
export class InactiveSalesAccountsComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table

	page_title: any = "Inactive Sales Accounts";
	page_title2: any = "Chart Inactive Sales Account State Wise"
	data: any = []
	isLoading: boolean = false;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().endOf('month').format("YYYY-MM-DD"))
	];
	companyList: any = staticValues.company_list_new
	selected_company: any = this.companyList[0];
	cols: any[];
	filter: string[];
	selected_cols: any;
	selected_status: any;
	user: UserDetails;
	links: string[] = [];
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	maxDate: any = new Date();
	isRange: any;
  	datePickerConfig: any = staticValues.datePickerConfigNew;

	constructor(
		private loginService: LoginService,
		private crudServices: CrudServices,
		private ExportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "sub_org_name", header: "Customer Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "state_name", header: "State", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "division", header: "Division", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "days", header: " SO Days", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "days" },
			{ field: "added_date_number", header:"Added Days", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "added_days" },
			{ field: "sales_person_name", header: "Sales Person Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "booking_date", header: "SO Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "added_date", header: "Added Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },

		];
		this.filter = ['sub_org_name', 'state_name', 'division', 'main_grade', 'grade_name'];
		this.getData();
	}

	receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
		
	}
	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Analytics.getInactiveSalesAccounts, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: this.selected_company.id
		}).subscribe(res => {
			console.log(res);
			this.isLoading = false;
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
		})

	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]).filter((value, index, self) =>
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
		})
	}
	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
			}

		});
	}

	onChangeCompany(e) {
		if (e != null && e != undefined) {
			this.selected_company = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}
	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	exportData(type) {
		let fileName = this.selected_company.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {}
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		if (type == 'Excel') {
			this.ExportService.exportExcel(exportData, fileName)
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			})
			this.ExportService.exportPdf(exportColumns, exportData, fileName);
		}
	}







}
