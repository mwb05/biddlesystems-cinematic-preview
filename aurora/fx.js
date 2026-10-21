/* Option 1: Aurora effects.
   - WebGL fragment shader: domain-warped noise ribbons behind the page, palette shifts with scroll
   - glass shapes in the hero drift with the cursor and scroll (parallax depth)
   - before/after halo spins with the pinned stage progress
   - statement line scales up as it enters the viewport */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener('pointermove', function (e) {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }, { passive: true });

  /* ---- aurora shader ---- */
  var canvas = document.getElementById('aurora');
  var gl = canvas && (canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }));
  var render = null;
  if (gl) {
    var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform float s;uniform vec2 m;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/r;',
      ' vec2 p=(gl_FragCoord.xy-.5*r)/r.y;',
      ' p+=(m-.5)*vec2(.18,-.12);',
      ' float tt=t*.05;',
      ' vec2 q=vec2(fbm(p*1.3+vec2(tt,0.)),fbm(p*1.3+vec2(3.1,-tt)));',
      ' float f=fbm(p*1.1+1.8*q+vec2(tt*1.3,s*1.6));',
      ' float y=p.y+(f-.5)*1.1-s*.9+.15;',
      ' float rib=exp(-pow(y*2.4,2.))+.55*exp(-pow((y+.55)*3.2,2.));',
      ' vec3 blue=vec3(.42,.56,1.),violet=vec3(.62,.42,1.),teal=vec3(.17,.88,.76),rose=vec3(1.,.38,.66);',
      ' vec3 a=mix(blue,violet,smoothstep(.0,.45,s));a=mix(a,rose,smoothstep(.55,1.,s)*.7);',
      ' vec3 b=mix(teal,blue,smoothstep(.2,.7,s));',
      ' vec3 col=mix(a,b,clamp(q.x*1.6-.4,0.,1.));',
      ' float glow=rib*(.35+1.1*f*f)+pow(f,3.)*.35;',
      ' vec3 o=vec3(.027,.035,.06)+col*glow*.62;',
      ' o*=1.-.6*pow(length(uv-.5),1.6);',
      ' gl_FragColor=vec4(o,1.);',
      '}'
    ].join('\n');
    var sh = function (type, src) { var x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't');
      var uS = gl.getUniformLocation(prog, 's'), uM = gl.getUniformLocation(prog, 'm');
      var scale = 0.5; /* render at half resolution: it is a soft background, nobody can tell */
      var size = function () {
        canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
        canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      size();
      window.addEventListener('resize', size);
      var sSmooth = 0;
      render = function (time) {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var sp = docH > 0 ? window.scrollY / docH : 0;
        sSmooth += (sp - sSmooth) * 0.06;
        gl.uniform2f(uR, canvas.width, canvas.height);
        gl.uniform1f(uT, time / 1000);
        gl.uniform1f(uS, sSmooth);
        gl.uniform2f(uM, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    }
  }

  /* ---- parallax glass, halo, statement ---- */
  var shapes = Array.prototype.slice.call(document.querySelectorAll('#glass .g'));
  var shift = document.getElementById('shift');
  var halo = document.querySelector('.shift-halo');
  var stmt = document.querySelector('[data-scale]');

  function frame(time) {
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    if (render) render(reduced ? 8000 : time);

    var y = window.scrollY, vh = window.innerHeight;
    if (!reduced) {
      shapes.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 1;
        el.style.transform = (el.classList.contains('g-pill') ? 'rotate(-18deg) ' : '') +
          'translate3d(' + ((mouse.x - 0.5) * -40 * d).toFixed(1) + 'px,' + ((mouse.y - 0.5) * -30 * d - y * 0.25 * d).toFixed(1) + 'px,0)';
      });
      if (halo && shift) {
        var p = clamp((y - shift.offsetTop) / Math.max(1, shift.offsetHeight - vh), 0, 1);
        halo.style.setProperty('--sp', p.toFixed(4));
      }
      if (stmt) {
        var r = stmt.getBoundingClientRect();
        var k = clamp(1 - (r.top + r.height / 2 - vh / 2) / vh, 0, 1);
        stmt.style.setProperty('--sc', (0.72 + 0.28 * k).toFixed(4));
        stmt.style.setProperty('--so', (0.2 + 0.8 * k).toFixed(4));
      }
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduced) window.addEventListener('resize', function () { requestAnimationFrame(frame); });
})();
