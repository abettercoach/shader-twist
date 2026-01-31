// Author iris fernández

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;


//Global (Ch 1)
uniform float u_phase;
uniform float u_radius;
uniform vec3 u_background; //CC 4-6
uniform float u_k; //CC 7

//For each circle (Channels 10-16)
// - x,y,r, Muted //CCs 1,2,3,94
struct CircleData
{
    vec2 position;
    float radius;
    float muted;
};
uniform CircleData u_circles[7]; 

float smoothen(float d1, float d2) {
    float k = u_k;
    return -log(exp(-k * d1) + exp(-k * d2)) / k;
}


void main()
{
    vec2 st = vTexCoord.xy;
    st.x *= u_resolution.x/u_resolution.y;
    
    st.y -= 0.5;
    st.x -= u_resolution.x/u_resolution.y/2.;
    
    vec3 color = vec3(1.0);

    //Big circle
    vec2 p0 = vec2(0.,0.);

    //Small circles
    vec2 p1 = vec2(-sin(u_time / 5.) * .7, -cos(u_time / 3.) * 0.5);
    vec2 p2 = vec2(sin(u_time / 1.3) * 0.2, -cos(u_time / 2.3) * 0.8);
    vec2 p3 = vec2(sin(u_time / 3.3) * 1., cos(u_time / 1.3) * 0.8);
    vec2 p4 = vec2(sin(u_time + 3.14 / 2.3) * 1., cos(u_time / 1.3) * 0.8);
    
    float d = smoothen(distance(st, p0) * u_radius, distance(st, p1) * (((sin(u_time) + 1.0) / 2. + 1.) * 5.0));
	d = smoothen(d, distance(st, p2) * (((sin(u_time) + 1.0) / 2. + 1.) * 5.0));
    d = smoothen(d,distance(st,p3) * (((cos(u_time) + 1.0) / 2. + 1.) * 5.0));
    d = smoothen(d,distance(st,p4) * (((sin(u_time) + 1.0) / 2. + 1.) * 5.0));
    
    
    float ae = 5. / u_resolution.y; //Anti-aliasing
    vec3 lava_pct = 1.0-vec3(smoothstep(0.8, 0.8+ae, d));
    
    color = mix(color, u_background, 1.0); //Background color
    color = mix(color, vec3(0.), lava_pct);
    
    
    gl_FragColor = vec4(color,1.0);
}
