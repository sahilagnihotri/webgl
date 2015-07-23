"use strict";

var canvas;
var gl;
var ctx; //debuging

var points = [];
var numTimesToSubdivide = 4;
var angle = 45; // initila angle
var bufferId;
var renderMode = "homework";
var fillType = "mesh";
var geometry = "triangle";

window.onload = init;

function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );

    ctx = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
    gl = WebGLDebugUtils.makeDebugContext(gl, logAndValidate);

    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.5, 0.5, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    document.getElementById("subDivideSlider").onchange = function(event) {
      numTimesToSubdivide = parseInt(event.target.value);
      console.log(event.target.value);
      renderTriangle();
    };

    document.getElementById("twistValue").onchange = function(){
      console.log(event.target.value);
      angle = parseInt(event.target.value);
      renderTriangle();
    };

    document.getElementById("fill").onchange = function(){
      console.log(event.target.value);
      fillType = event.target.value;
      renderTriangle();
    };

    render();
};

function gasket()
{

}

function render(){
  if ( geometry == "triangle") renderTriangle();
  if ( geometry == "square") renderSquare();
};

function reset()
{
//    points = [];
    document.getElementById('subDivideSlider').value = 4;
    numTimesToSubdivide = 4;
    document.getElementById("twistValue").value = 30;
    angle = 30;
    document.getElementById('demoType').selectedIndex = 1;
    renderTriangle();

};

var calculateDistance = function(vec2Point) {
  var xSquared = Math.pow(vec2Point[0], 2);
  var ySquared = Math.pow(vec2Point[1], 2);
  return Math.sqrt(xSquared + ySquared);
};

function calculateRotation(vec2Point, theta) {
  var distance = calculateDistance(vec2Point);
  var originalX = vec2Point[0];
  var originalY = vec2Point[1];
  var newX = (originalX * Math.cos(distance * theta)) - (originalY * Math.sin(distance * theta));
  var newY = (originalX * Math.sin(distance * theta)) + (originalY * Math.cos(distance * theta));
  return vec2(newX, newY);
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function rotate( p, theta) {
    var radians = (Math.PI / 180) * theta;
    var d = Math.sqrt(p[0]* p[0] + p[1] * p[1]);
    var s = Math.sin( radians*d );
    var c = Math.cos( radians*d );

    var p0 = -s * p[0] + c * p[1];
    var p1 =  s * p[1] + c * p[0];

    p[0] = p0;
    p[1] = p1;
}

function divideTriangle( a, b, c, count )
{
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
        --count;
        // four new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, ac, bc, count );
    }
}

var addSquare = function(a, b, c, e) {
  points.push(a, b, c);
  points.push(c, e, a);
};

function divideSquare( a, b, c, d, count )
{
    if ( count == 0 ) {
        addSquare( a, b, c, d );
    }
    else {
      var ad = mix(a, d, 0.5);
      var ab = mix(a, b, 0.5);
      var bc = mix(b, c, 0.5);
      var cd = mix(c, e, 0.5);
      var adbc = mix(ad, bc, 0.5);
      --count;
      divideSquare(ab, b, bc, adbc, count);   // bottom right
      divideSquare(ad, adbc, cd, d, count);   // top left
      divideSquare(adbc, bc, c, cd, count);   // top right
      divideSquare(a, ab, adbc, ad, count);   // bottom left
    }
}

var addSquare = function(a, b, c, e) {
  points.push(a, b, c);
  points.push(c, e, a);
};

function divideSquare( a, b, c, d, count )
{
    if ( count == 0 ) {
        addSquare( a, b, c, d );
    }
    else {
      var ad = mix(a, d, 0.5);
      var ab = mix(a, b, 0.5);
      var bc = mix(b, c, 0.5);
      var cd = mix(c, e, 0.5);
      var adbc = mix(ad, bc, 0.5);
      --count;
      divideSquare(ab, b, bc, adbc, count);   // bottom right
      divideSquare(ad, adbc, cd, d, count);   // top left
      divideSquare(adbc, bc, c, cd, count);   // top right
      divideSquare(a, ab, adbc, ad, count);   // bottom left
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

function renderTriangle()
{
/*    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];
*/
    var vertices = [
      vec2(-(Math.sqrt(3)/2), -0.5),   // bottom left
      vec2(0, 1),                      // top middle
      vec2((Math.sqrt(3)/2), -0.5)     // bottom right
    ];

    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2], numTimesToSubdivide);

  //  var radians = (Math.PI / 180) * 30;
    var rotatedPoints = points.map(function(vertex) {
      return rotate(vertex, angle);
    });

//   gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

  gl.clear( gl.COLOR_BUFFER_BIT );

  if (fillType === 'solid') {
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
  }

  if (fillType === 'mesh') {
    for (var i=0; i<points.length; i+=3)
      gl.drawArrays( gl.LINE_LOOP, i, 3);
  }
  points = [];

}

function renderSquare()
{
  var vertices = [
         vec2( 0,  1),
         vec2( 1,  0),
         vec2(-1,  0 ),
         vec2( 0, -1)
     ];

/*     var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];
*/
    points = [];
    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    numTimesToSubdivide);

    var rotatedPoints = points.map(function(vertex) {
      return rotate(vertex, angle);
    });

    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    gl.clear( gl.COLOR_BUFFER_BIT );

    if (fillType === 'solid') {
      gl.drawArrays( gl.TRIANGLES, 0, points.length );
    }

    if (fillType === 'mesh') {
      for (var i=0; i<points.length; i+=4)
        gl.drawArrays( gl.LINE_LOOP, i, 4);
    }
    points = [];
}
