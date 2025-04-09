let savedView = {
  yaw: 0,
  pitch: 0
};

let scenes = {}

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
function addCubeScene(name, id, cubeFaces, hotSpots = []) {
	// Create a scene object for cubemap
	const scene = {
		title: name,
		type: "cubemap",
		cubeMap: cubeFaces, // Array of 6 image paths [front, right, back, left, up, down]
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

function initializeSchoolTour() {
	addScene("", "image", [{ yaw: 0, idToCall: "start", text: "Start the virtual tour" }]); // this is the most jank solution humanly possible
	// thank you javascript
  
	// Drone 
	addCubeScene("Aerial View", "start", [
	"/epc-a1/media/drone/pano_f.jpg",
	"/epc-a1/media/drone/pano_r.jpg",
	"/epc-a1/media/drone/pano_b.jpg",
	"/epc-a1/media/drone/pano_l.jpg",
	"/epc-a1/media/drone/pano_u.jpg",
	"/epc-a1/media/drone/pano_d.jpg"
	], [
	{ pitch: -38, yaw: 31, idToCall: "211", text: "L Block" },
	]);

	// L Block
		// Floor 1
			addScene("L Block - 1st Floor", "211", [
				{ pitch: 0, yaw: -90, idToCall: "213", text: "Forward" }, // Forward
				{ pitch: 10, yaw: -118, idToCall: "193", text: "Up" },	// Stair
			])
			addScene("L Block - 1st Floor", "213", [
				{ pitch: 0, yaw: 10, idToCall: "215", text: "Forward" },
				{ pitch: 0, yaw: 190, idToCall: "211", text: "Back" },
			])
			addScene("L Block - 1st Floor", "215", [
				{ pitch: 0, yaw: 180, idToCall: "213", text: "Back" },
			])
		// Floor 2
			addScene("L Block - 2nd Floor - Stairs", "193", [
				{ pitch: -20, yaw: -105, idToCall: "211", text: "Down" },
				{ pitch: 0, yaw: -190, idToCall: "195", text: "Forward" },
				{ pitch: 0, yaw: -82, idToCall: "191", text: "Forward" },		
			])
			// L11 Pathway
			addScene("L Block - 2nd Floor", "195", [
				{ pitch: -0, yaw: -90, idToCall: "193", text: "Back" },
				{ pitch: -0, yaw: 100, idToCall: "197", text: "Forward" },	
			])
			addScene("L Block - 2nd Floor", "197", [
				{ pitch: -0, yaw: -90, idToCall: "195", text: "Back" },
				{ pitch: -0, yaw: 100, idToCall: "199", text: "Forward" },	
			])
			addScene("L Block - 2nd Floor", "199", [
				{ pitch: -0, yaw: -60, idToCall: "197", text: "Back" },
				{ pitch: -0, yaw: 75, idToCall: "201", text: "Inside" },
				{ pitch: -20, yaw: -90, idToCall: "197", text: "Down" },	
			])
			addScene("L Block - Classroom 2", "201", [
				{ pitch: 0, yaw: -20, idToCall: "197", text: "Outside" },	
			])

			// L19 Pathway
			addScene("L Block - 2nd Floor", "191", [
				{ pitch: 0, yaw: -130, idToCall: "187", text: "Forward" },
				{ pitch: 0, yaw: -95, idToCall: "189", text: "inside" },	
				{ pitch: 0, yaw: 80, idToCall: "193", text: "Forward" },	
			])

			addScene("L Block - Classroom 1", "189", [
				{ pitch: 0, yaw: 160, idToCall: "191", text: "Outside" },	
			])
			
			addScene("L Block - 2nd Floor", "187", [
				{ pitch: 0, yaw: 120, idToCall: "191", text: "Forward" },
				{ pitch: 0, yaw: -27, idToCall: "189", text: "inside" },	
				{ pitch: 0, yaw: -130, idToCall: "185", text: "Forward" },	
			])

			addScene("L Block - 2nd Floor", "185", [
				{ pitch: 0, yaw: -35, idToCall: "187", text: "Forward" },	
				{ pitch: 0, yaw: -178, idToCall: "183", text: "Forward" },	
			])
			addScene("L Block - 2nd Floor", "183", [
				{ pitch: 0, yaw: -0, idToCall: "185", text: "Forward" },	
				{ pitch: 0, yaw: 167, idToCall: "x", text: "Forward (TODO)" },	
			])


	window.viewer.loadScene("image");
}

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

// Add review functionality
function initializeReviewSystem() {
    const reviewTrigger = document.getElementById('center-overlay');
    const reviewPopup = document.getElementById('review-popup');
    const backdrop = document.getElementById('overlay-backdrop');
    const closeButton = document.getElementById('popup-close');
    const reviewForm = document.getElementById('review-form');
    
    console.log("Review elements:", {
        trigger: reviewTrigger,
        popup: reviewPopup,
        backdrop: backdrop,
        closeButton: closeButton,
        form: reviewForm
    });
    
    if (!reviewTrigger || !reviewPopup || !backdrop || !closeButton || !reviewForm) {
        console.error("Missing review elements!");
        return;
    }
    
    // Show popup
    reviewTrigger.addEventListener('click', () => {
        console.log("Review button clicked");
        reviewPopup.style.display = 'block';
        backdrop.style.display = 'block';
    });
    
    // Close popup
    closeButton.addEventListener('click', () => {
        reviewPopup.style.display = 'none';
        backdrop.style.display = 'none';
    });
    
    // Close popup if clicking backdrop
    backdrop.addEventListener('click', () => {
        reviewPopup.style.display = 'none';
        backdrop.style.display = 'none';
    });
    
    // Handle form submission
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('review-name').value;
        const description = document.getElementById('review-description').value;
        
        // Get rating value (if selected)
        const ratingInputs = document.querySelectorAll('input[name="rating"]');
        let rating = null;
        for (const input of ratingInputs) {
            if (input.checked) {
                rating = input.value;
                break;
            }
        }
        
        // Call the sendReview function
        sendReview(name, rating, description);
        
        // Reset form and close popup
        reviewForm.reset();
        reviewPopup.style.display = 'none';
        backdrop.style.display = 'none';
        
        // Temporary alert since sendReview is not implemented yet
        alert(`Thank you, ${name}! Your review has been submitted.`);
    });
    
    console.log("Review system initialized successfully!");
}

// Placeholder for the sendReview function to be implemented later
function sendReview(name, rating, description) {
    console.log("Review submission:", { name, rating, description });
    // This function will essentially send the review data to a server or API
	// For now, we'll just log it to the console
	// For example, using fetch to send a POST request to your server
	// fetch('/submit-review', {
	//     method: 'POST',
	//     headers: {
	//         'Content-Type': 'application/json'
	//     },
	//     body: JSON.stringify({ name, rating, description })
	// })
	// .then(response => response.json())
	// .then(data => console.log("Review submitted successfully:", data))
	// .catch(error => console.error("Error submitting review:", error));
	// I would much rather use Axios but this is a school project and I don't want to add a dependency for one function
}

// Function to enhance hotspots after they're rendered
function enhanceHotspots() {
    // Wait a moment for Pannellum to render hotspots
    setTimeout(function() {
        // Find all hotspot elements
        const hotspots = document.querySelectorAll('.pnlm-hotspot');
        
        // Enhance each hotspot
        hotspots.forEach(function(hotspot) {
            // Add shadow and larger appearance without affecting position
            const hotspotImg = hotspot.querySelector('.pnlm-sprite');
            if (hotspotImg) {
                hotspotImg.style.width = '60px';
                hotspotImg.style.height = '10px';
                hotspotImg.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))';
            }
            
            // Add our custom class for additional styling
            hotspot.classList.add('enhanced-hotspot');
        });
    }, 500);
}

// Original initializeVirtualTour function
function initializeVirtualTour() {
    window.viewer = pannellum.viewer('panorama', {
        "default": {
            "firstScene": "73",
            "sceneFadeDuration": 1000,
            "autoLoad": true
        },
        "scenes": Object.assign({}, scenes)
    });
	// Sets the initial scene as 73, as for some reason the school drone one would completely break the viewer if it was set as the first scene
	// Thanks????
	// I guess???
	// Javscript !
	// It gets replaced with the white one later anyway so its chill
    
    // Initialize the tour
    initializeSchoolTour();
    
    // Apply hotspot enhancements after initialization
    enhanceHotspots();
    
    // Also enhance hotspots after scene changes
    window.viewer.on('scenechange', function() {
        enhanceHotspots();
    });
    
    // Initialize the review system immediately after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeReviewSystem();
    });
    
    // As a fallback, also try to initialize after a short delay
    setTimeout(initializeReviewSystem, 500);
    
    console.log("Virtual tour initialized successfully!");
}

// If window is already loaded when this script runs, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeReviewSystem, 100);
}

// Go!!
window.onload = initializeVirtualTour;