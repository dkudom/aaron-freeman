"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import * as THREE from 'three'

export default function Globe3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    let THREE_Instance: any

    const initThree = async () => {
      const ThreeModule = await import("three")
      THREE_Instance = ThreeModule

      if (!mountRef.current) return

      const globeSize = 500

      // Scene setup
      const scene = new THREE_Instance.Scene()
      const camera = new THREE_Instance.PerspectiveCamera(60, globeSize / globeSize, 0.1, 1000)
      const renderer = new THREE_Instance.WebGLRenderer({ antialias: true, alpha: true })

      renderer.setSize(globeSize, globeSize)
      renderer.setClearColor(0x000000, 0)

      if (mountRef.current) {
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement)
      }

      sceneRef.current = scene
      rendererRef.current = renderer

      // Load earth texture map
      const textureLoader = new THREE_Instance.TextureLoader()
      const earthMap = await textureLoader.loadAsync("/textures/earth-map.png")
      const bumpMap = await textureLoader.loadAsync("/textures/earth-bump.png")
      const specularMap = await textureLoader.loadAsync("/textures/earth-specular.png")

      // Create globe
      const globeRadius = 2.5
      const globeGeometry = new THREE_Instance.SphereGeometry(globeRadius, 64, 64)
      const globeMaterial = new THREE_Instance.MeshPhongMaterial({
        map: earthMap,
        bumpMap: bumpMap,
        bumpScale: 0.1,
        specularMap: specularMap,
        specular: new THREE_Instance.Color(0x444444),
        shininess: 15,
        transparent: true,
        opacity: 0.9,
      })

      const globe = new THREE_Instance.Mesh(globeGeometry, globeMaterial)
      scene.add(globe)

      // Add wireframe overlay
      const wireframeGeo = new THREE_Instance.SphereGeometry(globeRadius + 0.01, 48, 48);
      const wireframeMat = new THREE_Instance.MeshBasicMaterial({
        color: 0x00ffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.20
      });
      const wireframeMesh = new THREE_Instance.Mesh(wireframeGeo, wireframeMat);
      globe.add(wireframeMesh);

      // Create atmosphere
      const atmosphereGeometry = new THREE_Instance.SphereGeometry(globeRadius + 0.1, 64, 64)
      const atmosphereMaterial = new THREE_Instance.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            gl_FragColor = vec4(0.0, 0.8, 0.8, 1.0) * intensity;
          }
        `,
        blending: THREE_Instance.AdditiveBlending,
        side: THREE_Instance.BackSide,
        transparent: true,
      })

      const atmosphere = new THREE_Instance.Mesh(atmosphereGeometry, atmosphereMaterial)
      scene.add(atmosphere)

      // Create holographic grid
      const gridGeometry = new THREE_Instance.SphereGeometry(globeRadius + 0.2, 32, 32)
      const gridMaterial = new THREE_Instance.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float time;
          
          void main() {
            float gridVal = 0.0;
            
            float line1 = step(0.985, mod(vUv.x * 25.0 + time, 1.0));
            float line2 = step(0.985, mod(vUv.y * 12.5 + time * 0.5, 1.0));
            
            gridVal = max(line1, line2) * 0.25;
            
            gl_FragColor = vec4(0.0, 1.0, 1.0, gridVal);
          }
        `,
        uniforms: {
          time: { value: 0 },
        },
        transparent: true,
        blending: THREE_Instance.AdditiveBlending,
      })

      const grid = new THREE_Instance.Mesh(gridGeometry, gridMaterial)
      scene.add(grid)

      // Lighting
      const ambientLight = new THREE_Instance.AmbientLight(0x606060, 0.7)
      scene.add(ambientLight)

      const pointLight = new THREE_Instance.PointLight(0x00ffff, 0.8, 150)
      pointLight.position.set(8, 8, 8)
      scene.add(pointLight)

      // Camera position
      camera.position.z = 7

      // Animation loop
      let time = 0
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)
        time += 0.001

        gridMaterial.uniforms.time.value = time

        globe.rotation.y += 0.0015
        atmosphere.rotation.y += 0.0015
        grid.rotation.y += 0.0008

        pointLight.position.x = Math.cos(time * 1.5) * 8
        pointLight.position.z = Math.sin(time * 1.5) * 8

        renderer.render(scene, camera)
      }

      animate()
    }

    initThree()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (rendererRef.current && mountRef.current) {
        if (mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        }
        rendererRef.current.dispose()
      }
      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
            const mesh = object as THREE.Mesh;
            if (!mesh.isMesh) return
            
            mesh.geometry.dispose()
    
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(material => cleanMaterial(material as THREE.Material));
            } else {
                cleanMaterial(mesh.material as THREE.Material);
            }
        })
      }
    }
  }, [])

  const cleanMaterial = (material: THREE.Material) => {
    material.dispose()

    for (const key of Object.keys(material)) {
        const value = (material as any)[key];
        if (value && typeof value === 'object' && 'isTexture' in value) {
            (value as THREE.Texture).dispose();
        }
    }
  }

  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <div className="relative overflow-hidden rounded-full border border-cyan-500/30 bg-black/30 backdrop-blur-sm aspect-square">
        <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
      </div>

      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h4 className="text-lg font-semibold text-cyan-300 dark:text-cyan-300 mb-2">Dynamic Worldview</h4>
        <p className="text-gray-400 dark:text-gray-400 text-sm">Visualizing global interconnectedness and sustainable futures.</p>
      </motion.div>
    </motion.div>
  )
}
