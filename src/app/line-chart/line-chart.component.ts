import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { TimeSeries } from '../types';
import * as data from './../data.json';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent {

  @ViewChild("canvas") canvas!: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null = null;

  lineWidth = 1;
  lineColor = "#000"
  circleColor = "#000"
  circleRadius = 3;
  circleHoverRadius = 6;
  canvasWidth = 0;
  canvasHeight = 0;
  lineData: TimeSeries[] = data.data as any[];
  isBrowser: boolean;
  pointData: any[] = [];
  hoveredIndex = -1;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {


    console.log(data);
    if (!this.canvas)
      return;

    this.canvasHeight = this.canvas.nativeElement.height;
    this.canvasWidth = this.canvas.nativeElement.width;

    this.ctx = this.canvas.nativeElement.getContext('2d');

    const { max, min } = this.findMinMax(this.lineData);

    const firstTimestamp = Object.keys(this.lineData[0])[0];
    const lastTimestamp = Object.keys(this.lineData[this.lineData.length - 1])[0];
    const timeDifferenceInMilliseconds = this.getTimeDifferenceInMilliseconds(firstTimestamp, lastTimestamp);
    const timeDifferenceInSeconds = timeDifferenceInMilliseconds / 1000;
    this.calculateXYCoordinates((this.canvasWidth - 70) / timeDifferenceInSeconds, (this.canvasHeight - 100) / (max - min), max);
    this.enableMouseMove();
    this.drawAxis(max,min);
  }


  plotTravesingLine(mouseX: number, mouseY: number) {
    if (!this.ctx)
      return;
    this.ctx.beginPath();
    this.ctx.moveTo(51, mouseY);
    this.ctx.lineTo(mouseX, mouseY)
    this.ctx.lineTo(mouseX, this.canvasHeight - 51);
    this.ctx.stroke();
  }

  plotText(mouseX: number, mouseY: number, text: string) {
    if (!this.ctx)
      return;
    this.ctx.font = "8px Comic Sans MS";
    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 1;
    this.ctx.strokeText(text, mouseX, mouseY);
  }

  enableMouseMove() {
    this.canvas.nativeElement.addEventListener("mousemove", (event) => {
      const mouseEvent = event as MouseEvent;
      let skipRest = false;
      const mouseX = mouseEvent.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
      const mouseY = mouseEvent.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

      if (!this.ctx)
        return;
      if (mouseX > 50 && mouseY > 10 && mouseY < (this.canvasHeight - 51) && mouseX < (this.canvasWidth - 1)) {
        this.ctx.clearRect(51, 0, this.canvasWidth, this.canvasHeight - 51);
        this.plotTravesingLine(mouseX, mouseY);
        this.plotCircle();
        this.plotLine();
      } else {
        this.ctx.clearRect(51, 0, this.canvasWidth, this.canvasHeight - 51);
        this.plotCircle();
        this.plotLine();
      }
      this.pointData.forEach((point, index) => {
        if (!this.ctx)
          return;

        const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);

        if (distance <= 5) {
          skipRest = true;
          this.hoveredIndex = index;
          this.ctx.clearRect(51, 0, this.canvasWidth, this.canvasHeight - 51);
          this.plotTravesingLine(mouseX, mouseY);
          this.plotLine();
          this.plotCircle();
          this.plotText(mouseX + 10, mouseY, new Date(point.time).toLocaleString() + " : " + point.value);
        }
      });

      if (skipRest) {
        return;
      }

      if (this.hoveredIndex != -1) {
        if (!this.ctx)
          return;
        this.hoveredIndex = -1;
        this.ctx.clearRect(51, 0, this.canvasWidth, this.canvasHeight - 51);
        this.plotLine();
        this.plotCircle();
      }

    });


  }


  onMouseMove() {
    this.canvas.nativeElement.addEventListener("mousemove", (event) => {
      const mouseEvent = event as MouseEvent;

      let skipRest = false;

      const mouseX = mouseEvent.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
      const mouseY = mouseEvent.clientY - this.canvas.nativeElement.getBoundingClientRect().top;


    });
  }

  drawAxis(maxValue: number, minValue: number) {
    if (!this.ctx)
      return;
    this.ctx.beginPath();
    this.ctx.moveTo(50, 20);
    this.ctx.lineTo(50, this.canvasHeight - 50)
    this.ctx.lineTo(this.canvasWidth - 5, this.canvasHeight - 50);
    this.ctx.lineWidth = 0.3;
    this.ctx.stroke();
  }

  findMinMax(data: TimeSeries[]): { min: number, max: number } {
    let values: number[] = data.map(entry => Object.values(entry)[0]);
    let min: number = Math.min(...values);
    let max: number = Math.max(...values);
    return { min, max };
  }


  parseTimestamp(timestamp: string): Date {
    const [datePart, timePart] = timestamp.split(' ');
    const [day, month, year] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  }

  getTimeDifferenceInMilliseconds(firstTimestamp: string, lastTimestamp: string): number {
    // const firstDate = this.parseTimestamp(firstTimestamp);
    // const lastDate = this.parseTimestamp(lastTimestamp);
    return Math.abs(parseInt(lastTimestamp) - parseInt(firstTimestamp));
  }




  plotLine() {
    if (!this.ctx)
      return

    this.ctx.beginPath();

    // Draw line
    this.pointData.map((point, index) => {

      if (!this.ctx)
        return;

      if (index == 0)
        this.ctx.moveTo(point.x, point.y);

      this.ctx.lineTo(point.x, point.y);
      this.ctx.strokeStyle = this.lineColor;

    });
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke();


  }

  plotCircle() {
    // Draw circle
    this.pointData.map((point, index) => {
      if (!this.ctx)
        return;

      this.ctx.beginPath();
      if (this.hoveredIndex == index) {
        this.ctx.arc(point.x, point.y, this.circleHoverRadius, 0, 2 * Math.PI);
      } else {
        this.ctx.arc(point.x, point.y, this.circleRadius, 0, 2 * Math.PI);
      }
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.circleColor;
      this.ctx.stroke();
    });
  }

  calculateXYCoordinates(x_diff: number, y_diff: number, max: number) {
    const startTime = parseInt(Object.keys(this.lineData[0])[0]); // Update parse Function

    this.lineData.map(x => {
      const key = parseInt(Object.keys(x)[0]); // Update parse Function
      const value = Object.values(x)[0];
      const timeDiff = (key - startTime) / 1000;
      const valueDiff = max - value;
      const obj = {
        x: 50 + 10 + (timeDiff * x_diff),
        y: 20 + (valueDiff * y_diff),
        time: key,
        value: value,
      }
      this.pointData.push(obj);
    });

    this.plotLine();
    this.plotCircle();
  }

}

