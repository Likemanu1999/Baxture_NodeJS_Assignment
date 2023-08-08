import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PriceList } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-edit-copy-price-list',
	templateUrl: './edit-copy-price-list.component.html',
	styleUrls: ['./edit-copy-price-list.component.scss'],
	providers: [CrudServices, ToasterService, DatePipe]

})
export class EditCopyPriceListComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;

	freightObj: any;
	isLoading: boolean = false;
	_selectedColumns: any[];
	cols: { field: string; header: string; style: string; }[];
	price_list_details = [];

	manufacturer_arr = [];
	lookup_manufature = {};
	city_master_arr = [];
	lookup_city_master = {};
	lookup_grade_master = {};
	grade_master_arr = [];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	addPriceListForm: FormGroup;
	frieght_rate: any;
	change_date_db: any;
	cash_discount: any;
	other_discount: any;
	bcd: any;
	sws: any;

	freight_id: any;


	constructor(private route: ActivatedRoute,
		private router: Router, private CrudServices: CrudServices, private toasterService: ToasterService, public datepipe: DatePipe) {

		this.route.params.subscribe((params: Params) => {
			this.freight_id = params["freight_id"];

		});


		this.CrudServices.postRequest<any>(PriceList.getOneFreight, {
			id: this.freight_id
		}).subscribe((response) => {

			this.freightObj = response[0];

			this.getPriceList();
		});

		this.addPriceListForm = new FormGroup({
			'change_date_db': new FormControl(null, Validators.required),
			'cash_discount': new FormControl(null, Validators.required),
			'other_discount': new FormControl(null, Validators.required),
			'bcd': new FormControl(null),
			'sws': new FormControl(null),
			'frieght_rate': new FormControl(null),
		});

		this.cols = [
			{ field: 'change_date', header: 'Date', style: '150px' },
			{ field: 'manufacture_name', header: 'Manufacture', style: '150px' },
			{ field: 'city_name', header: 'Location', style: '150px' },
			{ field: 'grade_name', header: 'Grade Name', style: '150px' },
			{ field: 'basic_rate', header: 'Basic Rate', style: '150px' },
			{ field: 'cash_discount', header: 'Cash Discount', style: '150px' },
			{ field: 'other_discount', header: 'Other Discount', style: '150px' },
			{ field: 'bcd', header: 'BCD', style: '150px' },
			{ field: 'sws', header: 'SWS', style: '150px' },
			{ field: 'net_value', header: 'Net Value', style: '150px' }
		];

		this._selectedColumns = this.cols



	}

	ngOnInit() {

	}

	getPriceList() {

		this.CrudServices.postRequest<any>(PriceList.getPriceListAgainstFreight, {
			manu_org_id: this.freightObj.manu_org_id,
			city_id: this.freightObj.city_id,
		}).subscribe((response) => {

			for (let item, i = 0; item = response.price_list[i++];) {
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

				item.grade_name = item.grade_master.grade_name;
				const grade_name = item.grade_master.grade_name;
				if (!(grade_name in this.lookup_grade_master)) {
					this.lookup_grade_master[grade_name] = 1;
					this.grade_master_arr.push({ 'grade_name': grade_name });
				}

			}

			this.price_list_details = response.price_list;

			this.frieght_rate = response.freight_list[0].frieght_rate;

			this.change_date_db = response.price_list[0].change_date;
			this.cash_discount = response.price_list[0].cash_discount;
			this.other_discount = response.price_list[0].other_discount;
			this.bcd = response.price_list[0].bcd;
			this.sws = response.price_list[0].sws;


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

	update(event, id, val, item) {

		if (event.target.value != null) {
			item[val] = event.target.value;

			let post_data = { data: item }
			this.CrudServices.postRequest<any>(PriceList.edit_price_list, item)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.getPriceList();
				});
		}


	}

	onDateSelect($event, name) {
		this.table.filter(this.convert($event), name, 'equals');
	}


	convert(date) {
		if (date != null) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return null;
		}
	}


	onSubmitPriceList() {

		let change_date = this.addPriceListForm.value.change_date_db;
		let cash_discount = this.addPriceListForm.value.cash_discount;
		let other_discount = this.addPriceListForm.value.other_discount;
		let bcd = this.addPriceListForm.value.bcd;
		let sws = this.addPriceListForm.value.sws;
		let frieght_rate = this.addPriceListForm.value.frieght_rate;

		let priceListArray = {
			change_date: change_date,
			cash_discount: parseFloat(cash_discount),
			other_discount: parseFloat(other_discount),
			bcd: bcd,
			sws: sws,
			manu_org_id: parseInt(this.freightObj.manu_org_id),
			city_id: parseInt(this.freightObj.city_id),
			frieght_rate: parseFloat(frieght_rate)
		};

		this.CrudServices.postRequest<any>(PriceList.updateCommanPriceListValue, { data: priceListArray }).subscribe((response) => {
			this.toasterService.pop(response.message, response.data, response.data);
			this.getPriceList();
		});
	}



}
