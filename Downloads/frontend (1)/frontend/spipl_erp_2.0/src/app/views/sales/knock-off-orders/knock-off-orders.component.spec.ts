import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnockOffOrdersComponent } from './knock-off-orders.component';

describe('KnockOffOrdersComponent', () => {
  let component: KnockOffOrdersComponent;
  let fixture: ComponentFixture<KnockOffOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnockOffOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnockOffOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
