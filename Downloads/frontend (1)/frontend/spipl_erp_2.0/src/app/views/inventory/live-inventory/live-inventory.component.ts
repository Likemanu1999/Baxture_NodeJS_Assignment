import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ViewChildren, ElementRef } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LiveInventory } from "../../../shared/apis-path/apis-path";
import { INVENTORY_TYPE } from "../../../shared/common-service/common-service";
import * as moment from "moment";
@Component({
	selector: 'app-live-inventory',
	templateUrl: './live-inventory.component.html',
	styleUrls: ['./live-inventory.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices]
})

export class LiveInventoryComponent implements OnInit {

	@ViewChild("inventoryModal", { static: false }) public inventoryModal: ModalDirective;

	isLoading: Boolean = false;
	data: any = [];
	cols: any = [];
	statusList: any = [];
	inventoryDetails: any = [];
	inventoryDate: any = null;

	constructor(private crudServices: CrudServices) {
		// 
	}

	ngOnInit() {
		this.cols = [
			{ field: "date", header: "Date", permission: true },
			{ field: "godown", header: "Godown", permission: true },
			{ field: "grade", header: "Grade", permission: true },
			{ field: "opening_stock", header: "Opening Stock", permission: true },
			{ field: "closing_stock", header: "Closing Stock", permission: true },
			{ field: "inward", header: "Inward", permission: true },
			{ field: "outward", header: "Outward", permission: true },
			{ field: "available_qty", header: "Available Quantity", permission: true },
			{ field: "hold_qty", header: "Hold Quantity", permission: true },
			{ field: "inventory_type", header: "Inventory Type", permission: true },
			{ field: "action", header: "Action", permission: true }
		];
		this.loadData();
	}

	loadData() {
		this.isLoading = true;
		this.data = [];
		this.crudServices.getAll<any>(LiveInventory.getAll).subscribe((response) => {
			console.log(response);
			this.isLoading = false;
			if (response.data.length > 0) {
				response.data.forEach(element => {
					let inventory_type = INVENTORY_TYPE.find(o => o.id === element.type);
					let obj = {
						godown_id: element.godown_id,
						godown_name: element.godown.godown_name,
						grade_id: element.grade_id,
						grade_name: element.grade_master.grade_name,
						opening_stock: element.opening_stock,
						closing_stock: element.closing_stock,
						total_inward: element.total_inward,
						total_outward: element.total_outward,
						available_quantity: element.available_quantity,
						hold_quantity: element.hold_quantity,
						unit_type: element.grade_master.unit_mt_drum_master.name,
						date: moment(element.date).format("DD-MMM-YYYY"),
						type: inventory_type.name
					};
					this.data.push(obj);
				});
				// 
			}
		});
	}

	getFilteredData() {
		console.log("Filtered Data");
	}

	refresh() {
		this.loadData();
	}

	onView(item) {
		this.inventoryDate = moment(item.date).format("DD-MMM-YYYY");
		this.inventoryDetails = [];
		this.crudServices.getOne<any>(LiveInventory.getOne, {
			date: item.date
		}).subscribe((response) => {
			response.data.forEach(element => {
				let inventory_type = INVENTORY_TYPE.find(o => o.id === element.type);
				let obj = {
					godown_id: element.godown_id,
					godown_name: element.godown.godown_name,
					grade_id: element.grade_id,
					grade_name: element.grade_master.grade_name,
					inward: element.inward,
					outward: element.outward,
					unit_type: element.grade_master.unit_mt_drum_master.name,
					date: moment(element.date).format("DD-MMM-YYYY"),
					type: inventory_type.name
				};
				this.inventoryDetails.push(obj);
			});
			this.inventoryModal.show();
		});
	}

	exportExcel() {
		console.log("Export Excel");
	}

}
