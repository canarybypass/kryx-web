/* Node cloud — soft glowing point sprites, with twinkle + scroll dispersion. */

export const nodesVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uDisperse;     // 0 = formed, 1 = scattered
uniform vec3  uPointer;      // world-space pointer target
uniform float uPointerForce;
attribute float aScale;
attribute float aSeed;
attribute vec3 aDir;         // dispersion direction
varying float vAlpha;
varying float vSeed;

void main(){
  vec3 pos = position;

  // gentle idle drift
  pos += aDir * sin(uTime * 0.4 + aSeed * 6.2831) * 0.05;

  // cursor attraction — nodes near the pointer lean toward it
  float d = distance(pos, uPointer);
  float pull = smoothstep(2.2, 0.0, d) * uPointerForce;
  pos += normalize(uPointer - pos) * pull * 0.4;

  // scroll dispersion — fly outward and fade
  pos += aDir * uDisperse * (3.0 + aSeed * 4.0);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float twinkle = 0.6 + 0.4 * sin(uTime * 1.5 + aSeed * 12.0);
  gl_PointSize = uSize * aScale * twinkle * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;

  vAlpha = (1.0 - uDisperse) * (0.5 + pull * 1.2);
  vSeed = aSeed;
}
`;

export const nodesFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vSeed;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, r);
  float core = smoothstep(0.18, 0.0, r);
  vec3 col = mix(uColorB, uColorA, step(0.5, fract(vSeed * 7.3)));
  vec3 c = col * glow + vec3(1.0) * core * 0.6;
  gl_FragColor = vec4(c, glow * vAlpha);
}
`;
