
out vec4 FragColor; 

in vec3 LightDir1, LightDir2, Normal, EyeVec;
in vec2 texCoord0;

uniform float uv_time;

uniform vec3 uv_diffuseMtrl;
uniform vec3 uv_ambientMtrl;
uniform vec3 uv_emissiveMtrl;

uniform float uv_opacityMtrl;


void main(void)
{

	vec4 finalDiffuseColor1 = vec4(0.0);
	vec4 finalDiffuseColor2 = vec4(0.0);
	vec4 finalAmbientColor  = vec4(uv_ambientMtrl,1.0);
	vec4 finalSpecularColor = vec4(0.0);
	vec4 finalColor;


	vec3 N = normalize(Normal);
	vec3 L1 = normalize(LightDir1);
	vec3 L2 = normalize(LightDir2);

	float shadow = 1.0;

	float lambertTerm1 = (dot(N,L1))*shadow;
	float lambertTerm2 = (dot(N,L2))*shadow*0.02;

	//point light from center
	if (lambertTerm1 > 0.0)
	{
		finalDiffuseColor1 = vec4(uv_diffuseMtrl,1);
		finalDiffuseColor1 *= lambertTerm1;
	}
	//additional diffuse light from other direction
	if (lambertTerm2 > 0.0)
	{
		finalDiffuseColor2 = vec4(uv_diffuseMtrl,1);
		finalDiffuseColor2 *= lambertTerm2;
	}
	finalColor.rgb = (finalAmbientColor + finalDiffuseColor1 + finalDiffuseColor2 + finalSpecularColor).rgb;

	finalColor.rgb += uv_emissiveMtrl;

	finalColor.a = uv_opacityMtrl;

	FragColor = finalColor;

}
