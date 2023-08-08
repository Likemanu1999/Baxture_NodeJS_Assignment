import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Leaves } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-leaves',
	templateUrl: './leaves.component.html',
	styleUrls: ['./leaves.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class LeavesComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "List of Leaves Applications";
	popoverTitle: string = 'Please Confirm';
	popoverMessage: string = 'Are you sure, you want to update?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Reject';
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
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "applicant", header: "Applicant", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "from_date", header: "From Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "to_date", header: "To Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "total_days", header: "Days", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "leave_category_label", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "leave_type_label", header: "Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "reason", header: "Reason", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "leave_status", header: "Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		this.filter = ['applicant', 'leave_type', 'leave_category', 'leave_status'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Leaves.getAllLeaves, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.applicant = element.createdBy.full_name;
						element.leave_category_label = (element.leave_category == 2) ? "Official" : "Personal";
						element.leave_type_label = this.getLeaveType(element.leave_type);
						element.leave_status = this.getLeaveStatus(element.status);
					});
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
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
	
	getLeaveType(leave_type) {
		if (leave_type == 1) {
			return "Late Check-In";
		} else if (leave_type == 2) {
			return "Early Check-Out";
		} else if (leave_type == 3) {
			return "Half-Day";
		} else if (leave_type == 4) {
			return "Leave";
		// } else if (leave_type == 5) {
		// 	return "Work From Home";
		} else if (leave_type == 6) {
			return "Maternity Leave";
		} else if (leave_type == 7) {
			return "Godown Visit";
		} else if (leave_type == 8) {
			return "Banking/Taxation/PF";
		} else if (leave_type == 9) {
			return "Other - Official Work";
		} else if (leave_type == 10) {
			return "Client Visit";
		}
	}

	getLeaveStatus(leave_status) {
		if (leave_status == 1) {
			return "Pending";
		} else if (leave_status == 2) {
			return "Approved";
		} else if (leave_status == 3) {
			return "Rejected";
		} else if (leave_status == 4) {
			return "Canceled";
		}
	}

	onAction(rowData, type, event) {
		if (type == 'Leave_Status') {
			this.crudServices.updateData<any>(Leaves.update, {
				id: rowData.id,
				status: event
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.getData();
				}
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
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
