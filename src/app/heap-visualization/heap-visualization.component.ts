import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArrayVisualizationComponent } from '../array-visualization/array-visualization.component';
import { GraphVisualizationComponent } from '../graph-visualization/graph-visualization.component';


@Component({
  selector: 'HeapVisualization',
  standalone: true,
  imports: [FormsModule, CommonModule, ArrayVisualizationComponent, GraphVisualizationComponent],
  templateUrl: './heap-visualization.component.html',
  styleUrl: './heap-visualization.component.css'
})
export class HeapVisualizationComponent {
  numbersInput: string = '';
  heapType: string = 'min';  // Default heap type
  representationType: string = 'array';  // Default visualization type
  numbersArray: number[] = [];
  visualizationSpeed: number = 1000;  // Default visualization speed (in ms)
  isAnimationRunning: boolean = false;  // Flag to disable controls during animation

  // Validate and clean the input if necessary
  validateInput() {
    const numArray = this.numbersInput.split(',').map(num => num.trim());
    if (numArray.length > 15) {
      alert('Please enter no more than 10 numbers.');
    }

    const invalidInput = numArray.some(num => isNaN(parseInt(num, 10)));
    if (invalidInput) {
      alert('Please enter only valid numbers separated by commas.');
      return false;
    }

    return true;
  }

  // Generates random numbers for the heap (max 10 numbers)
  generateRandomNumbers() {
    const randomNumbers: number[] = [];
    while (randomNumbers.length < 15) {
      const randomNum = Math.floor(Math.random() * 100);
      if (!randomNumbers.includes(randomNum)) {
        randomNumbers.push(randomNum);
      }
    }
    this.numbersInput = randomNumbers.join(', ');
  }

  // Method to handle the heap visualization logic
  visualizeHeap() {
    // Implement logic to visualize the heap based on input, heapType, and representationType
    if (!this.numbersInput) {
      alert('Please enter or generate numbers first!');
      return;
    }

     // Disable controls during animation
     this.isAnimationRunning = true;

    // Add your visualization code logic here (e.g., building an array or graph)
    console.log('Visualizing Heap...');
    console.log('Numbers:', this.numbersInput);
    console.log('Heap Type:', this.heapType);
    console.log('Visualization Type:', this.representationType);
    console.log('Visualization Speed:', this.visualizationSpeed, 'ms');
    this.numbersArray = this.numbersInput.split(',').map(num => parseInt(num.trim(), 10));

    
  }
  // Callback to reset the flag after animation is done
  onAnimationComplete(): void {
    this.isAnimationRunning = false;
  }
}