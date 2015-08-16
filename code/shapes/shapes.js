function createTruncatedConeVertices(
     bottomRadius,
     topRadius,
     height,
     radialSubdivisions,
     verticalSubdivisions,
     opt_topCap,
     opt_bottomCap) {
   if (radialSubdivisions < 3) {
     throw Error('radialSubdivisions must be 3 or greater');
   }

   if (verticalSubdivisions < 1) {
     throw Error('verticalSubdivisions must be 1 or greater');
   }

   var topCap = (opt_topCap === undefined) ? true : opt_topCap;
   var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

   var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

   var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
   var positions = webglUtils.createAugmentedTypedArray(3, numVertices);
   var normals   = webglUtils.createAugmentedTypedArray(3, numVertices);
   var texCoords = webglUtils.createAugmentedTypedArray(2, numVertices);
   var indices   = webglUtils.createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra) * 2, Uint16Array);

   var vertsAroundEdge = radialSubdivisions + 1;

   // The slant of the cone is constant across its surface
   var slant = Math.atan2(bottomRadius - topRadius, height);
   var cosSlant = Math.cos(slant);
   var sinSlant = Math.sin(slant);

   var start = topCap ? -2 : 0;
   var end = verticalSubdivisions + (bottomCap ? 2 : 0);

   for (var yy = start; yy <= end; ++yy) {
     var v = yy / verticalSubdivisions;
     var y = height * v;
     var ringRadius;
     if (yy < 0) {
       y = 0;
       v = 1;
       ringRadius = bottomRadius;
     } else if (yy > verticalSubdivisions) {
       y = height;
       v = 1;
       ringRadius = topRadius;
     } else {
       ringRadius = bottomRadius +
         (topRadius - bottomRadius) * (yy / verticalSubdivisions);
     }
     if (yy === -2 || yy === verticalSubdivisions + 2) {
       ringRadius = 0;
       v = 0;
     }
     y -= height / 2;
     for (var ii = 0; ii < vertsAroundEdge; ++ii) {
       var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
       var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
       positions.push(sin * ringRadius, y, cos * ringRadius);
       normals.push(
           (yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
           (yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
           (yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant));
       texCoords.push((ii / radialSubdivisions), 1 - v);
     }
   }

   for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {
     for (var ii = 0; ii < radialSubdivisions; ++ii) {
       indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                    vertsAroundEdge * (yy + 0) + 1 + ii,
                    vertsAroundEdge * (yy + 1) + 1 + ii);
       indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                    vertsAroundEdge * (yy + 1) + 1 + ii,
                    vertsAroundEdge * (yy + 1) + 0 + ii);
     }
   }

   return {
     position: positions,
     normal: normals,
     texcoord: texCoords,
     indices: indices,
   };
 }

 /**
  * Expands RLE data
  * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
  * @param {number[]} [padding] value to add each entry with.
  * @return {number[]} the expanded rleData
  */
 function expandRLEData(rleData, padding) {
   padding = padding || [];
   var data = [];
   for (var ii = 0; ii < rleData.length; ii += 4) {
     var runLength = rleData[ii];
     var element = rleData.slice(ii + 1, ii + 4);
     element.push.apply(element, padding);
     for (var jj = 0; jj < runLength; ++jj) {
       data.push.apply(data, element);
     }
   }
   return data;
 }

function createSphereVertices(
     radius,
     subdivisionsAxis,
     subdivisionsHeight,
     opt_startLatitudeInRadians,
     opt_endLatitudeInRadians,
     opt_startLongitudeInRadians,
     opt_endLongitudeInRadians) {
   if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
     throw Error('subdivisionAxis and subdivisionHeight must be > 0');
   }

   opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
   opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
   opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
   opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

   var latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
   var longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

   // We are going to generate our sphere by iterating through its
   // spherical coordinates and generating 2 triangles for each quad on a
   // ring of the sphere.
   var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
   var positions = webglUtils.createAugmentedTypedArray(3, numVertices);
   var normals   = webglUtils.createAugmentedTypedArray(3, numVertices);
   var texCoords = webglUtils.createAugmentedTypedArray(2 , numVertices);

   // Generate the individual vertices in our vertex buffer.
   for (var y = 0; y <= subdivisionsHeight; y++) {
     for (var x = 0; x <= subdivisionsAxis; x++) {
       // Generate a vertex based on its spherical coordinates
       var u = x / subdivisionsAxis;
       var v = y / subdivisionsHeight;
       var theta = longRange * u;
       var phi = latRange * v;
       var sinTheta = Math.sin(theta);
       var cosTheta = Math.cos(theta);
       var sinPhi = Math.sin(phi);
       var cosPhi = Math.cos(phi);
       var ux = cosTheta * sinPhi;
       var uy = cosPhi;
       var uz = sinTheta * sinPhi;
       positions.push(radius * ux, radius * uy, radius * uz);
       normals.push(ux, uy, uz);
       texCoords.push(1 - u, v);
     }
   }

   var numVertsAround = subdivisionsAxis + 1;
   var indices = webglUtils.createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
   for (var x = 0; x < subdivisionsAxis; x++) {
     for (var y = 0; y < subdivisionsHeight; y++) {
       // Make triangle 1 of quad.
       indices.push(
           (y + 0) * numVertsAround + x,
           (y + 0) * numVertsAround + x + 1,
           (y + 1) * numVertsAround + x);

       // Make triangle 2 of quad.
       indices.push(
           (y + 1) * numVertsAround + x,
           (y + 0) * numVertsAround + x + 1,
           (y + 1) * numVertsAround + x + 1);
     }
   }

   return {
     position: positions,
     normal: normals,
     texcoord: texCoords,
     indices: indices,
   };
 }

function createPlaneVertices(
      width,
      depth,
      subdivisionsWidth,
      subdivisionsDepth,
      matrix) {
    width = width || 1;
    depth = depth || 1;
    subdivisionsWidth = subdivisionsWidth || 1;
    subdivisionsDepth = subdivisionsDepth || 1;
    matrix = matrix || math3d.makeIdentity();

    var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
    var positions = webglUtils.createAugmentedTypedArray(3, numVertices);
    var normals = webglUtils.createAugmentedTypedArray(3, numVertices);
    var texcoords = webglUtils.createAugmentedTypedArray(2, numVertices);

    for (var z = 0; z <= subdivisionsDepth; z++) {
      for (var x = 0; x <= subdivisionsWidth; x++) {
        var u = x / subdivisionsWidth;
        var v = z / subdivisionsDepth;
        positions.push(
            width * u - width * 0.5,
            0,
            depth * v - depth * 0.5);
        normals.push(0, 1, 0);
        texcoords.push(u, v);
      }
    }

    var numVertsAcross = subdivisionsWidth + 1;
    var indices = webglUtils.createAugmentedTypedArray(
        3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);

    for (var z = 0; z < subdivisionsDepth; z++) {
      for (var x = 0; x < subdivisionsWidth; x++) {
        // Make triangle 1 of quad.
        indices.push(
            (z + 0) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x,
            (z + 0) * numVertsAcross + x + 1);

        // Make triangle 2 of quad.
        indices.push(
            (z + 1) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x + 1,
            (z + 0) * numVertsAcross + x + 1);
      }
    }

    var arrays = reorientVertices({
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    }, matrix);
    return arrays;
  }
