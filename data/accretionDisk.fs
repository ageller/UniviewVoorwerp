
out vec4 FragColor; 

in vec3 LightDir1, LightDir2, Normal, EyeVec;
in vec2 texCoord0;

in vec4 vPos;
in vec2 texcoord;

uniform float uv_time;
uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;

uniform vec3 uv_diffuseMtrl;
uniform vec3 uv_ambientMtrl;
uniform vec3 uv_emissiveMtrl;

uniform float uv_opacityMtrl;

uniform sampler2D cmap;

const float PI = 3.141592653589793;

void main(void)
{
	//float dist = length(vPos.xz)/10.; 
	float dist = length(texcoord)/12.; 
	vec3 cm = texture(cmap ,vec2(clamp(dist*1.1 - 0.1,0.,1),0.5)).rgb - vec3(0.5);

	vec4 finalDiffuseColor1 = vec4(0.0);
	vec4 finalDiffuseColor2 = vec4(0.0);
	vec4 finalAmbientColor  = vec4(cm,1.0);
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

	//attempt to simulate keplerian motion
	//first create some rings
	float dfac = 0.01; //controls the spacing of the rings
	float afac = 2.*PI; //controls the width of the cutout within each ring
	float lim = mod(dist, dfac);
	if (lim > dfac/2. && lim < dfac/1.4){
		//FragColor = vec4(0,0,0,1);
	}
	float newdist = round(dist/dfac)*dfac*10.;
	
	//define the time 
	float dayfract = uv_simulationtimeSeconds/(24.0*3600.0);
	float days = uv_simulationtimeDays + dayfract;

	float semi = newdist;//pow(newdist, 2./3.);
	float angle = atan(texcoord.y, texcoord.x) + PI;
	float amin = mod(days/semi, 2.*PI);
	float amax = mod(amin + afac/semi, 2.*PI);
	float adiff = clamp(1. - (angle - amin)/(afac/semi), 0.4, 1.);
	//need to fix portion near angle of zero
	if (amax < amin && angle <= amax){
		adiff = clamp(1. - (angle - amin + 2.*PI)/(afac/semi), 0.4, 1.);	
	}
	if ((angle >= amin && angle <= amax) || (amax < amin) ){
		FragColor.rgb *= adiff;
	}

}
