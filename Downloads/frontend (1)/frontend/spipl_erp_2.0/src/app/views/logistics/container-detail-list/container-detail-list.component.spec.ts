import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerDetailListComponent } from './container-detail-list.component';

describe('ContainerDetailListComponent', () => {
  let component: ContainerDetailListComponent;
  let fixture: ComponentFixture<ContainerDetailListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerDetailListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerDetailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
