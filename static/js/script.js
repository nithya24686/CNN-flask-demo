document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('image-preview');
    const predictBtn = document.getElementById('predict-btn');
    const resultDiv = document.getElementById('result');
    const uploadPrompt = document.getElementById('upload-prompt');

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('dragover');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    predictBtn.disabled = false;
                    uploadPrompt.style.display = 'none';
                    resultDiv.textContent = ''; // Clear previous results
                }
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    // Handle prediction
    predictBtn.addEventListener('click', async () => {
        if (!fileInput.files[0] && !preview.src) return;

        // Show loading state
        predictBtn.disabled = true;
        resultDiv.innerHTML = '<div class="loader"></div> Processing...';

        const formData = new FormData();
        // If file input has a file, use it. Otherwise we might need to handle drag-drop file specifically 
        // (simplified here to assume fileInput is populated or we need to store the dropped file)

        // Correct way for dropped files is to update fileInput.files or store variable.
        // For simplicity, let's assume fileInput updates or we rely on the click upload strictly for now,
        // BUT drag-drop needs to actually set the file. 
        // Let's refactor handleFiles to store the file object.
    });

    // Better file handling for Drag & Drop + Click
    let currentFile = null;

    // Overwrite handleFiles to store the file
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                currentFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    predictBtn.disabled = false;
                    uploadPrompt.style.display = 'none';
                    resultDiv.textContent = '';
                }
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    // Actual prediction logic
    predictBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        predictBtn.disabled = true;
        resultDiv.innerHTML = '<div class="loader"></div> Analyzing...';

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Display result
            resultDiv.innerHTML = `Prediction: <span style="color: var(--secondary-color)">${data.prediction}</span><br><span style="font-size: 0.9em; opacity: 0.8">Confidence: ${(data.confidence * 100).toFixed(2)}%</span>`;

        } catch (error) {
            console.error('Error:', error);
            resultDiv.textContent = 'Error processing image. Please try again.';
        } finally {
            predictBtn.disabled = false;
        }
    });
});
