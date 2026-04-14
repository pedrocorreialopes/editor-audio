// Visualizador de forma de onda e espectro
class AudioVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioBuffer = null;
        this.animationId = null;
        this.isPlaying = false;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        
        this.setupCanvas();
    }

    // Configura o canvas
    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    // Inicializa o analisador
    setupAnalyser(audioContext) {
        this.audioContext = audioContext;
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }

    // Define o buffer de áudio
    setAudioBuffer(buffer) {
        this.audioBuffer = buffer;
        this.drawWaveform();
    }

    // Desenha a forma de onda estática
    drawWaveform() {
        if (!this.audioBuffer) return;

        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        // Limpa o canvas
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(0, 0, width, height);

        // Desenha a forma de onda
        this.drawWaveformStatic(width, height);
        
        // Desenha grade
        this.drawGrid(width, height);
    }

    // Desenha forma de onda estática
    drawWaveformStatic(width, height) {
        const data = this.audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.beginPath();
        this.ctx.moveTo(0, amp);
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;

        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;
            
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            
            this.ctx.lineTo(i, (1 + min) * amp);
            this.ctx.lineTo(i, (1 + max) * amp);
        }
        
        this.ctx.stroke();
    }

    // Desenha grade
    drawGrid(width, height) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Linhas horizontais
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Linhas verticais
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
    }

    // Anima o visualizador
    animate() {
        if (!this.analyser || !this.dataArray) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        this.analyser.getByteTimeDomainData(this.dataArray);

        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        // Limpa o canvas
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(0, 0, width, height);

        // Desenha a forma de onda
        this.drawWaveformRealtime(width, height);
        
        // Desenha espectro
        this.drawSpectrum(width, height);
    }

    // Desenha forma de onda em tempo real
    drawWaveformRealtime(width, height) {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.beginPath();

        const sliceWidth = width / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
    }

    // Desenha espectro de frequências
    drawSpectrum(width, height) {
        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        const barWidth = (width / this.bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = (this.dataArray[i] / 255) * height * 0.7;

            const hue = (i / this.bufferLength) * 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
            this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    // Inicia animação
    start() {
        if (!this.analyser) return;
        
        this.isPlaying = true;
        this.animate();
    }

    // Para animação
    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Redesenha forma de onda estática
        this.drawWaveform();
    }

    // Analisa e retorna dados do espectro
    getSpectrumData() {
        if (!this.analyser || !this.dataArray) return [];
        
        this.analyser.getByteFrequencyData(this.dataArray);
        return Array.from(this.dataArray);
    }

    // Obtém informações do áudio
    getAudioInfo() {
        if (!this.audioBuffer) return null;
        
        return {
            duration: this.audioBuffer.duration,
            sampleRate: this.audioBuffer.sampleRate,
            numberOfChannels: this.audioBuffer.numberOfChannels,
            length: this.audioBuffer.length
        };
    }

    // Exporta visualização como imagem
    exportAsImage() {
        return this.canvas.toDataURL('image/png');
    }

    // Limpa recursos
    dispose() {
        this.stop();
        this.audioBuffer = null;
        this.analyser = null;
        this.dataArray = null;
    }
}