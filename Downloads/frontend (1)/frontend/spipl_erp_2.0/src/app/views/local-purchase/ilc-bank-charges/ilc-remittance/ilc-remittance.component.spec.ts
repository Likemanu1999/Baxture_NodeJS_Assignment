import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IlcRemittanceComponent } from './ilc-remittance.component';

describe('IlcRemittanceComponent', () => {
  let component: IlcRemittanceComponent;
  let fixture: ComponentFixture<IlcRemittanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IlcRemittanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IlcRemittanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
