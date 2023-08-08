import { Component, OnInit } from '@angular/core';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { InsiderSales, salesIftPayment, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ExportService } from '../../../shared/export-service/export-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
@Component({
	selector: 'app-insider-list',
	templateUrl: './insider-list.component.html',
	styleUrls: ['./insider-list.component.scss'],
	providers: [CrudServices, ToasterService, ExportService, PermissionService],
})
export class InsiderListComponent implements OnInit {
	page_title: any = "Insider List";

	assignParent: boolean = true;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;

	user: UserDetails;
	links: string[] = [];
	insiderData: any[];
	insiderParentData: any[];
	cols: any = [];
	filter: any = [];
	statusList: any = staticValues.active_status;
	selected_status: any = this.statusList[0];
	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(toasterService: ToasterService, private loginService: LoginService, private permissionService: PermissionService, private crudServices: CrudServices, private exportService: ExportService) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.toasterService = toasterService;
	}
	ngOnInit() {
		this.getCols();
	}
	getCols() {
		this.cols = [
			{ field: "full_name", header: "Child Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "parent", header: "Parent Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action", }
		];
		this.filter = ['first_name'];
		this.getData();
	}
	getData() {
		this.insiderData = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(InsiderSales.getInsiderListData, {
			type: "Child"
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.insiderData = res.data;
					this.insiderData.map(item => {
						if (item.parent_id != null) {
							item.editMode = false;
						} else {
							item.editMode = true;
						}
					})
					this.getParentData();
				}
			}
		});
	}
	getParentData() {
		this.insiderParentData = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(InsiderSales.getInsiderListData, {
			type: "Parent"
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.insiderParentData = res.data;
				}
			}
		});
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
	onAction(rowData, type, event) {
		if (type == "Insider_Parent") {
			let insider_parent_id = event;
			let body = {
				data: {
					insider_parent_id: insider_parent_id.id
				},
				id: rowData.id

			}
			if (rowData.id != insider_parent_id.id) {
				this.crudServices.updateData<any>(StaffMemberMaster.update, body).subscribe(res => {
					if (res.code === '100') {
						this.toasterService.pop('success', 'Success', "Insider Updated Successfully");
						this.getData();
					}
				});
			}
			else {
				this.toasterService.pop('error', 'error', "Error Assigning Same Parents");
				this.getData();
			}
		}
	}
	exportData(type) {
		let fileName = 'Insider List';
		let exportData = [];
		for (let i = 0; i < this.insiderData.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.insiderData[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.insiderData[i][this.cols[j]["field"]];
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
	editData(editId) {
		for (var i = 0; i < this.insiderData.length; i++) {
			if (this.insiderData[i].id == editId) {
				this.insiderData[i].editMode = false;
				break;
			}
		}
	}
}