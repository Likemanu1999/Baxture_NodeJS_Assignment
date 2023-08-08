import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesShortDamageComponent } from './sales-short-damage.component';

describe('SalesShortDamageComponent', () => {
  let component: SalesShortDamageComponent;
  let fixture: ComponentFixture<SalesShortDamageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesShortDamageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesShortDamageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
