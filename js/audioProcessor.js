// Processador de Áudio usando Web Audio API
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.originalBuffer = null;
        this.source = null;
        this.gainNode = null;
        this.pannerNode = null;
        this.convolverNode = null;
        this.highpassFilter = null;
        this.lowpassFilter = null;
        this.echoDelay = null;
        this.echoFeedback = null;
        this.echoGain = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.duration = 0;
        
        // Parâmetros de processamento
        this.params = {
            volume: 1.0,
            speed: 1.0,
            pitch: 0,
            echo: 0,
            highpass: 20,
            lowpass: 20000,
            pan: 0
        };
    }

    // Inicializa o contexto de áudio
    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Cria nós de processamento
            this.gainNode = this.audioContext.createGain();
            this.pannerNode = this.audioContext.createStereoPanner();
            this.highpassFilter = this.audioContext.createBiquadFilter();
            this.lowpassFilter = this.audioContext.createBiquadFilter();
            this.convolverNode = this.audioContext.createConvolver();
            this.echoDelay = this.audioContext.createDelay(1.0);
            this.echoFeedback = this.audioContext.createGain();
            this.echoGain = this.audioContext.createGain();
            
            // Configura filtros
            this.highpassFilter.type = 'highpass';
            this.lowpassFilter.type = 'lowpass';
            
            // Configura eco
            this.echoDelay.delayTime.value = 0.3;
            this.echoFeedback.gain.value = 0.5;
            this.echoGain.gain.value = 0.0;
            
            // Conecta nós de eco
            this.echoDelay.connect(this.echoFeedback);
            this.echoFeedback.connect(this.echoDelay);
            this.echoDelay.connect(this.echoGain);
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Carrega arquivo de áudio
    async loadAudioFile(file) {
        try {
            await this.initAudioContext();
            
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.originalBuffer = this.audioBuffer;
            this.duration = this.audioBuffer.duration;
            
            return {
                duration: this.duration,
                sampleRate: this.audioBuffer.sampleRate,
                numberOfChannels: this.audioBuffer.numberOfChannels,
                fileSize: file.size
            };
        } catch (error) {
            console.error('Erro ao carregar arquivo de áudio:', error);
            throw new Error('Erro ao processar arquivo de áudio');
        }
    }

    // Cria e conecta a cadeia de processamento
    createProcessingChain() {
        if (!this.audioContext || !this.audioBuffer) return;
        
        // Desconecta cadeia anterior
        this.disconnectChain();
        
        // Cria source
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        
        // Aplica velocidade (playback rate)
        this.source.playbackRate.value = this.params.speed;
        
        // Conecta cadeia de processamento
        let currentNode = this.source;
        
        // Aplica filtros
        if (this.params.highpass > 20) {
            this.highpassFilter.frequency.value = this.params.highpass;
            currentNode.connect(this.highpassFilter);
            currentNode = this.highpassFilter;
        }
        
        if (this.params.lowpass < 20000) {
            this.lowpassFilter.frequency.value = this.params.lowpass;
            currentNode.connect(this.lowpassFilter);
            currentNode = this.lowpassFilter;
        }
        
        // Aplica volume
        this.gainNode.gain.value = this.params.volume;
        currentNode.connect(this.gainNode);
        currentNode = this.gainNode;
        
        // Aplica balanço
        this.pannerNode.pan.value = this.params.pan;
        currentNode.connect(this.pannerNode);
        currentNode = this.pannerNode;
        
        // Aplica eco
        if (this.params.echo > 0) {
            this.echoGain.gain.value = this.params.echo * 0.3;
            currentNode.connect(this.echoDelay);
            currentNode.connect(this.audioContext.destination);
            this.echoGain.connect(this.audioContext.destination);
        } else {
            currentNode.connect(this.audioContext.destination);
        }
    }

    // Desconecta a cadeia de processamento
    disconnectChain() {
        if (this.source) {
            try {
                this.source.stop();
            } catch (e) {}
            this.source.disconnect();
            this.source = null;
        }
    }

    // Toca o áudio
    async play(processed = false) {
        if (!this.audioBuffer) return;
        
        try {
            await this.initAudioContext();
            
            if (this.isPlaying) {
                this.stop();
            }
            
            this.createProcessingChain();
            this.source.start(0, this.pauseTime);
            this.startTime = this.audioContext.currentTime - this.pauseTime;
            this.isPlaying = true;
            
            this.source.onended = () => {
                this.isPlaying = false;
                this.pauseTime = 0;
            };
            
        } catch (error) {
            console.error('Erro ao tocar áudio:', error);
        }
    }

    // Para o áudio
    stop() {
        if (this.source && this.isPlaying) {
            this.disconnectChain();
            this.isPlaying = false;
            this.pauseTime = 0;
        }
    }

    // Pausa o áudio
    pause() {
        if (this.isPlaying && this.source) {
            this.pauseTime = this.audioContext.currentTime - this.startTime;
            this.stop();
        }
    }

    // Define parâmetros de processamento
    setParameter(param, value) {
        this.params[param] = value;
        
        // Atualiza em tempo real se estiver tocando
        if (this.isPlaying) {
            switch (param) {
                case 'volume':
                    if (this.gainNode) {
                        this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
                    }
                    break;
                case 'pan':
                    if (this.pannerNode) {
                        this.pannerNode.pan.setValueAtTime(value, this.audioContext.currentTime);
                    }
                    break;
                case 'echo':
                    if (this.echoGain) {
                        this.echoGain.gain.setValueAtTime(value * 0.3, this.audioContext.currentTime);
                    }
                    break;
                case 'highpass':
                    if (this.highpassFilter) {
                        this.highpassFilter.frequency.setValueAtTime(value, this.audioContext.currentTime);
                    }
                    break;
                case 'lowpass':
                    if (this.lowpassFilter) {
                        this.lowpassFilter.frequency.setValueAtTime(value, this.audioContext.currentTime);
                    }
                    break;
            }
        }
    }

    // Aplica efeitos de pitch (simplificado)
    applyPitch() {
        if (!this.audioBuffer || this.params.pitch === 0) return;
        
        // Nota: Implementação real de pitch shifting é complexa
        // Esta é uma versão simplificada usando granular synthesis
        const semitones = this.params.pitch;
        const ratio = Math.pow(2, semitones / 12);
        
        // Atualiza velocidade para ajuste básico de pitch
        if (this.source) {
            this.source.playbackRate.value = this.params.speed * ratio;
        }
    }

    // Processa áudio com efeitos
    async processAudio() {
        if (!this.audioBuffer) return;
        
        // Para uma implementação completa, aqui aplicaríamos os efeitos ao buffer
        // Como pitch shifting, noise reduction, etc.
        // Por enquanto, apenas retornamos o buffer processado em tempo real
        
        this.applyPitch();
        return this.audioBuffer;
    }

    // Exporta áudio processado
    async exportProcessedAudio() {
        if (!this.audioBuffer) return null;
        
        // Cria um novo contexto offline para processamento
        const offlineContext = new OfflineAudioContext(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );
        
        // Copia o buffer
        const source = offlineContext.createBufferSource();
        const buffer = offlineContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );
        
        // Copia os dados do canal
        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);
            buffer.copyToChannel(channelData, channel);
        }
        
        source.buffer = buffer;
        
        // Aplica efeitos básicos
        const gainNode = offlineContext.createGain();
        gainNode.gain.value = this.params.volume;
        
        source.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        source.start(0);
        
        // Renderiza
        const renderedBuffer = await offlineContext.startRendering();
        
        // Converte para Blob
        return this.bufferToWave(renderedBuffer, renderedBuffer.length);
    }

    // Converte buffer para formato WAV
    bufferToWave(buffer, len) {
        const length = len * buffer.numberOfChannels * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // Escreve cabeçalho WAV
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };

        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        // RIFF chunk descriptor
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"

        // FMT sub-chunk
        setUint32(0x20746d66); // "fmt "
        setUint32(16); // subchunk size
        setUint16(1); // PCM
        setUint16(buffer.numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // byte rate
        setUint16(buffer.numberOfChannels * 2); // block align
        setUint16(16); // bits per sample

        // data sub-chunk
        setUint32(0x61746164); // "data"
        setUint32(length - pos - 4); // subchunk size

        // Escreve dados PCM
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (pos < length) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    // Limpa recursos
    dispose() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}