import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListSearchComponent } from './price-list-search.component';

describe('PriceListSearchComponent', () => {
  let component: PriceListSearchComponent;
  let fixture: ComponentFixture<PriceListSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceListSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceListSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
