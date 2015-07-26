"use strict";

var canvas;
var gl;

var maxNumVertices  = 100000;
var index = 0;
var cindex = 0;
var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];
var t = [];
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var widthMap = [4];
////////////////////////
var mousePressed = false;
var ctx;
var isGlIniatized;
var lineWidth=4;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    //debug lib
//    ctx = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
//    gl = WebGLDebugUtils.makeDebugContext(gl, logAndValidate);
    /////
    if ( !gl ) { alert( "WebGL isn't available" ); }

  document.getElementById("color").onchange = function(event) {
    cindex = parseInt(event.target.value);
    console.log(event.target.value);
    render();
  };

    canvas.addEventListener("mousedown", function(event){
        mousePressed = true;
        console.log("MouseDown");
    } );

    canvas.addEventListener("mouseup", function(event){
      if((mousePressed === true) && (isGlIniatized === true))
      {
        numPolygons++;
        numIndices[numPolygons] = 0;
        start[numPolygons] = index;
        widthMap[numPolygons] = lineWidth;
        render();
        t=[];
        mousePressed = false;
      }
      console.log("MouseUP");
    } );

    canvas.addEventListener("mousemove", function(event){
      if(mousePressed=== true)
      {
          t  = vec2(2*event.clientX/canvas.width-1,
             2*(canvas.height-event.clientY)/canvas.height-1);
          gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));

          t = vec4(colors[cindex]);
          gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
          gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));

          numIndices[numPolygons]++;
          index++;
      }
    } );

    document.getElementById("lineWidth").onchange = function(event) {
      lineWidth = parseInt(event.target.value);
      widthMap[numPolygons] = lineWidth;
      console.log(event.target.value);
      render();
    };

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    isGlIniatized = true;
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.lineWidth(lineWidth);
    for(var i=0; i<numPolygons; i++) {
  //      gl.lineWidth(widthMap[i]);
        gl.drawArrays( gl.LINE_STRIP, start[i], numIndices[i] );
    }
}

////////// Debug fxns //////////
function throwOnGLError(err, funcName, args) {
  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

function logGLCall(functionName, args) {
   console.log("gl." + functionName + "(" +
      WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function validateNoneOfTheArgsAreUndefined(functionName, args) {
  for (var ii = 0; ii < args.length; ++ii) {
    if (args[ii] === undefined) {
      console.error("undefined passed to gl." + functionName + "(" +
                     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    }
  }
}

function logAndValidate(functionName, args) {
   logGLCall(functionName, args);
   validateNoneOfTheArgsAreUndefined (functionName, args);
}
//////////////////////////////
