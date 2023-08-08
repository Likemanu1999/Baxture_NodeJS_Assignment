import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from "primeng/table";
import { staticValues } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { BlackListNew, SubOrg } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-blacklist-users-new',
	templateUrl: './blacklist-users-new.component.html',
	styleUrls: ['./blacklist-users-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices]
})

export class BlacklistUsersNewComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Black List Users"
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to ==?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.sales_deals_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[0];

	cols: any = [];
	data: any = [];
	filter: any = [];
	pendingSalesOrders: any = [];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		public crudServices: CrudServices
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.company_id = user.userDet[0].company_id;
		this.role_id = user.userDet[0].role_id;
		this.links = user.links;
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "sub_org_id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sub_org_name", header: "Customer", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "blacklist_status", header: "Status", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "black_list_count", header: "Black List Count", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "blacklist_renewed_date", header: "Last Renew Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
		];
		this.filter = ['sub_org_id', 'sub_org_name', 'virtual_acc_no'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(BlackListNew.getBlackListCustomers, {
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.blacklist_status = (element.blacklist == 1) ? "Black Listed" : null;
						element.company = (element.product_type == 2) ? "PE & PP" : "PVC";
					});
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
		});
	}

	onAction(item, type) {
		if (type == 'Unblacklist') {
			let data = {
				blacklist: 0,
				black_list_count: (Number(item.black_list_count) + 1),
				blacklist_renewed_date: moment().format("YYYY-MM-DD")
			};
			let body = {
				data: data,
				sub_org_id: item.sub_org_id
			};
			this.crudServices.updateData(BlackListNew.update, body).subscribe(data => {
				this.toasterService.pop('success', 'Success', 'Unblacklisted Successfully');
				this.getCols();
			});
		}
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
			let filter_cols = this.cols.filter(col => col.filter == true);
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
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
			let filter_cols = this.cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = data.map(item =>
					Number(item[element.field])
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
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
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "extra_suspense" || this.cols[j]["field"] == "total_pending_orders") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"];
				} else {
					foot[this.cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

}
