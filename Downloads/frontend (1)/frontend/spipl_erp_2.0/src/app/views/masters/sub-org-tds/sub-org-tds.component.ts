import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SubOrgTDS } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-sub-org-tds',
	templateUrl: './sub-org-tds.component.html',
	styleUrls: ['./sub-org-tds.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SubOrgTdsComponent implements OnInit {

	@ViewChild("updateTDSModal", { static: false }) public updateTDSModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	page_title: any = "Sub-Organization TDS";
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	cols: any = [];
	data: any = [];
	filter: any = [];
	divisionList: any = staticValues.company_list;
	selected_division: any = this.divisionList[3];
	selected_row: any = null;
	subOrgTDSForm: FormGroup;

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
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.subOrgTDSForm = new FormGroup({
			tds: new FormControl(null, Validators.required),
			tcs: new FormControl(null, Validators.required)
		});
	}

	getCols() {
		this.cols = [
			{ field: "sub_org_id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "sub_org_name", header: "Org Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "tds", header: "TDS", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "tcs", header: "TCS", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
			{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, width: "100px" },
		];
		this.filter = ['sub_org_id', 'sub_org_name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SubOrgTDS.getSubOrgList, {
			from_date: '2022-04-01',
			to_date: '2023-03-31',
			division: (this.selected_division.id == 0) ? null : this.selected_division.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data.map(x => {
						if (x.product_type == 1) {
							x.division = 'PVC';
						} else if (x.product_type == 2) {
							x.division = 'PE&PP';
						} else if (x.product_type == 3) {
							x.division = 'Surisha';
						}
						return x;
					});
					// this.data = res.data;
					this.pushDropdown(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	onSubmit() {
		let body = {
			data: {
				sub_org_id: this.selected_row.sub_org_id,
				tds: Number(this.subOrgTDSForm.value.tds),
				tcs: Number(this.subOrgTDSForm.value.tcs),
				from_date: '2022-04-01',
				to_date: '2023-03-31',
				status: 1
			}
		};
		if (this.selected_row.tds != null) {
			body['id'] = this.selected_row.id;
			this.crudServices.updateData<any>(SubOrgTDS.update, body).subscribe(res => {
				if (res.code == '100') {
					this.subOrgTDSForm.reset();
					this.updateTDSModal.hide();
				}
			});
		} else {
			this.crudServices.addData<any>(SubOrgTDS.add, body).subscribe(res => {
				if (res.code == '100') {
					this.subOrgTDSForm.reset();
					this.updateTDSModal.hide();
				}
			});
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
		// 
	}

	onAction(rowData, type, event) {
		if (type == 'View') {
			this.selected_row = rowData;
			this.subOrgTDSForm.reset();
			this.updateTDSModal.show();
		}
	}

	onChangeDivision(e) {
		if (e != null && e != undefined) {
			this.selected_division = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	exportData(type) {
		let final_data = (this.table.filteredValue == null) ? this.data : this.table.filteredValue;
		let fileName = this.page_title;
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] == "quantity") {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
				} else {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] == "quantity") {
				foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
			} else if (this.cols[j]["field"] == "final_rate") {
				foot[this.cols[j]["header"]] = this.cols[j]["total"];
			} else {
				foot[this.cols[j]["header"]] = "";
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				return { title: col.header, dataKey: col.header }
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

}
