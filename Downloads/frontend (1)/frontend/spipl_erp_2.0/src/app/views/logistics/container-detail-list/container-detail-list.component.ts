import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, billOfLading, containerDetails, FileUpload, GodownMaster } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { ExportService } from '../../../shared/export-service/export-service';
import { HelperService } from '../../../_helpers/helper_service';


@Component({
	selector: 'app-container-detail-list',
	templateUrl: './container-detail-list.component.html',
	styleUrls: ['./container-detail-list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		ToasterService,
		ExportService,
		HelperService
	]
})
export class ContainerDetailListComponent implements OnInit {
	cols: { field: string; header: string; style: string; }[];
	bsRangeValue: Date[];
	currentYear: number;
	date = new Date();
	fromBeDate: any;
	toBeDate: any;
	container_list = [];
	ewayDocs: Array<File> = [];
	net_wt: any;
	unloading_qty: any;
	crossing_qty: any;
	charges: any;
	short_material_qty: any;
	damage_material_qty: any;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	godown = [];
	godown_id: any;
	filteredValuess = [];
	exportColumns: { title: string; dataKey: string; }[];
	export_list: any;
	status: { id: number; status: string; }[];
	setStatus = 0;
	shortDocs: Array<File> = [];
	ewayDocsTransport: Array<File> = [];
	isLoading: boolean;
	fromRcvDt: any;
	toRcvDt: any;
	no_of_pallets: any;
	constructor(private permissionService: PermissionService,
		private toasterService: ToasterService,
		private exportService: ExportService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private HelperService: HelperService,
		private crudServices: CrudServices) {
		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}

		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
			this.godown = response;
		})

		this.HelperService;

		this.status = [{ id: 0, status: 'Pending' }, { id: 1, status: 'Completed' }];

		this.cols = [

			{ field: 'container_number', header: 'Container Number', style: '150' },
			{ field: 'container_return_date', header: 'Empty Container Return Date', style: '120' },
			{ field: 'godown_name', header: 'Godown ', style: '150' },
			{ field: 'bill_lading_no', header: 'BL Number', style: '100' },
			{ field: 'be_no', header: 'BE Number', style: '100' },
			{ field: 'bl_date', header: 'BL Date', style: '120' },
			{ field: 'net_wt', header: 'Net Wt', style: '100' },
			{ field: 'unloading_qty', header: 'Unloading Qty', style: '100' },
			{ field: 'crossing_qty', header: 'Crossing Qty', style: '100' },
			{ field: 'no_of_pallets', header: 'No of Pallets', style: '100' },
			{ field: 'charges', header: 'Charges', style: '100' },
			{ field: 'cont_received_date', header: 'Container Received Date', style: '120' },
			{ field: 'short_material_qty', header: 'Short Qty', style: '100' },
			{ field: 'short_remark', header: 'Short Remark', style: '100' },
			{ field: 'damage_material_qty', header: 'Damage Qty', style: '100' },
			{ field: 'damage_remark', header: 'Damage Remark', style: '100' },
			{ field: 'short_deb_credit_no', header: 'Short Debit/credit no', style: '200' },
			{ field: 'damage_deb_credit_no', header: 'Damage Debit/Credit no', style: '200' },
			{ field: '', header: 'Uploaded Short Damage Picture', style: '200' },
			{ field: '', header: 'Uploaded Transporter E-way Bill', style: '200' },



		];
	}

	ngOnInit() {
	}

	onSelect(event, val) {


		if (event == null && val == 1) {
			this.fromBeDate = '';
			this.toBeDate = '';
		}
		if (event && val == 1) {
			this.fromBeDate = event[0];
			this.toBeDate = event[1];
		}

		if (event == null && val == 2) {
			this.fromBeDate = '';
			this.toBeDate = '';
		}
		if (event && val == 2) {
			this.fromRcvDt = event[0];
			this.toRcvDt = event[1];
		}

		this.getList();

	}

	onGodownChange(event) {
		if (event) {
			this.godown_id = event.id;
		}

		if (event == null) {
			this.godown_id = null;
		}

		this.getList();
	}

	 updateData(event, id, val, items) {


	    let data ={}
		let value: any;
		if ( val == 'container_return_date') {

			value = this.datepipe.transform(event, 'yyyy-MM-dd');
		}

		data[val] = value;
		data['id'] = items.id
		let r = confirm("Are Yor Sure to update ?");
		if (r == true) {
			this.crudServices.updateData<any>(containerDetails.updateContainerWithoutInventory, data).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);

				} else {
					this.toasterService.pop(response.message, response.message, 'something Went Wrong');

				}

			})
		} else {
			if (val == 'container_return_date') {
				event = ''
			} else {
				event.target.value = '';
			}
		}



	
	}

	async updateContainer(event, id, val, items) {


		let load_charges = items.load_charges;
		let cross_charges = items.cross_charges;
		let charges = items.charges;



		if (event != undefined && event != null) {
			let value: any;
			if (val == 'unloading_qty' || val == 'crossing_qty' || val == 'charges' || val == 'short_material_qty' || val == 'damage_material_qty') {

				if (event.target.value == '') {

					value = 0;
				} else {
					value = event.target.value;
				}



				if (val == 'unloading_qty') {

					if (value < items.net_wt) {
						charges = value * load_charges;
						if (items.crossing_qty > 0) {
							charges = charges + (items.crossing_qty * cross_charges);
						}

					} else {
						this.toasterService.pop('Warning', 'Warning', 'Please Enter Proper Qty in MT');
					}


					// if(value == 0 && items.crossing_qty > 0) {
					// 	charges = items.crossing_qty * cross_charges;
					// }

				}

				if (val == 'crossing_qty') {
					if (value < items.net_wt) {
						charges = value * cross_charges;
						if (items.unloading_qty > 0) {
							charges = charges + (items.unloading_qty * load_charges);
						}
					} else {
						this.toasterService.pop('Warning', 'Warning', 'Please Enter Proper Qty in MT');
					}
					// if(value == 0 && items.unloading_qty > 0) {
					// 	charges = items.unloading_qty * load_charges;
					// }
				}
			} else if (val == 'cont_received_date' || val == 'container_return_date') {

				value = this.datepipe.transform(event, 'yyyy-MM-dd');
			} else if (val == 'godown_id') {

				value = event.id;
			} else {

				value = event.target.value;
			}

			items[val] = value;
			items['charges'] = charges;



			let r = confirm("Are Yor Sure to update ?");
			if (r == true) {
				this.crudServices.updateData<any>(containerDetails.updateContainer, items).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);

					} else {
						this.toasterService.pop(response.message, response.message, 'something Went Wrong');

					}

				})
			} else {
				if (val == 'cont_received_date' || val == 'container_return_date') {
					event = ''
				} else {
					event.target.value = '';
				}
			}

		}
	}






	onFilter(event, dt) {


		this.filteredValuess = [];

		this.filteredValuess = event.filteredValue;

		this.calculateTotal();


	}


	getDocArray(val) {
		return JSON.parse(val);
	}
	addShortCopy(event: any, id) {
		this.shortDocs = <Array<File>>event.target.files;
		this.uploadDocs(id);

	}

	addEwayCopy(event: any, id) {
		this.ewayDocs = <Array<File>>event.target.files;
		this.uploadDocs(id);

	}

	addEwayCopyTransporter(event: any, id) {
		this.ewayDocsTransport = <Array<File>>event.target.files;
		this.uploadDocs(id);

	}

	uploadDocs(id) {

		let fileData: any = new FormData();
		const document1: Array<File> = this.shortDocs;
		const document2: Array<File> = this.ewayDocs;
		const document3: Array<File> = this.ewayDocsTransport;
		if (document1.length > 0) {
			for (let i = 0; i < document1.length; i++) {
				fileData.append('container_short_damage_doc', document1[i], document1[i]['name']);
			}
		}

		if (document2.length > 0) {
			for (let i = 0; i < document2.length; i++) {
				fileData.append('eway_bill_copy', document2[i], document2[i]['name']);
			}
		}

		if (document3.length > 0) {
			for (let i = 0; i < document3.length; i++) {
				fileData.append('transporter_eway_bill_del_challan_copy', document3[i], document3[i]['name']);
			}
		
		}



		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {


			let fileDealDocs1 = [];
			let fileDealDocs2 = [];
			let fileDealDocs3 = [];
			let filesList1 = [];
			let filesList2 = [];
			let filesList3 = [];
			let data = {};

			if (res.uploads.container_short_damage_doc) {
				filesList1 = res.uploads.container_short_damage_doc;
				for (let i = 0; i < filesList1.length; i++) {
					fileDealDocs1.push(filesList1[i].location);
				}
				data['short_damage_doc'] = JSON.stringify(fileDealDocs1);

			}

			if (res.uploads.eway_bill_copy) {
				filesList2 = res.uploads.eway_bill_copy;
				for (let i = 0; i < filesList2.length; i++) {
					fileDealDocs1.push(filesList2[i].location);
				}
				data['ewaybill_path'] = JSON.stringify(fileDealDocs1);

			}

			if (res.uploads.transporter_eway_bill_del_challan_copy) {
				filesList3 = res.uploads.transporter_eway_bill_del_challan_copy;
				for (let i = 0; i < filesList3.length; i++) {
					fileDealDocs1.push(filesList3[i].location);
				}
				data['transporter_eway_bill_del_challan_copy'] = JSON.stringify(fileDealDocs1);
				data['ewaybill_path'] = JSON.stringify(fileDealDocs1);

			}

			if (data['short_damage_doc'] || data['ewaybill_path'] || data['transporter_eway_bill_del_challan_copy']) {
				data['id'] = id;
			


				this.crudServices.updateData<any>(containerDetails.updateFiles, data).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
						this.getList();

					} else {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong');

					}
				})

			} else {
				this.toasterService.pop('warning', 'warning', 'No File Uloaded');
			}

		});
	}

	changeStatus(event) {

		if (event != null) {
			this.setStatus = event;
		} else {
			this.setStatus = null;
		}

		this.getList();

	}


	getList() {
		this.container_list = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(containerDetails.getContainerList, { start_date: this.fromBeDate, end_date: this.toBeDate, godown_id: this.godown_id, status: this.setStatus, cont_received_from: this.fromRcvDt, cont_received_to: this.toRcvDt }).subscribe(response => {

			this.isLoading = false;
             
			if (response.length) {
				response.map(item => {
					item.net_wt = item.net_wt.toFixed(3)
					return item
				})
				this.container_list = response;
			}

			this.calculateTotal();
		})
	}

	calculateTotal() {

		let arr = [];
		if (this.filteredValuess.length) {
			arr = this.filteredValuess;
		} else {
			arr = this.container_list;
		}

		this.net_wt = arr.reduce((sum, item) => sum + (Number(item.net_wt)), 0);
		this.unloading_qty = arr.reduce((sum, item) => sum + Number(item.unloading_qty), 0);
		this.crossing_qty = arr.reduce((sum, item) => sum + Number(item.crossing_qty), 0);
		this.no_of_pallets = arr.reduce((sum, item) => sum + Number(item.no_of_pallets), 0);
		this.charges = arr.reduce((sum, item) => sum + Number(item.charges), 0);
		this.short_material_qty = arr.reduce((sum, item) => sum + Number(item.short_material_qty), 0);
		this.damage_material_qty = arr.reduce((sum, item) => sum + Number(item.damage_material_qty), 0);
	}

	// data exported for pdf excel download
	exportData() {

		let arr = [];
		const foot = {};


		if (this.filteredValuess.length) {
			arr = this.filteredValuess;
		} else {
			arr = this.container_list;
		}


		//  console.log(this.non_list);
		for (let i = 0; i < arr.length; i++) {
			const export_data = {};
			for (let j = 0; j < this.cols.length; j++) {
				export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

			}
			this.export_list.push(export_data);


		}



		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]['field'] === 'net_wt') {
				foot[this.cols[j]['header']] = this.net_wt;

			}
			else if (this.cols[j]['field'] === 'unloading_qty') {
				foot[this.cols[j]['header']] = this.unloading_qty;

			}
			else if (this.cols[j]['field'] === 'crossing_qty') {
				foot[this.cols[j]['header']] = this.crossing_qty;

			}
			else if (this.cols[j]['field'] === 'charges') {
				foot[this.cols[j]['header']] = this.charges;

			}
			else if (this.cols[j]['field'] === 'short_material_qty') {
				foot[this.cols[j]['header']] = this.short_material_qty;

			}
			else if (this.cols[j]['field'] === 'damage_material_qty') {
				foot[this.cols[j]['header']] = this.damage_material_qty;

			}

			else {
				foot[this.cols[j]['header']] = '';
			}
		}


		this.export_list.push(foot);


	}

	// download doc ,pdf , excel

	exportPdf() {
		this.export_list = [];
		this.exportData();
		this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_list, 'Container-List');
	}

	exportExcel() {
		this.export_list = [];
		this.exportData();

		this.exportService.exportExcel(this.export_list, 'Container-List');
	}

	deleteDoc(arr, doc, name, id) {
		if (confirm("Are You Sure!")) {
			const index = arr.indexOf(doc);
			let data = {};

			if (index > -1) {
				arr.splice(index, 1);
			}
			data[name] = JSON.stringify(arr);
			data['id'] = id;
			this.crudServices.updateData<any>(containerDetails.updateFiles, data).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getList();

				} else {
					this.toasterService.pop(response.message, response.message, 'Something Went Wrong');

				}
			})
		}

	}


}


