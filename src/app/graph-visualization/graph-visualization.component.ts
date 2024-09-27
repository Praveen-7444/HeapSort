import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';

interface Node {
  id: number;
  value: number;
  children: Node[];
}

@Component({
  selector: 'app-graph-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph-visualization.component.html',
  styleUrls: ['./graph-visualization.component.css'],
})
export class GraphVisualizationComponent implements OnInit, OnChanges {
  @Input() data: number[] = [];
  @Input() heapType: string = 'min'; // Default to 'min' heap, can also be 'max'
  @Input() visualizationSpeed: number = 1000; // Default speed for visualization
  inputArray: number[] = [];
  binaryTreeArray: number[] = [];
  sortedArray: number[] = [];
  private svg: any;
  private treeGroup: any;
  private sortedSvg: any;  // SVG for sorted array
  private width = 900;
  private height = 400;
  private nodeRadius = 20;
  private treeLayout = d3.tree<Node>().size([this.width - 200, this.height - 200]);
  private treeData: Node | null = null;
  @Output() animationComplete = new EventEmitter<void>();

  visualizationStarted: boolean = false; // Initially false, will be set to true when visualization starts
 // Define the time and space complexity
 timeComplexity: string = 'O(n log n)';
 spaceComplexity: string = 'O(1)'; // In-place sorting algorithm

 message: string = '';  // Status message to show before or during visualization

  private compareIndices: { parent: number | null, leftChild: number | null, rightChild: number | null } = {
    parent: null,
    leftChild: null,
    rightChild: null,
  };

  constructor() {}

  ngOnInit(): void {
    this.createSvg();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length) {
      this.inputArray = [...this.data];
      this.binaryTreeArray = [...this.data];
      this.sortedArray = [];
      this.treeData = this.arrayToTreeData(this.binaryTreeArray);

      if (this.treeData && d3.select('#heapGraph').node()) {
        this.drawTree(this.treeData);
      }

      this.visualizationStarted = true; // Visualization is now starting
      this.startHeapSortAnimation();
    }
  }

  private createSvg(): void {
    this.svg = d3
      .select('#heapGraph')
      .attr('width', this.width)
      .attr('height', this.height);

    if (!this.svg.node()) {
      console.error('SVG element #heapGraph not found');
      return;
    }

    this.treeGroup = this.svg.append('g').attr('transform', 'translate(0, 40)');

    this.sortedSvg = d3.select('#sortedArraySvg')
      .attr('width', this.width)
      .attr('height', 100);

    if (!this.sortedSvg.node()) {
      console.error('SVG element #sortedArraySvg not found');
      return;
    }
  }

  private arrayToTreeData(array: number[]): Node | null {
    if (array.length === 0) return null;

    const nodes: Node[] = array.map((value, index) => ({ id: index, value, children: [] }));
    nodes.forEach((node, index) => {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      if (leftChildIdx < array.length) {
        node.children.push(nodes[leftChildIdx]);
      }
      if (rightChildIdx < array.length) {
        node.children.push(nodes[rightChildIdx]);
      }
    });
    return nodes[0];
  }

  private drawTree(treeData: Node): void {
    const root = d3.hierarchy<Node>(treeData);
    const links = this.treeLayout(root).links();
    const nodes = root.descendants();

    this.treeGroup.selectAll('g').remove();
    this.treeGroup.selectAll('.link').remove();

    this.treeGroup
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d: d3.HierarchyPointLink<Node>) => d.source.x)
      .attr('y1', (d: d3.HierarchyPointLink<Node>) => d.source.y)
      .attr('x2', (d: d3.HierarchyPointLink<Node>) => d.target.x)
      .attr('y2', (d: d3.HierarchyPointLink<Node>) => d.target.y)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 2);

    const nodeGroup = this.treeGroup
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', (d: d3.HierarchyPointNode<Node>) => `translate(${d.x},${d.y})`);

    nodeGroup
      .append('circle')
      .attr('class', 'node')
      .attr('r', this.nodeRadius)
      .attr('fill', (d: d3.HierarchyPointNode<Node>) => this.getNodeColor(d))
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

    nodeGroup
      .append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .text((d: d3.HierarchyPointNode<Node>) => d.data.value.toString());
  }

  private getNodeColor(d: d3.HierarchyPointNode<Node>): string {
    if (d.data.id === this.compareIndices.parent) {
      return 'orange';
    } else if (d.data.id === this.compareIndices.leftChild || d.data.id === this.compareIndices.rightChild) {
      return 'yellow';
    } else {
      return 'white';
    }
  }

  private async startHeapSortAnimation() {
    let array = [...this.binaryTreeArray];
    let n = array.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await this.heapify(array, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      await this.swapElements(array, 0, i);
      this.sortedArray.unshift(array[i]);
      array.pop();
      this.updateSortedArrayUI();
      this.updateHeapUI();
      await this.heapify(array, i, 0);
    }

    if (array.length > 0) {
      this.sortedArray.unshift(array[0]);
    }

    this.binaryTreeArray = [];
    this.updateSortedArrayUI();
    this.updateHeapUI();
    this.clearSvg();
    this.animationComplete.emit();
  }

  private async heapify(array: number[], n: number, i: number) {
    let largestOrSmallest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (this.heapType === 'min') {
      if (left < n && array[left] < array[largestOrSmallest]) {
        largestOrSmallest = left;
      }
      if (right < n && array[right] < array[largestOrSmallest]) {
        largestOrSmallest = right;
      }
    } else {
      if (left < n && array[left] > array[largestOrSmallest]) {
        largestOrSmallest = left;
      }
      if (right < n && array[right] > array[largestOrSmallest]) {
        largestOrSmallest = right;
      }
    }

    // Update compareIndices to highlight the parent and children being compared
    this.compareIndices = { parent: i, leftChild: left < n ? left : null, rightChild: right < n ? right : null };
    this.drawTree(this.treeData!); // Redraw the tree to highlight nodes

    await this.sleep(this.visualizationSpeed);

    if (largestOrSmallest !== i) {
      await this.swapElements(array, i, largestOrSmallest);
      await this.heapify(array, n, largestOrSmallest);
    }
  }

  private async swapElements(array: number[], i: number, j: number) {
    [array[i], array[j]] = [array[j], array[i]];

    this.binaryTreeArray = [...array];
    this.treeData = this.arrayToTreeData(this.binaryTreeArray)!;

    // Update compareIndices for highlighting the swapped nodes
    this.compareIndices = { parent: j, leftChild: null, rightChild: null };
    this.drawTree(this.treeData);

    await this.sleep(this.visualizationSpeed);

    // Reset compareIndices after the swap
    this.compareIndices = { parent: null, leftChild: null, rightChild: null };
    this.drawTree(this.treeData);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateSortedArrayUI() {
    const rectWidth = 40;
    const rectHeight = 40;
    const spacing = 20; // Add extra spacing between elements

    if (!this.sortedSvg.node()) {
      console.error('Cannot update sorted array: #sortedArraySvg not found');
      return;
    }

    const sortedRects = this.sortedSvg.selectAll('rect')
      .data(this.sortedArray, (d: number) => d);

    sortedRects.exit().remove();

    sortedRects.enter()
      .append('rect')
      .attr('x', (d: number, i: number) => i * (rectWidth + spacing) + 10) // Add spacing between elements
      .attr('y', 20)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', 'lightgreen')
      .merge(sortedRects)
      .transition()
      .duration(this.visualizationSpeed)
      .attr('x', (d: number, i: number) => i * (rectWidth + spacing) + 10); // Apply the same spacing during the transition

    const textSelection = this.sortedSvg.selectAll('text')
      .data(this.sortedArray, (d: number) => d);

    textSelection.exit().remove();

    textSelection.enter()
      .append('text')
      .attr('x', (d: number, i: number) => i * (rectWidth + spacing) + 30) // Add spacing to the text elements
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .text((d: number) => d)
      .merge(textSelection)
      .transition()
      .duration(this.visualizationSpeed)
      .attr('x', (d: number, i: number) => i * (rectWidth + spacing) + 30); // Apply the same spacing during the transition
  }

  private updateHeapUI() {
    if (!this.treeData || !d3.select('#heapGraph').node()) {
      console.error('Cannot update heap UI: SVG element not found');
      return;
    }
    this.treeData = this.arrayToTreeData(this.binaryTreeArray)!;
    if (this.treeData) {
      this.drawTree(this.treeData);
    }
  }

  private clearSvg(): void {
    this.treeGroup.selectAll('*').remove();
  }
}
