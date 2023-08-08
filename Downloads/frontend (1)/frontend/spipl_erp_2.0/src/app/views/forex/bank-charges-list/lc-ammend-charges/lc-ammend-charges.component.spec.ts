import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LcAmmendChargesComponent } from './lc-ammend-charges.component';

describe('LcAmmendChargesComponent', () => {
  let component: LcAmmendChargesComponent;
  let fixture: ComponentFixture<LcAmmendChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LcAmmendChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LcAmmendChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
