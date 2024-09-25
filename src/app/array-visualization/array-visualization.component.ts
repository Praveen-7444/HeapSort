import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-array-visualization',
  standalone: true,
  templateUrl: './array-visualization.component.html',
  styleUrls: ['./array-visualization.component.css'],
  imports: [NgFor, CommonModule]
})
export class ArrayVisualizationComponent implements OnChanges {
  @Input() inputArray: number[] = [];
  @Input() heapType: string = 'min';
  @Input() visualizationSpeed: number = 1500; // Slowed down animation for visibility
  @Output() animationComplete = new EventEmitter<void>();

  array: number[] = [];
  sortedArray: number[] = [];
  isSorting: boolean = false;

  private svgHeap: any;
  private svgSorted: any;
  private svgInput: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputArray'] && this.inputArray.length) {
      this.array = [...this.inputArray]; // Copy input array for heap operations
      this.sortedArray = [];
      this.initializeSvg();
      this.visualizeInputArray(); // Show input array
      this.startHeapSort();
    }
  }

  initializeSvg() {
    d3.select('#heap-container').selectAll('*').remove();
    d3.select('#sorted-container').selectAll('*').remove();
    d3.select('#input-container').selectAll('*').remove();

    this.svgHeap = d3.select('#heap-container')
      .append('svg')
      .attr('width', 800)
      .attr('height', 100);

    this.svgSorted = d3.select('#sorted-container')
      .append('svg')
      .attr('width', 600)
      .attr('height', 100);

    this.svgInput = d3.select('#input-container')
      .append('svg')
      .attr('width', 600)
      .attr('height', 100);
  }

  visualizeInputArray() {
    const inputData = this.inputArray.map((d, i) => ({ value: d, index: i }));

    const rects = this.svgInput.selectAll('rect').data(inputData);
    const texts = this.svgInput.selectAll('text').data(inputData);

    rects.enter().append('rect')
      .attr('width', 40)
      .attr('height', 40)
      .attr('x', (d: any) => d.index * 50)
      .attr('y', 20)
      .attr('fill', 'lightblue');

    texts.enter().append('text')
      .attr('x', (d: any) => d.index * 50 + 20)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.value);
  }

  async startHeapSort() {
    this.isSorting = true;
    const n = this.array.length;

    // Build heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await this.heapify(n, i);
    }

    // Extract elements one by one from heap
    for (let i = n - 1; i > 0; i--) {
      await this.swapWithAnimation(0, i); // Swap first element with the last
      this.sortedArray.unshift(this.array.pop()!); // Move last element to sorted array
      this.updateSortedArray();
      await this.heapify(i, 0); // Heapify the reduced heap
      await this.sleep(this.visualizationSpeed); // Add delay after the swap
    }

    // Handle the last remaining element
    this.sortedArray.unshift(this.array.pop()!);
    this.updateSortedArray();
    this.isSorting = false;
    this.animationComplete.emit();
  }

  async heapify(n: number, i: number) {
    let largestOrSmallest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    this.updateHeapVisualization(i, left < n ? left : null, right < n ? right : null);

    if (this.heapType === 'min') {
      if (left < n && this.array[left] < this.array[largestOrSmallest]) {
        largestOrSmallest = left;
      }
      if (right < n && this.array[right] < this.array[largestOrSmallest]) {
        largestOrSmallest = right;
      }
    } else {
      if (left < n && this.array[left] > this.array[largestOrSmallest]) {
        largestOrSmallest = left;
      }
      if (right < n && this.array[right] > this.array[largestOrSmallest]) {
        largestOrSmallest = right;
      }
    }

    if (largestOrSmallest !== i) {
      await this.swapWithAnimation(i, largestOrSmallest);
      await this.heapify(n, largestOrSmallest);
    }
  }

  async swapWithAnimation(i: number, j: number) {
    const heapData = this.array.map((d, idx) => ({ value: d, index: idx }));

    const rects = this.svgHeap.selectAll('rect').data(heapData, (d: any) => d.index);
    const texts = this.svgHeap.selectAll('text').data(heapData, (d: any) => d.index);

    const duration = this.visualizationSpeed;

    // Transition positions to swap the two elements visually
    rects.filter((d: any) => d.index === i || d.index === j)
      .transition()
      .duration(duration)
      .attr('x', (d: any) => d.index === i ? j * 50 : i * 50);

    texts.filter((d: any) => d.index === i || d.index === j)
      .transition()
      .duration(duration)
      .attr('x', (d: any) => d.index === i ? j * 50 + 20 : i * 50 + 20);

    await this.sleep(duration); // Wait for the transition to complete

    // Swap data in the array
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];

    // Add a pause after the swap is visually completed
    await this.sleep(500); // Additional delay to prevent collision/overlap issues

    this.updateHeapVisualization(); // Update the heap to reflect the swap
  }

  updateHeapVisualization(parentIndex: number | null = null, leftIndex: number | null = null, rightIndex: number | null = null) {
    const heapData = this.array.map((d, i) => ({ value: d, index: i }));

    const rects = this.svgHeap.selectAll('rect').data(heapData, (d: any) => d.index);
    const texts = this.svgHeap.selectAll('text').data(heapData, (d: any) => d.index);

    rects.exit().remove();
    texts.exit().remove();

    const enterRects = rects.enter().append('rect')
      .attr('width', 40)
      .attr('height', 40)
      .attr('y', 20)
      .attr('fill', (d: any) => {
        if (d.index === parentIndex) return 'orange';
        if (d.index === leftIndex || d.index === rightIndex) return 'yellow';
        return 'lightblue';
      })
      .attr('x', (d: any) => d.index * 50);

    enterRects.merge(rects)
      .attr('fill', (d: any) => {
        if (d.index === parentIndex) return 'orange';
        if (d.index === leftIndex || d.index === rightIndex) return 'yellow';
        return 'lightblue';
      })
      .attr('x', (d: any) => d.index * 50);

    const enterTexts = texts.enter().append('text')
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.value)
      .attr('x', (d: any) => d.index * 50 + 20);

    enterTexts.merge(texts)
      .text((d: any) => d.value)
      .attr('x', (d: any) => d.index * 50 + 20);
  }

  updateSortedArray() {
    const sortedData = this.sortedArray.map((d, i) => ({ value: d, index: i }));

    const rects = this.svgSorted.selectAll('rect').data(sortedData, (d: any) => d.index);
    const texts = this.svgSorted.selectAll('text').data(sortedData, (d: any) => d.index);

    rects.exit().remove();
    texts.exit().remove();

    const enterRects = rects.enter().append('rect')
      .attr('width', 40)
      .attr('height', 40)
      .attr('y', 20)
      .attr('fill', 'lightgreen')
      .attr('x', (d: any, i: number) => i * 50);

    enterRects.merge(rects)
      .attr('x', (d: any, i: number) => i * 50);

    const enterTexts = texts.enter().append('text')
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.value)
      .attr('x', (d: any, i: number) => i * 50 + 20);

    enterTexts.merge(texts)
      .text((d: any) => d.value)
      .attr('x', (d: any, i: number) => i * 50 + 20);
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
