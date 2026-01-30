// PLY 3D Viewer Module
const PlyViewer = (function () {
  let viewer = null;
  let animationId = null;
  let resizeHandler = null;

  function init(container, plyBlobUrl) {
    // Clear previous viewer
    destroy();
    container.innerHTML = "";

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Load PLY file
    const loader = new THREE.PLYLoader();
    loader.load(
      plyBlobUrl,
      function (geometry) {
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
          vertexColors: geometry.hasAttribute("color"),
          side: THREE.DoubleSide,
          flatShading: false,
        });

        // If no vertex colors, use a default color
        if (!geometry.hasAttribute("color")) {
          material.color = new THREE.Color(0x888888);
        }

        const mesh = new THREE.Mesh(geometry, material);

        // Center the geometry
        geometry.center();

        // Scale to fit in view
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3()).length();
        const scale = 3 / size;
        mesh.scale.setScalar(scale);

        scene.add(mesh);
      },
      function (xhr) {
        // Progress callback
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.error("Error loading PLY:", error);
      }
    );

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    resizeHandler = function () {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 500;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", resizeHandler);

    viewer = { scene, camera, renderer, controls };
    return viewer;
  }

  function destroy() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (viewer) {
      if (viewer.renderer) {
        viewer.renderer.dispose();
      }
      if (viewer.controls) {
        viewer.controls.dispose();
      }
      viewer = null;
    }
  }

  function getViewer() {
    return viewer;
  }

  return {
    init,
    destroy,
    getViewer,
  };
})();
