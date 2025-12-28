import * as THREE from 'three';

export class Island {
    constructor(position, isStartingIsland = false) {
        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.isStartingIsland = isStartingIsland;
        
        this.createMesh();
    }

    createMesh() {
        // Create a low-poly island
        const group = new THREE.Group();

        // Main island base (irregular hexagon shape)
        const baseGeometry = new THREE.CylinderGeometry(5, 4, 2, 6);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a5f5a,
            roughness: 0.8,
            metalness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Top layer (grass/vegetation)
        const topGeometry = new THREE.CylinderGeometry(4.8, 4.8, 0.3, 6);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c59,
            roughness: 0.9,
            metalness: 0.1
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1.15;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);

        // Add some decorative rocks
        for (let i = 0; i < 3; i++) {
            const rockSize = 0.3 + Math.random() * 0.4;
            const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a6a7a,
                roughness: 0.9,
                metalness: 0.1
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            const angle = (i / 3) * Math.PI * 2;
            const radius = 3 + Math.random();
            rock.position.set(
                Math.cos(angle) * radius,
                1.3,
                Math.sin(angle) * radius
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
        }

        // Add glowing crystals (flora)
        for (let i = 0; i < 4; i++) {
            const crystalGeometry = new THREE.ConeGeometry(0.2, 0.8, 4);
            const crystalMaterial = new THREE.MeshStandardMaterial({
                color: 0x6a9fb5,
                emissive: 0x4a7f95,
                emissiveIntensity: 0.3,
                roughness: 0.3,
                metalness: 0.7
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
            const radius = 2.5 + Math.random() * 0.5;
            crystal.position.set(
                Math.cos(angle) * radius,
                1.7,
                Math.sin(angle) * radius
            );
            crystal.rotation.x = Math.PI;
            crystal.castShadow = true;
            group.add(crystal);

            // Add point light for crystal glow
            const crystalLight = new THREE.PointLight(0x6a9fb5, 0.3, 3);
            crystalLight.position.copy(crystal.position);
            group.add(crystalLight);
        }

        group.position.copy(this.position);
        this.mesh = group;
    }
}
