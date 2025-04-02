let savedView = {
    yaw: 0,
    pitch: 0
  };
  
  let scenes = {}
  
  // Function to add a new scene to the viewer
  function addScene(name, id, hotSpots = []) {
    // Create the file path based on the ID
    const filePath = `/epc-a1/media/school-r1/${id}_compressed.jpg`;
    
    // Create a scene object
    const scene = {
      title: name,
      type: "equirectangular",
      panorama: filePath,
      hotSpots: []
    };
    
    // Add hotspots to the scene
    hotSpots.forEach(hotspot => {
      scene.hotSpots.push({
        pitch: hotspot.pitch || 0,
        yaw: hotspot.yaw,
        type: "scene",
        text: hotspot.text || `Location ${hotspot.idToCall}`,
        sceneId: hotspot.idToCall,
        clickHandlerFunc: function() {
          window.loadScene(hotspot.idToCall);
        }
      });
    });
    
    // Add the scene to the viewer's config
    const config = window.viewer.getConfig();
    config.scenes[id] = scene;
    scenes[id] = scene;
    return config;
  }
  
  // Initialize the school tour based on the floor plan
  function initializeSchoolTour() {
      //Example
    addScene("Main Entrance", "73", [
      { yaw: 90, idToCall: "start", text: "Toward Location 71" },
    ]);
    
    window.viewer.loadScene("73");
  }
  
  // Function to load a scene while preserving view orientation
  function loadScene(id) {
    try {
      const currentPitch = window.viewer.getPitch();
      const currentYaw = window.viewer.getYaw();
      const currentHfov = window.viewer.getHfov();
      
      console.log(`Loading scene ${id} with yaw: ${currentYaw}, pitch: ${currentPitch}`);
      
      // Check if scene exists in config
      const config = window.viewer.getConfig();
      if (!config.scenes[id]) {
        console.error(`Scene ${id} not found in configuration`);
        return;
      }
      
      // For cubemap scenes, ensure all images are preloaded before switching
      if (config.scenes[id].type === 'cubemap') {
        let preloadedCount = 0;
        const cubeMap = config.scenes[id].cubeMap;
        
        // Verify cubeMap is an array with 6 elements
        if (!Array.isArray(cubeMap) || cubeMap.length !== 6) {
          console.error(`Invalid cubeMap configuration for scene ${id}`);
          return;
        }
        
        // Preload all cubemap images
        cubeMap.forEach((url) => {
          const img = new Image();
          img.onload = () => {
            preloadedCount++;
            if (preloadedCount === 6) {
              // All images loaded, now switch scene
              window.viewer.loadScene(id, currentPitch, currentYaw, currentHfov, 0, function() {
                console.log(`Successfully switched to scene ${id}`);
              });
            }
          };
          img.onerror = () => {
            console.error(`Failed to load cubemap image: ${url}`);
          };
          img.src = url;
        });
      } else {
        // For non-cubemap scenes, switch directly
        window.viewer.loadScene(id, currentPitch, currentYaw, currentHfov, 0, function() {
          console.log(`Successfully switched to scene ${id}`);
        });
      }
    } catch (error) {
      console.error(`Error loading scene ${id}:`, error);
    }
  }
  
  // Add a function to initialize the entire virtual tour
  function initializeVirtualTour() {
    // Initialize the panorama viewer
    
    window.viewer = pannellum.viewer('panorama', {
      "default": {
        "firstScene": "73",
        "sceneFadeDuration": 0,
        "autoLoad": true
      },
      "scenes": Object.assign({
        "start": {
          "title": "",
          "type": "cubemap",
          "cubeMap": [
            "/epc-a1/media/drone/pano_f.jpg",
            "/epc-a1/media/drone/pano_r.jpg",
            "/epc-a1/media/drone/pano_b.jpg",
            "/epc-a1/media/drone/pano_l.jpg",
            "/epc-a1/media/drone/pano_u.jpg",
            "/epc-a1/media/drone/pano_d.jpg"
          ]
        }
      }, scenes) // Merge predefined scene with dynamically added scenes
    });
    initializeSchoolTour();
    console.log("Virtual tour initialized successfully!");
    console.log(scenes);
  }
  
  // Call this function when the page loads
  window.onload = initializeVirtualTour;