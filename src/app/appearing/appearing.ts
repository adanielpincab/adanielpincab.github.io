import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-appearing',
  imports: [],
  templateUrl: './appearing.html',
  styleUrl: './appearing.css',
  host: {
    '[class.visible]': 'isVisible',
    '[style.animation-delay]': 'delay'
  }
})
export class Appearing implements AfterViewInit, OnDestroy {
  isVisible = false;
  delay = null as string | null;
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {
    this.calculateDelay();
  }

  calculateDelay() {
    this.delay = Math.random() * 0.5 + 's';
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.calculateDelay();
          }
          this.isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
