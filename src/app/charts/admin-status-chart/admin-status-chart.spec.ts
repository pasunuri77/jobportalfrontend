import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStatusChart } from './admin-status-chart';

describe('AdminStatusChart', () => {
  let component: AdminStatusChart;
  let fixture: ComponentFixture<AdminStatusChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStatusChart],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStatusChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
