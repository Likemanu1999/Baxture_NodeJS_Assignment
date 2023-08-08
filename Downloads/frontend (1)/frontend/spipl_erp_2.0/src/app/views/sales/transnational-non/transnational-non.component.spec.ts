import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransnationalNonComponent } from './transnational-non.component';

describe('TransnationalNonComponent', () => {
  let component: TransnationalNonComponent;
  let fixture: ComponentFixture<TransnationalNonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransnationalNonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransnationalNonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
