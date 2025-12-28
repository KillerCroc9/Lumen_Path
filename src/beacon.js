import * as THREE from 'three';

export class Beacon {
    constructor(position, islandIndex) {
        this.position = position;
        this.islandIndex = islandIndex;
        this.isActivated = false;
        this.pulseTime = 0;
        
        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        // Beacon base (pedestal)
        const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 1.5, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.7,
            metalness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Beacon crystal (the glowing part)
        const crystalGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            emissive: 0x222222,
            emissiveIntensity: 0.1,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8
        });
        this.crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        this.crystal.position.y = 1.2;
        this.crystal.castShadow = true;
        group.add(this.crystal);

        // Point light (initially dim)
        this.light = new THREE.PointLight(0xffd700, 0, 15);
        this.light.position.y = 1.2;
        this.light.castShadow = true;
        group.add(this.light);

        // Activation ring (initially invisible)
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffed4e,
            emissiveIntensity: 0,
            transparent: true,
            opacity: 0
        });
        this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ring.position.y = 0.2;
        this.ring.rotation.x = Math.PI / 2;
        group.add(this.ring);

        group.position.copy(this.position);
        this.mesh = group;
    }

    activate() {
        if (this.isActivated) return;
        
        this.isActivated = true;

        // Animate crystal activation
        const targetEmissive = new THREE.Color(0xffd700);
        const targetColor = new THREE.Color(0xffed4e);
        
        let progress = 0;
        const animate = () => {
            progress += 0.02;
            
            if (progress < 1) {
                // Crystal glow
                this.crystal.material.emissive.lerp(targetEmissive, 0.1);
                this.crystal.material.emissiveIntensity = Math.min(progress * 2, 1.5);
                this.crystal.material.color.lerp(targetColor, 0.1);
                
                // Light intensity
                this.light.intensity = progress * 3;
                
                // Ring appearance
                this.ring.material.opacity = Math.min(progress, 0.8);
                this.ring.material.emissiveIntensity = Math.min(progress, 0.7);
                
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    update(delta) {
        if (!this.isActivated) {
            // Gentle idle pulse for inactive beacons
            this.pulseTime += delta;
            const pulse = Math.sin(this.pulseTime * 2) * 0.05 + 0.1;
            this.crystal.material.emissiveIntensity = pulse;
        } else {
            // Rotating animation when activated
            this.crystal.rotation.y += delta * 0.5;
            this.ring.rotation.z += delta * 0.3;
            
            // Pulsing glow
            this.pulseTime += delta;
            const pulse = Math.sin(this.pulseTime * 3) * 0.2 + 1.3;
            this.crystal.material.emissiveIntensity = pulse;
            this.light.intensity = pulse * 2 + 1;
        }
    }
}
