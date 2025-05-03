console.clear();

// ----------------------------------------------
// Todo: Create variables used by your solution
// ----------------------------------------------

let webgl_context = null;
let attr_vertex = null;
let attr_normal = null;
let uniform__color = null;
let uniform_view = null;
let uniform_perspective = null;
let uniform_props = null;
let uniform_ship = null;
let uniform_moon = null;
let uniform_light = null;
let uniform_eye = null;
let shading_enabled = null;
let moon_angle = null;
let vertex_data = [];
let normal_data = [];
let canvas = null;
let program = null;
let count = 2;
let size = 3;
let rot = 0;
let srot = 0;
let erot = 0;
let shiprow = 0;

let attr_vTexCoord = null;
let uniform_texture = null;
let texture_data = [];
let texture_size = 2;

let sun_image = null;
let earth_image = null;
let moon_image = null;
let sun_texture = null;
let earth_texture = null;
let moon_texture = null;


// ----------------------------------------------
// Camera parameters
// ----------------------------------------------

let xt = 0.0;
let yt = 0.0;
let zt = 1.0;
let fov = 85;

// ----------------------------------------------
// Light parameters that are fixed (do not modify)
// ----------------------------------------------
const lxt = 0.0;
const lyt = 0.0;
const lzt = 0.0;

// ----------------------------------------------
// Camera orientation parameters (do not modify)
// ----------------------------------------------
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// ----------------------------------------------
// Map data structure. The key is a string 
// that defines the name of the image (e.g., 
// sun, earth, and moon) and the associated value 
// is also a string that defines a URL.
// (do no modify)
// ----------------------------------------------

let url_map = new Map();

url_map.set("sun", "https://127.0.0.1:8080/sun.jpg");
url_map.set("earth", "https://127.0.0.1:8080/earth.jpg");
url_map.set("moon", "https://127.0.0.1:8080/moon.jpg");

// ----------------------------------------------
// Earth orbit parameters
// ----------------------------------------------
let orbit_speed = 0;
let orbit_speed_crd = 3; 
let orbit_radius_crd = 1.0; 
let orbit_angle_crd = 0; 

// ----------------------------------------------
// Todo: You code the solution
// ----------------------------------------------

function configure() {
   
    canvas = document.getElementById( "webgl-canvas" );
   
    webgl_context = canvas.getContext( "webgl" );
    program = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
    webgl_context.useProgram( program );
   
    webgl_context.viewport( 0, 0, canvas.width, canvas.height );
    
    uniform_props = webgl_context.getUniformLocation( program, "props" );
    uniform_ship = webgl_context.getUniformLocation( program, "ship");
    uniform_moon = webgl_context.getUniformLocation( program, "moon");
    attr_vertex = webgl_context.getAttribLocation( program, "vertex" );
    attr_normal = webgl_context.getAttribLocation( program, "normal" );
    attr_vTexCoord = webgl_context.getAttribLocation( program, "vTexCoord" );

    uniform__color = webgl_context.getUniformLocation( program, "color" );
    uniform_view = webgl_context.getUniformLocation( program, "V" );
    uniform_perspective = webgl_context.getUniformLocation( program, "P" );
    shading_enabled = webgl_context.getUniformLocation( program, "shading_enabled" );

 
    uniform_light = webgl_context.getUniformLocation(program, "light");
   
    uniform_eye = webgl_context.getUniformLocation(program, "eye");

    uniform_texture = webgl_context.getUniformLocation(program, "texture");

    webgl_context.enable( webgl_context.DEPTH_TEST );
    webgl_context.clear( webgl_context.COLOR_BUFFER_BIT | webgl_context.DEPTH_BUFFER_BIT );
   
}

function createVertexData() {

    let row = 0;
   
    for (let i = 0; i < F.length; i++) { // change all these fp, vp vars to the three planets
        vertex_data[row++] = V[F[i][0]];
        vertex_data[row++] = V[F[i][1]];
        vertex_data[row++] = V[F[i][2]];
    }

    // shiprow = vertex_data.length;

    // for (let i = 0; i < F.length; i++) {
    //     vertex_data[row++] = V[F[i][0]];
    //     vertex_data[row++] = V[F[i][1]];
    //     vertex_data[row++] = V[F[i][2]];
    // }

   
}

function createNormalData() {

    let row = 0;
      
    for (let i = 0; i < F.length; i++) {
      normal_data[row++] = flipz( normalize( N[F[i][0]] ) );
      normal_data[row++] = flipz( normalize( N[F[i][1]] ) );
      normal_data[row++] = flipz( normalize( N[F[i][2]] ) );
    }
  
  }

function createTextureData() {

    let x = 0
    let y = 0
    let z = 0
    let r = 0
    let theta = 0
    let phi = 0
    let s = 0
    let t = 0
  
    for (let i = 0; i < vertex_data.length; i++) {
  
      x = vertex_data[i][0]
      y = vertex_data[i][1]
      z = vertex_data[i][2]
  
      r = Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) + Math.pow( z, 2 ) );
      phi = Math.acos( y/r );
      theta = Math.atan2( z, x );
  
      s = -( (theta + Math.PI) / (2 * Math.PI) );
      t = 1 - (phi / Math.PI );
  
      texture_data.push( vec2( s,t ) );
      
    }
  
  }

function createTexture() {

    sun_image = new Image();

    sun_image.onload = () => { 

      sun_texture = webgl_context.createTexture();
      webgl_context.bindTexture( webgl_context.TEXTURE_2D, sun_texture );
      webgl_context.pixelStorei( webgl_context.UNPACK_FLIP_Y_WEBGL, true );
      webgl_context.texImage2D( webgl_context.TEXTURE_2D, 0, 
                              webgl_context.RGB, webgl_context.RGB, 
                              webgl_context.UNSIGNED_BYTE, sun_image );
      webgl_context.generateMipmap( webgl_context.TEXTURE_2D );
      webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                 webgl_context.TEXTURE_MIN_FILTER,
                                 webgl_context.NEAREST_MIPMAP_LINEAR );
      webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                 webgl_context.TEXTURE_MAG_FILTER, 
                                 webgl_context.NEAREST );

    }

    sun_image.crossOrigin = "anonymous";
    sun_image.src = "sun.jpg";


    earth_image = new Image();

    earth_image.onload = () => { 

      earth_texture = webgl_context.createTexture();
      webgl_context.bindTexture( webgl_context.TEXTURE_2D, earth_texture );
      webgl_context.pixelStorei( webgl_context.UNPACK_FLIP_Y_WEBGL, true );
      webgl_context.texImage2D( webgl_context.TEXTURE_2D, 0, 
                              webgl_context.RGB, webgl_context.RGB, 
                              webgl_context.UNSIGNED_BYTE, earth_image );
      webgl_context.generateMipmap( webgl_context.TEXTURE_2D );
      webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                 webgl_context.TEXTURE_MIN_FILTER,
                                 webgl_context.NEAREST_MIPMAP_LINEAR );
      webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                 webgl_context.TEXTURE_MAG_FILTER, 
                                 webgl_context.NEAREST );

    }

    earth_image.crossOrigin = "anonymous";
    console.log(url_map["earth"]);
    earth_image.src = "earth.jpg";

    moon_image = new Image();

    moon_image.onload = () => { 

      moon_texture = webgl_context.createTexture();
      webgl_context.bindTexture( webgl_context.TEXTURE_2D, moon_texture );
      webgl_context.pixelStorei( webgl_context.UNPACK_FLIP_Y_WEBGL, true );
      webgl_context.texImage2D( webgl_context.TEXTURE_2D, 0, 
                              webgl_context.RGB, webgl_context.RGB, 
                              webgl_context.UNSIGNED_BYTE, moon_image );
      webgl_context.generateMipmap( webgl_context.TEXTURE_2D );
      webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                 webgl_context.TEXTURE_MIN_FILTER,
                                 webgl_context.NEAREST_MIPMAP_LINEAR );
      webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                 webgl_context.TEXTURE_MAG_FILTER, 
                                 webgl_context.NEAREST );

    }

    moon_image.crossOrigin = "anonymous";
    moon_image.src = "moon.jpg";
    }

function allocateMemory() {
   
    let vertex_id = webgl_context.createBuffer();
   
    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, vertex_id );
    webgl_context.vertexAttribPointer( attr_vertex, size, webgl_context.FLOAT, false, 0, 0 );
    webgl_context.enableVertexAttribArray( attr_vertex );
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(vertex_data), webgl_context.STATIC_DRAW );

    let normal_id = webgl_context.createBuffer();
   
    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, normal_id );
    webgl_context.vertexAttribPointer( attr_normal, size, webgl_context.FLOAT, false, 0, 0 );
    webgl_context.enableVertexAttribArray( attr_normal );
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(normal_data), webgl_context.STATIC_DRAW );

    let texbuff_id = webgl_context.createBuffer();
    
    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, texbuff_id );
    webgl_context.vertexAttribPointer( attr_vTexCoord, texture_size, webgl_context.FLOAT, false, 0, 0 );
    webgl_context.enableVertexAttribArray( attr_vTexCoord );
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(texture_data), webgl_context.STATIC_DRAW );
}

function draw() {
   
    let light_vector = vec4(lxt, lyt, lzt, 0);
   
    let eye_vector = vec3(xt, yt, zt);
   
    webgl_context.uniform4fv(uniform_light, light_vector);

    webgl_context.uniform3fv(uniform_eye, eye_vector);

    let V = lookAt( eye_vector, at, up );
    let P = perspective( fov, 1.0, 0.3, 3.0 );
    webgl_context.uniformMatrix4fv( uniform_view, false, flatten( V ) );
    webgl_context.uniformMatrix4fv( uniform_perspective, false, flatten( P ) );

    rot = (rot + 0.0174533) % 360;
    srot = (srot + 0.0872665) % 360;
    erot = (erot + 0.174533) % 360;
    orbit_speed = (orbit_speed + orbit_speed_crd) % 360;

    
    // draw sun
    webgl_context.uniform2f(uniform_props, rot, 2.5);
    webgl_context.uniform1f( uniform_moon, 0.0);

    webgl_context.uniform3f( uniform_ship, 0.0, 0.0, 0.0);
    webgl_context.uniform1f( shading_enabled, 1.0);   
    
    webgl_context.activeTexture( webgl_context.TEXTURE0);
    webgl_context.bindTexture( webgl_context.TEXTURE_2D, sun_texture );
    webgl_context.uniform1i( uniform_texture, 0);
    
    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, vertex_data.length );

    // draw earth 
    webgl_context.uniform2f(uniform_props, srot, 0.5); 
    webgl_context.uniform1f( uniform_moon, 1.0);

    webgl_context.uniform3f(uniform_ship, orbit_radius_crd, radians(orbit_speed), radians(orbit_angle_crd)); 
    webgl_context.uniform1f( shading_enabled, 0.0); 

    webgl_context.activeTexture( webgl_context.TEXTURE0 + 1);
    webgl_context.bindTexture( webgl_context.TEXTURE_2D, earth_texture );
    webgl_context.uniform1i( uniform_texture, 1);

    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, vertex_data.length );

    // draw moon
    webgl_context.uniform2f(uniform_props, erot, 0.25); 
    webgl_context.uniform1f(uniform_moon, 2.0);
    webgl_context.uniform3f(uniform_ship, orbit_radius_crd, radians(orbit_speed), radians(orbit_angle_crd));
    
    webgl_context.activeTexture( webgl_context.TEXTURE0 + 2);
    webgl_context.bindTexture( webgl_context.TEXTURE_2D, moon_texture );
    webgl_context.uniform1i( uniform_texture, 2);

    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, vertex_data.length );
   
}

createVertexData();
createNormalData();
createTextureData();
createTexture();
configure();
allocateMemory();
setInterval(draw, 100);