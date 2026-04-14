// Aplicação principal do Editor de Áudio
class AudioEditor {
    constructor() {
        this.audioProcessor = null;
        this.visualizer = null;
        this.currentFile = null;
        this.isPlaying = false;
        this.audioElement = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    // Inicializa elementos do DOM
    initializeElements() {
        // Upload elements
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('audioFile');
        this.selectFileBtn = document.getElementById('selectFile');
        
        // Audio controls
        this.audioControls = document.getElementById('audioControls');
        this.audioInfo = document.getElementById('audioInfo');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.waveformCanvas = document.getElementById('waveform');
        
        // Control sliders
        this.volumeSlider = document.getElementById('volume');
        this.speedSlider = document.getElementById('speed');
        this.pitchSlider = document.getElementById('pitch');
        this.echoSlider = document.getElementById('echo');
        this.highpassSlider = document.getElementById('highpass');
        this.lowpassSlider = document.getElementById('lowpass');
        this.panSlider = document.getElementById('pan');
        
        // Value displays
        this.volumeValue = document.getElementById('volumeValue');
        this.speedValue = document.getElementById('speedValue');
        this.pitchValue = document.getElementById('pitchValue');
        this.echoValue = document.getElementById('echoValue');
        this.highpassValue = document.getElementById('highpassValue');
        this.lowpassValue = document.getElementById('lowpassValue');
        this.panValue = document.getElementById('panValue');
        
        // Audio info
        this.durationSpan = document.getElementById('duration');
        this.fileSizeSpan = document.getElementById('fileSize');
        this.sampleRateSpan = document.getElementById('sampleRate');
        
        // Action buttons
        this.playOriginalBtn = document.getElementById('playOriginal');
        this.playProcessedBtn = document.getElementById('playProcessed');
        this.resetBtn = document.getElementById('resetAll');
        this.downloadBtn = document.getElementById('downloadAudio');
    }

    // Configura event listeners
    setupEventListeners() {
        // File upload
        this.selectFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control sliders
        this.setupSliderListeners();
        
        // Action buttons
        this.playOriginalBtn.addEventListener('click', () => this.playOriginal());
        this.playProcessedBtn.addEventListener('click', () => this.playProcessed());
        this.resetBtn.addEventListener('click', () => this.resetAll());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());
        
        // Audio player
        this.audioPlayer.addEventListener('play', () => this.onAudioPlay());
        this.audioPlayer.addEventListener('pause', () => this.onAudioPause());
        this.audioPlayer.addEventListener('ended', () => this.onAudioEnded());
    }

    // Configura listeners dos sliders
    setupSliderListeners() {
        const sliders = [
            { element: this.volumeSlider, param: 'volume', display: this.volumeValue, format: (v) => `${v}%` },
            { element: this.speedSlider, param: 'speed', display: this.speedValue, format: (v) => `${(v/100).toFixed(1)}x` },
            { element: this.pitchSlider, param: 'pitch', display: this.pitchValue, format: (v) => `${v} semitons` },
            { element: this.echoSlider, param: 'echo', display: this.echoValue, format: (v) => `${v}%` },
            { element: this.highpassSlider, param: 'highpass', display: this.highpassValue, format: (v) => `${v} Hz` },
            { element: this.lowpassSlider, param: 'lowpass', display: this.lowpassValue, format: (v) => `${v} Hz` },
            { element: this.panSlider, param: 'pan', display: this.panValue, format: (v) => {
                if (v === 0) return 'Centro';
                return v < 0 ? `Esquerda ${Math.abs(v)}%` : `Direita ${v}%`;
            }}
        ];

        sliders.forEach(({ element, param, display, format }) => {
            element.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                display.textContent = format(value);
                
                // Converte valores para o processador
                let processorValue = value;
                if (param === 'volume') processorValue = value / 100;
                else if (param === 'pan') processorValue = value / 100;
                else if (param === 'echo') processorValue = value / 100;
                else if (param === 'speed') processorValue = value / 100;
                
                if (this.audioProcessor) {
                    this.audioProcessor.setParameter(param, processorValue);
                }
            });
        });
    }

    // Manipula seleção de arquivo
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            await this.loadAudioFile(file);
        }
    }

    // Manipula drag over
    handleDragOver(event) {
        event.preventDefault();
        this.dropZone.classList.add('dragover');
    }

    // Manipula drag leave
    handleDragLeave(event) {
        event.preventDefault();
        this.dropZone.classList.remove('dragover');
    }

    // Manipula drop
    async handleDrop(event) {
        event.preventDefault();
        this.dropZone.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('audio/')) {
                await this.loadAudioFile(file);
            }
        }
    }

    // Carrega arquivo de áudio
    async loadAudioFile(file) {
        try {
            this.currentFile = file;
            
            // Mostra loading
            this.showLoading(true);
            
            // Inicializa processador e visualizador
            if (!this.audioProcessor) {
                this.audioProcessor = new AudioProcessor();
            }
            
            if (!this.visualizer) {
                this.visualizer = new AudioVisualizer(this.waveformCanvas);
            }
            
            // Carrega arquivo
            const audioInfo = await this.audioProcessor.loadAudioFile(file);
            
            // Atualiza visualizador
            this.visualizer.setAudioBuffer(this.audioProcessor.audioBuffer);
            
            // Atualiza interface
            this.updateAudioInfo(audioInfo, file);
            this.showControls(true);
            
            // Configura audio player
            const url = URL.createObjectURL(file);
            this.audioPlayer.src = url;
            
            this.showNotification('Áudio carregado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao carregar áudio:', error);
            this.showNotification('Erro ao carregar arquivo de áudio', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Atualiza informações do áudio
    updateAudioInfo(audioInfo, file) {
        // Duração
        const minutes = Math.floor(audioInfo.duration / 60);
        const seconds = Math.floor(audioInfo.duration % 60);
        this.durationSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Tamanho do arquivo
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        this.fileSizeSpan.textContent = `${sizeInMB} MB`;
        
        // Taxa de amostragem
        this.sampleRateSpan.textContent = `${audioInfo.sampleRate} Hz`;
        
        // Mostra seção de informações
        this.audioInfo.classList.remove('hidden');
        this.audioInfo.classList.add('fade-in');
    }

    // Mostra/esconde controles
    showControls(show) {
        if (show) {
            this.audioControls.classList.remove('hidden');
            this.audioControls.classList.add('fade-in');
        } else {
            this.audioControls.classList.add('hidden');
            this.audioInfo.classList.add('hidden');
        }
    }

    // Mostra/esconde loading
    showLoading(show) {
        if (show) {
            this.dropZone.classList.add('loading');
        } else {
            this.dropZone.classList.remove('loading');
        }
    }

    // Mostra notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Toca áudio original
    playOriginal() {
        if (this.audioPlayer) {
            this.audioPlayer.play();
        }
    }

    // Toca áudio processado
    async playProcessed() {
        if (this.audioProcessor) {
            await this.audioProcessor.play(true);
        }
    }

    // Eventos do player
    onAudioPlay() {
        this.isPlaying = true;
        if (this.visualizer) {
            this.visualizer.start();
        }
    }

    onAudioPause() {
        this.isPlaying = false;
        if (this.visualizer) {
            this.visualizer.stop();
        }
    }

    onAudioEnded() {
        this.isPlaying = false;
        if (this.visualizer) {
            this.visualizer.stop();
        }
    }

    // Reseta todos os controles
    resetAll() {
        // Reseta sliders
        this.volumeSlider.value = 100;
        this.speedSlider.value = 100;
        this.pitchSlider.value = 0;
        this.echoSlider.value = 0;
        this.highpassSlider.value = 20;
        this.lowpassSlider.value = 20000;
        this.panSlider.value = 0;
        
        // Atualiza displays
        this.volumeValue.textContent = '100%';
        this.speedValue.textContent = '1.0x';
        this.pitchValue.textContent = '0 semitons';
        this.echoValue.textContent = '0%';
        this.highpassValue.textContent = '20 Hz';
        this.lowpassValue.textContent = '20000 Hz';
        this.panValue.textContent = 'Centro';
        
        // Reseta processador
        if (this.audioProcessor) {
            this.audioProcessor.params = {
                volume: 1.0,
                speed: 1.0,
                pitch: 0,
                echo: 0,
                highpass: 20,
                lowpass: 20000,
                pan: 0
            };
        }
        
        this.showNotification('Controles resetados!', 'success');
    }

    // Baixa áudio processado
    async downloadAudio() {
        if (!this.audioProcessor) return;
        
        try {
            this.showNotification('Processando áudio...', 'info');
            
            const blob = await this.audioProcessor.exportProcessedAudio();
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audio_processado_${Date.now()}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Áudio baixado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao baixar áudio:', error);
            this.showNotification('Erro ao processar áudio', 'error');
        }
    }

    // Limpa recursos
    dispose() {
        if (this.audioProcessor) {
            this.audioProcessor.dispose();
        }
        if (this.visualizer) {
            this.visualizer.dispose();
        }
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.audioEditor = new AudioEditor();
});

// Limpa recursos quando a página for fechada
window.addEventListener('beforeunload', () => {
    if (window.audioEditor) {
        window.audioEditor.dispose();
    }
});