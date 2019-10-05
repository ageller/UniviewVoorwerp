uniform float uv_fade;
uniform float userAlpha;
uniform float colorFac;

uniform sampler2D cmap;

in vec2 texcoord;
in float rad;

out vec4 fragColor;

void main()
{

	vec3 color = texture(cmap ,vec2(0.5 + clamp(rad/5., 0., 0.5), 0.5)).rgb;// - vec3(0.1/rad);

	fragColor = vec4(color, 1.);
	fragColor.a *= uv_fade*userAlpha;
	vec2 fromCenter = texcoord * 2 - vec2(1);
	float dist = dot(fromCenter, fromCenter);
	//if (dist > 1){
	//	discard;
	//}
	//try to enhance the color, but exclude any that are grayish?
	float rg = abs(fragColor.r - fragColor.g);
	float rb = abs(fragColor.r - fragColor.b);
	float gb = abs(fragColor.g - fragColor.b);
	float foo = max(rg, rb);
	float maxC = max(foo, gb);
	if (maxC > 0.03){
		fragColor.rgb -= colorFac;
	}
	
	fragColor.a *= exp(-0.5*dist/0.1);

}
