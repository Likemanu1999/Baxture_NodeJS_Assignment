import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransnationalOrderComponent } from './add-transnational-order.component';

describe('AddTransnationalOrderComponent', () => {
  let component: AddTransnationalOrderComponent;
  let fixture: ComponentFixture<AddTransnationalOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTransnationalOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransnationalOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
