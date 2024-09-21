import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapVisualizationComponent } from './heap-visualization.component';

describe('HeapVisualizationComponent', () => {
  let component: HeapVisualizationComponent;
  let fixture: ComponentFixture<HeapVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeapVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeapVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
