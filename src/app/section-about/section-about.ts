import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Icon } from '../icon/icon';
import { Appearing } from '../appearing/appearing';
import { onScroll, animate } from 'animejs';

@Component({
  selector: 'app-section-about',
  imports: [Icon, Appearing],
  templateUrl: './section-about.html',
  styleUrl: './section-about.css'
})
export class SectionAbout implements OnInit{
  @ViewChild('pixiContainer', { static: true }) pixiContainer!: ElementRef;
  githubRepos: any[] = [];
  app!: PIXI.Application;

  async ngOnInit() {
  }
}
