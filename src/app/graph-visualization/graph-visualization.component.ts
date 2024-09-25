import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graph-visualization',
  standalone: true,
  imports: [CommonModule],  // Import CommonModule to use NgFor
  templateUrl: './graph-visualization.component.html',
  styleUrls: ['./graph-visualization.component.css']
})
export class GraphVisualizationComponent implements OnInit, OnChanges {
  @Input() data: number[] = [];
  inputArray: number[] = [];
  binaryTreeArray: number[] = [];
  sortedArray: number[] = [];
  private svg: any;
  private treeGroup: any;
  private width = 800;
  private height = 400;
  private nodeRadius = 20;
  private treeLayout = d3.tree().size([this.width - 200, this.height - 200]);
  private treeData: any = [];
  private animationDelay = 2000;

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
      this.drawTree(this.treeData);
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

  private arrayToTreeData(array: number[]): any {
    if (array.length === 0) return null;

    const nodes = array.map((value, index) => ({ id: index, value, children: [] as any[] }));
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

  private drawTree(treeData: any): void {
    const root = d3.hierarchy(treeData);
    const links = this.treeLayout(root).links();
    const nodes = root.descendants();

    this.treeGroup.selectAll('g').remove();
    this.treeGroup.selectAll('.link').remove();

    this.treeGroup.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('x1', (d: d3.HierarchyPointLink<{ id: number; value: number }>) => d.source.x)
      .attr('y1', (d: d3.HierarchyPointLink<{ id: number; value: number }>) => d.source.y)
      .attr('x2', (d: d3.HierarchyPointLink<{ id: number; value: number }>) => d.target.x)
      .attr('y2', (d: d3.HierarchyPointLink<{ id: number; value: number }>) => d.target.y)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 2);

    const nodeGroup = this.treeGroup.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('transform', (d: d3.HierarchyPointNode<{ id: number; value: number }>) => `translate(${d.x},${d.y})`);

    nodeGroup.append('circle')
      .attr('class', 'node')
      .attr('r', this.nodeRadius)
      .attr('fill', (d: d3.HierarchyPointNode<{ id: number; value: number }>) => this.getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);

    nodeGroup.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .text((d: d3.HierarchyPointNode<{ id: number; value: number }>) => d.data.value);
  }

  private getNodeColor(d: d3.HierarchyPointNode<{ id: number; value: number }>): string {
    // Color parent node orange, children yellow, and others white
    if (d.data.id === this.compareIndices.parent) {
      return 'orange';  // Parent node
    } else if (d.data.id === this.compareIndices.leftChild || d.data.id === this.compareIndices.rightChild) {
      return 'yellow';  // Child nodes
    } else {
      return 'white';  // Other nodes
    }
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
    this.treeData = this.arrayToTreeData(this.binaryTreeArray);  // Update the tree data
    this.drawTree(this.treeData);  // Redraw the tree with the remaining elements
}

  private async heapify(array: number[], n: number, i: number) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    // Set the nodes being compared
    this.compareIndices = { parent: i, leftChild: left < n ? left : null, rightChild: right < n ? right : null };
    this.drawTree(this.arrayToTreeData(array));  // Update the tree with the new colors
    await this.sleep(this.animationDelay);

    // Compare left child
    if (left < n && array[left] > array[largest]) {
      largest = left;
    }

    // Compare right child
    if (right < n && array[right] > array[largest]) {
      largest = right;
    }

    // Swap and continue heapifying if necessary
    if (largest !== i) {
      await this.swapElements(array, i, largest);
      await this.heapify(array, n, largest);
    }
  }

  private async swapElements(array: number[], i: number, j: number) {
    [array[i], array[j]] = [array[j], array[i]];

    this.binaryTreeArray = [...array];
    this.treeData = this.arrayToTreeData(this.binaryTreeArray);

    // Highlight swapped elements
    this.compareIndices = { parent: i, leftChild: null, rightChild: null };  // Highlight only the swapped parent
    this.drawTree(this.treeData);

    await this.sleep(this.animationDelay);

    // Reset compared nodes after swap
    this.compareIndices = { parent: null, leftChild: null, rightChild: null };
    this.drawTree(this.treeData);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
