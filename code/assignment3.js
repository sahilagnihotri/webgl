"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var indices = [];
var vertices = [];
///////////////
var coneVertexBuffer = null; //The vertex buffer for the cone
var coneIndexBuffer = null; // The index buffer for the cone
///////////////

var rotationMatrix;
var rotationMatrixLoc;

var  angle = 0.0;
var  axis = [0, 0, 1];

var 	trackingMouse = false;
var   trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;


function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);


	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

         lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }
    render();
}

function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}

function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "r");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    } );

    render();
//    createCone();
//    drawScene();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );

        // for interpolated colors use
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(trackballMove) {
      axis = normalize(axis);
      rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
      gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame( render );
}

function createCone()
{
  vertices =[1.5, 0, 0,0,
     -1.5, 1, 0,0,
     -1.5, 0.809017,	0.587785,0,
     -1.5, 0.309017,	0.951057,0,
     -1.5, -0.309017, 0.951057,0,
     -1.5, -0.809017, 0.587785,0,
     -1.5, -1, 0,0,
     -1.5, -0.809017, -0.587785,0,
     -1.5, -0.309017, -0.951057,0,
     -1.5, 0.309017,	-0.951057,0,
     -1.5, 0.809017,	-0.587785,0];

     indices = [0, 1, 2,
     0, 2, 3,
     0, 3, 4,
     0, 4, 5,
     0, 5, 6,
     0, 6, 7,
     0, 7, 8,
     0, 8, 9,
     0, 9, 10,
     0, 10, 1];

     coneVertexBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

     coneIndexBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     gl.bindBuffer(gl.ARRAY_BUFFER,null);

}

function drawScene(){
  var c_width, c_height = 600;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0,0,c_width, c_height);

/*    mat4.perspective(45, c_width / c_height, 0.1, 10000.0, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

    gl.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);
*/
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prg.vertexPositionAttribute);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
    gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT,0);
}

/**
* Render Loop
*/
function renderLoop() {
    requestAnimFrame(renderLoop);
    drawScene();
}
