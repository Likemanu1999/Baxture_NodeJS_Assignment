import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FdLinkingListComponent } from './fd-linking-list.component';

describe('FdLinkingListComponent', () => {
  let component: FdLinkingListComponent;
  let fixture: ComponentFixture<FdLinkingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FdLinkingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FdLinkingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
