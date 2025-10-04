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
        // --- 以下為可調整強度的靜態躁點效果 ---
        float noiseScale = 70.0; // 控制躁點顆粒尺寸（值越大顆粒越細緻）
        float noiseStrength = 0.45; // 控制躁點強度（0~1，可自行調整）

        // 產生靜態躁點（只用座標，不用時間參數，躁點不閃爍）
        float noise = fract(sin(dot(uv * noiseScale, vec2(12.9898,78.233))) * 43758.5453);
        // 將躁點疊加在低通濾波結果上
        vec3 noisyColor = lowpass + noise * noiseStrength;

        // --- 線性方向 motion blur 疊加---
        int nSamples = 8; // 取樣數量，可調整
            float blurStrength = 0.01; // 控制模糊長度，建議值小一點
        vec2 blurVec = vec2(0.0, blurStrength); // 垂直方向模糊
        vec3 blurColor = vec3(0.0);
        for (int i = 0; i < nSamples; ++i) {
            float t = float(i) / float(nSamples - 1) - 0.5;
            vec2 offset = blurVec * t;
                vec2 sampleUV = clamp(uv + offset, 0.0, 1.0); // clamp 保證座標合法
                // 取樣雜訊疊加後的顏色
                blurColor += noisyColor;
        }
        blurColor /= float(nSamples);
        // 輸出 motion blur 疊加後的顏色
        gl_FragColor = vec4(blurColor, 1.0);
    }
}
