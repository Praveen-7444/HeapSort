import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-array-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './array-visualization.component.html',
  styleUrl: './array-visualization.component.css',
})
export class ArrayVisualizationComponent {
  @Input() inputArray: number[] = [];
  @Input() heapType: string = 'min';
  sortedArray: number[] = [];
  defaultArray: number[] = new Array(10).fill(0); 

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputArray'] && this.inputArray.length > 0) {
      // Initialize sorted array with the input array when it changes
      this.sortedArray = [...this.inputArray];
      this.sortArray();  // Sort the array when input changes
      console.log("Input Array:", this.inputArray);
    }
  }

  sortArray() {
    // Implement your sorting algorithm here (e.g., Heap Sort)
    this.sortedArray.sort((a, b) => a - b);  // Example sorting logic (ascending)
    console.log('Sorted Array:', this.sortedArray);
  }
  // Change this to a getter
  get displayInputArray(): (number | string)[] {
    return this.inputArray.length ? this.inputArray : Array(10).fill('-');
  }

  get displaySortedArray(): (number | string)[] {
    return this.sortedArray.length ? this.sortedArray : Array(10).fill('-');
  }
}
