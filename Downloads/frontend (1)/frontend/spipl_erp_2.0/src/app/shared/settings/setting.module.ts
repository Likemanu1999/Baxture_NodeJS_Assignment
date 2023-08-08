import {NgModule} from '@angular/core';
import { SettingsComponent } from './settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@NgModule({
 imports: [
  ReactiveFormsModule,
  CommonModule
 ],
declarations: [SettingsComponent],
exports: [SettingsComponent]
})
export class SettingModule {}
