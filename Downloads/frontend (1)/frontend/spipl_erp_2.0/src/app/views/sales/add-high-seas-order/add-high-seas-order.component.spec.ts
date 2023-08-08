import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHighSeasOrderComponent } from './add-high-seas-order.component';

describe('AddHighSeasOrderComponent', () => {
  let component: AddHighSeasOrderComponent;
  let fixture: ComponentFixture<AddHighSeasOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHighSeasOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHighSeasOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
