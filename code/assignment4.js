(function(window) {
   var Shape = {
     generate: function(shapeName, opts) {
       return window[shapeName].generate(opts);
     }
   };
   window.Shape = Shape;
 })(window);

(function(window, Shape) {
  var gl,
    _canvas,
    _shapes = [],
    editing = true,
    _camera = {
      modelViewMatrix: mat4(),
      theta: 0,
      phi: 0,
      dz: 0,
      sx: 1,
      sy: 1,
      sz: 1,
      radius: 1.5
    },
    _cameraRotationInc = 15,
    _cameraDZInc = 0.5;

    var cindex = 0;
    var colors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
    ];

/////////////////// lights camera actipn
var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

/*
var lightPosition = [];
lightPosition.push(vec4(1.0, 1.0, 1.0, 0.0 )); //Defualt
var lightAmbient = [];
lightAmbient.push(vec4(0.2, 0.2, 0.2, 1.0 ));
var lightDiffuse = [];
lightDiffuse.push(vec4( 1.0, 1.0, 1.0, 1.0 ));
var lightSpecular = [];
lightSpecular.push(vec4( 1.0, 1.0, 1.0, 1.0 ));
*/

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

////////////////////////////////////////

var renderShape = function(shape) {
    gl.useProgram(shape.program);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
  //  console.log("ambient is: "+ambientProduct);
  //  console.log("diffuse is: "+diffuseProduct);
  //  console.log("specular is: "+specularProduct);
    // Load index data onto GPU
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

    // Load vertex buffer onto GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( shape.program, 'vPosition' );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( shape.program, 'vNormal' );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

  //  var colorLoc = gl.getUniformLocation(shape.program, 'fColor');
    var thetaLoc = gl.getUniformLocation(shape.program, 'theta');
    var scaleLoc = gl.getUniformLocation(shape.program, 'scale');
    var translateLoc = gl.getUniformLocation(shape.program, 'translate');
    var modelViewMatrixLoc = gl.getUniformLocation(shape.program, "modelViewMatrix" );
    var normalMatrixLoc = gl.getUniformLocation( shape.program, "normalMatrix" );

    gl.uniform3fv(thetaLoc, shape.theta);
    gl.uniform3fv(scaleLoc, shape.scale);
    gl.uniform3fv(translateLoc, shape.translate);
  //  gl.uniform4fv(colorLoc, shape.color);

/*  eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
      radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

  modelViewMatrix = lookAt(eye, at , up);
  projectionMatrix = ortho(left, right, bottom, ytop, near, far);
*/  normalMatrix = [
      vec3(_camera.modelViewMatrix[0][0], _camera.modelViewMatrix[0][1], _camera.modelViewMatrix[0][2]),
      vec3(_camera.modelViewMatrix[1][0], _camera.modelViewMatrix[1][1], _camera.modelViewMatrix[1][2]),
      vec3(_camera.modelViewMatrix[2][0], _camera.modelViewMatrix[2][1], _camera.modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(_camera.modelViewMatrix) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(shape.program, "diffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(shape.program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(shape.program, "shininess"),materialShininess );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

//    gl.drawElements( gl.LINE_LOOP, shape.indices.length, gl.UNSIGNED_SHORT, 0 );
    gl.drawElements( gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0 );
  };

  var render = function(shapes, oneShape) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (oneShape) {
      renderShape(oneShape, true);
      renderShape(oneShape);
    }

    shapes.forEach(function(shape) {
      renderShape(shape);
    });

  };

  function addShape(shapeType) {
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
    shape.normals = shapeVI.n;
//    var i = (document.getElementById('color').value);

//    shape.color = colors[i];
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

  var updateCamera = function(evt) {
    var t, ry, rx, s, modelView;
    ry = rotateY(_camera.phi);
    rx = rotateX(_camera.theta);
    s = genScaleMatrix(_camera.sx, _camera.sy, _camera.sz);

    modelView = mat4();
    modelView = mult(modelView, ry);
    modelView = mult(modelView, rx);
    modelView = mult(modelView, s);
    _camera.modelViewMatrix = modelView;
    render(_shapes);
  };

  function update(evt) {
    var shapeSelect = document.getElementById('shape');

    if(evt.target.id === 'aR' ) { lightAmbient[0] = evt.target.value;  }
    if(evt.target.id === 'aG' ) { lightAmbient[1] = evt.target.value;  }
    if(evt.target.id === 'aB' ) { lightAmbient[2] = evt.target.value;  }
    if(evt.target.id === 'aA' ) { lightAmbient[3] = evt.target.value;  }
    if(evt.target.id === 'dR' ) { lightDiffuse[0] = evt.target.value;  }
    if(evt.target.id === 'dG' ) { lightDiffuse[1] = evt.target.value;  }
    if(evt.target.id === 'dB' ) { lightDiffuse[2] = evt.target.value;  }
    if(evt.target.id === 'dA' ) { lightDiffuse[3] = evt.target.value;  }
    if(evt.target.id === 'sR' ) { lightSpecular[0] = evt.target.value; }
    if(evt.target.id === 'sG' ) { lightSpecular[1] = evt.target.value; }
    if(evt.target.id === 'sB' ) { lightSpecular[2] = evt.target.value; }
    if(evt.target.id === 'sA' ) { lightSpecular[3] = evt.target.value; }

    if(evt.target.id === 'aMR' ) { materialAmbient[0] = evt.target.value;  }
    if(evt.target.id === 'aMG' ) { materialAmbient[1] = evt.target.value;  }
    if(evt.target.id === 'aMB' ) { materialAmbient[2] = evt.target.value;  }
    if(evt.target.id === 'aMA' ) { materialAmbient[3] = evt.target.value;  }
    if(evt.target.id === 'dMR' ) { materialDiffuse[0] = evt.target.value;  }
    if(evt.target.id === 'dMG' ) { materialDiffuse[1] = evt.target.value;  }
    if(evt.target.id === 'dMB' ) { materialDiffuse[2] = evt.target.value;  }
    if(evt.target.id === 'dMA' ) { materialDiffuse[3] = evt.target.value;  }
    if(evt.target.id === 'sMR' ) { materialSpecular[0] = evt.target.value; }
    if(evt.target.id === 'sMG' ) { materialSpecular[1] = evt.target.value; }
    if(evt.target.id === 'sMB' ) { materialSpecular[2] = evt.target.value; }
    if(evt.target.id === 'sMA' ) { materialSpecular[3] = evt.target.value; }
    if(evt.target.id === 'shine' ) { materialShininess = evt.target.value; }

    console.log("shien is: "+materialShininess);
//    console.log("diffuse is: "+lightDiffuse);
//    console.log("specular is: "+lightSpecular);

    var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;

    if (evt.target.id === 'commitShape' || evt.target.id === 'commitShapeIcon') {
         editing = false;
         _shapes.push(addShape(shapeType));
         render(_shapes);
         document.getElementById("commitShape").disabled = true;
         document.getElementById("newShape").disabled = false;
         editing = true;

       }

    if (evt.target.id === 'newShape' || evt.target.id === 'newShapeIcon') {
      editing = true;
      setDefaults();
      edit();
      document.getElementById("commitShape").disabled = false;
      document.getElementById("newShape").disabled = true;
    }

    if (evt.target.id === 'clear' || evt.target.id === 'clearIcon') {
      editing = true;
      _shapes = [];
      setDefaults();
      document.getElementById("newShape").disabled = true;
      document.getElementById("commitShape").disabled = false;

      document.getElementById('shape').value = 'Sphere';
      document.getElementById('color').value = 0;
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
      edit();
    }

  };

  var edit = function() {
    if (editing) {
      var shapeSelect = document.getElementById('shape');
      var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;
      var shapeToEdit = addShape(shapeType);

      shapeToEdit.border = addShape(shapeType, true);
      render(_shapes, shapeToEdit);
      }
  };

  var setDefaults = function() {
    _camera = {
      modelViewMatrix: mat4(),
      theta: 0,
      phi: 0,
      dz: 0,
      sx: 1,
      sy: 1,
      sz: 1
    };
    document.getElementById("newShape").disabled = true;
  };

  var App = {

    init: function() {
      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register event handlers
      document.getElementById('settings').addEventListener('click', update);
      document.getElementById('settings').addEventListener('change', edit);
      document.getElementById('settings').addEventListener('return', edit);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.5, 0.5, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);

      // Seed the system with one shape
      setDefaults();
      edit();
    }
  };
  window.App = App;

}(window, window.Shape));

document.addEventListener('DOMContentLoaded', function() { App.init(); });
