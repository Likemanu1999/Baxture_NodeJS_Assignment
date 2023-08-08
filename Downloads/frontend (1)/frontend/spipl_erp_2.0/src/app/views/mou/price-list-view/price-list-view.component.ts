import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CountryStateCityMaster, DiscountMaster, PriceList, ProductMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../../login/login.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-price-list-view',
	templateUrl: './price-list-view.component.html',
	styleUrls: ['./price-list-view.component.scss'],
	providers: [CrudServices, ToasterService, DatePipe, ExportService, LoginService]
})
export class PriceListViewComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('myModalEdit', { static: false }) public myModalEdit: ModalDirective;

	data = [];
	cols: any = [];

	manufacturer_arr = [];
	lookup_manufature = {};
	city_master_arr = [];
	lookup_city_master = {};
	_selectedColumns: any[];

	filteredValuess: any[];
	priceListData = [];

	ManufactureName: any;
	ChangeDate: any;
	Location: any;
	freight_rate: any;

	freight_rate_update: any;
	change_date: any;
	city_id: any;
	cash_discount: any;
	other_discount: any;
	bcd: any;
	sws: any;
	manu_org_id: any;

	freighUpdateForm: FormGroup;
	dest_freight_id: any;
	isLoading: boolean = false;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});






	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to delete?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;
	city = [];


	constructor(private CrudServices: CrudServices, public datepipe: DatePipe, private toasterService: ToasterService, private exportService: ExportService, private loginService: LoginService, private router: Router,) {

		this.cols = [
			{ field: "change_date", header: "Date" },
			{ field: "manufacture_name", header: "Manufacture Name" },
			{ field: "city_name", header: "Freight" },
			{ field: "frieght_rate", header: "Freight Rate" },
			{ field: "#", header: "Action" },
		];

		this._selectedColumns = this.cols;

		this.freighUpdateForm = new FormGroup({
			'freight_rate_update': new FormControl(null, Validators.required),
			'dest_freight_id': new FormControl(null, Validators.required),
			'city_id': new FormControl(null, Validators.required),
			'change_date': new FormControl(null, Validators.required),
			'cash_discount': new FormControl(null),
			'other_discount': new FormControl(null),
			'bcd': new FormControl(null),
			'sws': new FormControl(null),
			'manu_org_id': new FormControl(null),
		});

		this.getFreightList();
	}

	ngOnInit() {

		this.CrudServices.getOne<any>(CountryStateCityMaster.getCities, { state_id: 22 }).subscribe((response) => {
			this.city = response.data;
		});

	}

	getFreightList() {
		this.CrudServices.postRequest<any>(PriceList.getFreightList, { id: 1 }).subscribe((response) => {
			for (let item, i = 0; item = response[i++];) {
				item.manufacture_name = item.main_org_master.org_name;

				const manufacture_name = item.manufacture_name;
				if (!(manufacture_name in this.lookup_manufature)) {
					this.lookup_manufature[manufacture_name] = 1;
					this.manufacturer_arr.push({ 'manufacture_name': manufacture_name });
				}
				item.city_name = item.city_master.name;
				const city_name = item.city_master.name;
				if (!(city_name in this.lookup_city_master)) {
					this.lookup_city_master[city_name] = 1;
					this.city_master_arr.push({ 'city_name': city_name });
				}

			}
			this.data = response;
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
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		// this.tot_mou_quantity = 0;
		// this.total_lifting = 0;
		// this.total_pending = 0;
		// for (const val of this.filteredValuess) {
		// 	this.tot_mou_quantity = this.tot_mou_quantity + Number(val.quantity);

		// }

	}

	viewPriceList(org_id, city_id) {
		this.myModal.show();
		this.CrudServices.postRequest<any>(PriceList.getPriceListAgainstFreight, {
			manu_org_id: org_id,
			city_id: city_id
		}).subscribe((response) => {
			this.priceListData = response.price_list;
			this.ManufactureName = this.priceListData[0].main_org_master.org_name;
			this.ChangeDate = this.priceListData[0].change_date;
			this.Location = this.priceListData[0].city_master.name;
			this.freight_rate = response.freight_list[0].frieght_rate;
		})

	}
	oncloseModal() {
		this.myModal.hide();
		this.myModalEdit.hide();
	}

	onEdit(item) {


		this.freight_rate_update = item['frieght_rate'];
		this.change_date = item['change_date'];
		this.city_id = item['city_id'];
		this.manu_org_id = item['manu_org_id'];
		this.dest_freight_id = item['id'];

		this.CrudServices.postRequest<any>(PriceList.getPriceListAgainstFreight, {
			manu_org_id: this.manu_org_id,
			city_id: this.city_id
		}).subscribe((response) => {
			this.cash_discount = response.price_list[0].cash_discount;
			this.other_discount = response.price_list[0].other_discount;
			this.bcd = response.price_list[0].bcd;
			this.sws = response.price_list[0].sws;
		})
		this.myModalEdit.show();
	}

	onSubmit() {
		let frieght_rate = this.freighUpdateForm.value.freight_rate_update;
		let dest_freight_id = this.freighUpdateForm.value.dest_freight_id;
		let change_date = this.freighUpdateForm.value.change_date;
		let city_id = this.freighUpdateForm.value.city_id;
		let cash_discount = this.freighUpdateForm.value.cash_discount;
		let other_discount = this.freighUpdateForm.value.other_discount;
		let bcd = this.freighUpdateForm.value.bcd;
		let sws = this.freighUpdateForm.value.sws;
		let manu_org_id = this.freighUpdateForm.value.manu_org_id;
		this.CrudServices.postRequest<any>(PriceList.copy_freight_price_list,
			{
				frieght_rate: frieght_rate,
				dest_freight_id: dest_freight_id,
				change_date: change_date,
				city_id: city_id,
				cash_discount: cash_discount,
				other_discount: other_discount,
				bcd: bcd,
				sws: sws,
				manu_org_id: manu_org_id
			}
		).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.onResetForm();
				this.oncloseModal();
				this.getFreightList();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}


	onResetForm() {
		this.freighUpdateForm.reset();
	}


	duplicateFreight(id) {
		this.CrudServices.postRequest<any>(PriceList.duplicateFreightRecords, {
			id: id
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.getFreightList();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}


	onDelete(id) {
		this.CrudServices.postRequest<any>(PriceList.deleteFreightRecord, {
			id: id
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.getFreightList();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}


	copyPriceList(freight_id) {
		if (freight_id != null) {
			//this.router.navigateByUrl("mou/edit-copy-price-list", { state : item} );
			// this.router.navigate(["mou/edit-copy-price-list", item.id]);

			this.router.navigate(["mou/edit-copy-price-list", freight_id]);
		}
	}

}


