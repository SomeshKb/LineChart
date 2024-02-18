import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { data } from './data';
import { TimeSeries } from './types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  @ViewChild("canvas") canvas!: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null = null;

  public lineData: TimeSeries[] = data;
  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private renderer2: Renderer2) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.canvas)
      return;

    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.drawAxis();
    const { max, min } = this.findMinMax(this.lineData);

    const firstTimestamp = Object.keys(data[0])[0];
    const lastTimestamp = Object.keys(data[data.length - 1])[0];
    const timeDifferenceInMilliseconds = this.getTimeDifferenceInMilliseconds(firstTimestamp, lastTimestamp);
    const timeDifferenceInSeconds = timeDifferenceInMilliseconds / 1000; // Convert milliseconds to seconds
    this.calculateXY(550 / timeDifferenceInSeconds, 400 / (max - min), max, min);
  }

  drawAxis() {
    if (!this.ctx)
      return;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(50, 20);
    this.ctx.lineTo(50, 450)
    this.ctx.lineTo(550, 450);
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
    const firstDate = this.parseTimestamp(firstTimestamp);
    const lastDate = this.parseTimestamp(lastTimestamp);
    return Math.abs(lastDate.getTime() - firstDate.getTime());
  }




  plotXY(pointData: any[]) {
    if (!this.ctx)
      return

    this.ctx.beginPath();

    // Draw line
    pointData.map((point, index) => {

      if (!this.ctx)
        return;

      if (index == 0)
        this.ctx.moveTo(point.x, point.y);

      this.ctx.lineTo(point.x, point.y);

    });
    this.ctx.stroke();

    // draw circle
    pointData.map((point, index) => {
      if (!this.ctx)
      return;

      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      this.ctx.stroke();

      this.ctx.font = "10px Arial";
      this.ctx.fillText(point.value, point.x+5, point.y);
    })




  }

  calculateXY(x_diff: number, y_diff: number, max: number, min: number) {
    console.log(x_diff, y_diff);

    const points: any[] = [];
    const startTime = this.parseTimestamp(Object.keys(this.lineData[0])[0]);

    this.lineData.map(x => {
      const key = this.parseTimestamp(Object.keys(x)[0]);
      const value = Object.values(x)[0];
      const timeDiff = (key.getTime() - startTime.getTime()) / 1000;
      const valueDiff = max-value ;
      const obj = {
        x: 50 + 10 + (timeDiff * x_diff),
        y: 20 + (valueDiff * y_diff),
        time: key,
        value: value,
      }
      // console.log(obj)
      points.push(obj);
    });

    this.plotXY(points);



  }

}
