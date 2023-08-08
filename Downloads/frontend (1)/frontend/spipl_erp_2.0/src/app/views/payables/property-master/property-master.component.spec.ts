import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyMasterComponent } from './property-master.component';

describe('PropertyMasterComponent', () => {
  let component: PropertyMasterComponent;
  let fixture: ComponentFixture<PropertyMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
