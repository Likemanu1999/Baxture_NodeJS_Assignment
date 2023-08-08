import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransperComponent } from './stock-transper.component';

describe('StockTransperComponent', () => {
  let component: StockTransperComponent;
  let fixture: ComponentFixture<StockTransperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockTransperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTransperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
