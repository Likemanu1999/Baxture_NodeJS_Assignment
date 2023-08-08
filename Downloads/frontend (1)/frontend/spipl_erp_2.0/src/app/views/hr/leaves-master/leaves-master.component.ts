import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from "primeng/table";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { Leaves } from '../../../shared/apis-path/apis-path';
import * as moment from "moment";

@Component({
	selector: 'app-leaves-master',
	templateUrl: './leaves-master.component.html',
	styleUrls: ['./leaves-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService],
})

export class LeavesMasterComponent implements OnInit {
	@ViewChild("dt1", { static: false }) table: Table;
	isLoading = false;
	user: UserDetails;
	links: string[] = [];
	data: any = [];
	filter: any = [];
	cols: any;
	maxDate: any = new Date();
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	show_all_leaves: boolean = false;
	selected_date_range: any;
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();

	page_title: any = "Hr leaves List";
	public popoverTitle: string = "Please Confirm";
	public popoverMessage: string = "";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Approve";
	public cancelText: string = "Reject";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	applicant_leave: any = {
		id: null,
		applicant_name: null,
		checked_by: null,
		from_date: null,
		to_date: null,
		leave_type: null,
		duration: null,
		status: null,
		reason: null,

	};

	constructor(
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private exportService: ExportService,
	) {
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.show_all_leaves = (this.links.indexOf('show all leaves') > -1);

		this.selected_date_range = [
			new Date(moment().subtract(30, 'days').format("YYYY-MM-DD")),
			new Date(moment().add(30, 'days').format("YYYY-MM-DD"))
		];
	}

	ngOnInit() {
		this.getCols();
	}
	getCols() {
		this.cols = [
			{ field: "id", header: "ID", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "applicant", header: "Applicant", filter: true, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "from_date", header: "From Date", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "to_date", header: "To Date", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "total_days", header: "Duration", filter: false, dropdown: [], footer: true, type: "Duration", total: 0, sort: true },
			{ field: "leave_category_label", header: "Category", filter: true, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "leave_type_label", header: "Type", filter: true, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "reason", header: "Reason", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "leave_status", header: "Status", filter: true, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "action", header: "Action", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "updatedBy", header: "Updated By", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true },
			{ field: "checked_at", header: "Updated At", filter: false, dropdown: [], footer: false, type: null, total: 0, sort: true }
		],
			this.filter = ['applicant', 'leave_type', 'leave_category', 'leave_status']
		this.getData();

	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getData() {
		this.data = [];
		this.crudServices.getOne<any>(Leaves.getAllLeaves, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		}).subscribe(res => {
			if (res.code == '100') {
				console.log("res", res.data[0]);

				res.data.forEach(element => {
					element.applicant = element.createdBy.full_name;
					if (element && element.CheckedBy && element.CheckedBy.full_name) {
						element.updatedBy = element.CheckedBy.full_name;
					} else {
						element.updatedBy = "NA"
					}
					element.leave_category_label = this.getLeaveCategory(element.leave_category);
					element.leave_type_label = this.getLeaveType(element.leave_type);
					element.leave_status = this.getLeaveStatus(element.status);

				});
				this.data = res.data;
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}

		});
	}

	getLeaveCategory(leave_category) {
		if (leave_category == 1) {
			return "Personal";
		} else if (leave_category == 2) {
			return "Official";
		}
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
		} else if (leave_type == 5) {
			return "Work From Home";
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

	updateStatus(status, id) {
		this.crudServices.updateData<any>(Leaves.update, {
			id: id,
			status: status
		}).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop(res.message, res.message, res.data);
				this.getData();
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
				element.total = Number(total);
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		this.footerTotal(dt.filteredValue);
	}



	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		} if (type == 'Excel') {
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
