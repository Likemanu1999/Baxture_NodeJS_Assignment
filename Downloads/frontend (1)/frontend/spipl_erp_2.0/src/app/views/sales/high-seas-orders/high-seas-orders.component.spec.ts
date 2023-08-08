import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighSeasOrdersComponent } from './high-seas-orders.component';

describe('HighSeasOrdersComponent', () => {
  let component: HighSeasOrdersComponent;
  let fixture: ComponentFixture<HighSeasOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighSeasOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighSeasOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
