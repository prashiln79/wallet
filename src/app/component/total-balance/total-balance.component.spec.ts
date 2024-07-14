import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalBalanceComponent } from './total-balance.component';

describe('TotalBalanceComponent', () => {
  let component: TotalBalanceComponent;
  let fixture: ComponentFixture<TotalBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TotalBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
