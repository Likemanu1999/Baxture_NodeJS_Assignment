import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IlcChargesComponent } from './ilc-charges.component';

describe('IlcChargesComponent', () => {
  let component: IlcChargesComponent;
  let fixture: ComponentFixture<IlcChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IlcChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IlcChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
