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

// 高斯權重與偏移
const int kernelSize = 9;
const float kernel[kernelSize] = float[](
    0.05, 0.09, 0.12, 0.15, 0.18, 0.15, 0.12, 0.09, 0.05
);

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    // 高斯模糊 (以 u_tex0 為輸入圖片)
    vec4 color = vec4(0.0);
    float offset = 2.0 / u_resolution.x; // 根據解析度調整模糊範圍
    for (int i = 0; i < kernelSize; ++i) {
        float x = float(i) - float(kernelSize / 2);
        color += texture2D(u_tex0, uv + vec2(x * offset, 0.0)) * kernel[i];
    }
    gl_FragColor = color;
}