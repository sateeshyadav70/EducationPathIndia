import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

function ThreeDViewer({ modelUrl = '/models/college.glb', autoRotate = true }) {
  const mountRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mountRef.current) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.4, 3.4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(3, 5, 2)
    scene.add(ambientLight, directionalLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 2
    controls.maxDistance = 6

    let model
    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        model = gltf.scene
        model.scale.set(1.1, 1.1, 1.1)
        scene.add(model)
      },
      undefined,
      () => {
        setError('3D model failed to load. Add a GLB at /public/models/college.glb')
      },
    )

    const resize = () => {
      if (!mountRef.current) return
      const { clientWidth, clientHeight } = mountRef.current
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }

    resize()
    window.addEventListener('resize', resize)

    let frameId
    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      if (model && autoRotate) {
        model.rotation.y += 0.003
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frameId)
      controls.dispose()
      renderer.dispose()
      scene.clear()
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [modelUrl, autoRotate])

  return (
    <div className="three-d-viewer" ref={mountRef}>
      {error ? <p className="card-meta" style={{ padding: '16px' }}>{error}</p> : null}
    </div>
  )
}

export default ThreeDViewer
