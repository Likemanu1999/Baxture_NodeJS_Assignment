import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GodownStockComponent } from './godown-stock.component';

describe('GodownStockComponent', () => {
  let component: GodownStockComponent;
  let fixture: ComponentFixture<GodownStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GodownStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GodownStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
