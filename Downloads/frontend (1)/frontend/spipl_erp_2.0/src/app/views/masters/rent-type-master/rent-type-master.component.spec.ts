import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RentTypeMasterComponent } from './rent-type-master.component';

describe('RentTypeMasterComponent', () => {
  let component: RentTypeMasterComponent;
  let fixture: ComponentFixture<RentTypeMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RentTypeMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
