import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayVisualizationComponent } from './array-visualization.component';

describe('ArrayVisualizationComponent', () => {
  let component: ArrayVisualizationComponent;
  let fixture: ComponentFixture<ArrayVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrayVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrayVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
