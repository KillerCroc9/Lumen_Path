import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Player } from './player.js';
import { Island } from './island.js';
import { Beacon } from './beacon.js';
import { AudioManager } from './audio.js';

class LumenPath {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.player = null;
        this.islands = [];
        this.beacons = [];
        this.particles = [];
        this.activeBeaconCount = 0;
        this.nearestBeacon = null;
        this.audioManager = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Post-processing setup
        this.setupPostProcessing();

        // Lighting
        this.setupLighting();

        // Create world
        this.createWorld();

        // Player
        this.player = new Player(this.scene);

        // Audio
        this.audioManager = new AudioManager();

        // Particles
        this.createParticles();
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,
            0.4,
            0.85
        );
        this.composer.addPass(bloomPass);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        this.scene.add(ambientLight);

        // Directional light (moon/sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(20, 50, 30);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // Hemisphere light for sky
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x1a1a2e, 0.3);
        this.scene.add(hemisphereLight);
    }

    createWorld() {
        // Create 5 islands in a path
        const islandPositions = [
            { x: 0, y: 0, z: 0 },
            { x: 15, y: 2, z: -5 },
            { x: 30, y: 1, z: 5 },
            { x: 45, y: 3, z: -3 },
            { x: 60, y: 2, z: 2 }
        ];

        islandPositions.forEach((pos, index) => {
            const island = new Island(pos, index === 0);
            this.scene.add(island.mesh);
            this.islands.push(island);

            // Create beacon on each island
            const beacon = new Beacon(
                new THREE.Vector3(pos.x, pos.y + 2, pos.z),
                index
            );
            this.scene.add(beacon.mesh);
            this.beacons.push(beacon);
        });

        // Create bridges (initially invisible)
        this.createBridges();
    }

    createBridges() {
        for (let i = 0; i < this.islands.length - 1; i++) {
            const start = this.islands[i].position;
            const end = this.islands[i + 1].position;
            
            const direction = new THREE.Vector3()
                .subVectors(end, start);
            const distance = direction.length();
            
            const bridgeGeometry = new THREE.BoxGeometry(2, 0.3, distance);
            const bridgeMaterial = new THREE.MeshStandardMaterial({
                color: 0x4444ff,
                emissive: 0x2222ff,
                emissiveIntensity: 0,
                transparent: true,
                opacity: 0
            });
            
            const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
            bridge.position.copy(start).lerp(end, 0.5);
            bridge.position.y = Math.max(start.y, end.y) + 0.5;
            bridge.lookAt(end);
            bridge.rotateX(Math.PI / 2);
            
            bridge.castShadow = true;
            bridge.receiveShadow = true;
            
            this.scene.add(bridge);
            bridge.userData.bridgeIndex = i;
            bridge.userData.activated = false;
        }
    }

    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: Math.random() * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        this.particles = { mesh: particles, velocities };
    }

    updateParticles(delta) {
        const positions = this.particles.mesh.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3] += this.particles.velocities[i].x;
            positions[i * 3 + 1] += this.particles.velocities[i].y;
            positions[i * 3 + 2] += this.particles.velocities[i].z;

            // Wrap around
            if (positions[i * 3 + 1] > 50) positions[i * 3 + 1] = 0;
            if (positions[i * 3] > 50) positions[i * 3] = -50;
            if (positions[i * 3] < -50) positions[i * 3] = 50;
            if (positions[i * 3 + 2] > 50) positions[i * 3 + 2] = -50;
            if (positions[i * 3 + 2] < -50) positions[i * 3 + 2] = 50;
        }
        
        this.particles.mesh.geometry.attributes.position.needsUpdate = true;
    }

    updateBridges(delta) {
        this.scene.children.forEach(child => {
            if (child.userData.isAnimating && child.userData.activationProgress !== undefined) {
                child.userData.activationProgress += delta * 0.5;
                
                const progress = Math.min(child.userData.activationProgress, 0.7);
                child.material.opacity = progress;
                child.material.emissiveIntensity = Math.min(progress * 2, 0.5);
                
                if (child.userData.activationProgress >= 0.7) {
                    child.userData.isAnimating = false;
                }
            }
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start button
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        // Keyboard input
        document.addEventListener('keydown', (event) => {
            if (event.key === 'e' || event.key === 'E') {
                this.tryActivateBeacon();
            }
        });
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        this.isRunning = true;
        this.audioManager.playAmbient();
        this.animate();
    }

    tryActivateBeacon() {
        if (this.nearestBeacon && !this.nearestBeacon.isActivated) {
            this.activateBeacon(this.nearestBeacon);
        }
    }

    activateBeacon(beacon) {
        beacon.activate();
        this.activeBeaconCount++;
        
        // Update UI
        document.getElementById('beacon-count').textContent = this.activeBeaconCount;
        
        // Play sound
        this.audioManager.playBeaconActivation();
        
        // Activate bridge to next island
        const bridgeIndex = beacon.islandIndex;
        if (bridgeIndex < this.islands.length - 1) {
            this.activateBridge(bridgeIndex);
        }
        
        // Update world lighting
        this.updateWorldLighting();
        
        // Check if all beacons are activated
        if (this.activeBeaconCount === this.beacons.length) {
            this.onAllBeaconsActivated();
        }
    }

    activateBridge(bridgeIndex) {
        const bridges = this.scene.children.filter(
            child => child.userData.bridgeIndex === bridgeIndex
        );
        
        bridges.forEach(bridge => {
            if (!bridge.userData.activated) {
                bridge.userData.activated = true;
                bridge.userData.activationProgress = 0;
                bridge.userData.isAnimating = true;
            }
        });
    }

    updateWorldLighting() {
        const progress = this.activeBeaconCount / this.beacons.length;
        
        // Update ambient light
        const ambientLight = this.scene.children.find(
            child => child instanceof THREE.AmbientLight
        );
        if (ambientLight) {
            ambientLight.intensity = 0.3 + progress * 0.4;
        }
        
        // Update fog
        this.scene.fog.density = 0.02 - progress * 0.015;
        
        // Update background color (darker to lighter)
        const startColor = new THREE.Color(0x1a1a2e);
        const endColor = new THREE.Color(0x2a3a5e);
        this.scene.background.lerpColors(startColor, endColor, progress);
    }

    onAllBeaconsActivated() {
        console.log('All beacons activated! World restored!');
        this.audioManager.playVictory();
        
        // Hide instructions
        document.getElementById('instructions').classList.add('hidden');
        
        // Could add victory screen or continue exploring
    }

    checkNearestBeacon() {
        let nearest = null;
        let minDistance = 5; // Activation range

        this.beacons.forEach(beacon => {
            const distance = this.player.position.distanceTo(beacon.position);
            if (distance < minDistance && !beacon.isActivated) {
                minDistance = distance;
                nearest = beacon;
            }
        });

        // Update UI
        const prompt = document.getElementById('interaction-prompt');
        if (nearest && nearest !== this.nearestBeacon) {
            prompt.classList.add('visible');
        } else if (!nearest) {
            prompt.classList.remove('visible');
        }

        this.nearestBeacon = nearest;
    }

    updateCamera() {
        // Smooth camera follow
        const idealOffset = new THREE.Vector3(0, 5, 10);
        const idealLookat = new THREE.Vector3(
            this.player.position.x,
            this.player.position.y + 2,
            this.player.position.z
        );
        
        const idealPosition = this.player.position.clone().add(idealOffset);
        
        this.camera.position.lerp(idealPosition, 0.1);
        this.camera.lookAt(idealLookat);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();

        // Update player
        this.player.update(delta);

        // Update camera
        this.updateCamera();

        // Update beacons
        this.beacons.forEach(beacon => beacon.update(delta));

        // Update bridges
        this.updateBridges(delta);

        // Update particles
        this.updateParticles(delta);

        // Check for beacon interaction
        this.checkNearestBeacon();

        // Render
        this.composer.render();
    }
}

// Initialize game
// Note: ES modules with type="module" are deferred by default and execute after DOM is parsed
// Using document.readyState check to handle cases where DOM might already be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LumenPath();
    });
} else {
    // DOM is already loaded
    new LumenPath();
}
