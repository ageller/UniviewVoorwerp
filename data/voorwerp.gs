//in vec3 vertex;

layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform float uv_fade;
uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;
uniform float uv_time;


uniform float userPsize;
uniform float userScale;
uniform float userRotationX;
uniform float userRotationY;
uniform float userRotationZ;

uniform float voorwerpOffsetX;
uniform float voorwerpOffsetY;
uniform float voorwerpOffsetZ;
uniform float jetMin;
uniform float jetMax;

out vec2 texcoord;
out vec3 color;
out float onOff;

// axis should be normalized
mat3 rotationMatrix(vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}


//from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//simple 3D noise
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
float snoise(vec3 p){
	vec3 a = floor(p);
	vec3 d = p - a;
	d = d * d * (3.0 - 2.0 * d);

	vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
	vec4 k1 = perm(b.xyxy);
	vec4 k2 = perm(k1.xyxy + b.zzww);

	vec4 c = k2 + a.zzzz;
	vec4 k3 = perm(c);
	vec4 k4 = perm(c + 1.0);

	vec4 o1 = fract(k3 * (1.0 / 41.0));
	vec4 o2 = fract(k4 * (1.0 / 41.0));

	vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
	vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

	return o4.y * d.y + o4.x * (1.0 - d.y);
}

// from https://www.seedofandromeda.com/blogs/49-procedural-gas-giant-rendering-with-gpu-noise
//fractal noise
float noise(vec3 position, int octaves, float frequency, float persistence, int rigid) {
	float total = 0.0; // Total value so far
	float maxAmplitude = 0.0; // Accumulates highest theoretical amplitude
	float amplitude = 1.0;
	const int largeN = 50;
	for (int i = 0; i < largeN; i++) {
		if (i > octaves){
				break;
		}
		// Get the noise sample
		if (rigid == 0){
		   total += snoise(position * frequency) * amplitude;
		} else {
		// rigid noise
			total += ((1.0 - abs(snoise(position * frequency))) * 2.0 - 1.0) * amplitude;
		}
		// Make the wavelength twice as small
		frequency *= 2.0;
		// Add to our maximum possible amplitude
		maxAmplitude += amplitude;
		// Reduce amplitude according to persistence for the next octave
		amplitude *= persistence;
	}

	// Scale the result by the maximum amplitude
	return total / maxAmplitude;
}

float makeNoise(vec3 pNorm)
{
	//fractal noise
	float n1 = noise(pNorm, 7, 5., 0.1, 1); 
	float s = 0.1;
	float frequency = 3;//
	float threshold = 0.5;// limit number of spots
	float t1 = snoise(pNorm * frequency) - s;
	float t2 = snoise((pNorm + 30.) * frequency) - s;
	float ss = (max(t1 * t2, threshold) - threshold) ;
	// Accumulate total noise
	float n = n1 - ss;
	
	return n;
}
void drawSprite(vec4 position, float radius, float rotation)
{
	vec3 objectSpaceUp = vec3(0, 0, 1);
	vec3 objectSpaceCamera = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
	vec3 cameraDirection = normalize(objectSpaceCamera - position.xyz);
	vec3 orthogonalUp = normalize(objectSpaceUp - cameraDirection * dot(cameraDirection, objectSpaceUp));
	vec3 rotatedUp = rotationMatrix(cameraDirection, rotation) * orthogonalUp;
	vec3 side = cross(rotatedUp, cameraDirection);
	texcoord = vec2(0, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(0, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side - rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side - rotatedUp), 1);
	EmitVertex();
	EndPrimitive();
}

void main()
{

	color = vec3(gl_in[1].gl_Position.x/255., gl_in[1].gl_Position.y/255., gl_in[1].gl_Position.z/255.);


	vec3 pos = vec3(gl_in[0].gl_Position.x*userScale, gl_in[0].gl_Position.y*userScale, gl_in[0].gl_Position.z*userScale);
	mat3 rotX = rotationMatrix(vec3(1,0,0), userRotationX);
	mat3 rotY = rotationMatrix(vec3(0,1,0), userRotationY);
	mat3 rotZ = rotationMatrix(vec3(0,0,1), userRotationZ);
	
	
	//define the time 
	//float dayfract = uv_simulationtimeSeconds/(24.0*3600.0);
	//float days = uv_simulationtimeDays + dayfract;

	//add some noisy motion
	float r = length(pos);
	float dfac = 0.01;
	//vec3 pNormX = vec3(pos.x, r, days*dfac);
	//vec3 pNormY = vec3(pos.y, r, days*dfac);
	//vec3 pNormZ = vec3(pos.z, r, days*dfac);
	vec3 pNormX = vec3(pos.x, r, uv_simulationtimeSeconds*dfac);
	vec3 pNormY = vec3(pos.y, r, uv_simulationtimeSeconds*dfac);
	vec3 pNormZ = vec3(pos.z, r, uv_simulationtimeSeconds*dfac);
	float nX = makeNoise(pNormX);
	float nY = makeNoise(pNormY);
	float nZ = makeNoise(pNormZ);
	float nFac = 0.1*r*r;
	
	pos += vec3(nX, nY, nZ)*nFac;
	vec3 posR = rotX*rotY*rotZ*pos;
	
	//check if the jet reached it
	float loc = length(vec3(voorwerpOffsetX, voorwerpOffsetY, voorwerpOffsetZ) - posR);  //not sure why this is a minus sign...
	onOff = 0.;
	if (loc >= jetMin && loc <= jetMax) drawSprite(vec4(posR, 1.), userPsize, 0);
	
	

}
