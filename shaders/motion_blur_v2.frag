// update:tsuyi
// Title:input image, kernel and vertical motion blur

#ifdef GL_ES
precision mediump float;
#endif


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_buffer0;

// 產生像素化效果
vec2 pixelization(vec2 uv, float size) //from 1 to 10
{
    vec2 uvs=uv/ size;//縮小uv座標[0~6]
    vec2 ipos = floor(uvs);// 取整數
    vec2 nuv=ipos*size;//放大uv座標回原尺寸
    return nuv;
}

void main() {
    // 套用像素化效果，pixelSize 可調整顆粒大小
    float pixelSize = 2.0;
    vec2 uv = pixelization(gl_FragCoord.xy, pixelSize) / u_resolution.xy;
    vec2 texel = 1.0 / u_resolution;
    
    // === 步驟1: 高斯模糊（使用 kernelSmall 與 offset 陣列） ===
    float kernelSmall[9];
    kernelSmall[0] = 1.0/16.0; kernelSmall[1] = 0.0/16.0; kernelSmall[2] = 1.0/16.0;
    kernelSmall[3] = 5.0/16.0; kernelSmall[4] = 2.0/16.0; kernelSmall[5] = 5.0/16.0;
    kernelSmall[6] = 1.0/16.0; kernelSmall[7] = 0.0/16.0; kernelSmall[8] = 1.0/16.0;

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


    // === 步驟2: 動態模糊（隨時間增加模糊強度）===
    float blurStrength = 1.0 + u_time * 5.0; // 可調整係數
    vec3 blurSmall = vec3(0.0);
    for (int i = 0; i < 9; i++) {
        vec2 sampleUV = uv + offset[i] * texel * blurStrength;
        blurSmall += texture2D(u_tex0, sampleUV).rgb * kernelSmall[i];
    }
    vec3 lowpass = blurSmall;

    // === 步驟3:增加閃爍感的雜訊（以 motion blur 結果為基底） ===
    float noise = fract(sin(dot(uv * 70.0 + u_time * 0.5, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 noisy = lowpass + vec3(noise * 0.70);

    // 最終融合 motion blur（lowpass）與雜訊 noisy 效果
    vec3 final = mix(lowpass, noisy, 0.6);
    if(u_time < 1.0)
        gl_FragColor = vec4(texture2D(u_tex0, uv).rgb, 0.9); // 初始顯示原圖
    else
        gl_FragColor = vec4(final, 0.9);

    
}