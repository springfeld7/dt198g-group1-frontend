import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatPairComponent } from './seat-pair.component';

describe('SeatPairComponent', () => {
  let component: SeatPairComponent;
  let fixture: ComponentFixture<SeatPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatPairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
