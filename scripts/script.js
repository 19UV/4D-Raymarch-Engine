var frag_source, vert_source;

var to_load = 2;

var iTime = 0;

var timedelta = 0;

var shape_val = 0;

var _XY, _YZ, _XZ, _XW, _YW, _ZW = 0;
var uXY, uYZ, uXZ, uXW, uYW, uZW;

function reset() {
  _XY = document.getElementById("_XY").value = 0;
  _YZ = document.getElementById("_YZ").value = 0;
  _XZ = document.getElementById("_XZ").value = 0;
  
  _XW = document.getElementById("_XW").value = 0;
  _YW = document.getElementById("_YW").value = 0;
  _ZW = document.getElementById("_ZW").value = 0;
}

function update_sliders() {
  shape_val = parseInt(document.getElementById("shape").value);

  _XY = document.getElementById("_XY").value/50;
  _YZ = document.getElementById("_YZ").value/50;
  _XZ = document.getElementById("_XZ").value/50;
  
  _XW = document.getElementById("_XW").value/50;
  _YW = document.getElementById("_YW").value/50;
  _ZW = document.getElementById("_ZW").value/50;

  timedelta = document.getElementById('time').value/500;
}

function load() {
  console.log('loading shaders...');

  console.log('  loading fragment shader...')
  var frag_get = new XMLHttpRequest();
  frag_get.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200 && this.responseText != "") {
      frag_source = this.responseText.trim();
      to_load--;
      console.log('  downloaded fragment shader')
      if (to_load == 0) {init()};
    }
  };
  
  frag_get.open("GET", "shaders/fragment.glsl", true);
  frag_get.send();

  console.log('  loading vertex shader...')
  var vert_get = new XMLHttpRequest();
  vert_get.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200 && this.responseText != "") {
      vert_source = this.responseText.trim();
      to_load--;
      console.log('  downloaded vertex shader')
      if (to_load == 0) {init()};
    }
  };
  vert_get.open("GET", "shaders/vertex.glsl", true);
  vert_get.send();
}

var canvas, gl;

function init() {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext('webgl');
   
  if (!gl) {
    alert("WebGL not supported on this device.");
  }

  console.log('creating shaders...');
  
  console.log('  creating fragment shader...')
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frag_source);
  
  console.log('  creating vertex shader...');
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vert_source);

  console.log('creating program...')
  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var positions = [
    -1, -1,
    -1, 1,
    1, -1,
    -1, 1,
    1, 1,
    1, -1
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  iTimeUniform = gl.getUniformLocation(program, "iTime");
  gl.uniform1f (iTimeUniform, iTime);

  uXY = gl.getUniformLocation(program, "tXY");
  uYZ = gl.getUniformLocation(program, "tYZ");
  uXZ = gl.getUniformLocation(program, "tXZ");
  uXW = gl.getUniformLocation(program, "tXW");
  uYW = gl.getUniformLocation(program, "tYW");
  uZW = gl.getUniformLocation(program, "tZW");

  uShape = gl.getUniformLocation(program, "uShape");
  gl.uniform1f(uShape, shape_val);

  gl.uniform1f (uXY, _XY);
  gl.uniform1f (uYZ, _YZ);
  gl.uniform1f (uXZ, _XZ);
  gl.uniform1f (uXW, _XW);
  gl.uniform1f (uYW, _YW);
  gl.uniform1f (uZW, _ZW);
 
  requestAnimationFrame(render);
  
  function render() {
    update_sliders();

    iTime += timedelta;

    gl.uniform1f(uShape, shape_val);

    resize();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.uniform1f (iTimeUniform, iTime);

    gl.uniform1f (uXY, _XY);
    gl.uniform1f (uYZ, _YZ);
    gl.uniform1f (uXZ, _XZ);
    gl.uniform1f (uXW, _XW);
    gl.uniform1f (uYW, _YW);
    gl.uniform1f (uZW, _ZW);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 2;
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false;
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = positions.length/size;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(render);
  }
}

var iTimeUniform;

/*
function resize() {
  var ax = Math.min(window.innerHeight, window.innerWidth);
  canvas.height = canvas.width = ax;
}
*/
function resize() {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = window.innerWidth;
  var displayHeight = window.innerHeight;
 
  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    // Make the canvas the same size
    canvas.width  = canvas.height = Math.min(displayWidth, displayHeight);
  }
}