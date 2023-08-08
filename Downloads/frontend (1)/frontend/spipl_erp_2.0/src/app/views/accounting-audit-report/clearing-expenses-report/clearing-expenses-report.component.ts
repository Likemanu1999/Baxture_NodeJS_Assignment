import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { AccountAndReport } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-clearing-expenses-report',
	templateUrl: './clearing-expenses-report.component.html',
	styleUrls: ['./clearing-expenses-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class ClearingExpensesReportComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "Clearing Expenses Report";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	maxDate: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfigNew;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	misData: any = [];
	filter: any = [];
	dataWithGST:boolean;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,

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
	}

	ngOnInit() {
		this.dataWithGST=true;
		this.getData();
	}

	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}

  receiveDate(dateValue: any){
	this.isRange = dateValue.range
	this.selected_date_range = dateValue.range;
		
	}

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		
	    let body=
		{
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		};
		
		body['gstInclude']=(this.dataWithGST==true)?true:false;
		
		this.crudServices.getOne<any>(AccountAndReport.expensesReport, body).subscribe(res => {
			console.log(res);

			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					let response=res.data[0];

				console.log("response data>>",res.data);
				
				console.log(`TEST CHARGES > terminalTotal:${typeof(response.terminalTotal)},scanning_charges:${response.scanning_charges},toll_charges:${response.toll_charges},
				cha_other_charges:${response.cha_other_charges},shipping_other_charges:${response.shipping_other_charges},examination_charge:${response.examination_charge}`);
				
					res.data.forEach((item)=>{
						item.party_type="Import";

						let temp=JSON.parse(item.pi_id_qty);
						item.non_qty=Number(temp[0].pi_qty)
						let temp_be_copy=JSON.parse(item.be_copy)
						item.be_copy=temp_be_copy[0];
						let temp_Tr6_copy=JSON.parse(item.tr6_copy);
						item.tr6_copy=temp_Tr6_copy[0];

											
						item.chatotal=(item.chatotal==(null || undefined))?0:item.chatotal; 
						item.shippingtotal=(item.shippingtotal==(null || undefined))?0:item.shippingtotal; 
						item.citpltotal=(item.citpltotal==(null || undefined))?0:item.citpltotal; 
						item.cfstotal=(item.cfstotal==(null || undefined))?0:item.cfstotal; 
						item.terminaltotal=(item.terminaltotal==(null || undefined))?0:item.terminaltotal; 
						item.fobtotal=(item.fobtotal==(null || undefined))?0:item.fobtotal; 
						item.storagetotal=(item.storagetotal==(null || undefined))?0:item.storagetotal; 
						item.transporterChargesTotal=(item.transporterChargesTotal==(null || undefined))?0:item.transporterChargesTotal; 
						
						item.scanning_charges=(item.scanning_charges==(null || undefined))?0:Number(item.scanning_charges);
						item.toll_charges=(item.toll_charges==(null || undefined))?0:Number(item.toll_charges);
						item.cha_other_charges=(item.cha_other_charges==(null || undefined))?0:Number(item.cha_other_charges);
						item.shipping_other_charges=(item.shipping_other_charges==(null || undefined))?0:Number(item.shipping_other_charges);
						item.examination_charges=(item.examination_charge==(null || undefined))?0:Number(item.examination_charge); 


						item.total_charges=Number(item.chatotal)+Number(item.shippingtotal)+Number(item.citpltotal)+Number(item.cfstotal) +
						Number(item.fobtotal)+Number(item.storagetotal)+Number(item.transporterchargestotal)+Number(item.scanning_charges);
						+Number(item.toll_charges)+Number(item.cha_other_charges)+Number(item.shipping_other_charges);
						+Number(item.examination_charges)+Number(item.be_custom_duty_amt);	
						console.log("T CHARGE>>",item.total_charges);
											
					})
					this.data = res.data;
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
			{ field: 'purchase_date', header: 'Purchase Date', style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: 'sub_org_name', header: 'Supplier Name', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'invoice_no', header: 'Import Invoice No', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'invoice_date', header: 'Import Invoice Date', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: 'party_type', header: 'Party Type', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'division', header: 'Division Name', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'port_name', header: 'Port', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			// { field: 'state_name', header: 'Depot', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'grade_name', header: 'Grade', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'category', header: 'Category', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'non_qty', header: 'Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: 'be_no', header: 'BE No', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: "be_copy" },
			{ field: 'be_dt', header: 'BE Date', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'bl_qauntity', header: 'BL Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: 'total_charges', header: 'Total Clearing Charges', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

		];
		this.filter = ['purchase_date', 'invoice_no','invoice_date', 'sub_org_name', 'party_type', 'division','port_name', 'depot', 'grade_name', 'category','non_qty','bl_qauntity',
		'be_no', 'be_dt','total_charges'];
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	flatten(obj) {
		const result = {};
		if (obj != null && obj != undefined) {
			for (const key of Object.keys(obj)) {
				if (typeof obj[key] === 'object') {
					const nested = this.flatten(obj[key]);
					for (const nestedKey of Object.keys(nested)) {
						result[`${nestedKey}`] = nested[nestedKey];
					}
				} else {
					result[key] = obj[key];
				}
			}
		}
		return result;
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
				if (item) {
					array.push({
					  value: item,
					  label: item
					});
				  }
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
				}else if (element.type == "Amount") {
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
		//this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}


	onAction(item, type) {
		if (type == 'View') {
			console.log(item, "onAction-View");
		}
		if (type == "with_gst") {
			this.dataWithGST=(item.checked==true)?true:false;
			this.getData();
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
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
					} else {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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
