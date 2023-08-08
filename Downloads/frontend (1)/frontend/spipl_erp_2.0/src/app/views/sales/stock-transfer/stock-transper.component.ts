import {
	Component,
	OnInit,
	ViewEncapsulation,
	ViewChild,
	OnDestroy,
} from "@angular/core";
import { ToasterService, ToasterConfig } from "angular2-toaster";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { from, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import {
	FormGroup,
	FormBuilder,
	FormControl,
	Validators,
	FormArray,
	AbstractControl,
} from "@angular/forms";
import { UserDetails } from "../../login/UserDetails.model";
import { LoginService } from "../../login/login.service";
import { Table } from "primeng/table";
import { ExportService } from "../../../shared/export-service/export-service";
import { DatePipe } from "@angular/common";

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { StockTransfer, FileUpload, GradeMaster, GodownMaster, SubOrg, EmailTemplateMaster, UsersNotification, NotificationsUserRel, Notifications } from "../../../shared/apis-path/apis-path";
import { map, filter } from "rxjs/operators";
import { MinSelectedCheckboxes, MustNotMatch } from "../validations";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { element } from "protractor";
import { fromArray } from "rxjs/internal/observable/fromArray";
import * as moment from "moment";
import { MessagingService } from "../../../service/messaging.service";
import { staticValues } from "../../../shared/common-service/common-service";
@Component({
	selector: "app-stock-transper",
	templateUrl: "./stock-transper.component.html",
	styleUrls: ["./stock-transfer.component.scss"],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ExportService,
		DatePipe,
		ToasterService,
		PermissionService,
		LoginService,
		CrudServices,
		MessagingService
	],
})
export class StockTransferComponent implements OnInit {
	isLoading = false; //Loader Flag
	fileData: FormData = new FormData();
	allStockList: any; // for export data in pdf or csv
	billingForm: FormGroup; //Billing Modal Form
	editStockTransferForm: FormGroup; // Edit Stock Transfer Modal form
	emailForm: FormGroup;
	recievedForm: FormGroup;
	debitCreditForm: FormGroup;
	stockReturnForm: FormGroup;
	isRange: any;

	//*config for Edit Stock Transfer  Modals
	@ViewChild("myModalEditStock", { static: false })
	public myModalEditStock: ModalDirective;

	//*config For Show Stock Transfer modals
	@ViewChild("myModalDetails", { static: false })
	public myModalDetails: ModalDirective;

	//*config For Edit Billing  Stock Transfer modals
	@ViewChild("myModalBilling", { static: false })
	public myModalBilling: ModalDirective;

	//*config For Send Email  Stock Transfer modals
	@ViewChild("myModalEmail", { static: false })
	public myModalEmail: ModalDirective;

	@ViewChild("myModalRecieved", { static: false })
	public myModalRecieved: ModalDirective;


	@ViewChild("myModalStockReturn", { static: false })
	public myModalStockReturn: ModalDirective;

	@ViewChild("myModalDebitCredit", { static: false })
	public myModalDebitCredit: ModalDirective;

	@ViewChild("dt", { static: false }) table: Table; // Table instance DOM prime table

	user: UserDetails; //User Details
	links: string[] = []; // User Permited Links Detail
	bsRangeValue: any; //DatePicker range Value
	subscription: Subscription;
	//Toast Configration
	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	stockTransferList$: any = []; //All Stock List
	selectedstockTransferList: any = [];
	cols: any[]; //TABLE  coloms
	exportColumns: any[]; //Export colom for export
	maxDate: Date = new Date(); // date range will not greater  than today

	selectedGrade: any = [];
	selectedToGodown: any = [];
	selectedFromGodown: any = [];

	selectedStockReturn: any;

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to delete?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "right";
	public closeOnOutsideClick: boolean = true;

	exportColumns_list: any = [];
	gradeList: any = [];
	godownList: any = [];

	emailArray: any = []; // no of emails respective godown person it will be one or multiple
	selectedEmails: any = []; //selecte list of mail wich useer selected from checkbox
	emailTempleteDetails: any; //selected email templet  in this case stock transfer templets
	emailFooterTemplete: any; // common footer template
	emailBodyTemplete: any; //body html custome

	eWayBillFiles: Array<File> = [];
	billCopyFiles: Array<File> = [];
	private socket$: WebSocketSubject<any>;
	total_qty: number = 0;
	total_short_qty: number = 0;
	total_damage_qty: number = 0;

	filteredValues: any;
	transporterList: any[];
	loadingCharges: number;
	companyList: any = staticValues.companies;

	loadingQty: number; //Number of loading  quantity out of total quantity
	crossingQty: number; //Number of crossing   quantity out of total quantity
	loadCrossList: any = [
		{ name: "Loading", id: 1 },
		{ name: "Crossing", id: 2 },
		{ name: "Both", id: 3 },
	];

	shortDamageFilter: any = [
		{ name: "All", id: 0 },
		{ name: "Short/Damage", id: 1 }
	];
	crossingCharges: any;
	emailFrom: any;
	emailSubject: string;

	//LINKS
	add_stock_link: boolean = false;
	edit_stock_link: boolean = false;
	delete_stock_link: boolean = false;
	view_stock_link: boolean = false;
	view_billing_stock_link: boolean = false;
	pdf_stock_link: boolean = false;
	short_stock_link: boolean = false;
	credit_debit__stock_link: boolean = false;
	send_email_stock_link: boolean = false;
	csv_stock_link: boolean = false;
	stock_return_link: boolean = true;
	inward_outward_list = [];
	InwardOutwardStatus: any = { id: 3, name: "All" };
	ShortDamageStatus: any = { name: "All", id: 0 };
	notification_details: any;
	notification_tokens = [];//?FCM TIKENS ARRAY
	notification_id_users = []//?STAFF IDS 
	notification_users = [];//?USERS NOTIFICATION ARRAY TO STORE INSIDE DATABASE
	message: any;
	role_id: any;
	company_id: any;
	selected_date_range: any = [
		new Date(moment().subtract(6, 'months').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];

	import_local_flag: any = [{ name: "All", id: 0 }, { name: "Import", id: 1 }, { name: "Local", id: 2 }];
	selectedImportLocalFlag = { name: "All", id: 0 }

	constructor(
		private fb: FormBuilder,
		public datePipe: DatePipe,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private exportService: ExportService,
		private formBuilder: FormBuilder,
		public crudServices: CrudServices,
		private messagingService: MessagingService
	) {
		let date = new Date();
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		this.setFinanceYear()
		this.add_stock_link = (this.links.indexOf('add_stock_link') > -1);
		this.edit_stock_link = (this.links.indexOf('edit_stock_link') > -1);
		this.delete_stock_link = (this.links.indexOf('delete_stock_link') > -1);
		this.view_stock_link = (this.links.indexOf('view_stock_link') > -1);
		this.pdf_stock_link = (this.links.indexOf('pdf_stock_link') > -1);
		this.csv_stock_link = (this.links.indexOf('csv_stock_link') > -1);
		this.short_stock_link = (this.links.indexOf('short_stock_link') > -1);
		this.credit_debit__stock_link = (this.links.indexOf('credit_debit__stock_link') > -1);
		this.send_email_stock_link = (this.links.indexOf('send_email_stock_link') > -1);
		this.view_billing_stock_link = (this.links.indexOf('view_billing_stock_link') > -1);
		this.inward_outward_list = [{ id: 3, name: "All" }, { id: 1, name: "Inward" }, { id: 2, name: "Outward" }];
	}

	setFinanceYear() {
		let date = new Date();
		let nextyr
		let currentYear
		if (new Date().getMonth() >= 3) {
			nextyr = new Date(date.getFullYear() + 1, 2, 31);
			currentYear = new Date(date.getFullYear(), 3, 1)
		} else {
			nextyr = new Date(date.getFullYear(), 2, 31);
			currentYear = new Date(date.getFullYear() - 1, 3, 1)
		}
		// this.bsRangeValue = [
		//   new Date(date.getFullYear(), date.getMonth(), 1),
		//   new Date(),
		// ];
		this.bsRangeValue = [
			new Date(currentYear),
			new Date(nextyr),
		];
	}

	ngOnInit() {
		this.generateHeader();
		this.initForms();
		this.getGrade();
		this.getGodown();
		this.getTransporter();
		this.getAllStockTransferDetails();
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	//?Generate Header And Field  For Table And Export Data
	generateHeader() {
		this.cols = [
			// { field: "id", header: "Id", permission: true ,width:'100px'},
			{ field: "status", header: "Status", permission: true, width: '200px' },
			{ field: "fromGodown", header: "From Godown", permission: true, width: '200px' },
			{ field: "toGodown", header: "To Godown", permission: true, width: '200px' },
			{ field: "grade_master", header: "Grade", permission: true, width: '200px' },
			{ field: "quantity", header: "Quantity", permission: true, width: '200px' },
			{ field: "outward_date", header: "Transfer date", permission: true, width: '200px' },
			{ field: "inward_date", header: "Received date", permission: true, width: '200px' },
			{ field: "short_quantity", header: "Short Qty", permission: true, width: '200px' },
			{ field: "short_remark", header: "Short Remark", permission: true, width: '200px' },
			{ field: "damage_quantity", header: "Damage Qty", permission: true, width: '200px' },
			{ field: "damage_remark", header: "Damage Remark", permission: true, width: '200px' },
			{ field: "remark", header: "Remark", permission: true, width: '200px' },
			{ field: "import_local_flag_cat", header: "category", permission: true, width: '200px' },
			{ field: "company", header: "Company", permission: true, width: '200px' },
		];
	}


	ewayBillFileUploadEvent(event: any) {
		let files = <Array<File>>event.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append('eway_bill_copy', files[i], files[i]['name']);
		}
	}

	billCopyFileUploadEvent(event: any) {
		if (event.target.files) {
			let files = <Array<File>>event.target.files;
			for (let i = 0; i < files.length; i++) {
				this.fileData.append('bill_copy', files[i], files[i]['name']);
			}
		}
	}

	changeImportLocal(event) {

	}

	filterdData(event) {
		if (event.id == 1) {
			this.total_qty = 0;
			this.total_short_qty = 0;
			this.total_damage_qty = 0;
			this.stockTransferList$ = this.stockTransferList$
				.pipe(map((results: any) => {
					return results.filter((r) => {
						if (r.short_quantity > 0 || r.damage_quantity > 0) {
							this.calculateFooterValues(r);
							return r;
						}
					});

				}));
		}
		else {
			this.getAllStockTransferDetails()
		}
	}

	// ?List Of All  Transfer Details
	getAllStockTransferDetails() {
		this.isLoading = true;
		this.total_qty = 0;
		this.total_short_qty = 0;
		this.total_damage_qty = 0;
		if (this.bsRangeValue) {
			this.isLoading = true;
			const parambody = {
				to_date: this.convert(this.bsRangeValue[0]),
				from_date: this.convert(this.bsRangeValue[1]),
				// inward_outward_status: this.InwardOutwardStatus.id,
				company_id: null,//(this.role_id == 1) ? null : this.company_id,
				import_local_flag: this.selectedImportLocalFlag.id,
				short_damage: this.ShortDamageStatus.id
			};
			this.stockTransferList$ = this.crudServices
				.getOne<any>(StockTransfer.getAll, parambody)
				.pipe(
					map((value) => {
						if (value.data) {
							let emailArr = []
							value.data.forEach((element) => {
								emailArr = []
								element.fromGodown = element.fromGodown.godown_name;
								//element.company_id = element.grade_master.company_id;
								element.grade_master = element.grade_master.grade_name;
								element.to_email = element.toGodown.godown_email ? element.toGodown.godown_email : null;
								element.toGodown = element.toGodown.godown_name;
								element.import_local_flag_cat = (element.import_local_flag == 1) ? 'Import' : 'LOCAL';
								element.sub_org_name = element.sub_org_master.sub_org_name;
								if (element.company_id) {
									let company = this.companyList.filter(item => item.id == element.company_id)
									element.company = company[0].name
								}
								if (element.bill_copy) {
									element.bill_copy = JSON.parse(element.bill_copy);
								}
								if (element.eway_bill_copy) {
									element.eway_bill_copy = JSON.parse(element.eway_bill_copy);
								}

								if (element.sub_org_master.org_contact_people) {
									element.sub_org_master.org_contact_people.forEach(contact_person => {
										if (contact_person.org_contact_emails) {
											contact_person.org_contact_emails.forEach((emails => {
												if (emails.email_id) {
													emailArr.push(emails.email_id);
												}

											}))
										}
									});
								}


								element.transporter_email = emailArr ? emailArr : null;
								this.calculateFooterValues(element);
							});
							this.allStockList = value.data;

						}
						return value.data;
					}),

				);
			this.isLoading = false;
		}
	}



	calculateFooterValues(values: any) {



		if (values.short_quantity) {
			this.total_short_qty = this.total_short_qty + Number(values.short_quantity);
		}
		if (values.damage_quantity) {
			this.total_damage_qty = this.total_damage_qty + Number(values.damage_quantity);
		}
		if (values.quantity) {
			this.total_qty = this.total_qty + Number(values.quantity);
		}
	}

	//*Check Form control Validations
	get f() {
		return this.editStockTransferForm.controls;
	}

	/**
	 *  ?Here We Crate And Validate All Form : Edit Stock Transfer Form , Email User Form  Or Update Billing Detail Form
	 */
	initForms() {
		//@editStockTransferForm Here
		this.editStockTransferForm = this.formBuilder.group({
			from_godown: new FormControl(null, Validators.required),
			to_godown: new FormControl(null, Validators.required),
			grade: new FormControl(null, Validators.required),
			quantity: new FormControl(null, [Validators.required]),
			transfer_date: new FormControl(null, Validators.required),
			transporter: new FormControl(null, Validators.required),
			lr_number: new FormControl(null),
			lr_date: new FormControl(null),
			eway_bill_flag: new FormControl(null, Validators.required),
			remark: new FormControl(null),
			load_cross: new FormControl(null, Validators.required),
			loading_qty: new FormControl(),
			crossing_qty: new FormControl(),
			loading_charges: new FormControl(),
			crossing_charges: new FormControl(),
			freight_rate: new FormControl(),
			total_freight_amount: new FormControl(),
			total_load_cross_amount: new FormControl(),
			total_amount_of_freight_load_cross: new FormControl(),
			truck_number: new FormControl(null, Validators.required),
			import_local_flag: new FormControl(null, Validators.required),
			dispatch_from: new FormControl(),
			bill_from: new FormControl(),
			ship_to: new FormControl(),
			bill_to: new FormControl(),
			company_id: new FormControl(null, Validators.required),
		}
			,
			{
				validator: MustNotMatch("from_godown", "to_godown"), //here is custom validation to check source or destination of  godown must diffrent
			}
		);


		this.recievedForm = this.fb.group({
			received_date: new FormControl(null, Validators.required),
			short_remark: new FormControl(null),
			damage_quantity: new FormControl(null),
			damage_remark: new FormControl(null),
			short_quantity: new FormControl(null),
			purchase_check: new FormControl(null),
			company_id: new FormControl(null),
		})
		//@billing Form Here
		this.billingForm = this.formBuilder.group({
			invoice_num: new FormControl(null, Validators.required),
			billing_rate: new FormControl(null, Validators.required),
			invoice_date: new FormControl(null, Validators.required),
			billing_remark: new FormControl(null),
			eway_bill_flag: new FormControl(null),
			eway_bill_copy: new FormControl(null),
			bill_copy: new FormControl(null),
		});

		//@Send Email Form Here
		this.emailForm = this.fb.group({
			toEmail: new FormArray([]),
			emailMult: new FormControl(null),
		});

		this.debitCreditForm = this.fb.group({
			debit_note: new FormControl(null),
			credit_note: new FormControl(null),
		});


		this.stockReturnForm = this.fb.group({
			stock_return_date: new FormControl(null, Validators.required),
			stock_return_quantity: new FormControl(null, Validators.required),
			return_remark: new FormControl(null, Validators.required),
			company_id: new FormControl(null),
		});



	}

	/**
	 *
	 * @param data Here Showing Details Of Specific Enrty Of Stock Transfer
	 */
	viewDetails(data) {
		this.selectedstockTransferList = [];
		this.selectedstockTransferList = data;
		this.myModalDetails.config.class = "modal-lg";
		this.myModalDetails.show();
	}

	/**
	 * ?Here Is Open Modal and Patch  To edit Form Here  we Edit Basic Detaiols  Or Complete Stock Transfer Details
	 * @param data//! Selected Data Of Specific Stock Entry
	 */
	openEditModal(data) {
		this.selectedstockTransferList = []
		this.selectedstockTransferList = data;
		this.selectedFromGodown = this.godownList.filter((res) => { return res.id === this.selectedstockTransferList.from_godown });
		this.selectedToGodown = this.godownList.filter((res) => { return res.id === this.selectedstockTransferList.to_godown });

		this.selectedGrade = {
			grade_name: data.grade_master,
			grade_id: data.grade_id,
		};
		console.log(this.selectedstockTransferList);

		this.editStockTransferForm.patchValue({
			from_godown: this.selectedFromGodown[0],
			to_godown: this.selectedToGodown[0],
			grade: this.selectedGrade,
			quantity: Number(this.selectedstockTransferList["quantity"]) * 1000,
			transfer_date: this.selectedstockTransferList["outward_date"],
			lr_number: this.selectedstockTransferList["lr_no"],
			lr_date: this.selectedstockTransferList["lr_date"],
			eway_bill_flag: this.selectedstockTransferList["eway_bill_flag"] ? 1 : 0,
			remark: this.selectedstockTransferList["remark"],
			transporter: this.selectedstockTransferList["transport_id"],
			load_cross: this.selectedstockTransferList["load_cross_status"],
			freight_rate: this.selectedstockTransferList["frt_rate"],
			truck_number: this.selectedstockTransferList["truc_no"],
			import_local_flag: this.selectedstockTransferList["import_local_flag"],
			dispatch_from: this.selectedstockTransferList["dispatch_from"],
			bill_from: this.selectedstockTransferList["bill_from"],
			ship_to: this.selectedstockTransferList["ship_to"],
			bill_to: this.selectedstockTransferList["bill_to"],
			company_id: this.selectedstockTransferList["company_id"],
		});
		this.onFreightrateChange(Number(this.selectedstockTransferList["frt_rate"]))
		this.onFormGodownPatch(this.selectedFromGodown[0], this.selectedstockTransferList)
		this.myModalEditStock.show();
	}

	/**
	 *!Here We Update Stock Entry
	 */
	onUpdateStockTransfer() {
		this.isLoading = true;
		if (this.editStockTransferForm.valid) {
			let FormData = {

				remark: this.editStockTransferForm.value.remark ? this.editStockTransferForm.value.remark : null,
				modified_by: this.user.userDet[0].id,
				modified_date: new Date(),
				lr_no: this.editStockTransferForm.value.lr_number,
				lr_date: this.editStockTransferForm.value.lr_date ? this.convert(this.editStockTransferForm.value.lr_date) : null,
				eway_bill_flag: this.editStockTransferForm.value.eway_bill_flag ? 1 : 0,
				transport_id: this.editStockTransferForm.value.transporter,
				load_cross_status: this.editStockTransferForm.value.load_cross,
				load_qty: this.editStockTransferForm.value.loading_qty ? this.editStockTransferForm.value.loading_qty / 1000 : 0,
				load_charges: this.editStockTransferForm.value.loading_charges ? this.editStockTransferForm.value.loading_charges : 0,
				cross_qty: this.editStockTransferForm.value.crossing_qty ? this.editStockTransferForm.value.crossing_qty / 1000 : 0,
				cross_charges: this.editStockTransferForm.value.crossing_charges ? this.editStockTransferForm.value.crossing_charges : 0,
				load_cross_charges: this.editStockTransferForm.value.total_load_cross_amount,
				frt_rate: this.editStockTransferForm.value.freight_rate ? this.editStockTransferForm.value.freight_rate : 0,
				tot_frt: this.editStockTransferForm.value.total_freight_amount ? this.editStockTransferForm.value.total_freight_amount : 0,
				tot_frt_ld_cs: this.editStockTransferForm.value.total_amount_of_freight_load_cross,
				truc_no: this.editStockTransferForm.value.truck_number,
				from_godown: this.editStockTransferForm.value.from_godown.id,
				to_godown: this.editStockTransferForm.value.to_godown.id,
				grade_id: this.editStockTransferForm.value.grade.grade_id,
				outward_date: this.convert(this.editStockTransferForm.value.transfer_date),
				quantity: Number(this.editStockTransferForm.value.quantity) / 1000,
				import_local_flag: Number(this.editStockTransferForm.value.import_local_flag),
				dispatch_from: this.editStockTransferForm.value.dispatch_from,
				bill_from: this.editStockTransferForm.value.bill_from,
				ship_to: this.editStockTransferForm.value.ship_to,
				bill_to: this.editStockTransferForm.value.bill_to,
				company_id: this.editStockTransferForm.value.company_id,
			};
			this.crudServices
				.putRequest<any>(`${StockTransfer.update}/${this.selectedstockTransferList.id}`, FormData)
				.subscribe(
					(response) => {
						this.toasterService.pop(
							response.message,
							response.message,
							response.data
						);
						this.myModalEditStock.hide();
						this.isLoading = false;
					},
					(error) => { }
				);
		}
	}

	/**
	 * Here  We Delete Stock Entry (Soft Delete )
	 * @param id unique Id Of Stock Transfer
	 * ?Here We Soft delete Stock transfer Details deleted=0  with respective data we use same api for update and delete
	 */

	deleteDetails(id: number) {
		this.isLoading = true;
		const parameters = {
			modified_by: this.user.userDet[0].id,
			modified_date: new Date(),
			deleted: 1,
		};

		let body = { data: parameters, id: id };
		this.crudServices.updateData(StockTransfer.deleteStock, body).subscribe((response: any) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.isLoading = false;
		});


		// this.crudServices
		// 	.putRequest<any>(`${StockTransfer.update}/${id}`, parameters)
		// 	.subscribe(
		// 		(response) => {
		// 			this.toasterService.pop(
		// 				response.message,
		// 				response.message,
		// 				response.data
		// 			);
		// 			this.isLoading = false;
		// 		},
		// 		(error) => { }
		// 	);
	}

	/**
	 * *Navigate TO add Stock Transfer Component
	 */
	onAdd() {
		this.router.navigate(["sales/add-stock-transfer"]);
	}

	/**
	 * Calculate Total Loading Amount
	 */
	calTotalLoadingAmt(qty, charges) {
		return (qty * charges);
	}

	//*EXPORT AS PDF
	exportPdf() {
		let cols = this.cols.filter(
			(col) =>
				col.header != "Status" &&
				col.field != "status" &&
				col.header != "Edit" &&
				col.field != "edit" &&

				col.header != "Delete" &&
				col.field != "delete" &&
				col.header != "Details" &&
				col.field != "details"
		);
		this.exportColumns = cols.map((col) => {
			return { title: col.header, dataKey: col.field };
		});
		this.exportService.exportPdf(
			this.exportColumns,
			this.allStockList,
			`stock_transfer_${new Date()}`
		);
	}
	//*EXPORT FILE
	exportExcel() {
		this.exportDataStockTransfer();
		this.exportService.exportExcel(
			this.exportColumns_list,
			`transfer_stock${new Date()}`
		);
	}

	/**
	 **here we have use Date Pipe for convert Date
	 * @param str
	 * *Convert Date In Formate DD-MM-YYYY
	 */

	convert(date) {
		if (date) {
			return this.datePipe.transform(date, "yyyy-MM-dd");
		} else {
			return "";
		}
	}

	// *data exported for pdf excel download
	exportDataStockTransfer() {
		let arr = [];
		const foot = {};
		if (this.allStockList) {
			arr = this.allStockList;
			//  this.stockTransferList$.subscribe((response=>{arr =response}));
		}
		for (let i = 0; i < arr.length; i++) {
			const export_stock = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (
					this.cols[j]["field"] != "delete" &&
					this.cols[j]["field"] !== "edit" &&
					this.cols[j]["field"] !== "details" &&

					this.cols[j]["field"] !== "status"
				) {
					export_stock[this.cols[j]["header"]] = arr[i][this.cols[j]["field"]];
				}
			}
			this.exportColumns_list.push(export_stock);
		}

		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] === "quantity") {
				foot[this.cols[j]["header"]] = `Total:${this.total_qty}`;
			}
			else {
				foot[this.cols[j]["header"]] = "";
			}
		}
		this.exportColumns_list.push(foot)
	}



	onFilter(event, dt) {
		this.total_qty = 0;
		this.total_short_qty = 0;
		this.total_damage_qty = 0;
		this.filteredValues = [];
		this.filteredValues = event.filteredValue;
		for (let i = 0; i < this.filteredValues.length; i++) {
			if (this.filteredValues[i]["quantity"]) {
				this.total_qty = this.total_qty + Number(this.filteredValues[i]["quantity"]);
			}
			if (this.filteredValues[i]["short_quantity"]) {
				this.total_short_qty = this.total_short_qty + Number(this.filteredValues[i]["short_quantity"]);
			}
			if (this.filteredValues[i]["damage_quantity"]) {
				this.total_damage_qty = this.total_damage_qty + Number(this.filteredValues[i]["damage_quantity"]);
			}
		}
	}



	/**
	 * ! Open Billing Modal And  patchValue To  form controls
	 * @data Selected Stock Transfer Entery
	 *?Here We just Open Modal and Set Value To form control
	 */
	openBillingsModal(data) {
		this.selectedstockTransferList = data;
		this.getNotifications('STOCK TRANSFER_BILL');
		if (this.selectedstockTransferList) {
			this.billingForm.patchValue({
				invoice_num: data.invoice_num,
				invoice_date: data.invoice_date ? data.invoice_date : null,
				billing_remark: data.billing_remark,
				eway_bill_flag: data.eway_bill_flag,
				billing_rate: (Number(data.rate) > 0) ? Number(data.rate) : Number(data.billing_rate)
			});
		}
		this.myModalBilling.show();
	}

	/**
	 * !On Billing Form Submit Save Result Into DB
	 * ?if Billing Form Valid Then submit Data and hide the modal dialog
	 */
	onUpdateBillingDetails() {
		this.isLoading = true;
		if (this.billingForm.valid) {
			let FormData = {
				invoice_num: this.billingForm.value.invoice_num
					? this.billingForm.value.invoice_num
					: null,
				invoice_date: this.billingForm.value.invoice_date
					? this.convert(this.billingForm.value.invoice_date)
					: null,
				billing_remark: this.billingForm.value.billing_remark
					? this.billingForm.value.billing_remark
					: null,
				modified_by: this.user.userDet[0].id,
				modified_date: new Date(),
				billing_flag: this.billingForm.value.billing_flag ? 1 : 0,
				billing_done_by: this.user.userDet[0].id,
				billing_done_on: new Date(),
				rate: Number(this.billingForm.value.billing_rate),
				eway_bill_flag: this.billingForm.value.eway_bill_flag ? 1 : 0,
				status: 2
			};
			if (this.fileData.get("eway_bill_copy") != null || this.fileData.get("bill_copy") != null) {

				this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
					let filesBills = [];
					let filesEway = [];

					let bill_copy_res = res.uploads.bill_copy;
					let eway_bill_copy_res = res.uploads.eway_bill_copy;

					if (bill_copy_res != null) {
						if (bill_copy_res.length > 0) {
							for (let i = 0; i < bill_copy_res.length; i++) {
								filesBills.push(bill_copy_res[i].location);
							}
						}
						FormData['bill_copy'] = JSON.stringify(filesBills);
					}

					if (eway_bill_copy_res != null) {
						if (eway_bill_copy_res.length > 0) {
							for (let i = 0; i < eway_bill_copy_res.length; i++) {
								filesEway.push(eway_bill_copy_res[i].location);
							}
						}
						FormData['eway_bill_copy'] = JSON.stringify(filesEway);
					}
					this.updateBill(FormData);
				});
			} else {
				this.updateBill(FormData);
			}
		}
	}

	updateBill(formData) {
		if (formData) {
			let body = { data: formData, id: this.selectedstockTransferList.id };
			this.crudServices.updateData(StockTransfer.invoiceAdd, body).subscribe((response: any) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (this.notification_details != null && this.notification_details != undefined) {
					let notification = {
						"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details ? this.notification_details.title : ''}`,
						"body": `Stock transfer invoice attached  for  ${this.selectedstockTransferList.grade_master} 0f  ${this.selectedstockTransferList.quantity} MT from ${this.selectedstockTransferList.fromGodown}  to  ${this.selectedstockTransferList.toGodown}  transfer date ${this.selectedstockTransferList.outward_date}`,
						"click_action": "https://erp.sparmarglobal.com:8085/#/sales/stock-transfer"
					}
					this.sendNotification(notification)
				}
				this.myModalBilling.hide();
				this.billingForm.reset();
				this.isLoading = false;
				this.isLoading = false;
			})
		}
	}

	//*email Form Checkbox control dynamically  add new checkbox
	get emailFormArray() {
		return this.emailForm.controls.toEmail as FormArray;
	}

	/* *here we pop up email Modal
	 * @param data is selected stock transfer datails
	 */




	removeAddressAt() {
		this.emailFormArray.controls.pop()
	}

	viewEmailModal(data: any) {
		this.selectedstockTransferList = [];
		this.selectedEmails = []
		this.emailArray.forEach(() => this.removeAddressAt())
		if (data) {

			this.emailArray = []
			this.selectedstockTransferList = data;
			if (this.selectedstockTransferList.transporter_email) {
				this.emailArray = this.selectedstockTransferList.transporter_email;
				this.emailArray.forEach(() => this.emailFormArray.push(new FormControl(false)));
			}
			this.generateEmailTemplete(data);
			this.myModalEmail.show();
		}
	}








	/**
	 * *Genrate Email HTML  Templete   With Body Or Footer With dynamic Contain
	 * @param data :-Selected Stock Tranfer Record
	 */
	generateEmailTemplete(data: any) {

		this.emailSubject = '';
		this.emailFooterTemplete = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Stock Billing' }).subscribe(body_temp => {
			if (body_temp) {
				this.emailBodyTemplete = body_temp[0].custom_html;
				this.emailSubject = body_temp[0].subject;
				this.emailFrom = body_temp[0].from_name;
			}
		})
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(footer_temp => {
			if (footer_temp.code == 100) {
				this.emailFooterTemplete = footer_temp[0].custom_html;
			}

		})




		// this.crudServices
		//   .getAll<any>(StockTransfer.emailTempletes)
		//   .subscribe((res) => {
		//     res.map((templete) => {

		//       if (templete.id == 2) {
		//         this.emailFooterTemplete = templete.custom_html;
		//       }
		//       if (templete.id == 8) {

		//         this.emailTempleteDetails = templete;
		//         this.emailBodyTemplete = templete.custom_html.replace(
		//           "{INVOICE_NO}",
		//           data.invoice_num
		//         );
		//       }
		//     });
		//   });
	}

	//*on Check Box  checked / unchecked  Add Or Remove Email from  To email List
	onCheckboxChange(e) {
		if (e.target.checked) {
			this.selectedEmails.push(e.target.value);
		} else {
			this.selectedEmails = this.selectedEmails.filter((email) => {
				if (email === e.target.value) {
					return email !== e.target.value;
				} else {
					return email;
				}
			});
		}
	}

	/**
	 * *After Sumbite Form  Send Email To Listed User  here We Attached Invoice Attachment Also
	 */
	onSendEmail() {
		const attachment = [];
		if (this.selectedstockTransferList['bill_copy']) {
			const files = this.selectedstockTransferList['bill_copy'];
			for (let j = 0; j < files.length; j++) {
				const test = files[j].split('/');
				attachment.push({ 'filename': `${test[3]}${j}.${this.getFileExtension(files[j])}`, 'path': files[j] });
			}
		}


		let emailBody = {
			from: this.emailFrom,
			to: this.emailForm.value.emailMult,
			subject: this.emailSubject,
			html: this.emailBodyTemplete + this.emailFooterTemplete,
			attachments: attachment
		};




		let body = {
			mail_object: emailBody,
			stock_id: this.selectedstockTransferList.id,
		};
		this.crudServices
			.postRequest<any>(StockTransfer.sendEmail, body)
			.subscribe((response) => {
				this.myModalEmail.hide();
				this.toasterService.pop(
					response.message,
					response.message,
					response.data
				);
				this.selectedstockTransferList = [];

			});
	}


	getFileExtension(filename) {
		const extension = filename.split('.').pop();
		return extension;
	}


	//?Get All Grade List From Master
	getGrade() {
		this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((grade) => {
			this.gradeList = grade;

		});
	}


	//?Get All Godown List From Master
	getGodown() {
		this.crudServices
			.getAll<any>(GodownMaster.getAll)
			.subscribe((godown) => {
				this.godownList = godown;
			});
	}

	//?Get All Transporter List From Master
	getTransporter() {
		let trans = []
		this.crudServices
			.getAll<any>(SubOrg.getTransporter)
			.subscribe((transporter) => {
				if (transporter) {
					transporter.map(data => { trans.push(data.sub_org_master) });
				}
				this.transporterList = trans;
			});
		this.loadingCharges = 0;
	}

	//?Aply Loading And Crossing charges on select of from godown
	onFormGodownSelect(event) {
		// const selectedFromGodown = this.godownList.filter((data) => data.id === this.addStockTransferForm.value.from_godown);
		this.loadingCharges = event.load_charges;
		this.crossingCharges = event.cross_charges;
		if (this.editStockTransferForm.value.load_cross) {
			this.onSelectLoading({ id: this.editStockTransferForm.value.load_cross })
		}
	}

	//Freightrate calculation on enter
	onFreightrateChange(Freightrate) {
		let totalFreightAmount =
			(this.editStockTransferForm.controls.quantity.value * Freightrate) / 1000;
		this.editStockTransferForm.patchValue({
			total_freight_amount: totalFreightAmount,
			total_amount_of_freight_load_cross:
				totalFreightAmount +
				this.editStockTransferForm.controls.total_load_cross_amount.value,
		});
	}

	//?ON ENTER LOADING QUANTITY
	onLoadingQtyChange(LoadingQty) {
		let loadingValue = ((LoadingQty / 1000) * Number(this.editStockTransferForm.controls.loading_charges.value));
		let cossingvalue = ((this.editStockTransferForm.controls.crossing_qty.value / 1000) * Number(this.editStockTransferForm.controls.crossing_charges.value));
		let total = loadingValue + cossingvalue;
		this.editStockTransferForm.patchValue({
			total_load_cross_amount: total,
			total_amount_of_freight_load_cross:
				total + this.editStockTransferForm.controls.total_freight_amount.value,
		});
	}


	//?On Crossing ENTER CROSSING QUANTITY
	onCrossQtyChange(crossingQty) {
		let cossingvalue = ((crossingQty / 1000) * Number(this.editStockTransferForm.controls.crossing_charges.value));
		let loadingValue =
			((Number(this.editStockTransferForm.controls.loading_qty.value) / 1000) * Number(this.editStockTransferForm.controls.loading_charges.value));
		let total = loadingValue + cossingvalue;
		this.editStockTransferForm.patchValue({
			total_load_cross_amount: total,
			total_amount_of_freight_load_cross:
				total + Number(this.editStockTransferForm.controls.total_freight_amount.value),
		});
	}

	onSelectLoading(event) {


		//!when we select Loading Then we take Default quantity and loading charges we
		// !have and also desable/radonly condition true , also we set 0 value to crossing
		/**
		 * ?id=1 is loading Option
		 * ?id=2crossing
		 * ?id=3 loading + crossing
		 *
		 */
		if (event.id == "1") {
			this.editStockTransferForm.patchValue({
				loading_qty: Number(this.editStockTransferForm.controls.quantity.value),
				loading_charges: this.loadingCharges,
				crossing_qty: 0,
				crossing_charges: 0,
				total_load_cross_amount:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.loadingCharges),
				total_amount_of_freight_load_cross:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.loadingCharges) + this.editStockTransferForm.controls.total_freight_amount.value,
			});
		} else if (event.id == "2") {
			this.editStockTransferForm.patchValue({
				loading_qty: 0,
				loading_charges: 0,
				crossing_qty: this.editStockTransferForm.controls.quantity.value,
				crossing_charges: this.crossingCharges,
				total_load_cross_amount:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.crossingCharges),
				total_amount_of_freight_load_cross:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.crossingCharges) + Number(this.editStockTransferForm.controls.total_freight_amount.value),
			});
		} else if (event.id == "3") {
			this.editStockTransferForm.patchValue({
				loading_qty: "",
				loading_charges: this.loadingCharges,
				crossing_qty: "",
				crossing_charges: this.crossingCharges,
				total_load_cross_amount: 0,
			});
		} else {
			alert("Select Valid Load Or cross");
		}
	}

	//?Aply Loading And Crossing charges on select of from godown
	onFormGodownPatch(godown, stockData) {
		this.loadingCharges = 0;
		this.crossingCharges = 0;

		// const selectedFromGodown = this.godownList.filter((data) => data.id === this.addStockTransferForm.value.from_godown);
		this.loadingCharges = Number(godown.load_charges);
		this.crossingCharges = Number(godown.cross_charges);
		if (this.editStockTransferForm.value.load_cross) {
			this.onpatchLoading(this.editStockTransferForm.value.load_cross, stockData)
		}

	}


	onpatchLoading(event, data) {


		//!when we select Loading Then we take Default quantity and loading charges we
		// !have and also desable/radonly condition true , also we set 0 value to crossing
		/**
		 * ?id=1 is loading Option
		 * ?id=2crossing
		 * ?id=3 loading + crossing
		 *
		 */
		if (event == "1") {
			this.editStockTransferForm.patchValue({
				loading_qty: Number(this.editStockTransferForm.controls.quantity.value),
				loading_charges: Number(this.loadingCharges),
				crossing_qty: 0,
				crossing_charges: 0,
				total_load_cross_amount:
					(Number(this.editStockTransferForm.controls.quantity.value) / 1000 * this.loadingCharges),
				total_amount_of_freight_load_cross:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.loadingCharges) + Number(this.editStockTransferForm.controls.total_freight_amount.value),
			});
		} else if (event == "2") {
			this.editStockTransferForm.patchValue({
				loading_qty: 0,
				loading_charges: 0,
				crossing_qty: Number(this.editStockTransferForm.controls.quantity.value),
				crossing_charges: this.crossingCharges,
				total_load_cross_amount:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.crossingCharges),
				total_amount_of_freight_load_cross:
					((Number(this.editStockTransferForm.controls.quantity.value) / 1000) * this.crossingCharges) + Number(this.editStockTransferForm.controls.total_freight_amount.value),
			});
		} else if (event == "3") {
			this.editStockTransferForm.patchValue({
				loading_qty: data.load_qty * 1000,
				loading_charges: this.loadingCharges,
				crossing_qty: data.cross_qty * 1000,
				crossing_charges: this.crossingCharges,
				total_load_cross_amount: 0,
			});
		} else {
			alert("Select Valid Load Or cross");
		}
	}



	openRecievedModal(data) {
		this.getNotifications('STOCK_TRANSFER_RECIEVED')
		this.selectedstockTransferList = [];
		this.selectedstockTransferList = data;
		this.onChangeShortQty(data.short_quantity ? data.short_quantity : 0);
		this.onChangeDamgeQty(data.damage_quantity ? data.damage_quantity : 0);
		this.recievedForm.patchValue({
			received_date: data.inward_date ? data.inward_date : null,
			short_remark: data.short_remark ? data.short_remark : null,
			short_quantity: data.short_quantity ? data.short_quantity * 1000 : 0,
			damage_quantity: data.damage_quantity ? data.damage_quantity * 1000 : 0,
			damage_remark: data.damage_remark ? data.damage_remark : null,
			purchase_check: data.inward_date ? 1 : 0,
			company_id: data.company_id,
		});
		this.myModalRecieved.show();
	}

	onUpdateRecievedDetails() {
		if (this.recievedForm.valid) {
			let revivedData = {
				inward_date: this.recievedForm.value.received_date,
				short_quantity: Number(this.recievedForm.value.short_quantity / 1000),
				short_remark: this.recievedForm.value.short_remark,
				damage_quantity: Number(this.recievedForm.value.damage_quantity / 1000),
				damage_remark: this.recievedForm.value.damage_remark,
				to_godown: this.selectedstockTransferList.to_godown,
				quantity: Number(this.selectedstockTransferList.quantity),
				grade_id: Number(this.selectedstockTransferList.grade_id),
				status: 1,
				// purchase_check: this.recievedForm.value.purchase_check,
				import_local_flag: this.selectedstockTransferList.import_local_flag
			}
			let body = {
				data: revivedData,
				id: this.selectedstockTransferList.id,
				purchase_check: this.recievedForm.value.purchase_check,
				company_id: this.recievedForm.value.company_id,
			};
			this.crudServices.updateData(StockTransfer.materialRecieved, body).subscribe((response: any) => {
				if (this.notification_details != null && this.notification_details != undefined) {
					let notification = {
						"title": `${this.notification_details ? this.notification_details.title : ''} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  `,
						"body": `Stock recieved  ${this.selectedstockTransferList.grade_master} 0f  ${this.selectedstockTransferList.quantity} MT from ${this.selectedstockTransferList.fromGodown}  to  ${this.selectedstockTransferList.toGodown}  transfer date ${this.selectedstockTransferList.outward_date} invoice no. ${this.selectedstockTransferList.invoice_num} Short : ${revivedData.short_quantity}, Damage : ${revivedData.damage_quantity}`,
						"click_action": "https://erp.sparmarglobal.com:8085/#/sales/stock-transfer"
					}
					this.sendNotification(notification)
				}
				this.toasterService.pop(
					response.message,
					response.message,
					response.data
				);
				this.myModalRecieved.hide();
				this.getAllStockTransferDetails();
				this.recievedForm.reset();
				this.isLoading = false;
			})

			// this.crudServices
			// 	.putRequest<any>(`${StockTransfer.update}/${this.selectedstockTransferList.id}`, revivedData)
			// 	.subscribe(
			// 		(response) => {

			// 			if (this.notification_details != null && this.notification_details != undefined) {
			// 				let notification = {
			// 					"title": `${this.notification_details ? this.notification_details.title : ''} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  `,
			// 					"body": `Stock recieved  ${this.selectedstockTransferList.grade_master} 0f  ${this.selectedstockTransferList.quantity} MT from ${this.selectedstockTransferList.fromGodown}  to  ${this.selectedstockTransferList.toGodown}  transfer date ${this.selectedstockTransferList.outward_date} invoice no. ${this.selectedstockTransferList.invoice_num} Short : ${revivedData.short_quantity}, Damage : ${revivedData.damage_quantity}`,
			// 					"click_action": "https://erp.sparmarglobal.com:8085/#/sales/stock-transfer"
			// 				}
			// 				this.sendNotification(notification)
			// 			}



			// 			this.toasterService.pop(
			// 				response.message,
			// 				response.message,
			// 				response.data
			// 			);
			// 			this.myModalRecieved.hide();
			// 			this.getAllStockTransferDetails();
			// 			this.recievedForm.reset();
			// 			this.isLoading = false;
			// 		},
			// 		(error) => { }
			// 	);
		}

	}


	onChangeShortQty(qty) {
		if (Number(qty) >= this.selectedstockTransferList.quantity * 1000) {
			this.recievedForm.get('short_quantity').setValidators([Validators.max(this.selectedstockTransferList.quantity * 1000)]);
			this.recievedForm.patchValue({ damage_quantity: 0, short_quantity: this.selectedstockTransferList.quantity * 1000 });
		} else {
			this.recievedForm.get('short_quantity').setValidators([Validators.max(this.selectedstockTransferList.quantity * 1000)]);
			this.recievedForm.get('damage_quantity').setValidators([Validators.max(this.selectedstockTransferList.quantity * 1000 - qty)]);
		}
		this.recievedForm.get('short_quantity').updateValueAndValidity();
		this.recievedForm.get('damage_quantity').updateValueAndValidity();
	}

	onChangeDamgeQty(qty) {
		if (Number(qty) >= this.selectedstockTransferList.quantity * 1000) {
			this.recievedForm.get('damage_quantity').setValidators([Validators.max(this.selectedstockTransferList.quantity * 1000)]);
			this.recievedForm.patchValue({ damage_quantity: this.selectedstockTransferList.quantity * 1000, short_quantity: 0 });
		} else {
			this.recievedForm.get('short_quantity').setValidators([Validators.max(this.selectedstockTransferList.quantity * 1000 - qty)]);
			this.recievedForm.get('damage_quantity').setValidators([Validators.max(this.selectedstockTransferList.quantity * 1000)]);
		}
		this.recievedForm.get('short_quantity').updateValueAndValidity();
		this.recievedForm.get('damage_quantity').updateValueAndValidity();
	}




	onOpenDebitCredit(data) {
		this.getNotifications('STOCK_TRANSFER_DEBIT_CREDIT_NOTE')
		this.selectedstockTransferList = [];
		if (data) {
			this.selectedstockTransferList = data;
		}
		if (this.selectedstockTransferList) {
			this.debitCreditForm.patchValue({
				debit_note: data.debit_note ? data.debit_note : null,
				credit_note: data.credit_note ? data.credit_note : null
			});
		}
		this.myModalDebitCredit.show();
	}



	onUpdateDebitCreditDetails() {
		if (this.debitCreditForm.valid) {
			let formData = {
				debit_note: this.debitCreditForm.value.debit_note,
				credit_note: this.debitCreditForm.value.credit_note
			}
			this.crudServices.updateData(StockTransfer.debitCreaditNoteAdd, { data: formData, id: this.selectedstockTransferList.id }).subscribe((response: any) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (this.notification_details != null && this.notification_details != undefined) {
					let notification = {
						"title": `${this.user.userDet[0].first_name} ${this.user.userDet[0].last_name} ${this.notification_details ? this.notification_details.title : ''}`,
						"body": `Debit note: ${formData.debit_note}, Credit note : ${formData.credit_note}, ${this.selectedstockTransferList.grade_master} 0f ${this.selectedstockTransferList.quantity} MT from ${this.selectedstockTransferList.fromGodown} to ${this.selectedstockTransferList.toGodown} transfer date ${this.selectedstockTransferList.outward_date} invoice no. ${this.selectedstockTransferList.invoice_num} Short : ${this.selectedstockTransferList.short_quantity}, Damage : ${this.selectedstockTransferList.damage_quantity}`,
						"click_action": "https://erp.sparmarglobal.com:8085/#/sales/stock-transfer"
					}
					this.sendNotification(notification);
				}
				this.myModalDebitCredit.hide();
				this.debitCreditForm.reset();
				this.isLoading = false;
			});
		}
	}


	onInwardOutward($event) {
		//let InwardOutwardStatus = $event.id;
		// this.InwardOutwardStatus = $event.id;
		this.getAllStockTransferDetails();
	}





	onOpenStockReturnDetails(stock: any) {
		this.getNotifications('STOCK_TRANSFER_RETURN')
		this.selectedStockReturn = stock;
		this.stockReturnForm.patchValue({
			stock_return_quantity: stock.stock_return_quantity ? stock.stock_return_quantity : Number(stock.quantity),
			stock_return_date: stock.stock_return_date ? stock.stock_return_date : moment(new Date).format("YYYY-MM-DD"),
			return_remark: stock.return_remark ? stock.return_remark : null
		});
		this.stockReturnForm.get('stock_return_quantity').setValidators([Validators.required, Validators.max(stock.quantity)]);
		this.stockReturnForm.get('stock_return_quantity').updateValueAndValidity();
		this.myModalStockReturn.show();
	}


	onUpdateReturnDetails() {
		this.isLoading = true;
		let body = {
			stock_return_quantity: Number(this.stockReturnForm.value.stock_return_quantity),
			stock_return_added_by: Number(this.user.userDet[0].id),
			stock_return_date: this.stockReturnForm.value.stock_return_date,
			return_remark: this.stockReturnForm.value.return_remark,
			is_stock_return: Number(1),
			import_local_flag: this.selectedStockReturn.import_local_flag

		}
		this.crudServices.updateData(StockTransfer.stockReturn, { id: this.selectedStockReturn.id, data: body, other_data: this.selectedStockReturn }).subscribe(data => {
			this.toasterService.pop('success', 'Stock returned updated ', 'updated');
			if (this.notification_details != null && this.notification_details != undefined) {
				let notification = {
					"title": `${this.user.userDet[0].first_name} ${this.user.userDet[0].last_name} ${this.notification_details ? this.notification_details.title : ''}`,
					"body": `Stock return of   ${this.selectedStockReturn.grade_master} 0f ${this.selectedStockReturn.quantity} MT from ${this.selectedStockReturn.fromGodown} to ${this.selectedStockReturn.toGodown} transfer date ${this.selectedStockReturn.outward_date} invoice no. ${this.selectedStockReturn.invoice_num}, return date :${body.stock_return_date}`,
					"click_action": "https://erp.sparmarglobal.com:8085/#/sales/stock-transfer"
				}
				this.sendNotification(notification);
				this.myModalStockReturn.hide();
				this.stockReturnForm.reset();
				this.isLoading = true;
			}
		});
	}

	//? NOTIFICATION LOGIC START FROM HERE ONLY
	getNotifications(name) {
		this.notification_details = undefined;
		this.notification_tokens = [];
		this.notification_id_users = [];
		this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {

			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);

							}
						});
					}
				});
			}
		})
	}

	saveNotifications(notification_body) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'stock_transfer',
			})
		}

		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

	sendNotification(notification_body) {
		let body = {
			notification: notification_body,
			registration_ids: this.notification_tokens
		};
		this.messagingService.sendNotification(body).then((response) => {
			if (response) {
				this.saveNotifications(body['notification'])
			}
			this.messagingService.receiveMessage();
			this.message = this.messagingService.currentMessage;
		})
	}

}
