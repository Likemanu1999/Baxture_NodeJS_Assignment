import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownDaterangeComponent } from '../dropdown-daterange/dropdown-daterange.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
		DropdownDaterangeComponent,
  ],
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  exports: [ 
    DropdownDaterangeComponent,
    CommonModule, 
    FormsModule 
  ]
})
export class SharedModuleModule { }
