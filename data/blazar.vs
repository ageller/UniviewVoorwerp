out vec3 lightDir1, lightDir2, normal, eyeVec;
out vec2 texCoord0;

in vec3 uv_vertexAttrib;
in vec3 uv_normalAttrib;
in vec2 uv_texCoordAttrib0;

uniform vec4 uv_lightPos;

uniform mat4 uv_modelViewProjectionMatrix;

uniform mat4 uv_object2SceneMatrix;
uniform mat4 uv_scene2ObjectMatrix;
uniform vec4 uv_cameraPos;

void main(void)
{

	mat4 normalMatrix = transpose( uv_scene2ObjectMatrix );
	
	normal = (normalMatrix * vec4(uv_normalAttrib,0.0)).xyz;
	gl_Position = vec4(uv_vertexAttrib ,1.0);;

	vec3 vVertex = vec3(uv_object2SceneMatrix* vec4(uv_vertexAttrib,1.0));
	vec3 tmpVec = normalize( (uv_object2SceneMatrix* uv_lightPos).xyz );

	//point light at center
	lightDir1 = -1.*vVertex.xyz;

	//some diffuse lighting from the opposite direction
	lightDir2 = vVertex.xyz;

	eyeVec = uv_cameraPos.xyz-vVertex;

	texCoord0.s  = uv_texCoordAttrib0.s;
	texCoord0.t  = uv_texCoordAttrib0.t;
}
