import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersChargesComponent } from './others-charges.component';

describe('OthersChargesComponent', () => {
  let component: OthersChargesComponent;
  let fixture: ComponentFixture<OthersChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OthersChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OthersChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
