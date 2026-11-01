import { SIMPLEX_3D } from "./noise.glsl";

/* Pulsing AI core — noise-displaced icosahedron with a fresnel rim. */

export const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uPulse;
varying float vNoise;
varying vec3 vNormalW;
varying vec3 vViewDir;

${SIMPLEX_3D}

void main(){
  vec3 pos = position;
  float n = snoise(normal * 1.4 + uTime * 0.25);
  float displace = n * (0.18 + uPulse * 0.12);
  pos += normal * displace;
  vNoise = n;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform vec3 uColorA; // accent
uniform vec3 uColorB; // secondary
varying float vNoise;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main(){
  float fres = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.4);
  vec3 col = mix(uColorB, uColorA, smoothstep(-0.6, 0.8, vNoise));
  // dark, almost-black interior that lights up at the rim
  vec3 base = mix(vec3(0.02, 0.03, 0.04), col, fres);
  base += col * fres * (1.2 + uPulse);
  // faint internal energy veins
  float veins = smoothstep(0.45, 0.5, abs(vNoise));
  base += uColorA * veins * 0.25;
  gl_FragColor = vec4(base, 0.92);
}
`;
