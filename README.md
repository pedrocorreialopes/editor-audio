# Editor de Áudio Online

Uma aplicação web completa para edição de áudio diretamente no navegador, utilizando Web Audio API para processamento em tempo real.

## 🎯 Funcionalidades

### ✅ Implementadas

#### Carregamento de Áudio
- **Upload por arrastar e soltar**: Arraste arquivos de áudio diretamente para a área designada
- **Seleção por arquivo**: Clique no botão para selecionar arquivos do seu dispositivo
- **Formatos suportados**: MP3, WAV, OGG, M4A
- **Validação**: Verificação automática de formatos suportados

#### Controles de Edição

**Controles Principais:**
- **Volume**: Ajuste de 0% a 200% com aplicação em tempo real
- **Velocidade**: Controle de 0.5x a 2.0x com manutenção de pitch
- **Tom (Pitch)**: Ajuste de -12 a +12 semitons
- **Eco**: Adição de efeito de eco com intensidade ajustável

**Filtros de Frequência:**
- **Filtro High-pass**: Remove frequências baixas (20Hz - 2000Hz)
- **Filtro Low-pass**: Remove frequências altas (1000Hz - 20000Hz)
- **Balanço**: Controle de panorama estéreo (esquerda/centro/direita)

#### Visualização
- **Forma de onda**: Visualização gráfica da forma de onda do áudio
- **Espectro em tempo real**: Análise espectral durante a reprodução
- **Canvas interativo**: Interface responsiva e moderna

#### Reprodução
- **Player original**: Reprodução do arquivo original
- **Player processado**: Reprodução com todos os efeitos aplicados
- **Controles independentes**: Alternância entre versões original e processada

#### Exportação
- **Download de áudio processado**: Exportação em formato WAV com todos os efeitos aplicados
- **Manutenção da qualidade**: Preservação da taxa de amostragem original

### 🚧 Limitações

**Processamento de Timbre**: A extração e transformação completa de timbre (voice conversion) não é possível em websites estáticos porque:
- Requer modelos de machine learning complexos
- Necessita de processamento computacional intensivo
- Envolve algoritmos proprietários ou bibliotecas pesadas como LibROSA

**Alternativas possíveis**: Para aplicações de transferência de timbre, seria necessário:
- Backend com Python e bibliotecas como LibROSA, TensorFlow
- APIs de terceiros com autenticação
- Servidores especializados em processamento de áudio

## 🚀 Como Usar

### 1. Carregar Áudio
1. Abra a aplicação no navegador
2. Arraste um arquivo de áudio para a área de upload ou clique em "Selecionar Arquivo"
3. Aguarde o processamento do arquivo

### 2. Editar Áudio
1. Use os sliders para ajustar os parâmetros desejados
2. Ouça o resultado em tempo real clicando em "Tocar Processado"
3. Compare com o original usando "Tocar Original"

### 3. Exportar
1. Clique em "Baixar Áudio" para exportar o arquivo processado
2. O arquivo será baixado em formato WAV com todos os efeitos aplicados

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização moderna com Tailwind CSS
- **JavaScript ES6+**: Programação orientada a objetos
- **Web Audio API**: Processamento de áudio de alta performance

### Bibliotecas e Frameworks
- **Tailwind CSS**: Framework de CSS utilitário
- **Font Awesome**: Ícones vetoriais
- **Google Fonts**: Tipografia Inter
- **CDN jsDelivr**: Distribuição confiável de recursos

### APIs Web
- **Web Audio API**: Processamento de áudio em tempo real
- **File API**: Manipulação de arquivos locais
- **Canvas API**: Visualização gráfica de áudio
- **OfflineAudioContext**: Processamento offline para exportação

## 📁 Estrutura do Projeto

```
editor-audio-online/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos personalizados
├── js/
│   ├── main.js            # Aplicação principal
│   ├── audioProcessor.js  # Processamento de áudio
│   └── visualizer.js      # Visualização de áudio
└── README.md              # Este arquivo
```

## 🔧 Funcionalidades Técnicas

### Processamento de Áudio
- **Contexto de áudio**: Gerenciamento eficiente de recursos
- **Nós de processamento**: Cadeia de efeitos configurável
- **Processamento em tempo real**: Aplicação instantânea de efeitos
- **Buffer management**: Manipulação eficiente de buffers de áudio

### Visualização
- **Waveform rendering**: Desenho de forma de onda com canvas
- **Spectrum analysis**: Análise FFT para visualização espectral
- **Real-time updates**: Atualizações suaves durante reprodução
- **Responsive canvas**: Adaptação a diferentes tamanhos de tela

### Interface de Usuário
- **Drag & drop**: Interface intuitiva para upload de arquivos
- **Live preview**: Prévia instantânea de alterações
- **Responsive design**: Adaptação a dispositivos móveis
- **Acessibilidade**: Suporte a teclado e leitores de tela

## 🌐 Compatibilidade

### Navegadores Suportados
- **Chrome 66+**: Suporte completo
- **Firefox 76+**: Suporte completo
- **Safari 14.1+**: Suporte completo
- **Edge 79+**: Suporte completo

### Requisitos Mínimos
- JavaScript ES6+ habilitado
- Suporte a Web Audio API
- Capacidade de processamento de áudio
- Acesso a microfone (para algumas funcionalidades avançadas)

## 🚀 Próximos Passos Recomendados

### Funcionalidades Avançadas
1. **Equalizador gráfico**: Controle de múltiplas bandas de frequência
2. **Compressor dinâmico**: Compressão de áudio com parâmetros ajustáveis
3. **Reverberação**: Efeito de sala com diferentes ambientes
4. **Noise gate**: Redução de ruído entre silêncios
5. **Looper**: Gravação e repetição de trechos

### Melhorias de Interface
1. **Undo/Redo**: Histórico de alterações com múltiplos níveis
2. **Presets**: Configurações pré-definidas para diferentes estilos
3. **Visualização melhorada**: Gráficos mais detalhados e informativos
4. **Teclas de atalho**: Atalhos de teclado para funções comuns
5. **Tema claro/escuro**: Alternância entre temas

### Exportação e Compartilhamento
1. **Formatos adicionais**: Exportação para MP3, OGG
2. **Qualidade ajustável**: Controle de taxa de bits
3. **Compartilhamento direto**: Upload para serviços de nuvem
4. **Link compartilhável**: Geração de links para áudio processado

## 📚 Recursos Úteis

### Documentação Web Audio API
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [Can I Use Web Audio API](https://caniuse.com/audio-api)

### Tutoriais e Guias
- [Web Audio API Basics](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)
- [Advanced Audio Processing](https://webaudio.github.io/web-audio-api/)
- [Audio Visualization Techniques](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)

## 📝 Notas de Desenvolvimento

### Performance
- O processamento é feito completamente no cliente
- Sem envio de arquivos para servidores externos
- Uso eficiente de memória com buffers de áudio
- Otimizações para dispositivos móveis

### Segurança
- Processamento local garante privacidade dos dados
- Sem armazenamento de arquivos em servidores
- Código aberto para auditoria

### Limitações Técnicas
- Web Audio API tem limitações em dispositivos móveis
- Processamento pesado pode afetar performance
- Alguns formatos podem não ser suportados em todos navegadores

## 🎵 Exemplos de Uso

### Para Podcasts
- Ajuste de volume e normalização
- Redução de ruído com filtros
- Equalização de voz

### Para Música
- Criação de versões instrumentais
- Ajuste de pitch para karaokê
- Efeitos de eco e reverberação

### Para Educação
- Análise visual de formas de onda
- Demonstração de conceitos de processamento
- Estudo de espectros de frequência

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente suas alterações
4. Teste em diferentes navegadores
5. Submeta um pull request

## 📄 Licença

Este projeto é código aberto e disponível para uso educacional e comercial.

---

**Nota**: Esta aplicação é um exemplo de processamento de áudio client-side. Para funcionalidades mais avançadas como transferência de timbre, seria necessário implementar um backend com Python e bibliotecas especializadas.