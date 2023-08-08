import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { godownStock, ReportRemark } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-godown-stock',
	templateUrl: './godown-stock.component.html',
	styleUrls: ['./godown-stock.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class GodownStockComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('remarkModel', { static: false }) public remarkModel: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "Inventory Movement";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	inventory_movement_actions:boolean=false;
	isLoading: boolean = false;
	drop_down: boolean = false;
	maxDate: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfigNew;
	reports_name: any = staticValues.reports_name;
	remarkForm: any = FormGroup;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	misData: any = [];
	filter: any = [];
	pdf_excell:any=[];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.inventory_movement_actions = (this.links.find(x => x == 'inventory_movement_actions') != null) ? true : false;
		

	}

	ngOnInit() {
		this.getData();

		// Form for remarks
		this.remarkForm = new FormGroup({
			remark: new FormControl(null),
			dispatchBilling_id: new FormControl(null),
			mis_id: new FormControl(null),
		})
	}

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(godownStock.getAll, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1]
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(item => {
						item.import_local_name = (item.import_local_flag == 1) ? "Import" : "Local";
					})
					this.data = res.data;
					console.log("Amol >>", this.data);

					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');

				}
			}
			this.table.reset();
		});
	}



	getCols() {
		this.cols = [
			{ field: 'id', header: 'Serial no', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			// { field: 'id', header: 'ID', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'import_local_name', header: 'Type', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
			{ field: 'company_name', header: 'Division', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
			{ field: 'godown_name', header: 'Godown', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'grade_name', header: 'Grade', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
			{ field: 'added_date', header: 'Date', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Date", oprations: null },
			{ field: 'inward', header: 'Inward', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: null },
			{ field: 'outward', header: 'Outward', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: null },
			{ field: 'action', header: 'Action', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null, oprations: null },

		];
		this.filter = ['id','import_local_name','company_name','godown_name', 'grade_name', 'date', 'inward', 'outward'];
		this.pushDropdown(this.data);
		// this.footerTotal(this.data);
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
			this.pdf_excell=arg;
		} else {
			data = this.data;
			this.pdf_excell= this.data;
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

				if (element.type == "Avg") {
					element.total = total / (data.length)
				} else if (element.type == "Quantity") {
					element.total = roundQuantity(total);
				}
				else {
					element.total = total;
				}
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);		
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);		
	}

	onFilter(e, dt) {
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}


	onAction(item, type) {
		// if (type == 'View') {
		// 	console.log(item, "Amol");
		// }
		// if (type == 'Download') {
		// 	window.open(item.so_copy, "_blank");
		// }
		// if (type == "REMARK") {
		// 	this.remark_add(item, "add");
		// }
		// if (type == 'Edit_Remark') {
		// 	console.log("EDIT REMARK >>", item.remark_id);
		// 	this.getMisAuditReport(item.remark_id);
		// 	//this.remark_add(this.misData, "update");
		// }
		// if (type == 'Download_Invoice') {
		// 	let invoice_arr = JSON.parse(item);
		// 	this.crudServices.downloadMultipleFiles(invoice_arr);
		// }

		if(type=="changeLocalImportFlag"){
			
			let data={};
			data['import_local_flag']=(item.import_local_flag==1)?2:1;
			data['outward']=item.outward;
			data['record_id']=item.record_id;
			this.crudServices.updateData<any>(godownStock.update, { data: data, id: item.id }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data)				
			})
			console.log("changing flag of ",item.id);
			
			this.getData();
		}

		if(type=="changeSurishaFlag"){			
			let data={};
			data['surisha_stock_flag']=(item.surisha_stock_flag==0)?1:0;
			this.crudServices.updateData<any>(godownStock.update, { data: data, id: item.id }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data)				
			})
			console.log("change Surisha Flag of",item.id);			
			this.getData();
		}

		
	}

	




	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.pdf_excell.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.pdf_excell[i][this.cols[j]["field"]];
					} else {
						obj[this.cols[j]["header"]] = this.pdf_excell[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "order_quantity" || this.cols[j]["field"] == "dispatch_quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "final_rate") {
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

