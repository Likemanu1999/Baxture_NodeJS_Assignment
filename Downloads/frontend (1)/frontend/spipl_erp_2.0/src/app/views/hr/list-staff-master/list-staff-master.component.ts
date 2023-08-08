import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { PayableParameter, PayableParameterModel } from '../../../shared/payable-request/payable-parameter.model';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { staticValues } from '../../../shared/common-service/common-service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-list-staff-master',
	templateUrl: './list-staff-master.component.html',
	styleUrls: ['./list-staff-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, InrCurrencyPipe],
})

export class ListStaffMasterComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	page_title: any = "Staff Members List"
	public popoverTitle: string = 'Warning';
	public popoverMessage1: string = 'Are you sure, you want to update?';
	public popoverMessage2: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

	isLoading = false;
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	payment_staff: boolean = false;
	generate_appointment_letter: boolean = false;
	showPaymentList: boolean = false;
	initialPara: PayableParameterModel;
	statusList: any = staticValues.active_status;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	cols: any = [];
	data: any = [];
	filter: any = [];
	company_id: any;
	role_id: any;
	selected_status: any = this.statusList[0];

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private currencyPipe: InrCurrencyPipe,
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.payment_staff = (this.links.indexOf('Staff Payment') > -1);
		this.generate_appointment_letter = (this.links.indexOf('generate_appointment_letter') > -1);
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "full_name", header: "Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "mobile", header: "Mobile", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "email", header: "Email", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "department", header: "Department", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "emp_type", header: "Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "machine_id", header: "Machine ID", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "status_label", header: "Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Status" },
			{ field: "is_third_party_label", header: "Is Third Party", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Third_Party" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		if (this.role_id == 1) {
			let ext_obj = { field: "extension", header: "Extension", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null };
			let role_obj = { field: "role_name", header: "Role", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null };
			this.cols.splice(4, 0, ext_obj);
			this.cols.splice(5, 0, role_obj);
		}
		this.filter = ['id', 'full_name', 'mobile', 'profile', 'department', 'machine_id', 'company', 'emp_type', 'role_name'];
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
			this.table.reset();
		});
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_staff_col",
			JSON.stringify(this.cols)
		);
		return this.cols;
	}

	set selectedColumns(val: any[]) {
		this.cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
	}

	getColumnPresent(col) {
		if (this.cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
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
		this.pushDropdown(this.data);
	}

	onFilter(e, dt) {
		this.pushDropdown(dt.filteredValue);
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	onAction(item, type) {
		if (type == 'View') {
			this.router.navigate(['hr/view-staff', item.id]);
		}
		if (type == 'Edit') {
			this.router.navigate(['hr/add-staff', item.id]);
		}
		if (type == 'Delete') {
			this.crudServices.deleteData<any>(StaffMemberMaster.delete, {
				id: item.id
			}).subscribe(res => {
				this.getData();
				this.toasterService.pop(res.message, 'Success', res.data);
			});
		}
		if (type == 'Status') {
			let new_status = (item.active_status == 1) ? 0 : 1;
			let body = {
				data: {
					active_status: new_status
				},
				id: item.id
			};
			this.crudServices.updateData<any>(StaffMemberMaster.update, body).subscribe(res => {
				this.toasterService.pop(res.message, 'Success', res.data);
				this.getData();
			});
		}
		if (type == 'Third_Party') {
			let new_is_third_party = (item.is_third_party == 1) ? 0 : 1;
			let body = {
				data: {
					is_third_party: new_is_third_party
				},
				id: item.id
			};
			this.crudServices.updateData<any>(StaffMemberMaster.update, body).subscribe(res => {
				this.toasterService.pop(res.message, 'Success', res.data);
				this.getData();
			});
		}
		if (type == 'Payment') {
			this.showPaymentList = true;
			const name = `${item.title} ${item.full_name}`
			const headerMsg = `Payment Details for: ${name}`;
			this.initialPara = new PayableParameter(0, item.id, headerMsg, 0, item.id, 5, name, true, true, this.company_id);
		}
	}

	backFromPayable(event) {
		this.showPaymentList = false;
	}

	exportData(type) {
		let fileName = 'Staff Member List';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "final_rate" ||
					this.cols[j]["field"] == "freight_rate") {
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
