/* Connection lines — a pulse of light travels along each edge (attack route). */

export const edgesVertex = /* glsl */ `
uniform float uTime;
uniform float uDisperse;
attribute float aProgress; // 0 at source end, 1 at far end
attribute float aSpeed;
attribute vec3 aDir;
varying float vGlow;
varying float vBase;

void main(){
  vec3 pos = position + aDir * uDisperse * 3.0;

  // travelling pulse: a bright band sweeping from 0 -> 1
  float head = fract(uTime * aSpeed);
  float dist = abs(aProgress - head);
  vGlow = smoothstep(0.12, 0.0, dist);
  vBase = 0.10 * (1.0 - uDisperse);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const edgesFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDisperse;
varying float vGlow;
varying float vBase;

void main(){
  vec3 col = mix(uColorB, uColorA, vGlow);
  float a = (vBase + vGlow * 0.9) * (1.0 - uDisperse);
  gl_FragColor = vec4(col, a);
}
`;
