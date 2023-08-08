import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightRateComponent } from './freight-rate.component';

describe('FreightRateComponent', () => {
  let component: FreightRateComponent;
  let fixture: ComponentFixture<FreightRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreightRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
