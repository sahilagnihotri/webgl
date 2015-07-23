//
// webgl simple square
// author: saagn(sahil agnihoti)
// just checking some stuff
//

var gl;
var points;

window.onload = function init()
{
  //window is the global window setted outside
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if(!gl) { alert("WebGl isnt available");  }
  var vertices = [-0.5, -0.5,
    -0.5, 0.5,
    0.5, 0.5,
    0.5, -0.5 ];
//alternative var vertices = [vec2(-0.5,-0.5), vec2(-0.5,0.5), vec2(0.5,0.5), vec2(0.5, -0.5)];

//configure webgl
  gl.viewport(0,0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //Load the shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  //load the data into the buffers
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  //associate variables in program with variables in shaders
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0,0);  // false parameter dont normalize the data
  //First 0 is offset
  //second one is how far apart are data values kindoff striding
  gl.enableVertexAttribArray( vPosition );

  render();

};

function render()
{
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
