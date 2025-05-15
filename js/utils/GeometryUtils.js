export function distToSegment(px, py, x1, y1, x2, y2) {
  const lineLength = distBetween(x1, y1, x2, y2);
  
  if (lineLength === 0) {
    return distBetween(px, py, x1, y1);
  }
  
  // Calculate projection
  const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength * lineLength);
  
  if (t < 0) {
    return distBetween(px, py, x1, y1);
  }
  if (t > 1) {
    return distBetween(px, py, x2, y2);
  }
  
  return distBetween(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

export function distBetween(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}