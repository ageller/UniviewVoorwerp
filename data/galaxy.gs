//in vec3 vertex;

layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform float uv_fade;
uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;

uniform float userPsize;
uniform float userScale;
uniform float userRotationX;
uniform float userRotationY;
uniform float userRotationZ;
uniform vec3 galaxyColor;
uniform float voorwerpOffsetX;
uniform float voorwerpOffsetY;
uniform float voorwerpOffsetZ;

out vec2 texcoord;
out vec3 color;

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

	color = galaxyColor;
	
	vec3 pos = vec3(gl_in[0].gl_Position.x*userScale, gl_in[0].gl_Position.y*userScale, gl_in[0].gl_Position.z*userScale);
	mat3 rotX = rotationMatrix(vec3(1,0,0), userRotationX + 3.141592653589793/2.); //to match plane of blazar model
	mat3 rotY = rotationMatrix(vec3(0,1,0), userRotationY);
	mat3 rotZ = rotationMatrix(vec3(0,0,1), userRotationZ);
	drawSprite(vec4(vec3(rotX*rotY*rotZ*pos) + vec3(voorwerpOffsetX, voorwerpOffsetY, voorwerpOffsetZ), 1.), userPsize, 0);
}
