import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'HeapVisualization',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './heap-visualization.component.html',
  styleUrl: './heap-visualization.component.css'
})
export class HeapVisualizationComponent {
  numbersInput: string = '';
  heapType: string = 'min';  // Default heap type
  representationType: string = 'array';  // Default visualization type

  // Validate and clean the input if necessary
  validateInput() {
    const numArray = this.numbersInput.split(',').map(num => num.trim());
    if (numArray.length > 10) {
      alert('Please enter no more than 10 numbers.');
    }
  }

  // Generates random numbers for the heap (max 10 numbers)
  generateRandomNumbers() {
    const randomNumbers: number[] = [];
    while (randomNumbers.length < 10) {
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

    // Add your visualization code logic here (e.g., building an array or graph)
    console.log('Visualizing Heap...');
    console.log('Numbers:', this.numbersInput);
    console.log('Heap Type:', this.heapType);
    console.log('Visualization Type:', this.representationType);
  }
}