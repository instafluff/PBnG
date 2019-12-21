function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

function getColorDistFromAll( color, array ) {
  var colorHSL = rgbToHsl( color.r, color.g, color.b );
  var dist = array.map( c => {
    var cHSL = rgbToHsl( c.r, c.g, c.b );
    return ( Math.pow( colorHSL[ 0 ] - cHSL[ 0 ], 2 ) );
    // return ( Math.pow( color.r - c.r, 2 ) + Math.pow( color.g - c.g, 2 ) + Math.pow( color.b - c.b, 2 ) );
  } ).reduce( ( total, p ) => total + p, 0 );
  return dist;
}

function getMaxColorDistFromAll( color, array ) {
  var dist = Math.max( ...array.map( c => {
    return ( Math.pow( color.r - c.r, 2 ) + Math.pow( color.g - c.g, 2 ) + Math.pow( color.b - c.b, 2 ) );
  } ) );
  return dist;
}

function groupIntoColorClusters( pixels, numClusters ) {
  let allClusters = [];
  for( var cl = 0; cl < 100; cl++ ) {
    let colorClusters = [];
    for( var i = 0; i < numClusters; i++ ) {
      colorClusters.push( pixels[ Math.floor( Math.random() * pixels.length ) ] );
    }
    allClusters.push( colorClusters );
  }
  allClusters.sort( ( cA, cB ) => {
    var aDist = cA.map( c => getColorDistFromAll( c, cA ) ).reduce( ( total, p ) => total + p, 0 );
    var bDist = cB.map( c => getColorDistFromAll( c, cB ) ).reduce( ( total, p ) => total + p, 0 );
    return bDist - aDist;
  });
  return allClusters[ 0 ];
}

function runColorClusterPass( pixels, clusters ) {
  let colorBuckets = sortPixelsIntoClusters( pixels, clusters );
  // Average the buckets into new clusters
  let colorClusters = colorBuckets.map( bucket => ({
    r: bucket.reduce( (total, p) => total + p.r, 0 ) / bucket.length,
    g: bucket.reduce( (total, p) => total + p.g, 0 ) / bucket.length,
    b: bucket.reduce( (total, p) => total + p.b, 0 ) / bucket.length,
    a: bucket.reduce( (total, p) => total + p.a, 0 ) / bucket.length,
  }) );
  return { buckets: colorBuckets, clusters: colorClusters };
}

function sortPixelsIntoClusters( pixels, clusters ) {
  let colorBuckets = [];
  pixels.forEach( p => {
    var distances = clusters.map( (c, i) => ({
      i,
      dist: ( Math.pow( p.r - c.r, 2 ) + Math.pow( p.g - c.g, 2 ) + Math.pow( p.b - c.b, 2 ) )
    }));
    distances.sort( (a, b) => a.dist - b.dist );
    var bucket = distances[ 0 ].i;
    if( !colorBuckets[ bucket ] ) {
      colorBuckets[ bucket ] = [];
    }
    colorBuckets[ bucket ].push( p );
  });
  return colorBuckets;
}
