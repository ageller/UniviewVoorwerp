layout(triangles) in;
layout(triangle_strip, max_vertices=3) out;
in vec3 lightDir1[];
in vec3 lightDir2[];
in vec3 normal[];
in vec3 eyeVec[];
out vec3 LightDir1;
out vec3 LightDir2;
out vec3 Normal;
out vec3 EyeVec;


uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewProjectionInverseMatrix;
uniform mat4 uv_modelViewMatrix;
uniform mat4 uv_projectionMatrix;
uniform mat4 uv_projectionInverseMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform vec4 uv_cameraPos;
uniform mat4 uv_scene2ObjectMatrix;

uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;
uniform float uv_fade;

uniform float voorwerpOffsetX;
uniform float voorwerpOffsetY;
uniform float voorwerpOffsetZ;
uniform float userRotationX;
uniform float userRotationY;
uniform float userRotationZ;
out vec2 texcoord;

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

void main()
{

	vec3 offset = vec3(voorwerpOffsetX, voorwerpOffsetY, voorwerpOffsetZ);
	mat3 rotX = rotationMatrix(vec3(1,0,0), userRotationX);
	mat3 rotY = rotationMatrix(vec3(0,1,0), userRotationY);
	mat3 rotZ = rotationMatrix(vec3(0,0,1), userRotationZ);
	for (int i=0;i<3;i++) {
		gl_Position =  uv_modelViewProjectionMatrix *vec4(vec3(rotX*rotY*rotZ*gl_in[i].gl_Position.xyz + offset), gl_in[i].gl_Position.w);
		texcoord = gl_in[i].gl_Position.xz;
		
		LightDir1 = lightDir1[i];
		LightDir2 = lightDir2[i];

		Normal = normal[i];
		EyeVec = eyeVec[i];
		EmitVertex();
	}


	EndPrimitive();


}
