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
    uniform__color = webgl_context.getUniformLocation( program, "color" );
    uniform_view = webgl_context.getUniformLocation( program, "V" );
    uniform_perspective = webgl_context.getUniformLocation( program, "P" );
    shading_enabled = webgl_context.getUniformLocation( program, "shading_enabled" );

 
    uniform_light = webgl_context.getUniformLocation(program, "light");
   
    uniform_eye = webgl_context.getUniformLocation(program, "eye");

    webgl_context.enable( webgl_context.DEPTH_TEST );
   
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
    moon_angle = (moon_angle + 0.5) % 360;

    webgl_context.uniform2f(uniform_props, rot, 2.5);
    webgl_context.uniform1f( uniform_moon, 0.0);
    webgl_context.uniform3f( uniform_ship, 0.0, 0.0, 0.0);
    webgl_context.uniform1f( shading_enabled, 1.0);   
    //moon = atan(tan(ship[1]) * cos(ship[2])) / 3.0
    webgl_context.uniform4f( uniform__color, 0.0, 1.0, 0.0, 1.0 );
    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, vertex_data.length );

    webgl_context.uniform2f(uniform_props, srot, 0.5); 
    webgl_context.uniform1f( uniform_moon, 0.0);
    webgl_context.uniform3f(uniform_ship, orbit_radius_crd, radians(orbit_speed), radians(orbit_angle_crd)); 
    webgl_context.uniform1f( shading_enabled, 0.0); 
    //moon = atan(tan(ship[1]) * cos(ship[2])) / 3.0
    webgl_context.uniform4f( uniform__color, 0.0, 0.84, 1.0, 1.0 );
    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, vertex_data.length );

    webgl_context.uniform2f(uniform_props, erot, 0.25); 
    webgl_context.uniform1f(uniform_moon, radians(orbit_speed_crd));
    webgl_context.uniform3f(uniform_ship, orbit_radius_crd, radians(orbit_speed), radians(orbit_angle_crd));
    webgl_context.uniform4f( uniform__color, 0.50, 0.50, 1.0, 1.0 );
    webgl_context.drawArrays( webgl_context.TRIANGLES, 0, vertex_data.length );
   
}

createVertexData();
createNormalData();
configure();
allocateMemory();
setInterval(draw, 100);