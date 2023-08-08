import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlcChargesComponent } from './flc-charges.component';

describe('FlcChargesComponent', () => {
  let component: FlcChargesComponent;
  let fixture: ComponentFixture<FlcChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlcChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlcChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
