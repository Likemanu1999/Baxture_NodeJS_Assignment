import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	SalesReportsNew,
	DispatchBilling,
	Notifications,
	FileUpload,
	UsersNotification
} from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-discount-report',
	templateUrl: './discount-report.component.html',
	styleUrls: ['./discount-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class DiscountReportComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
	page_title: any = "Discount Report";
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure you want to Change Discount Status?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	update_discount_status: boolean = false;
	isLoading: boolean = false;
	statusList: any = staticValues.dispatch_report_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	selectedZone:any;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.update_discount_status = (this.links.find(x => x == 'update_discount_status') != null) ? true : false;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34 || this.user.userDet[0].role_id == 46) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
	}

	receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
		
	}
	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}
	
	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesReportsNew.getDiscountReport, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			zone_id:this.selectedZone
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.isLoading = false;
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "invoice_no", header: "Invoice No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "bill_rate", header: "Bill Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "deal_rate", header: "Deal Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "discount_rate", header: "Difference", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "discount_amount", header: "Discount Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['invoice_no', 'customer'];
		this.getData();
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
				element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
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

	onAction(item, type) {
		if (type == 'View') {
			// 
		}
		if (type == 'Status') {
			let status = (item.discount_status == 0) ? 1 : 0;
			let body = {
				data: {
					discount_status: status
				},
				id: item.id
			};
			this.crudServices.updateData<any>(SalesReportsNew.updateDiscountStatus, body).subscribe((res) => {
				this.toasterService.pop('success', 'Success', 'Discount Status Updated Successfully');
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

	closeModal() {
		this.getCols();
	}

	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
