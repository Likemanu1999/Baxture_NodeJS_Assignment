import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralizeCommunicationComponent } from './centralize-communication.component';

describe('CentralizeCommunicationComponent', () => {
  let component: CentralizeCommunicationComponent;
  let fixture: ComponentFixture<CentralizeCommunicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralizeCommunicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralizeCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
