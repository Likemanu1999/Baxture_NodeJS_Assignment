import { Component, OnInit, ViewChild } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { DatePipe } from '@angular/common';
import { ExportService } from '../../../shared/export-service/export-service';
import { MouMaster, SubOrg, ProductMaster } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
	selector: 'app-mou-master',
	templateUrl: './mou-master.component.html',
	styleUrls: ['./mou-master.component.css', './mou-master.scss'],
	providers: [CrudServices, ToasterService, DatePipe, ExportService]
})
export class MouMasterComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;

	isLoading: boolean = false;
	cols: any = [];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	manufacturer_arr = [];
	lookup_manufature = {};
	product_arr = [];
	lookup_product = {};
	_selectedColumns: any[];
	data = [];
	tot_mou_quantity = 0;
	total_lifting = 0;
	total_pending = 0;

	filteredValuess: any[];
	export_list = [];
	addMouForm: FormGroup;
	sub_org_arr = [];

	manufacture_id: any;
	product_id: any;
	date: any;
	quantity: any;
	add_update_status = 0;
	mou_id: any;

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to delete?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	constructor(private CrudServices: CrudServices, public datepipe: DatePipe, private toasterService: ToasterService, private exportService: ExportService) {

		this.cols = [
			{ field: "manufacture_name", header: "Manufacture Name" },
			{ field: "product_name", header: "Product Name" },
			{ field: "date", header: "Date" },
			{ field: "quantity", header: "Quantity" },
			{ field: "total_lifting", header: "Total Lifting" },
			{ field: "pending_lifting", header: "Pending Lifting" },
			{ field: "#", header: "Action" },
		];

		this._selectedColumns = this.cols;

		this.addMouForm = new FormGroup({
			'manufacture_id': new FormControl(null, Validators.required),
			'product_id': new FormControl(null, Validators.required),
			'date': new FormControl(null),
			'quantity': new FormControl(null),
			'mou_id': new FormControl(null)
		});

		this.CrudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 116 }).subscribe(response => {

			if (response.length) {
				response.map(item => {
					item.sub_org_name = `${item.sub_org_name} - (${item.org_unit_master.unit_type}) - (${item.location_vilage})`
				})
			}
			this.sub_org_arr = response;
		});

		this.CrudServices.getRequest<any>(ProductMaster.getAll).subscribe(response => {
			if (response.length) {
				this.product_arr = response;
			}
		});

		this.getMou();

	}

	ngOnInit() {
	}

	getMou() {

		this.CrudServices.postRequest<any>(MouMaster.get_all, { id: 1 }).subscribe((response) => {
			for (let item, i = 0; item = response[i++];) {
				item.manufacture_name = item.sub_org_master.sub_org_name;
				item.product_name = item.product_master.name;
				const manufacture_name = item.manufacture_name;
				if (!(manufacture_name in this.lookup_manufature)) {
					this.lookup_manufature[manufacture_name] = 1;
					this.manufacturer_arr.push({ 'manufacture_name': manufacture_name });
				}
				const product_name = item.product_name;
				if (!(product_name in this.lookup_product)) {
					this.lookup_product[product_name] = 1;
					this.product_arr.push({ 'product_name': product_name });
				}
			}
			this.data = response;
			this.calculateTotal();
		});
	}

	getColumnPresent(name) {

		if (this._selectedColumns.find(ob => ob['field'] === name)) {

			return true;

		} else {

			return false;
		}
	}

	onchange(event, name) {
		const arr = [];

		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	calculateTotal() {
		this.tot_mou_quantity = 0;
		this.total_lifting = 0;
		this.total_pending = 0;

		for (const val of this.data) {
			this.tot_mou_quantity = this.tot_mou_quantity + Number(val.quantity);
		}

	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		this.tot_mou_quantity = 0;
		this.total_lifting = 0;
		this.total_pending = 0;
		for (const val of this.filteredValuess) {
			this.tot_mou_quantity = this.tot_mou_quantity + Number(val.quantity);

		}

	}

	exportData() {
		this.export_list = [];
		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.data;
		} else {
			arr = this.filteredValuess;
		}

		for (let i = 0; i < arr.length; i++) {
			const exportList = {};
			for (let j = 0; j < this.cols.length; j++) {
				exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

			}
			this.export_list.push(exportList);
		}

		for (let j = 0; j < this._selectedColumns.length; j++) {

			if (this._selectedColumns[j]['field'] === 'quantity') {
				foot[this._selectedColumns[j]['header']] = this.tot_mou_quantity;
			}

		}
		this.export_list.push(foot);
	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'MOU Master');
	}

	onEdit(item) {
		this.manufacture_id = item['manufacture_id'];
		this.product_id = item['product_id'];
		this.date = item['date'];
		this.quantity = item['quantity'];
		this.mou_id = item['id'];
		this.add_update_status = 1;

		this.myModal.show();
	}

	onDelete(id) {
		this.CrudServices.postRequest<any>(MouMaster.delete, {
			id: id
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.getMou();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}

	duplicate(id) {
		this.CrudServices.postRequest<any>(MouMaster.dupliate_record, {
			id: id
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.getMou();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}

	addNew() {
		this.add_update_status = 0;
		this.myModal.show();
	}

	oncloseModal() {
		this.myModal.hide();
	}

	onSubmit() {
		let mou_id = this.addMouForm.value.mou_id;
		const data = {
			manufacture_id: this.addMouForm.value.manufacture_id,
			product_id: this.addMouForm.value.product_id,
			date: this.addMouForm.value.date,
			quantity: this.addMouForm.value.quantity,

		};



		if (this.add_update_status == 0) { //add
			this.CrudServices.postRequest<any>(MouMaster.add, { data: data }).subscribe((response) => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.data, response.data);
					this.oncloseModal();
					this.getMou();
				} else {
					this.toasterService.pop(response.message, response.data, response.data);
				}
			});
		} else if (this.add_update_status == 1) { //update
			this.CrudServices.postRequest<any>(MouMaster.update, { data: data, id: mou_id }).subscribe((response) => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.data, response.data);
					this.oncloseModal();
					this.getMou();
				} else {
					this.toasterService.pop(response.message, response.data, response.data);
				}
			});
		}

	}

}
