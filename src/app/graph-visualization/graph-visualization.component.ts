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
  styleUrls: ['./graph-visualization.component.css']
})
export class GraphVisualizationComponent implements OnInit, OnChanges {
  @Input() data: number[] = [];
  @Input() heapType: string = 'min';  // Default to 'min' heap, can also be 'max'
  @Input() visualizationSpeed: number = 1000;  // Default speed for visualization
  inputArray: number[] = [];
  binaryTreeArray: number[] = [];
  sortedArray: number[] = [];
  private svg: any;
  private treeGroup: any;
  private width = 800;
  private height = 400;
  private nodeRadius = 20;
  private treeLayout = d3.tree<Node>().size([this.width - 200, this.height - 200]);  // Fixed: explicitly typed with Node
  private treeData: Node | null = null;
  private animationDelay = 2000;
  @Output() animationComplete = new EventEmitter<void>();  // Event emitted when animation completes

  // Variables to track the indices of the parent and children being compared
  private compareIndices: { parent: number | null, leftChild: number | null, rightChild: number | null } = { parent: null, leftChild: null, rightChild: null };

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
      
      // Ensure treeData is not null before drawing the tree
      if (this.treeData) {
        this.drawTree(this.treeData);
      }
      
      this.startHeapSortAnimation();
    }
  }

  private createSvg(): void {
    this.svg = d3.select('#heapGraph')
      .attr('width', this.width)
      .attr('height', this.height);

    this.treeGroup = this.svg.append('g')
      .attr('transform', 'translate(0, 40)');
  }

  private arrayToTreeData(array: number[]): Node | null {
    if (array.length === 0) return null;

    const nodes: Node[] = array.map((value, index) => ({ id: index, value, children: [] }));
    nodes.forEach((node, index) => {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      if (leftChildIdx < array.length) {
        node.children.push(nodes[leftChildIdx]);  // Fixed: children is now properly typed as Node[]
      }
      if (rightChildIdx < array.length) {
        node.children.push(nodes[rightChildIdx]);  // Fixed: children is now properly typed as Node[]
      }
    });
    return nodes[0];
  }

  private drawTree(treeData: Node): void {
    // Use the fixed type for d3.hierarchy<Node>()
    const root = d3.hierarchy<Node>(treeData);
    const links = this.treeLayout(root).links();
    const nodes = root.descendants();

    this.treeGroup.selectAll('g').remove();
    this.treeGroup.selectAll('.link').remove();

    this.treeGroup.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('x1', (d: d3.HierarchyPointLink<Node>) => d.source.x)
      .attr('y1', (d: d3.HierarchyPointLink<Node>) => d.source.y)
      .attr('x2', (d: d3.HierarchyPointLink<Node>) => d.target.x)
      .attr('y2', (d: d3.HierarchyPointLink<Node>) => d.target.y)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 2);

    const nodeGroup = this.treeGroup.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('transform', (d: d3.HierarchyPointNode<Node>) => `translate(${d.x},${d.y})`);

    nodeGroup.append('circle')
      .attr('class', 'node')
      .attr('r', this.nodeRadius)
      .attr('fill', (d: d3.HierarchyPointNode<Node>) => this.getNodeColor(d))
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

    nodeGroup.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .text((d: d3.HierarchyPointNode<Node>) => d.data.value.toString());
  }

  private getNodeColor(d: d3.HierarchyPointNode<Node>): string {
    // Color parent node orange, children yellow, and others white
    if (d.data.id === this.compareIndices.parent) {
      return 'orange';  // Parent node
    } else if (d.data.id === this.compareIndices.leftChild || d.data.id === this.compareIndices.rightChild) {
      return 'yellow';  // Child nodes
    } else {
      return 'white';  // Other nodes
    }
  }

   // Method to clear all elements from the SVG once sorting is done
   private clearSvg(): void {
    this.treeGroup.selectAll('*').remove(); // Remove all child elements of the SVG group
  }

  private async startHeapSortAnimation() {
    let array = [...this.binaryTreeArray];
    let n = array.length;

    // Build the heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await this.heapify(array, n, i);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      await this.swapElements(array, 0, i);

      // Move the last element from heap to sorted array
      this.sortedArray.unshift(array.pop()!);  
      this.updateSortedArrayUI();
      this.updateHeapUI();

      await this.heapify(array, i, 0);
    }

    // Handle the last element in the heap
    this.sortedArray.unshift(array[0]);
    this.binaryTreeArray = [];  // Empty the heap array after the last element is moved
    this.updateSortedArrayUI();
    this.updateHeapUI();  // Redraw the tree as empty
    this.clearSvg();

    this.animationComplete.emit();
  }

  private async heapify(array: number[], n: number, i: number) {
    let largestOrSmallest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    // Set the nodes being compared
    this.compareIndices = { parent: i, leftChild: left < n ? left : null, rightChild: right < n ? right : null };
    if (this.treeData) {
      this.drawTree(this.treeData);  // Update the tree with the new colors
    }
    await this.sleep(this.visualizationSpeed);

    if (this.heapType === 'min') {
      // Min heap comparison logic (smallest at the top)
      if (left < n && array[left] < array[largestOrSmallest]) {
        largestOrSmallest = left;
      }
      if (right < n && array[right] < array[largestOrSmallest]) {
        largestOrSmallest = right;
      }
    } else {
      // Max heap comparison logic (largest at the top)
      if (left < n && array[left] > array[largestOrSmallest]) {
        largestOrSmallest = left;
      }
      if (right < n && array[right] > array[largestOrSmallest]) {
        largestOrSmallest = right;
      }
    }

    // Swap and continue heapifying if necessary
    if (largestOrSmallest !== i) {
      await this.swapElements(array, i, largestOrSmallest);
      await this.heapify(array, n, largestOrSmallest);
    }
  }

  private async swapElements(array: number[], i: number, j: number) {
    [array[i], array[j]] = [array[j], array[i]];

    this.binaryTreeArray = [...array];
    this.treeData = this.arrayToTreeData(this.binaryTreeArray)!;

    // Highlight swapped elements
    this.compareIndices = { parent: i, leftChild: null, rightChild: null };  // Highlight only the swapped parent
    this.drawTree(this.treeData);

    await this.sleep(this.visualizationSpeed);

    // Reset compared nodes after swap
    this.compareIndices = { parent: null, leftChild: null, rightChild: null };
    this.drawTree(this.treeData);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateSortedArrayUI() {
    const sortedContainer = document.getElementById('sortedArray');
    if (sortedContainer) {
      sortedContainer.innerHTML = '';  // Clear the sorted array container

      // Add each element in the sorted array to the UI
      this.sortedArray.forEach(value => {
        const box = document.createElement('div');
        box.className = 'array-box sorted-box';  // Add sorted-box class for styling
        box.innerText = value.toString();
        sortedContainer.appendChild(box);
      });
    }
  }

  private updateHeapUI() {
    this.treeData = this.arrayToTreeData(this.binaryTreeArray)!;  // Update the tree data
    if (this.treeData) {
      this.drawTree(this.treeData);  // Redraw the tree with the remaining elements
    }
  }
}
