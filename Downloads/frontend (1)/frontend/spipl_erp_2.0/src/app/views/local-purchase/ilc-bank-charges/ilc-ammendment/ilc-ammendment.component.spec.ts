import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IlcAmmendmentComponent } from './ilc-ammendment.component';

describe('IlcAmmendmentComponent', () => {
  let component: IlcAmmendmentComponent;
  let fixture: ComponentFixture<IlcAmmendmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IlcAmmendmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IlcAmmendmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
