import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { Analytics } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';
import { ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';

@Component({
	selector: 'app-org-summary-view',
	templateUrl: './org-summary-view.component.html',
	styleUrls: ['./org-summary-view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]

})
export class OrgSummaryViewComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table

	page_title: any = "Organization Summary View";
	page_title_search: any = "Organization Summary Search";
	data: any = [];
	isLoading: boolean = false;
	cols: any[];
	filter: string[];
	user: UserDetails;
	links: string[] = [];
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_option: any;

	companyList: any = staticValues.company_list_new;
	selected_company: any = this.companyList[0];

	local_import_flag: any = staticValues.new_grade_flag_type;
	selected_grade_flag: any = this.local_import_flag[0];
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();




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
			{ field: "sub_org_name", header: "Org Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_flag", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "zone_name", header: "Zone Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "purchase_acc_holder", header: "Purchase Person Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "state_name", header: "State Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "virtual_acc_no", header: "V. A. Number", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "booking_date", header: "Last Booking Date", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pan_no", header: "PAN Number", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pay_term", header: "Payment Terms", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pay_val", header: "Payment Days", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "gst_no", header: "GST Number", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "added_by", header: "Added By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "modified_by", header: "Modified_by", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lc_date", header: "lc Date", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "date_of_shipment", header: "Date of shipment", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },

			
		];
		this.filter = ['sub_org_name', 'division', 'grade_flag','country_name','state_name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Analytics.getOrgSummaryview, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: this.selected_company.id,
			grade_id: this.selected_grade_flag.id,
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == "100") {
				if (res.data.length > 0) {
					console.log(this.data);
					this.table.reset();
					this.data = res.data;
					this.pushDropdown(this.data);

				} this.footerTotal(this.data);
			}
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
			} else {
				element.total = 0;
			}
		});
	}

	onChangeOption(e) {
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
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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

	onChangeCompany(e) {
		if (e != null && e != undefined) {
			this.selected_company = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	onChangeLocalImport(e) {
		if (e != null && e != undefined) {
			this.selected_grade_flag = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
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

}
