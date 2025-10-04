// Author:CMH
// Title:input image and kernel 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

void main() {
    // 取得像素座標並正規化到 [0,1]
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = st;

    // 定義高斯模糊 kernel（3x3）
    // 這個 kernel 會決定模糊的加權分布
    float kernelSmall[9];
    kernelSmall[0] = 0.0/16.0; kernelSmall[1] = 4.0/16.0; kernelSmall[2] = 0.0/16.0;
    kernelSmall[3] = 0.0/16.0; kernelSmall[4] = 8.0/16.0; kernelSmall[5] = 0.0/16.0;
    kernelSmall[6] = 0.0/16.0; kernelSmall[7] = 4.0/16.0; kernelSmall[8] = 0.0/16.0;

    // 定義取樣偏移（3x3 區域）
    // offset[i] 代表每個 kernel 權重對應的像素偏移
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

    // 低通濾波：將小範圍模糊合併在 u_tex0 上
    vec2 texel = 1.0 / u_resolution; // 計算每個像素的 texel 大小
    vec3 blurSmall = vec3(0.0);
    for (int i = 0; i < 9; i++) {
        vec2 sampleUV = uv + offset[i] * texel;
        blurSmall += texture2D(u_tex0, sampleUV).rgb * kernelSmall[i]; // 取樣 u_tex0
    }
    vec3 lowpass = blurSmall;

 

    // 初始顯示
    if(u_time<1.0) {
        gl_FragColor = texture2D(u_tex1, st); // 顯示原始圖
    }
    //else if (mod(u_time, 4.0)<=1.0) gl_FragColor = texture2D(u_buffer0, st);
    else {
        gl_FragColor = vec4(lowpass, 1.0); // 顯示低通濾波後的結果
    }
}
