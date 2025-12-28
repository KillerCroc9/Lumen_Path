import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 5;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.createMesh();
        this.setupControls();
    }

    createMesh() {
        // Simple player representation (glowing sphere)
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffed4e,
            emissiveIntensity: 0.5,
            metalness: 0.3,
            roughness: 0.4
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Add a point light to the player
        this.light = new THREE.PointLight(0xffd700, 1, 10);
        this.light.position.copy(this.position);
        this.scene.add(this.light);
    }

    setupControls() {
        window.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        window.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
    }

    handleKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
        }
    }

    update(delta) {
        // Calculate movement direction
        const moveDirection = new THREE.Vector3(0, 0, 0);

        if (this.keys.forward) moveDirection.z -= 1;
        if (this.keys.backward) moveDirection.z += 1;
        if (this.keys.left) moveDirection.x -= 1;
        if (this.keys.right) moveDirection.x += 1;

        // Normalize and apply speed
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            this.velocity.x = moveDirection.x * this.speed * delta;
            this.velocity.z = moveDirection.z * this.speed * delta;
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }

        // Update position
        this.position.add(this.velocity);

        // Keep player above ground
        this.position.y = 2;

        // Update mesh and light position
        this.mesh.position.copy(this.position);
        this.light.position.copy(this.position);

        // Add subtle bobbing animation when moving
        if (moveDirection.length() > 0) {
            const bobAmount = Math.sin(Date.now() * 0.005) * 0.1;
            this.mesh.position.y += bobAmount;
        }
    }
}
