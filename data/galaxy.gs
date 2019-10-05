//in vec3 vertex;

layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform float uv_fade;
uniform float userPsize;
uniform float userScale;
uniform float userRotationX;
uniform float userRotationY;
uniform float userRotationZ;
uniform float voorwerpOffsetX;
uniform float voorwerpOffsetY;
uniform float voorwerpOffsetZ;

out vec2 texcoord;
out vec3 color;
out float rad;

uniform float uv_time;
uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;

const float PI = 3.141592653589793;

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
	float bScale = 50.; //scale relative to the blazar model

	//define the time 
	//float dayfract = uv_simulationtimeSeconds/(24.0*3600.0);
	//float days = uv_simulationtimeDays + dayfract;
	rad = length(gl_in[0].gl_Position.xyz);
	//keplerian for now
	//float angle = mod(days/30., 2.*PI)/r;
	float angle = mod(uv_simulationtimeSeconds/30., 2.*PI)/rad;
	
	//The blazar model has the yand z axes flipped
	vec3 pos = gl_in[0].gl_Position.xyz*userScale*bScale;
	mat3 rotX = rotationMatrix(vec3(1,0,0), userRotationX + PI/2.); //to match plane of blazar model
	mat3 rotY = rotationMatrix(vec3(0,1,0), -userRotationZ + PI); //flip the orientation, based on how I have aligned the model and the real image
	mat3 rotZ = rotationMatrix(vec3(0,0,1), userRotationY + angle);
	drawSprite(vec4(vec3(rotX*rotY*rotZ*pos) + vec3(voorwerpOffsetX, voorwerpOffsetY, voorwerpOffsetZ), 1.), userPsize, 0);
}
