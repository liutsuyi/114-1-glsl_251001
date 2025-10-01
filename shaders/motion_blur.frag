// Author: CMH
// Title: Learning Shaders

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;
uniform sampler2D u_tex5;
uniform sampler2D u_tex6;

void main()
{
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv.x*=u_resolution.x/u_resolution.y;
    vec2 vUv=fract(6.*uv);//key
    float shading=texture2D(u_tex0,uv).g;//取texture的綠色版作為明亮值
    
    vec4 c;
    float step = 1.0 / 6.0;
    if (shading <= step) {
        c = mix(texture2D(u_tex6, vUv), texture2D(u_tex5, vUv), smoothstep(0.0, step, shading));
    } else if (shading <= 2.0 * step) {
        c = mix(texture2D(u_tex5, vUv), texture2D(u_tex4, vUv), smoothstep(step, 2.0 * step, shading));//使用else if避免多重賦值
    } else if (shading <= 3.0 * step) {
        c = mix(texture2D(u_tex4, vUv), texture2D(u_tex3, vUv), smoothstep(2.0 * step, 3.0 * step, shading));
    } else if (shading <= 4.0 * step) {
        c = mix(texture2D(u_tex3, vUv), texture2D(u_tex2, vUv), smoothstep(3.0 * step, 4.0 * step, shading));
    } else if (shading <= 5.0 * step) {
        c = mix(texture2D(u_tex2, vUv), texture2D(u_tex1, vUv), smoothstep(4.0 * step, 5.0 * step, shading));
    } else if (shading >= 0.95) {
        c = vec4(1.0);//接近白色直接設為白色，避免殘存原始紋理
    } else {
        float t = smoothstep(5.0 * step, 1.0, shading);//製作一個平滑過渡
        c = mix(texture2D(u_tex1, vUv), vec4(1.0), t);
    }
    
    vec4 inkColor=vec4(0.,0.,1.,1.);
    vec4 src=mix(mix(inkColor,vec4(1.),c.r),c,.5);
    gl_FragColor=src;
    
}