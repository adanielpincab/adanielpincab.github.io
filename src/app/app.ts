import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Hero } from './hero/hero';
import { Footer } from './footer/footer';
import { SectionAbout } from './section-about/section-about';
import { Background } from './background/background';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Hero, Footer, SectionAbout, Background],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'adp';
}
