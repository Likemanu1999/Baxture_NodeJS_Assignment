import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplReturnTypeComponent } from './compl-return-type.component';

describe('ComplReturnTypeComponent', () => {
  let component: ComplReturnTypeComponent;
  let fixture: ComponentFixture<ComplReturnTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplReturnTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplReturnTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
