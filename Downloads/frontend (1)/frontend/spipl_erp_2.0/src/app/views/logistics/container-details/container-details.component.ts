import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { billOfLading, containerDetails, FileUpload, GodownMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-container-details',
  templateUrl: './container-details.component.html',
  styleUrls: ['./container-details.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
		ToasterService,
		DatePipe,
    CrudServices
	]
})
export class ContainerDetailsComponent implements OnInit {



  public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Change?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

  isCollapsed: boolean = false;
  containerForm: FormGroup;
  bl_id: number;
  containers: any;
  n_id: any;
  godown: any;
  container_type: { id: number; value: string; }[];
  unload_cross: { id: number; value: string; }[];
  BlNo: any;
  BlQty: any;
  BlDate: any;

  docs: Array<File> = [];

	public filterQuery = '';
	filterArray = [];
  public toasterconfig: ToasterConfig =
  new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  containerGlobal: any;
  index: any;
  progress: number;
  supplier_id: any;
  grade_id: any;
  constructor(private toasterService: ToasterService,
		private fb: FormBuilder,
		public datepipe: DatePipe,private crudServices : CrudServices,  private route: ActivatedRoute,
    private router: Router) {

      this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
        this.godown = response;

      })

      this.containerForm = this.fb.group({
        containerDetails: this.fb.array([]),
      });
     }

  ngOnInit() {
    this.container_type = [{id:1 , value:"20 Ft" } , {id:2 , value:"40 Ft" }];
    this.unload_cross = [{id:1 , value:"Unloading" } , {id:2 , value:"Crossing" },   {id:3 , value:"UN + CR" }];
    this.route.params.subscribe((params: Params) => {
      this.bl_id  = +params['bl_id'];
		});

    this.getContainer();




  }

  addShortDamageDocs(event: any , index) {
    this.docs = <Array<File>>event.target.files;
    this.index = index;

  }

  uploadDoc(index,item) {

    if(this.index == index) {
      this.containers[index].progress_bar = true;
      this.progress = 10;
      let fileData: any = new FormData();
      const document1: Array<File> = this.docs;

      if (document1.length > 0) {
        for (let i = 0; i < document1.length; i++) {
          fileData.append('container_short_damage_doc', document1[i], document1[i]['name']);
        }
      }

      this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
        console.log(res);

        let fileDealDocs1 = [];
        let filesList1 = [];


        if(res.uploads.container_short_damage_doc) {
          filesList1 = res.uploads.container_short_damage_doc;
          for (let i = 0; i < filesList1.length; i++) {
            fileDealDocs1.push(filesList1[i].location);
          }
          this.progress = 100;
          // data['be_copy'] = JSON.stringify(fileDealDocs1);

          ((this.containerForm.controls.containerDetails as FormArray).at(index) as FormGroup).get('short_damage_doc').patchValue(JSON.stringify(fileDealDocs1));

        }




      })

    }

  }

  getContainer() {
    this.crudServices.getOne<any>(billOfLading.getOneBl,{id:this.bl_id }).subscribe(response=> {

      const data = response[0];
      console.log(response);
      this.BlNo  = data.bill_lading_no;
      this.BlQty  = data.bl_qauntity;
      this.BlDate  = data.bl_date;
      this.n_id = data.n_id;
      this.supplier_id = data.non_negotiable.supplier_id;
      this.grade_id = data.non_negotiable.grade_id;

      const blquantity = data.bl_qauntity;
      const container_count = data.container_details.length;

      const qty_per_contr = blquantity/container_count;  //Net wt

      let setflag = 0;

        //Total Quantity In KG
      const wt_bag_per_contr = qty_per_contr*1000;
      let no_bags_per_contr = 0;
    //Bags Per Containers  each bag 25 kg
    if(data.materialBags) {
       no_bags_per_contr = wt_bag_per_contr/data.materialBags;  //bags per conatiners

    }

      if(qty_per_contr<=20)
      {
          // 20 ft.
          setflag=1;
      }else
      {   //40 ft.
          setflag=2;
      }



      this.containers = [];


      const dataContainer = this.containerForm.controls.containerDetails as FormArray;
      dataContainer.controls = [];
     for (const val of data.container_details) {
       let bagsPerContainer = 0;
       let typeCont = 0;
       let netWt = 0;
       let unloadingQTy = false;
       let crossingQTy= false;
       if(val.bags_per_cont) {
        bagsPerContainer =  val.bags_per_cont;
       } else {
        bagsPerContainer =  no_bags_per_contr;
       }

       if(val.type_cont) {
        typeCont = val.type_cont;
       } else {
        typeCont = setflag;
       }

       if(val.net_wt) {
         netWt = val.net_wt;
       } else {
        netWt = qty_per_contr
       }



       if(val.unloading_qty) {
        unloadingQTy = true;
       }

       if(val.crossing_qty) {
        crossingQTy = true;
       }

        val.collapseVal = true;
        val.progress_bar = false;
        val.qty_per_contr = netWt.toFixed(3);
        val.no_bags_per_contr = no_bags_per_contr;
        val.unload = unloadingQTy;
        val.cross = crossingQTy;
        val.load_charge = 0;
        val.cross_charge = 0;
        this.containers.push(val);

      dataContainer.push(this.fb.group({
          id : new FormControl(val.id),
          container_number: new FormControl(val.container_number),
          seal_no: new FormControl(val.seal_no),
          type_cont: new FormControl(typeCont),
          bags_per_cont: new FormControl(bagsPerContainer.toFixed(3)),
          net_wt: new FormControl(netWt.toFixed(3)),
          unloading_qty: new FormControl(val.unloading_qty),
          crossing_qty: new FormControl(val.crossing_qty),
          godown_id: new FormControl(val.godown_id),
          charges: new FormControl(val.charges),
          cont_received_date: new FormControl(val.cont_received_date),
          short_material_qty: new FormControl(val.short_material_qty),
          short_remark: new FormControl(val.short_remark),
          damage_material_qty: new FormControl(val.damage_material_qty),
          damage_remark: new FormControl(val.damage_remark),
          short_damage_doc: new FormControl(val.short_damage_doc),
          no_of_pallets: new FormControl(val.no_of_pallets),

        }));
     }

     this.containerGlobal = this.containers;

    })
  }

  onChangeUnCr(event , i, item) {
    if(event != null) {
      this.containers[i].unload = false;
      this.containers[i].cross = false;
      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('unloading_qty').patchValue(0);
      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('crossing_qty').patchValue(0);
      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(0);




      if(event.id == 1) {
        this.containers[i].unload = true;
        ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('unloading_qty').patchValue(item.qty_per_contr);
        const charges = ( item.load_charge * item.qty_per_contr) ;

        ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(charges);
      }

      if(event.id == 2) {
        this.containers[i].cross = true;
        ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('crossing_qty').patchValue(item.qty_per_contr);
        const charges = (item.cross_charge * item.qty_per_contr);

        ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(charges);
      }

      if(event.id == 3) {
        this.containers[i].unload = true;
        this.containers[i].cross = true;
        ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(0);
      }

    } else {
      this.containers[i].unload = false;
      this.containers[i].cross = false;
      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('unloading_qty').patchValue(0);
      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('crossing_qty').patchValue(0);
      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(0);

    }
  }

  onGodownChange(event , i, item) {

    if(event != null) {

      this.containers[i].load_charge = event.load_charges;
      this.containers[i].cross_charge = event.cross_charges;

      const charges =( item.load_charge * ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('unloading_qty').value) + (item.cross_charge *  ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('crossing_qty').value);

      ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(charges);

    } else {
      this.containers[i].load_charge = 0;
      this.containers[i].cross_charge = 0;

    }
  }

  onSubmit(){
    const details = this.containerForm.value.containerDetails;
    console.log(details);

    let data = [];
    for (let element of details) {

      data.push({
        bl_id: this.bl_id,
        n_id:  this.n_id,
        supplier_id : this.supplier_id,
        grade_id : this.grade_id,
        bags_per_cont: element.bags_per_cont,
        charges: element.charges,
        cont_received_date:this.datepipe.transform(  element.cont_received_date , 'yyyy-MM-dd'),
        container_number: element.container_number,
        crossing_qty: element.crossing_qty,
        damage_material_qty: element.damage_material_qty,
        damage_remark: element.damage_remark,
        godown_id: element.godown_id,
        id: element.id,
        net_wt: element.net_wt,
        seal_no: element.seal_no,
        short_material_qty: element.short_material_qty,
        short_remark: element.short_remark,
        type_cont: element.type_cont,
        unloading_qty: element.unloading_qty,
        short_damage_doc : element.short_damage_doc,
        no_of_pallets : element.no_of_pallets
      })
    }

    if(data.length > 0){
      this.crudServices.updateData<any>(containerDetails.update, data).subscribe(response => {

        if(response.code = 100) {
          this.toasterService.pop(response.message, response.message, response.data);
          this.getContainer();
          this.containers[this.index].progress_bar = false;
        } else {
          this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
        }

      })
    }

  }

  calculateCharge(event, item , i) {

    const charges =( item.load_charge * ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('unloading_qty').value) + (item.cross_charge *  ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('crossing_qty').value);
    ((this.containerForm.controls.containerDetails as FormArray).at(i) as FormGroup).get('charges').patchValue(charges);

  }

  collapsed(event: any): void {
    // console.log(event);
  }

  expanded(event: any): void {
    // console.log(event);
  }

  collapse(i) {

  }

  onBack() {
    console.log(this.n_id);
    
     this.router.navigate(['logistics/bill-of-lading/'+this.n_id]);
  }

  getArray(doc) {
    return JSON.parse(doc);
  }

  



}
