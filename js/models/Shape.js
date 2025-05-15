export class Shape {
  constructor(props = {}) {
    this.type = this.constructor.name.toLowerCase();
    this.strokeColor = props.strokeColor || '#000000';
    this.fillColor = props.fillColor || '#ffffff';
    this.strokeWeight = props.strokeWeight || 4;
    this.opacity = props.opacity !== undefined ? props.opacity : 100;
  }
}