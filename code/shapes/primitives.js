/// primitives

(function(window, ShapeCommon) {
  var Sphere = {
    generate: function(opts) {
      var lats = 30,
        longs = 30,
        radius = 1,
        vertices = [],
        indices = [],
        normals = [];

      for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
          var theta = latNumber * Math.PI / lats;
          var phi = longNumber * 2 * Math.PI / longs;
          var sinTheta = Math.sin(theta);
          var sinPhi = Math.sin(phi);
          var cosTheta = Math.cos(theta);
          var cosPhi = Math.cos(phi);

          var x = cosPhi * sinTheta;
          var y = cosTheta;
          var z = sinPhi * sinTheta;

          vertices.push(radius * x);
          vertices.push(radius * y);
          vertices.push(radius * z);
          normals.push(radius * x);
          normals.push(radius * y);
          normals.push(radius * z);
      //    normals.push(1.0);
//          normals.push(vec3(cross(subtract(vec3(y),vec3(x)), subtract(vec3(z),vec3(x)))));
//          console.log(normals);
        }
      }

      for (var latNumberI = 0; latNumberI < lats; ++latNumberI) {
        for (var longNumberI = 0; longNumberI < longs; ++longNumberI) {
          var first = (latNumberI * (longs+1)) + longNumberI;
          var second = first + longs + 1;
          indices.push(first);
          indices.push(second);
          indices.push(first+1);

          indices.push(second);
          indices.push(second+1);
          indices.push(first+1);
        }
      }

      return {
        v: vertices,
        i: indices,
        n: normals
      };
    }

  };

  var Cylinder = {
    generate: function() {
      var vertices = [],
        indices = [],
        normals = [],
        bottomCap = [],
        topCap = [],
        n = 30,
        startAngle = 0;

      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topCap.push(0.0);
      topCap.push(0.0);
      topCap.push(-1.9);
      topCap = topCap.concat(ShapeCommon.createNgon(n, startAngle, -1.9));

      vertices = bottomCap.concat(topCap);

      // Index bottom cap
      for (var i=0; i<n; i++) {
        if (i === n-1) {
          indices.push(0);
          indices.push(n);
          indices.push(1);
        } else {
          indices.push(0);
          indices.push(i+1);
          indices.push(i+2);
        }
      }

      // Index top cap
      var offset = n+1;
      for (var j=0; j<n; j++) {
        if (j === n-1) {
          indices.push(offset);
          indices.push(n + offset);
          indices.push(1 + offset);
        } else {
          indices.push(offset);
          indices.push(j+1 + offset);
          indices.push(j+2 + offset);
        }
      }

      // Index tube connecting top and bottom
      for (var k=1; k<=n-1; k++) {

        // Special handling to "wrap it up"
        if (k === n-1) {

          // first triangle
          indices.push(k);
          indices.push(1);
          indices.push(k + offset);

          // second triangle
          indices.push(k);
          indices.push(1 + offset);
          indices.push(k + offset);

        } else {

          // first triangle
          indices.push(k);
          indices.push(k+1);
          indices.push(k + 1 + offset);

          // second triangle
          indices.push(k);
          indices.push(k + offset);
          indices.push(k + 1 + offset);
        }

      }

      return {
        v: vertices,
        i: indices,
        n: normals
      };
    }

  };

  var Cone = {

    generate: function() {
      var vertices = [],
        indices = [],
        normals = [],
        bottomCap = [],
        topPoint = [],
        n = 30,
        startAngle = 1;

      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topPoint.push(0.0);
      topPoint.push(0.0);
      topPoint.push(1.9);

      vertices = bottomCap.concat(topPoint);

      // Index bottom cap
      for (var i=0; i<n; i++) {
        if (i === n-1) {
          indices.push(0);
          indices.push(n);
          indices.push(1);
        } else {
          indices.push(0);
          indices.push(i+1);
          indices.push(i+2);
        }
      }

      // Join top point to bottom cap
      for (var j=1; j<=n; j++) {
        if (j === n) {
          indices.push(n+1);
          indices.push(j);
          indices.push(1);
        } else {
          indices.push(n+1);
          indices.push(j);
          indices.push(j+1);
        }
      }

      return {
        v: vertices,
        i: indices,
        n: normals
      };
    }
  };

  var ShapeCommon = {
    createNgon: function (n, startAngle, z) {
      var vertices = [],
        dA = Math.PI*2 / n,
        r = 0.9,
        angle,
        x, y;

      for (var i=0; i < n; i++) {
        angle = startAngle + dA*i;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);
      }
      return vertices;
    }
  };

  window.ShapeCommon = ShapeCommon;
  window.Cone = Cone;
  window.Cylinder = Cylinder;
  window.Sphere = Sphere;

})(window, window.ShapeCommon);
