precision mediump float;

uniform float iTime;

uniform int shape;

uniform float tXY;
uniform float tYZ;
uniform float tXZ;
uniform float tXW;
uniform float tYW;
uniform float tZW;

varying vec2 uv;

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01

vec4 rotate(vec4 p, float xy, float yz, float xz, float xw, float yw, float zw) {
  mat4 mXY = mat4(
    vec4(cos(xy), sin(xy), 0, 0),
    vec4(-sin(xy), cos(xy), 0, 0),
    vec4(0, 0, 1, 0),
    vec4(0, 0, 0, 1)
  );

  mat4 mYZ = mat4(
    vec4(1, 0, 0, 0),
    vec4(0, cos(yz), sin(yz), 0),
    vec4(0, -sin(yz), cos(yz), 0),
    vec4(0, 0, 0, 1)
  );

  mat4 mXZ = mat4(
    vec4(cos(xz), 0, -sin(xz), 0),
    vec4(0, 1, 0, 0),
    vec4(sin(xz), 0, cos(xz), 0),
    vec4(0, 0, 0, 1)
  );

  mat4 mXW = mat4(
    vec4(cos(xw), 0, 0, sin(xw)),
    vec4(0, 1, 0, 0),
    vec4(0, 0, 1, 0),
    vec4(-sin(xw), 0, 0, cos(xw))
  );

  mat4 mYW = mat4(
    vec4(1, 0, 0, 0),
    vec4(0, cos(yw), 0, -sin(yw)),
    vec4(0, 0, 1, 0),
    vec4(0, sin(yw), 0, cos(yw))
  );

  mat4 mZW = mat4(
    vec4(1, 0, 0, 0),
    vec4(0, 1, 0, 0),
    vec4(0, 0, cos(zw), -sin(zw)),
    vec4(0, 0, sin(zw), cos(zw))
  );

  return p * mXY * mYZ * mXZ * mXW * mYW * mZW;
}

float sdSphere(in vec4 p, in float s)
{
	return length( p ) - s;
}

float sdBox( vec4 p, vec4 b )
{
  vec4 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,max(q.z, q.w))),0.0);
}

#define OBJ_COUNT 2

float GetDist(vec4 p)
{
    float shortest_dist = MAX_DIST;
    
    float objs[OBJ_COUNT];
    objs[0] = sdBox(rotate(p - vec4(0, 2.5, 6, 0), iTime*tXY, iTime*tYZ, iTime*tXZ, iTime*tXW, iTime*tYW, iTime*tZW), vec4(1.0));
    //objs[0] = sdBox(box_rot - vec4(0, 2.5, 6, 0), vec4(1.0));
    objs[1] = p.y;
    
    for (int i=0;i<OBJ_COUNT;i++) shortest_dist = min(shortest_dist, objs[i]);
    
    return shortest_dist;
}

float trace(vec4 po, vec3 rd)
{
	float dO = 0.0;
    
    for(int i=0;i<MAX_STEPS;i++)
    {
    	vec4 p = po + vec4((rd * dO), 0);
        float dS = GetDist(p);
        dO += dS;
        if(dO>MAX_DIST || dS<SURF_DIST) break;
    }
    
    return dO;
}

vec4 GetNormal(in vec4 p)
{
	float d = GetDist(p);
  vec2 e = vec2(0.01, 0);
    
  vec4 n = d - vec4(
    GetDist(p-e.xyyy),
    GetDist(p-e.yxyy),
    GetDist(p-e.yyxy),
    GetDist(p-e.yyyx)
  );
    
  return normalize(n);
}

float GetLight(in vec4 p)
{
	vec4 light_pos = vec4(1, 4, 4, 0);
    // light_pos.xz += vec2(sin(iTime), cos(iTime)) * 2.0;
    vec4 l = normalize(light_pos - p);
    vec4 n = GetNormal(p);
    
    float dif = clamp(dot(n, l), 0.0, 1.0);

    float d = trace(p + (n *SURF_DIST*1.5), normalize(l).xyz); // Possible remove normalize
    if (d < length(light_pos - p)) dif *= 0.35;
    
    return dif;
}

void main()
{
  vec4 ro = vec4(0, 4, 0, 0);
  vec3 rd = normalize(vec3(uv.x, uv.y, 1));
    
  float d = trace(ro, rd);
    
  vec4 p = ro + vec4((rd * d), 0);
    
  float dif = GetLight(p);
    
  vec3 col = vec3(dif);
    
  gl_FragColor = vec4(col, 1);
}