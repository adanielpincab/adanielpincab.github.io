import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Contacto } from '../contacto/contacto';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, Contacto],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
}
