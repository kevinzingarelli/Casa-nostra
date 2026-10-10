import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { roomType } from '../lib/rooms'

export default function HouseView({ rooms }) {
  const host = useRef(null)
  const reset = useRef(() => {})
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const element = host.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) }
    catch { setFailed(true); return }
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#edf0e8')
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.setAttribute('aria-label', 'Modello 3D delle stanze: trascina per ruotare, pizzica per ingrandire')
    renderer.domElement.setAttribute('role', 'img')
    element.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI / 2.1
    controls.minDistance = 8; controls.maxDistance = 60
    const render = () => renderer.render(scene, camera)
    const bounds = rooms.length ? {
      minX: Math.min(...rooms.map(r => r.x)), maxX: Math.max(...rooms.map(r => r.x + r.w)),
      minZ: Math.min(...rooms.map(r => r.y)), maxZ: Math.max(...rooms.map(r => r.y + r.l)),
    } : { minX: 0, maxX: 22, minZ: 0, maxZ: 22 }
    const cx = (bounds.minX + bounds.maxX) / 2, cz = (bounds.minZ + bounds.maxZ) / 2
    const distance = Math.max(10, Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) * 1.2)
    reset.current = () => { const fit = distance * Math.max(1, element.clientHeight / Math.max(1, element.clientWidth)); camera.position.set(cx + fit, fit * 1.15, cz + fit); controls.target.set(cx, 0, cz); controls.update(); render() }
    scene.add(new THREE.HemisphereLight(0xffffff, 0x809076, 3))
    const sun = new THREE.DirectionalLight(0xffffff, 3)
    sun.position.set(8, 22, 12); scene.add(sun)
    const ground = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 24), new THREE.MeshStandardMaterial({ color: '#d9dfcf', roughness: 1 }))
    ground.position.set(11, -0.3, 11); scene.add(ground)
    const grid = new THREE.GridHelper(22, 22, '#adb8a1', '#c5cebc')
    grid.position.set(11, -0.18, 11); scene.add(grid)
    for (const room of rooms) {
      const type = roomType(room.type)
      const floor = new THREE.Mesh(new THREE.BoxGeometry(room.w, 0.15, room.l), new THREE.MeshStandardMaterial({ color: type.color, roughness: 0.85 }))
      floor.position.set(room.x + room.w / 2, 0, room.y + room.l / 2); scene.add(floor)
      // Pareti in sezione per vedere l'interno: modello schematico, non edilizio.
      const wallMaterial = new THREE.MeshStandardMaterial({ color: '#fff9ed', roughness: 0.8, side: THREE.DoubleSide })
      const back = new THREE.Mesh(new THREE.BoxGeometry(room.w, 2.6, 0.13), wallMaterial)
      back.position.set(room.x + room.w / 2, 1.3, room.y); scene.add(back)
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.6, room.l), wallMaterial)
      side.position.set(room.x, 1.3, room.y + room.l / 2); scene.add(side)
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 128)
      ctx.fillStyle = '#243025'; ctx.textAlign = 'center'; ctx.font = 'bold 36px sans-serif'
      ctx.fillText(type.name, 256, 52, 490)
      ctx.font = '28px sans-serif'; ctx.fillText(`${room.w} × ${room.l} m`, 256, 99)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }))
      sprite.position.set(room.x + room.w / 2, 0.8, room.y + room.l / 2)
      sprite.scale.set(Math.min(room.w, 4), Math.min(room.w, 4) / 4, 1); scene.add(sprite)
    }
    const resize = () => { const width = element.clientWidth; const height = element.clientHeight; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); reset.current() }
    const observer = new ResizeObserver(resize); observer.observe(element)
    controls.addEventListener('change', render); reset.current(); resize()
    return () => {
      observer.disconnect(); controls.dispose()
      scene.traverse(object => { object.geometry?.dispose(); const mats = Array.isArray(object.material) ? object.material : [object.material]; mats.filter(Boolean).forEach(m => { m.map?.dispose(); m.dispose() }) })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [rooms])
  return <section><div className="dream-heading"><span className="eyebrow">Un altro punto di vista</span><h2>Entra negli spazi</h2><p>Trascina per ruotare. Usa due dita o la rotellina per avvicinarti.</p></div>
    {failed ? <p className="alert info">Questo browser non supporta la vista 3D. Puoi continuare dalla Planimetria.</p> : <><div className="house-view" ref={host} /><button className="btn secondary" onClick={() => reset.current()}>Rimetti al centro</button></>}
    <p className="dream-note">Vista schematica delle stanze, con pareti aperte per vedere gli interni. Si aggiorna con la planimetria; arredi e desideri speciali non sono ancora modellati.</p>
  </section>
}
