import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { RainSettings } from '../types';

export interface RainCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
}

interface RainCanvasProps {
  rainSettings: RainSettings;
  width: number;
  height: number;
  internalWidth: number;
  internalHeight: number;
  backgroundCanvas?: HTMLCanvasElement | null;
  bgVersion?: number;
}

// Vertex shader
const VS_SOURCE = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// Faithful Heartfelt Rain GLSL Fragment Shader
// Features: Aspect-compensated round droplets, DropLayer2 sliding droplets with trails & bead chains,
// multi-scale static condensation drops, finite-difference 3D normals, true background refraction,
// specular highlights, dark meniscus rim, and decoupled parameters.
const FS_SOURCE = `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uBackground;
  uniform int uHasBackground;
  uniform vec2 uResolution;
  uniform float uTimeSlide;
  uniform float uTimeRate;

  uniform float uRainRate;
  uniform float uRainDensity;
  uniform float uDropSize;
  uniform float uTrailDensity;
  uniform float uSlideSpeed;
  uniform float uTrailLength;
  uniform float uRefraction;

  // Noise hash functions from Heartfelt (Dave Hoskins hash)
  vec3 N13(float p) {
    vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
  }

  float N(float t) {
    return fract(sin(t * 12345.564) * 7658.76);
  }

  // Strict GLSL Sawtooth function: edge0 < edge1 guaranteed everywhere
  float Saw(float b, float t) {
    float up = smoothstep(0.0, b, t);
    float down = 1.0 - smoothstep(b, 1.0, t);
    return up * down;
  }

  // Sliding drop layer with aspect compensation, sinusoidal sway, tail streak, and bead droplets
  vec2 DropLayer2(vec2 uv, float tSlide, float tRate, float dropSize, float trailDensity, float trailLength, float rainDensity) {
    vec2 UV = uv;
    uv.y += tSlide * 0.75;
    vec2 a = vec2(6.0, 1.0);
    vec2 grid = a * 2.0;
    vec2 id = floor(uv * grid);
    float colShift = N(id.x);
    uv.y += colShift;
    id = floor(uv * grid);
    vec3 n = N13(id.x * 35.2 + id.y * 2376.1);

    // Spatial density threshold
    if (n.x > rainDensity * 1.15) {
      return vec2(0.0);
    }

    vec2 st = fract(uv * grid) - vec2(0.5, 0.0);
    float x = n.x - 0.5;
    float y = UV.y * 20.0;
    float wiggle = sin(y + sin(y));
    x += wiggle * (0.5 - abs(x)) * (n.z - 0.5);
    x *= 0.7;

    // Cycle sawtooth driven by uRainRate, independent of downward sliding speed
    float ti = fract(tRate * 0.6 + n.z);
    y = (Saw(0.85, ti) - 0.5) * 0.9 + 0.5;
    vec2 p = vec2(x, y);

    // Round distance field with aspect correction: length((st - p) * a.yx)
    // a.yx is vec2(1.0, 6.0), fully compensating the 12:2 grid deformation
    float d = length((st - p) * a.yx);
    float mainDrop = 1.0 - smoothstep(0.0, 0.4 * dropSize, d);

    // Trail calculation: strict edge0 < edge1
    float r = sqrt(clamp(1.0 - smoothstep(y, 1.0, st.y), 0.0, 1.0));
    float cd = abs(st.x - x);
    float trail = 1.0 - smoothstep(0.14 * r * r * dropSize, 0.24 * r * dropSize, cd);
    float trailFront = smoothstep(-0.02, 0.02, st.y - y);

    // Trail length cut-off governed by uTrailLength
    float maxTrail = 0.75 * trailLength;
    float trailCut = 1.0 - smoothstep(0.0, maxTrail, st.y - y);
    trail *= trailFront * r * r * trailCut;

    // Tail droplets / bead chain along the path
    y = UV.y;
    float trail2 = 1.0 - smoothstep(0.0, 0.22 * r * dropSize, cd);
    y = fract(y * 10.0) + (st.y - 0.5);
    float dd = length((st - vec2(x, y)) * a.yx * 0.5);
    float droplets = 1.0 - smoothstep(0.0, 0.26 * dropSize, dd);

    // Trail density control: probability of drop producing visible trail
    float hasTrail = step(1.0 - clamp(trailDensity * 1.15, 0.0, 1.0), n.y);
    float m = mainDrop + (droplets * r * trailFront + trail * 0.5) * hasTrail;

    return vec2(m, trail * hasTrail);
  }

  // Static condensation droplets across the glass pane
  float StaticDrops(vec2 uv, float tRate, float dropSize, float rainRate, float rainDensity) {
    uv *= 38.0;
    vec2 id = floor(uv);
    uv = fract(uv) - 0.5;
    vec3 n = N13(id.x * 107.45 + id.y * 3543.654);

    if (n.x > rainDensity * 1.1) {
      return 0.0;
    }

    vec2 p = (n.xy - 0.5) * 0.7;
    float d = length(uv - p);

    float fade = (rainRate > 0.01) ? Saw(0.04, fract(tRate * 0.12 + n.z)) : 1.0;
    float c = (1.0 - smoothstep(0.0, 0.3 * dropSize, d)) * fract(n.z * 10.0) * fade;
    return c;
  }

  // Combine multi-scale drops
  vec2 Drops(vec2 uv, float tSlide, float tRate) {
    float staticMult = smoothstep(-0.2, 1.0, uRainDensity) * 1.7;
    float layer1Mult = smoothstep(0.1, 0.8, uRainDensity);
    float layer2Mult = smoothstep(0.0, 0.6, uRainDensity);

    float s = StaticDrops(uv, tRate, uDropSize, uRainRate, uRainDensity) * staticMult;
    vec2 m1 = DropLayer2(uv, tSlide, tRate, uDropSize, uTrailDensity, uTrailLength, uRainDensity) * layer1Mult;
    vec2 m2 = DropLayer2(uv * 1.85, tSlide * 1.12, tRate * 1.1, uDropSize * 0.85, uTrailDensity * 0.8, uTrailLength, uRainDensity) * layer2Mult;

    float c = s + m1.x + m2.x;
    c = smoothstep(0.2, 0.9, c);

    return vec2(c, max(m1.y * layer1Mult, m2.y * layer2Mult));
  }

  void main() {
    // Screen aspect-ratio normalized UV
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    // Standard normalized screen UV (0 to 1) for texture sampling
    vec2 UV = gl_FragCoord.xy / uResolution.xy;

    vec2 c = Drops(uv, uTimeSlide, uTimeRate);

    // Outside droplet: completely transparent to preserve underlying Canvas & drawing
    if (c.x <= 0.003) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    // Normal calculation via finite differences (accurate 3D physical slope)
    vec2 e = vec2(0.001, 0.0);
    float cx = Drops(uv + e, uTimeSlide, uTimeRate).x;
    float cy = Drops(uv + e.yx, uTimeSlide, uTimeRate).x;
    vec2 n = vec2(cx - c.x, cy - c.x);

    // True optical refraction offset
    vec2 refractUV = UV - n * (0.055 * uRefraction);
    refractUV = clamp(refractUV, vec2(0.001), vec2(0.999));

    // Sample background texture or neutral glass tint
    vec3 bgCol;
    if (uHasBackground == 1) {
      bgCol = texture2D(uBackground, refractUV).rgb;
    } else {
      bgCol = vec3(0.25, 0.32, 0.4);
    }

    // 3D Normal for specular reflection and meniscus
    vec3 N_vec = normalize(vec3(-n * 2.8, 0.7));
    vec3 lightDir1 = normalize(vec3(-0.35, 0.75, 0.65));
    vec3 lightDir2 = normalize(vec3(0.4, 0.5, 0.7));

    // Specular highlights
    float spec1 = pow(max(0.0, dot(N_vec, lightDir1)), 28.0) * 1.3;
    float spec2 = pow(max(0.0, dot(N_vec, lightDir2)), 14.0) * 0.4;
    float specular = spec1 + spec2;

    // Dark meniscus boundary for 3D liquid depth
    float normLen = length(n);
    float rim = smoothstep(0.06, 0.32, normLen);

    // Water droplet liquid coloration
    vec3 dropColor = bgCol * (1.0 - rim * 0.4);
    dropColor += vec3(1.0, 1.0, 1.0) * specular;
    dropColor += vec3(0.85, 0.93, 1.0) * (rim * 0.22);

    // Alpha channel: crisp antialiased droplet boundary with bright specular transmission
    float alpha = smoothstep(0.003, 0.12, c.x) * 0.95;
    alpha = max(alpha, clamp(specular * 0.85, 0.0, 1.0));

    // Output straight RGBA without internal blend (browser composites cleanly)
    gl_FragColor = vec4(dropColor, alpha);
  }
`;

export const RainCanvas = forwardRef<RainCanvasRef, RainCanvasProps>(({
  rainSettings,
  width,
  height,
  internalWidth,
  internalHeight,
  backgroundCanvas,
  bgVersion,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fallback2DRef = useRef<boolean>(false);

  // Independent time accumulators for decoupled motion
  const slideTimeRef = useRef<number>(0);
  const rateTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Texture state
  const bgTextureRef = useRef<WebGLTexture | null>(null);
  const hasBgTextureRef = useRef<boolean>(false);

  // Cached uniform locations
  const uniformsRef = useRef<{
    uBackground?: WebGLUniformLocation | null;
    uHasBackground?: WebGLUniformLocation | null;
    uResolution?: WebGLUniformLocation | null;
    uTimeSlide?: WebGLUniformLocation | null;
    uTimeRate?: WebGLUniformLocation | null;
    uRainRate?: WebGLUniformLocation | null;
    uRainDensity?: WebGLUniformLocation | null;
    uDropSize?: WebGLUniformLocation | null;
    uTrailDensity?: WebGLUniformLocation | null;
    uSlideSpeed?: WebGLUniformLocation | null;
    uTrailLength?: WebGLUniformLocation | null;
    uRefraction?: WebGLUniformLocation | null;
  }>({});

  // Expose canvas for export compositor
  useImperativeHandle(ref, () => ({
    getCanvas: () => {
      if (!rainSettings.enabled) return null;
      return canvasRef.current;
    },
  }));

  // Upload or update background texture
  const updateBackgroundTexture = useCallback((canvasSource?: HTMLCanvasElement | null) => {
    const gl = glRef.current;
    const source = canvasSource || backgroundCanvas;
    if (!gl || !source || source.width === 0 || source.height === 0) return;

    try {
      if (!bgTextureRef.current) {
        bgTextureRef.current = gl.createTexture();
      }
      gl.bindTexture(gl.TEXTURE_2D, bgTextureRef.current);
      // Flip Y so texture UV matches gl_FragCoord Y orientation
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      hasBgTextureRef.current = true;
    } catch (e) {
      console.warn('Could not upload background texture for rain refraction:', e);
      hasBgTextureRef.current = false;
    }
  }, [backgroundCanvas]);

  // Initialize WebGL
  const initWebGL = useCallback((): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    if (canvas.width !== internalWidth || canvas.height !== internalHeight) {
      canvas.width = internalWidth;
      canvas.height = internalHeight;
    }

    if (glRef.current && programRef.current) {
      return true;
    }

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        antialias: true,
      });

      if (!gl) {
        gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      }
    } catch (e) {
      console.warn('WebGL context creation threw error, falling back to 2D:', e);
      fallback2DRef.current = true;
      return false;
    }

    if (!gl) {
      console.warn('WebGL not supported, falling back to 2D canvas rain');
      fallback2DRef.current = true;
      return false;
    }

    glRef.current = gl;

    // Helper to compile shader
    const compileShader = (type: number, source: string): WebGLShader | null => {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Rain Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vertShader || !fragShader) {
      fallback2DRef.current = true;
      return false;
    }

    const program = gl.createProgram();
    if (!program) {
      fallback2DRef.current = true;
      return false;
    }
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Rain Shader linking error:', gl.getProgramInfoLog(program));
      fallback2DRef.current = true;
      return false;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Full screen quad geometry
    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    uniformsRef.current = {
      uBackground: gl.getUniformLocation(program, 'uBackground'),
      uHasBackground: gl.getUniformLocation(program, 'uHasBackground'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uTimeSlide: gl.getUniformLocation(program, 'uTimeSlide'),
      uTimeRate: gl.getUniformLocation(program, 'uTimeRate'),
      uRainRate: gl.getUniformLocation(program, 'uRainRate'),
      uRainDensity: gl.getUniformLocation(program, 'uRainDensity'),
      uDropSize: gl.getUniformLocation(program, 'uDropSize'),
      uTrailDensity: gl.getUniformLocation(program, 'uTrailDensity'),
      uSlideSpeed: gl.getUniformLocation(program, 'uSlideSpeed'),
      uTrailLength: gl.getUniformLocation(program, 'uTrailLength'),
      uRefraction: gl.getUniformLocation(program, 'uRefraction'),
    };

    // Note: Do not enable gl.BLEND for full-screen quad transparent overlay!
    // This prevents double alpha attenuation, gray edges, and background brightening.
    gl.disable(gl.BLEND);

    // Initial background texture update
    updateBackgroundTexture();

    return true;
  }, [internalWidth, internalHeight, updateBackgroundTexture]);

  // Sync internal resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (canvas.width !== internalWidth || canvas.height !== internalHeight) {
      canvas.width = internalWidth;
      canvas.height = internalHeight;
    }

    const gl = glRef.current;
    if (gl) {
      gl.viewport(0, 0, internalWidth, internalHeight);
    }
  }, [internalWidth, internalHeight]);

  // Mount effect to initialize WebGL
  useEffect(() => {
    initWebGL();

    return () => {
      const gl = glRef.current;
      const program = programRef.current;
      const texture = bgTextureRef.current;
      if (gl) {
        if (texture) gl.deleteTexture(texture);
        if (program) gl.deleteProgram(program);
      }
      bgTextureRef.current = null;
      glRef.current = null;
      programRef.current = null;
    };
  }, [initWebGL]);

  // Update background texture whenever bgVersion or backgroundCanvas changes
  useEffect(() => {
    if (backgroundCanvas) {
      updateBackgroundTexture(backgroundCanvas);
    }
  }, [backgroundCanvas, bgVersion, updateBackgroundTexture]);

  // 2D Fallback animation state
  const fallbackDropsRef = useRef<Array<{
    x: number;
    y: number;
    speed: number;
    radius: number;
    trail: Array<{ x: number; y: number; r: number; alpha: number }>;
  }>>([]);

  // Render loop effect
  useEffect(() => {
    // If rain is disabled, stop RAF immediately & clear canvas
    if (!rainSettings.enabled) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      const canvas = canvasRef.current;
      const gl = glRef.current;
      if (gl && canvas) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      } else if (canvas) {
        const ctx2d = canvas.getContext('2d');
        ctx2d?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Rain is enabled: ensure WebGL or fallback is initialized
    if (!glRef.current && !fallback2DRef.current) {
      initWebGL();
    }

    let isRunning = true;
    lastTimeRef.current = performance.now();

    // Initialize 2D fallback drops if needed
    if (fallback2DRef.current && fallbackDropsRef.current.length === 0) {
      const count = Math.round(35 * rainSettings.rainDensity);
      fallbackDropsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * internalWidth,
        y: Math.random() * internalHeight,
        speed: (1.5 + Math.random() * 3.0) * Math.max(0.1, rainSettings.slideSpeed),
        radius: (3 + Math.random() * 4) * rainSettings.dropSize,
        trail: [],
      }));
    }

    const render = () => {
      if (!isRunning) return;

      const canvas = canvasRef.current;
      const gl = glRef.current;
      const program = programRef.current;
      const u = uniformsRef.current;

      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // Independent time integration
      slideTimeRef.current += dt * rainSettings.slideSpeed;
      rateTimeRef.current += dt * rainSettings.rainRate;

      // 1. Primary High-Performance WebGL Shader Path
      if (gl && program && canvas) {
        gl.useProgram(program);

        if (gl.drawingBufferWidth !== canvas.width || gl.drawingBufferHeight !== canvas.height) {
          gl.viewport(0, 0, canvas.width, canvas.height);
        }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Ensure background texture is loaded
        if (!hasBgTextureRef.current && backgroundCanvas) {
          updateBackgroundTexture(backgroundCanvas);
        }

        // Bind background texture to unit 0
        if (hasBgTextureRef.current && bgTextureRef.current) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, bgTextureRef.current);
          if (u.uBackground) gl.uniform1i(u.uBackground, 0);
          if (u.uHasBackground) gl.uniform1i(u.uHasBackground, 1);
        } else {
          if (u.uHasBackground) gl.uniform1i(u.uHasBackground, 0);
        }

        // Feed real-time uniforms
        if (u.uResolution) gl.uniform2f(u.uResolution, canvas.width, canvas.height);
        if (u.uTimeSlide) gl.uniform1f(u.uTimeSlide, slideTimeRef.current);
        if (u.uTimeRate) gl.uniform1f(u.uTimeRate, rateTimeRef.current);
        if (u.uRainRate) gl.uniform1f(u.uRainRate, rainSettings.rainRate);
        if (u.uRainDensity) gl.uniform1f(u.uRainDensity, rainSettings.rainDensity);
        if (u.uDropSize) gl.uniform1f(u.uDropSize, rainSettings.dropSize);
        if (u.uTrailDensity) gl.uniform1f(u.uTrailDensity, rainSettings.trailDensity);
        if (u.uSlideSpeed) gl.uniform1f(u.uSlideSpeed, rainSettings.slideSpeed);
        if (u.uTrailLength) gl.uniform1f(u.uTrailLength, rainSettings.trailLength);
        if (u.uRefraction) gl.uniform1f(u.uRefraction, rainSettings.refraction);

        // Render full-screen quad
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } 
      // 2. High-Quality 2D Canvas Fallback (if WebGL unavailable)
      else if (canvas && fallback2DRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const drops = fallbackDropsRef.current;

          drops.forEach((d) => {
            d.y += d.speed * (rainSettings.slideSpeed / 1.0);
            if (d.y > internalHeight + 50) {
              d.y = -20;
              d.x = Math.random() * internalWidth;
              d.trail = [];
            }

            // Record trail
            if (rainSettings.trailDensity > 0.05 && Math.random() < 0.4) {
              d.trail.push({
                x: d.x + (Math.random() - 0.5) * 1.5,
                y: d.y,
                r: d.radius * 0.4,
                alpha: 0.8 * rainSettings.trailDensity,
              });
            }

            // Draw trail beads
            for (let i = d.trail.length - 1; i >= 0; i--) {
              const tr = d.trail[i];
              tr.alpha -= 0.005;
              if (tr.alpha <= 0) {
                d.trail.splice(i, 1);
                continue;
              }
              ctx.beginPath();
              ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(220, 235, 255, ${tr.alpha * 0.45})`;
              ctx.fill();
            }

            // Draw round main raindrop
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(235, 245, 255, 0.45)';
            ctx.fill();

            // Specular glint
            ctx.beginPath();
            ctx.arc(d.x - d.radius * 0.35, d.y - d.radius * 0.35, d.radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
          });
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [
    rainSettings.enabled,
    rainSettings.rainRate,
    rainSettings.rainDensity,
    rainSettings.dropSize,
    rainSettings.trailDensity,
    rainSettings.slideSpeed,
    rainSettings.trailLength,
    rainSettings.refraction,
    initWebGL,
    internalWidth,
    internalHeight,
    backgroundCanvas,
    updateBackgroundTexture,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: rainSettings.enabled ? 'block' : 'none',
      }}
      className="absolute inset-0 w-full h-full block pointer-events-none z-[25]"
    />
  );
});

RainCanvas.displayName = 'RainCanvas';
