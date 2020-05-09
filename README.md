# Tesseract-Example
May 9th, 2020

[![Run on Repl.it](https://repl.it/badge/github/19UV/Tesseract-Example)](https://repl.it/github/19UV/Tesseract-Example)

![Screenshot](/docs/Example.png)

This project was an attempt at using a Raymarching (a type of Ray Tracing) method to render multi-dimensional objects. In this instance, a mathmatically defined 4d shape is projected into a 3d area, and in turn, projected onto a 2d screen.

## Equations
All equations are written in GLSL, and are given a 4d point (p), and some attributes (radius, dimensions, etc) and return a distance. 
See http://www2.imm.dtu.dk/pubdb/edoc/imm6392.pdf (Sphere Tracing) for a more in depth explanation.

Tesseract
```
float sdBox( vec4 p, vec4 b )
{
  vec4 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,max(q.z, q.w))),0.0);
}
```

Hypersphere
```
float sdSphere(in vec4 p, in float s)
{
	return length( p ) - s;
}
```

Hypercone
```
float sdCone( vec4 p ) {
    return length( vec3(p.xyz) ) - p.w;
}
```

## Future Work
* Colors
* Texturing (Image and Function)
* Collision
* Physics
* Post-processing
 * Fog
 * Bloom
Past this point, I hope to translate this to OpenGL, and eventually create a full-fledged graphics engine that can be used in both rendering and games.
