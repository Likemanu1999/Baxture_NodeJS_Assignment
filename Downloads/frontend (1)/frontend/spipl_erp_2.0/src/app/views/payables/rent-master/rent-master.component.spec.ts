import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RentMasterComponent } from './rent-master.component';

describe('RentMasterComponent', () => {
  let component: RentMasterComponent;
  let fixture: ComponentFixture<RentMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RentMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
