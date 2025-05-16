/**
 * This file adds sample shapes to the canvas when the application starts
 * and adds event handlers for the help button
 */

// Function to create pre-drawn sample shapes
function addSampleShapes() {
    // Wait for the canvas and drawing system to be fully initialized
    setTimeout(() => {
        // Get the DrawingManager instance
        const drawingManager = window.appInstance?.drawingManager;
        if (!drawingManager) {
            console.error('Drawing manager not available');
            return;
        }

        // Create a welcome message
        drawingManager.addShape({
            type: 'text',
            text: 'Welcome to ParsonLabs Draw!',
            x: window.innerWidth / 2 - 150,
            y: 100,
            fontSize: 24,
            fontFamily: 'Arial',
            strokeColor: '#3b82f6',
            fillColor: '#3b82f6',
            opacity: 1
        });

        // Add a rectangle
        drawingManager.addShape({
            type: 'rect',
            x: window.innerWidth / 2 - 250,
            y: 180,
            width: 150,
            height: 100,
            strokeColor: '#000000',
            fillColor: '#f9a8d4',
            strokeWeight: 2,
            opacity: 0.9
        });

        // Add an ellipse
        drawingManager.addShape({
            type: 'ellipse',
            x: window.innerWidth / 2 - 50,
            y: 220,
            width: 120,
            height: 120,
            strokeColor: '#000000',
            fillColor: '#93c5fd',
            strokeWeight: 2,
            opacity: 0.9
        });

        // Add a diamond
        drawingManager.addShape({
            type: 'diamond',
            x: window.innerWidth / 2 + 150,
            y: 220,
            width: 100,
            height: 140,
            strokeColor: '#000000',
            fillColor: '#86efac',
            strokeWeight: 2,
            opacity: 0.9
        });

        // Add an arrow
        drawingManager.addShape({
            type: 'arrow',
            x1: window.innerWidth / 2 - 200,
            y1: 350,
            x2: window.innerWidth / 2 + 200,
            y2: 350,
            strokeColor: '#ef4444',
            strokeWeight: 3,
            opacity: 1
        });

        // Add a text label
        drawingManager.addShape({
            type: 'text',
            text: 'Try the tools from the top toolbar!',
            x: window.innerWidth / 2 - 130,
            y: 400,
            fontSize: 16,
            fontFamily: 'Arial',
            strokeColor: '#000000',
            fillColor: '#000000',
            opacity: 1
        });

        // Save these shapes to history
        drawingManager.saveToHistory();
    }, 500); // Give time for the app to initialize fully
}

// Set up help button functionality
function setupHelpButton() {
    const helpButton = document.getElementById('help-button');
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalButton = document.getElementById('close-modal');

    if (helpButton && shortcutsModal) {
        // Show modal when help button is clicked
        helpButton.addEventListener('click', () => {
            shortcutsModal.classList.remove('hidden');
        });

        // Close modal when close button is clicked
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                shortcutsModal.classList.add('hidden');
            });
        }

        // Close modal when overlay is clicked
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                shortcutsModal.classList.add('hidden');
            });
        }

        // Close modal when ESC key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !shortcutsModal.classList.contains('hidden')) {
                shortcutsModal.classList.add('hidden');
            }
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupHelpButton();
    addSampleShapes();
});

// Expose functions for testing
window.sampleShapesManager = {
    addSampleShapes,
    setupHelpButton
};