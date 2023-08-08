import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-list-of-staff',
	templateUrl: './list-of-staff.component.html',
	styleUrls: ['./list-of-staff.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ListOfStaffComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "List of Staff";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to update?';
	popoverMessage2: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.active_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[0];

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	max_date: any = new Date();
	cols: any = [];
	data: any = [];
	filter: any = [];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "Emp ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "full_name", header: "Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "mobile", header: "Mobile", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "email", header: "Email", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "department", header: "Department", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "emp_type", header: "Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "status_label", header: "Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Status" },
			{ field: "is_third_party_label", header: "Is Third Party", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Third_Party" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		this.filter = ['full_name', 'mobile', 'profile', 'department', 'company', 'emp_type', 'role_name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(StaffMemberMaster.getAllStaffMembersNew, {
			active_status: this.selected_status.id
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
		this.cols.forEach(element => {
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
		this.cols.forEach(element => {
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
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	onAction(rowData, type, event) {
		if (type == 'Add') {
			this.router.navigate(['hr-new/add-staff-member']);
		}
		if (type == 'View') {
			console.log(rowData);
		}
		if (type == 'Edit') {
			this.router.navigate(['hr-new/edit-staff-member', rowData.id]);
		}
		if (type == 'Delete') {
			this.crudServices.deleteData<any>(StaffMemberMaster.delete, {
				id: rowData.id
			}).subscribe(res => {
				this.getData();
				this.toasterService.pop(res.message, 'Success', res.data);
			});
		}
		if (type == 'Status') {
			let new_status = (rowData.active_status == 1) ? 0 : 1;
			let body = {
				data: {
					active_status: new_status
				},
				id: rowData.id
			};
			this.crudServices.updateData<any>(StaffMemberMaster.update, body).subscribe(res => {
				this.toasterService.pop(res.message, 'Success', res.data);
				this.getData();
			});
		}
		if (type == 'Third_Party') {
			let new_is_third_party = (rowData.is_third_party == 1) ? 0 : 1;
			let body = {
				data: {
					is_third_party: new_is_third_party
				},
				id: rowData.id
			};
			this.crudServices.updateData<any>(StaffMemberMaster.update, body).subscribe(res => {
				this.toasterService.pop(res.message, 'Success', res.data);
				this.getData();
			});
		}
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.selected_status.name + ' - ' + this.page_title;
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "final_rate") {
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
