import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: '<header class="panel-head"><h3>{{ title }}</h3><span>{{ subtitle }}</span></header>'
})
export class AppPageHeader {
  @Input() title = '';
  @Input() subtitle = '';
}
