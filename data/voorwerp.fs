uniform float uv_fade;
uniform float userAlpha;

in vec2 texcoord;
in vec3 color;

out vec4 fragColor;

void main()
{
	fragColor = vec4(color, 1.);
	fragColor.a *= uv_fade*userAlpha;
	vec2 fromCenter = texcoord * 2 - vec2(1);
	float dist = dot(fromCenter, fromCenter);
	//if (dist > 1){
	//	discard;
	//}
	fragColor.a *= exp(-0.5*dist/0.1);

}
