import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContigentLiabilityComponent } from './contigent-liability.component';

describe('ContigentLiabilityComponent', () => {
  let component: ContigentLiabilityComponent;
  let fixture: ComponentFixture<ContigentLiabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContigentLiabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContigentLiabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
