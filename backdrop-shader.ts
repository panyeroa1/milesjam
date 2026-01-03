
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
const vs = `precision highp float;
in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;

const fs = `precision highp float;
out vec4 fragmentColor;
uniform vec2 resolution;
void main() {
  fragmentColor = vec4(253.0/255.0, 252.0/255.0, 248.0/255.0, 1.0);
}
`;

export {fs, vs};
