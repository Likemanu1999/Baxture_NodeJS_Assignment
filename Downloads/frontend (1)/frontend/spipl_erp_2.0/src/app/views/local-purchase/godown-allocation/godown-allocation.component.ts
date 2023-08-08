


import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from '@angular/common';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Params } from '@angular/router';
import { GodownMaster, LocalPurchase, LocalPurchaseCharges, LocalPurchaseGodownAlloc, SubOrg } from '../../../shared/apis-path/apis-path';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-godown-allocation',
  templateUrl: './godown-allocation.component.html',
  styleUrls: ['./godown-allocation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    DatePipe,
    CrudServices

  ]
})
export class GodownAllocationComponent implements OnInit {
  id: number;
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;

  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'right';
  public closeOnOutsideClick: boolean = true;


  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  StorageForm: any;

  StorageArr: FormArray;
  godown: any;
  sub_org_name: any;
  port: any;
  data = [];
  StorageFormUpdate: FormGroup;
  storage_id: any;
  liftQty: any;

  constructor(private toasterService: ToasterService,
    public datepipe: DatePipe,
    private crudServices: CrudServices,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {


    this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
      this.godown = response;

    })

  }

  ngOnInit() {

    this.route.params.subscribe((params: Params) => {
      this.id = +params['local_purchase_id'];

    });



    this.StorageForm = this.fb.group({

      StorageArr: this.fb.array([
        this.createItemStorage()
      ]),
    });

    this.StorageFormUpdate = new FormGroup({
      godown_id: new FormControl(null),
      quantity: new FormControl(null),
      from_date: new FormControl(null),
      to_date: new FormControl(null),
    });

    this.getDetails();

    this.getData();
  }

  getDetails() {
    this.crudServices.getOne<any>(LocalPurchase.getAll, { id: this.id }).subscribe(response => {
      if (response.length) {
        console.log(response);
        
        this.sub_org_name = response[0]['sub_org_name'];
        this.port = response[0]['port_name'];
        this.liftQty = response[0].LocalPurchaseLiftingDetails.reduce((sum,item) => sum + Number(item.quantity) , 0);
        
      }

    })
  }



  addRowStorage(): void {


    this.StorageArr = this.StorageForm.get('StorageArr') as FormArray;
    this.StorageArr.push(this.createItemStorage());
  }

  deleteStorage(index: number) {
    this.StorageArr = this.StorageForm.get('StorageArr') as FormArray;
    this.StorageArr.removeAt(index);

  }



  createItemStorage(): FormGroup {


    return this.fb.group({
      godown_id: new FormControl(null),
      quantity: new FormControl(null),
      from_date: new FormControl(null),
      to_date: new FormControl(null),


    });



  }



  getData() {
    this.crudServices.getOne<any>(LocalPurchaseGodownAlloc.getGodownAllocation, { id: this.id }).subscribe(response => {
      console.log(response);
    
        this.data = response;

    })
  }



  onSubmit() {
    let Storage_data = this.StorageForm.value.StorageArr;
    let data = [];

    Storage_data.forEach(element => {
      data.push({
        'local_deal_id': this.id,
        'godown_id': element.godown_id,
        'from_date': this.datepipe.transform(element.from_date, 'yyyy-MM-dd'),
        'to_date': this.datepipe.transform(element.to_date, 'yyyy-MM-dd'),
        'quantity': element.quantity != '' ? element.quantity : 0,
        'original_qty': element.quantity != '' ? element.quantity : 0,

      })
    });

    let qty = data.reduce((sum , item) => sum + item.quantity ,0)

    if(qty <= this.liftQty) {
      this.crudServices.addData<any>(LocalPurchaseGodownAlloc.addGodownAllocation, data).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.StorageForm.reset();
        this.StorageArr = this.StorageForm.get('StorageArr') as FormArray;
        this.StorageArr.clear();
        this.StorageArr.push(this.createItemStorage());
  
        this.getData();
      })
    } else {
      this.toasterService.pop('warning', 'Warning', 'Quantity Exceeded');
    }

   
  }

  onEdit(item) {
    this.myModal.show();
    this.storage_id = item.id;
    this.StorageFormUpdate.patchValue(item);

  }

  closeModal() {
    this.myModal.hide();
    this.StorageFormUpdate.reset();
  }

  update() {

    let data = {
      'godown_id': this.StorageFormUpdate.value.godown_id,
      'from_date': this.datepipe.transform(this.StorageFormUpdate.value.from_date, 'yyyy-MM-dd'),
      'to_date': this.datepipe.transform(this.StorageFormUpdate.value.to_date, 'yyyy-MM-dd'),
      'quantity': this.StorageFormUpdate.value.quantity != '' ? this.StorageFormUpdate.value.quantity : 0,
      'original_qty': this.StorageFormUpdate.value.quantity != '' ? this.StorageFormUpdate.value.quantity : 0,
      'id': this.storage_id
    }
    this.crudServices.updateData<any>(LocalPurchaseGodownAlloc.updateGodownAllocation, data).subscribe(response => {
      this.toasterService.pop(response.message, response.message, response.data);
      this.closeModal();
      this.getData();
    })

  }

  onDelete(item) {
    if (item.id) {

      this.crudServices.postRequest<any>(LocalPurchaseGodownAlloc.deleteDataGodown, { id: item.id }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);

        this.getData();
      })
    }
  }





}

