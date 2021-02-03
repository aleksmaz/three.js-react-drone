import React, {Component} from "react";
import * as THREE from "three";
import {MapControls} from "three/examples/jsm/controls/OrbitControls";
import {DragControls} from "three/examples/jsm/controls/DragControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import droneModel from "../assets/drone.glb";
import cityModel from "../assets/lavoro.glb";


class ThreeScene extends Component {

    componentDidMount() {

        var scene, renderer, camera, city;
        let raycaster, selectedPath;
        let drone;
        let models = [],
            objects = [],
            selected = [],
            points = [],
            linesPr = []
        let i = 0, t = 0, dt = 0.002,
            a, b
        let pathCheck = false

        const buttons = document.getElementsByTagName("button");
        for (let r = 0; r < buttons.length; r++) {
            buttons[r].addEventListener("click", onButtonClick, false);
        }

        function onButtonClick() {

            if (linesPr.length >= 1) {
                scene.remove(linesPr[0])
                linesPr = []
                points = []
            }

            if (drone.visible === true) {
                objects.forEach(element => points.push(element.position))
                points.push(objects[0].position)
                const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
                const materialLine = new THREE.LineBasicMaterial({color: 0xffffff});
                const line = new THREE.Line(geometryLine, materialLine);
                linesPr.push(line);
                scene.add(line);
                pathCheck = true;
            }
        }

        let input = document.querySelector('input');
        input.addEventListener('change', onAlt)

        function onAlt() {
            if (drone.visible === true) {
                selected[0].position.y = input.value
            }
        }


        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        this.mount.appendChild(renderer.domElement);
        renderer.setPixelRatio(devicePixelRatio);
        const mouse = new THREE.Vector2();


        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);

        camera.position.z = 235;
        camera.position.y = 50;
        camera.position.x = -234;
        camera.target = new THREE.Vector3();

        const mapControls = new MapControls(camera, renderer.domElement);
        mapControls.maxPolarAngle = Math.PI / 2;

        const dragControls = new DragControls(objects, camera, renderer.domElement);
        dragControls.addEventListener('dragstart', function (event) {
            mapControls.enabled = false;
            selected[0].material.color.setHex(0x42aaf5)
            selected.pop()

        });
        dragControls.addEventListener('dragend', function (event) {
            mapControls.enabled = true;
            selectedPath = event.object
            selectedPath.material.color.setHex(0xc91625)
            selected.push(selectedPath)
            document.getElementById("posX").innerHTML = 'Position X   ' + Math.round(event.object.position.x)
            document.getElementById("posZ").innerHTML = 'Position Z   ' + Math.round(event.object.position.z)
            input.value = Math.round(event.object.position.y)
        });


        scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0x404040));
        raycaster = new THREE.Raycaster();
        const loader = new GLTFLoader();

        loadDrone();
        loadCity();

        function loadDrone() {

            loader.load(droneModel, function (gltf) {
                drone = gltf.scene
                scene.add(drone);
                drone.scale.set(0.2, 0.2, 0.2)
                drone.position.y = 30
                drone.visible = false
                drone.rotation.y = 90
                models.push(drone)
            });
        }

        function loadCity() {

            loader.load(cityModel, function (gltf) {
                city = gltf.scene
                scene.add(city);
            });
        }

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('touchend', onTouchMove, false);
        document.addEventListener('dblclick', createPath, false)

        function createPath() {

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {

                const sphereGeometry = new THREE.SphereGeometry(1.2, 32, 32);
                const sphereMaterial = new THREE.MeshBasicMaterial({color: 0x42aaf5});
                const spherePath = new THREE.Mesh(sphereGeometry, sphereMaterial);
                scene.add(spherePath);
                spherePath.position.y = intersects[0].point.y + 30
                spherePath.position.x = intersects[0].point.x
                spherePath.position.z = intersects[0].point.z
                objects.push(spherePath)
                document.getElementById("posX").innerHTML = 'Position X ' + Math.round(spherePath.position.x)
                document.getElementById("posZ").innerHTML = 'Position Z ' + Math.round(spherePath.position.z)
                input.value = Math.round(spherePath.position.y)
                if (!drone.visible) {
                    drone.visible = true;
                    drone.position.copy(spherePath.position)
                    selected.push(spherePath)
                }
            } else {
                return
            }
        }


        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onDocumentMouseMove(event) {

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function onTouchMove(event) {

            let x, y;
            if (event.changedTouches) {
                x = event.changedTouches[0].pageX;
                y = event.changedTouches[0].pageY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }
            mouse.x = (x / window.innerWidth) * 2 - 1;
            mouse.y = -(y / window.innerHeight) * 2 + 1;
        }


        function ease(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        }

        function lint(a, b, t) {
            return a + (b - a) * t
        }


        function animDrone() {

            a = {x: objects[i].position.x, y: objects[i].position.y, z: objects[i].position.z}
            b = {x: objects[i + 1].position.x, y: objects[i + 1].position.y, z: objects[i + 1].position.z}
            const newX = lint(a.x, b.x, ease(t));
            const newY = lint(a.y, b.y, ease(t));
            const newZ = lint(a.z, b.z, ease(t));
            models[0].position.set(newX, newY, newZ);
        }

        function loopDrone() {

            b = {x: objects[0].position.x, y: objects[0].position.y, z: objects[0].position.z}
            a = {
                x: objects[objects.length - 1].position.x,
                y: objects[objects.length - 1].position.y,
                z: objects[objects.length - 1].position.z
            }
            const newX = lint(a.x, b.x, ease(t));
            const newY = lint(a.y, b.y, ease(t));
            const newZ = lint(a.z, b.z, ease(t));
            models[0].position.set(newX, newY, newZ);
        }

        const animate = () => {
            requestAnimationFrame(animate);

            if (pathCheck === true) {
                if (i === objects.length - 1) {
                    loopDrone()
                    drone.lookAt(new THREE.Vector3(objects[0].position.x, objects[0].position.y, objects[0].position.z))
                    t += dt
                    if (t >= 1) {
                        i = 0
                        t = 0
                    }
                } else {

                    animDrone()
                    drone.lookAt(new THREE.Vector3(objects[i].position.x, objects[i].position.y, objects[i].position.z))
                    t += dt;
                    if (t >= 1) {
                        i++
                        t = 0
                        t += dt
                    }
                }
            }

            renderer.render(scene, camera);

        };
        animate();
    }

    render() {
        return (
            <div ref={ref => (this.mount = ref)}/>
        )
    }
}

export default ThreeScene