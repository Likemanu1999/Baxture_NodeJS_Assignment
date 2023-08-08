import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { Analytics, CountryStateCityMaster, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import * as moment from 'moment';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { Table } from 'primeng/table';
import { element } from 'protractor';
import { ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
	selector: 'app-sales-analytics-buying-trends',
	templateUrl: './sales-analytics-buying-trends.component.html',
	styleUrls: ['./sales-analytics-buying-trends.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]

})
export class SalesAnalyticsBuyingTrendsComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table

	page_title: any = "Sales Buying Trends";
	data: any = []
	isLoading: boolean = false;
	cols: any[];
	filter: any = [];
	selected_cols: any;
	selected_status: any;
	user: UserDetails;
	links: string[] = [];
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	optionsList: any = staticValues.buying_trends_options;
	selected_option: any = this.optionsList[0];
	staff: any;
	zone_id: any = null;
	state_id: any = null;
	stateList: any;
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
		this.getZoneList();
		this.getState();
	}

	getZoneList() {
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: staticValues.marketing_role_ids
		}).subscribe(response => {
			response["data"].map(item => item.first_name = item.first_name + ' ' + item.last_name);
			this.staff = response.data;
		});
	}

	getCols() {
		if (this.selected_option.id == 0) {
			this.cols = [
				{ field: "main_grade_name", header: "Main Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "total_orders", header: "Total Orders", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "total_sold_quantity", header: "Total Sold Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			];
		}
		if (this.selected_option.id == 1) {
			this.cols = [
				{ field: "sub_org_name", header: "Customer Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, },
				{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "state_name", header: "State Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "sales_person_name", header: "Sales Person Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "total_sold_quantity", header: "Total Sold Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			];
		} if (this.selected_option.id == 2) {
			this.cols = [
				{ field: "sub_org_name", header: "Customer Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, },
				{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "state_name", header: "State Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "sales_person_name", header: "Sales Person Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "total_sold_quantity", header: "Total Sold Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			];
		}
		this.filter = ['main_grade_name', 'grade_name', 'division', 'sales_person_name'];
		this.getData();

	}

	receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;	
	}
	
	clearDropdown(){		
		console.log((JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range)));
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}
  

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Analytics.getBuyingGrade, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			option: this.selected_option.id,
			zone_id: this.zone_id > 0 ? this.zone_id : null,
			state_id: this.state_id > 0 ? this.state_id : null
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.table.reset();
					this.data = res.data;
					this.pushDropdown(this.data);
					
				}this.footerTotal(this.data);
			}
		})
	}
	getState() {
		this.crudServices.getOne<any>(CountryStateCityMaster.getStates, {
			country_id: 101
		}).subscribe(res => {
			this.stateList = res.data;
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
			}else{
				element.total = 0;
			}
		});
	}

	onChangeOption(e) {
		this.zone_id = null;
		if (e != null && e != undefined) {
			this.selected_option = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		// this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	exportData(type) {
		let fileName = this.selected_option.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
