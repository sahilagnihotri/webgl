"use strict";

var canvas;
var gl;
var program;
var shapes;

var numTimesToSubdivide = 5;
var index = 0;
var pointsArray = [];
var cylinderVertices = [], cylinderIndices = []
var cindex = 0;
var colors = [
    vec3( 0.0, 0.0, 0.0 ),  // black
    vec3( 1.0, 0.0, 0.0 ),  // red
    vec3( 1.0, 1.0, 0.0 ),  // yellow
    vec3( 0.0, 1.0, 0.0 ),  // green
    vec3( 0.0, 0.0, 1.0 ),  // blue
    vec3( 1.0, 0.0, 1.0 ),  // magenta
    vec3( 0.0, 1.0, 1.0 )   // cyan
];

var coneVertices =[1.5, 0, 0,
    -1.5, 1, 0,
    -1.5, 0.809017,	0.587785,
    -1.5, 0.309017,	0.951057,
    -1.5, -0.309017, 0.951057,
    -1.5, -0.809017, 0.587785,
    -1.5, -1, 0,
    -1.5, -0.809017, -0.587785,
    -1.5, -0.309017, -0.951057,
    -1.5, 0.309017,	-0.951057,
    -1.5, 0.809017,	-0.587785];

var coneIndices = [0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 7,
    0, 7, 8,
    0, 8, 9,
    0, 9, 10,
    0, 10, 1];


var camera = {
  modelViewMatrix: mat4(),
  theta: 0,
  phi: 0,
  dz: 0,
  sx: 1,
  sy: 1,
  sz: 1
},
_cameraRotationInc = 15,
_cameraDZInc = 0.5;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);
     index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.5, 0.5, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    defaultValues();

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER,flatten(pointsArray) , gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("Button0").onclick = function(){theta += dr;};
    document.getElementById("Button1").onclick = function(){theta -= dr;};
    document.getElementById("Button2").onclick = function(){phi += dr;};
    document.getElementById("Button3").onclick = function(){phi -= dr;};

    document.getElementById("color").onchange = function(event) {
      cindex = parseInt(event.target.value);
      console.log(event.target.value);
      render();
    };

    render();
}

/*
function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

//   gl.drawArrays( gl.TRIANGLES, 0, index );

    for( var i=0; i<index; i+=3)
       gl.drawArrays( gl.LINE_LOOP, i, 3 );

    window.requestAnimFrame(render);

}
*/
function render()
{
//  var shape = cylinder.generate;
  renderShape(shape);
}


function renderShape(shape)
{
  // Load shaders
  gl.useProgram(program);

  // Load index data onto GPU
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(coneIndices), gl.STATIC_DRAW);

  // Load vertex buffer onto GPU
  var vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(coneVertices), gl.STATIC_DRAW );

  // Associate shader variables with vertex data buffer
  var vPosition = gl.getAttribLocation( program, 'vPosition' );
  gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // Uniform vars for user specified parameters
  var colorLoc = gl.getUniformLocation(program, 'fColor');
  var thetaLoc = gl.getUniformLocation(program, 'theta');
  var scaleLoc = gl.getUniformLocation(program, 'scale');
  var translateLoc = gl.getUniformLocation(program, 'translate');
  var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix" );

/*  gl.uniform3fv(thetaLoc, camera.theta);
  gl.uniform3fv(scaleLoc, camera.scale);
  gl.uniform3fv(translateLoc, shape.translate);
  gl.uniform4fv(colorLoc, shape.color);
  gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(camera.modelViewMatrix) );
*/
  gl.drawElements( gl.LINE_LOOP, coneIndices.length, gl.UNSIGNED_SHORT, 0 );
//  gl.drawElements( gl.LINE_LOOP, 30, gl.UNSIGNED_SHORT, 0 );
}

var addShape = function(shapeType, editing) {
  var shape = {type: shapeType},
    shapeVI;

  shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );

  if (editing) {
    shapeVI = Shape.generate(shapeType, {outlineOnly: true});
  } else {
    shapeVI = Shape.generate(shapeType);
  }
  shape.vertices = shapeVI.v;
  shape.indices = shapeVI.i;

  shape.color = ColorUtils.hexToGLvec4(document.getElementById('shapeColor').value);

  shape.theta = [
    document.getElementById('rotateX').valueAsNumber,
    document.getElementById('rotateY').valueAsNumber,
    document.getElementById('rotateZ').valueAsNumber
  ];

  if (editing) {
    shape.scale = [
      document.getElementById('scaleX').valueAsNumber * 1.1,
      document.getElementById('scaleY').valueAsNumber * 1.1,
      document.getElementById('scaleZ').valueAsNumber * 1.1
    ];
  } else {
    shape.scale = [
      document.getElementById('scaleX').valueAsNumber,
      document.getElementById('scaleY').valueAsNumber,
      document.getElementById('scaleZ').valueAsNumber
    ];
  }

  shape.translate = [
    document.getElementById('translateX').valueAsNumber,
    document.getElementById('translateY').valueAsNumber,
    document.getElementById('translateZ').valueAsNumber
  ];

  return shape;
};


function defaultValues()
{
  document.getElementById('rotateX').value = 60;
  document.getElementById('rxv').value = 60;
  document.getElementById('rotateY').value = 0;
  document.getElementById('ryv').value = 0;
  document.getElementById('rotateZ').value = 0;
  document.getElementById('rzv').value = 0;

  document.getElementById('scaleX').value = 0.2;
  document.getElementById('sxv').value = 0.2;
  document.getElementById('scaleY').value = 0.2;
  document.getElementById('syv').value = 0.2;
  document.getElementById('scaleZ').value = 0.2;
  document.getElementById('szv').value = 0.2;

  document.getElementById('translateX').value = 0;
  document.getElementById('txv').value = 0;
  document.getElementById('translateY').value = 0;
  document.getElementById('tyv').value = 0;
  document.getElementById('translateZ').value = 0;
  document.getElementById('tzv').value = 0;
}
