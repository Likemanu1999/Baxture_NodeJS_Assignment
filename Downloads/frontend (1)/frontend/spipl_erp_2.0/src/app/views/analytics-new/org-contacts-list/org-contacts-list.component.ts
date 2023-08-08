import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { SubOrg } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FileNamePipe } from '../../../shared/file-name/file-name.pipe';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
	selector: 'app-org-contacts-list',
	templateUrl: './org-contacts-list.component.html',
	styleUrls: ['./org-contacts-list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, FileNamePipe, Calculations]
})

export class OrgContactsListComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Organization Contacts List";

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	orgContactTypeList: any = staticValues.org_contact_type;
	selected_type: any = this.orgContactTypeList[0];

	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];

	constructor(
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		if (this.selected_type.id == 1) {
			this.cols = [
				{ field: "email_id", header: "Email", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "sub_org_name", header: "Organization Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "org_category", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			];
			this.filter = ['org_category', 'sub_org_name', 'email', 'division'];
		} else if (this.selected_type.id == 2) {
			this.cols = [
				{ field: "contact_no", header: "Contact No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "sub_org_name", header: "Organization Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "org_category", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			];
			this.filter = ['org_category', 'sub_org_name', 'contact_no', 'division'];
		}
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SubOrg.getOrgContactsList, {
			contact_type: this.selected_type.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
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

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
	}

	onFilter(e, dt) {
		// 
	}

	onAction(rowData, type, event) {
		if (type == 'View') {
			// 
		}
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_type = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	exportData(type) {
		let fileName = this.selected_type.name + ' - ' + this.page_title;
		let exportData = [];
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}

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
			foot[this.cols[j]["header"]] = "";
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
