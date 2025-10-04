// Author:tsuyi
// Title:input image, kernel and vertical motion blur

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

// 產生像素化效果
vec2 pixelization(vec2 uv, float size) //from 1 to 10
{
    vec2 uvs=uv/ size;//縮小uv座標[0~6]
    vec2 ipos = floor(uvs);// 取整數
    vec2 nuv=ipos*size;//放大uv座標回原尺寸
    return nuv;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 texel = 1.0 / u_resolution;
    
    // === 步驟1: 高斯模糊（使用 kernelSmall 與 offset 陣列） ===
    float kernelSmall[9];
    kernelSmall[0] = 1.0/16.0; kernelSmall[1] = 2.0/16.0; kernelSmall[2] = 1.0/16.0;
    kernelSmall[3] = 2.0/16.0; kernelSmall[4] = 4.0/16.0; kernelSmall[5] = 2.0/16.0;
    kernelSmall[6] = 1.0/16.0; kernelSmall[7] = 2.0/16.0; kernelSmall[8] = 1.0/16.0;

    vec2 offset[9];
    offset[0] = vec2(-1, -1);
    offset[1] = vec2( 0, -1);
    offset[2] = vec2( 1, -1);
    offset[3] = vec2(-1,  0);
    offset[4] = vec2( 0,  0);
    offset[5] = vec2( 1,  0);
    offset[6] = vec2(-1,  1);
    offset[7] = vec2( 0,  1);
    offset[8] = vec2( 1,  1);

    vec3 blurred = vec3(0.0);
    for(int i = 0; i < 9; i++) {
        blurred += texture2D(u_tex0, uv + offset[i] * texel).rgb * kernelSmall[i];
    }
    
    // === 步驟2: 增加雜訊 ===
    float noise = fract(sin(dot(uv * 70.0, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 noisy = blurred + vec3(noise * 0.15);
    
    // === 步驟3: 垂直動態模糊 ===
    // --- Low pass: combine small and large blur on u_tex0 ---
    vec3 blurSmall = vec3(0.0);
    float blurStrength = 1.0 + u_time * 0.5; // 可調整係數
    for (int i = 0; i < 9; i++) {
        vec2 sampleUV = uv + offset[i] * texel * blurStrength;
        blurSmall += texture2D(u_tex0, sampleUV).rgb * kernelSmall[i];
    }
    vec3 lowpass = blurSmall;

    // 混合 noisy 和 lowpass
    vec3 final = mix(noisy, lowpass, 0.5);
    gl_FragColor = vec4(final, 1.0);
    
}