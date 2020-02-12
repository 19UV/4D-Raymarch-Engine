// an attribute will receive data from a buffer
attribute vec4 a_position;

varying vec2 uv;

void main() {
  gl_Position = a_position;
  uv = vec2(gl_Position);
}