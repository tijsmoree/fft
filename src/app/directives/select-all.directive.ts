import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: 'textarea[appSelectAll]',
})
export class SelectAllDirective {
  private element = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  @HostListener('click')
  onClick() {
    this.element.nativeElement.select();
  }
}
