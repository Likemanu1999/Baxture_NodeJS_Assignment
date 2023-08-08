import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransnationalLcComponent } from './transnational-lc.component';

describe('TransnationalLcComponent', () => {
  let component: TransnationalLcComponent;
  let fixture: ComponentFixture<TransnationalLcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransnationalLcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransnationalLcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
