document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('documentForm');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('dropZone');
    const imagePreview = document.getElementById('imagePreview');
    const charCount = document.getElementById('charCount');
    const generateBtn = document.getElementById('generateBtn');
    const errorMessage = document.getElementById('errorMessage');
    const resultSection = document.getElementById('resultSection');
    const documentOutput = document.getElementById('documentOutput');
    const loadingSpinner = document.getElementById('loadingSpinner');

    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
    });

    dropZone.addEventListener('click', () => imageInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageSelect(files[0]);
        }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageSelect(e.target.files[0]);
        }
    });

    function handleImageSelect(file) {
        if (!file.type.startsWith('image/')) {
            showError('画像ファイルを選択してください');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('画像サイズは5MB以下にしてください');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!textInput.value.trim()) {
            showError('テキストを入力してください');
            return;
        }

        const formData = new FormData();
        formData.append('text', textInput.value);
        formData.append('documentType', document.getElementById('documentType').value);
        
        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            showLoading(true);
            hideError();
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'エラーが発生しました');
            }

            displayResult(data.document);
            
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    });

    function showLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
        generateBtn.disabled = show;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function displayResult(document) {
        documentOutput.textContent = document;
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
});
