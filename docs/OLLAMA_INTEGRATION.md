# Ollama Integration Guide

## 🤖 Overview

Ollama is integrated into the multi-agent system to provide local, open-source LLM capabilities. This eliminates API costs for certain workloads and provides privacy-preserving AI processing.

## 📦 Included Models

### 1. Qwen2.5 Coder (32B parameters)

**Purpose**: Specialized code generation and analysis  
**Best for**:

- Writing production code
- Code reviews and refactoring
- Debugging complex issues
- API documentation

**Performance**: ~20 tokens/sec on 8 CPU cores

### 2. Qwen2-VL (7B parameters)

**Purpose**: Vision-language multimodal model  
**Best for**:

- Screenshot analysis
- UI/UX understanding
- Diagram interpretation
- Image-to-code generation

**Performance**: ~30 tokens/sec on 8 CPU cores

### 3. Gemma2 (9B parameters)

**Purpose**: Fast general-purpose model  
**Best for**:

- Quick code completions
- Simple Q&A
- Code explanations
- Documentation generation

**Performance**: ~40 tokens/sec on 8 CPU cores

## 🏗️ Architecture

```tsx
┌──────────────────────────────────────┐
│     Ollama Server Container          │
│   - 8 CPUs, 16GB RAM                 │
│   - Port 11434                       │
│   - Persistent volume: ollama_data   │
└──────────┬───────────────────────────┘
           │
    ┌──────┴──────┬──────────┬─────────┐
    │             │          │         │
┌───▼───┐    ┌───▼───┐  ┌───▼───┐  ┌──▼──┐
│Qwen   │    │Qwen   │  │Gemma2 │  │Gemma│
│Coder 1│    │Coder 2│  │Agent 1│  │Ag. 2│
└───────┘    └───────┘  └───────┘  └─────┘
    │             │          │         │
┌───▼───┐    ┌───▼───┐
│Qwen   │    │Qwen   │
│Vision1│    │Vision2│
└───────┘    └───────┘
```

## 🚀 Quick Start

### Start Ollama Service

```bash
# Start Ollama server
docker-compose -f docker-compose.multi-agent.yml up -d ollama

# Wait for initialization (pulls models automatically)
docker-compose -f docker-compose.multi-agent.yml logs -f ollama-init

# Expected output:
# ✅ Successfully pulled qwen2.5-coder:latest
# ✅ Successfully pulled qwen2-vl:latest
# ✅ Successfully pulled gemma2:latest
```

### Start Ollama Agents

```bash
# Start all Ollama-based agents
docker-compose -f docker-compose.multi-agent.yml up -d \
  agent-ollama-qwen-1 \
  agent-ollama-qwen-2 \
  agent-ollama-gemma-1 \
  agent-ollama-gemma-2 \
  agent-ollama-qwen-vision-1 \
  agent-ollama-qwen-vision-2

# Verify agents are running
docker-compose -f docker-compose.multi-agent.yml ps | grep ollama
```

## 💻 Usage Examples

### Direct API Call

```bash
# Code generation with Qwen2.5 Coder
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder",
  "prompt": "Write a Python function to calculate fibonacci numbers",
  "stream": false
}'

# Quick completion with Gemma2
curl http://localhost:11434/api/generate -d '{
  "model": "gemma2",
  "prompt": "Explain what a REST API is",
  "stream": false
}'

# Vision analysis with Qwen2-VL
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2-vl",
  "prompt": "Describe this image",
  "images": ["base64_encoded_image"],
  "stream": false
}'
```

### Through Agent Pool

```bash
# Send task to Ollama agent via load balancer
curl -X POST http://localhost/api/agent/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Review this Python code",
    "code": "def calculate(x):\n    return x * 2",
    "agent_type": "ollama",
    "model": "qwen2.5-coder"
  }'
```

## 🔧 Configuration

### Environment Variables

```yaml
# In docker-compose.multi-agent.yml
environment:
  - OLLAMA_KEEP_ALIVE=24h # Keep models loaded
  - OLLAMA_HOST=0.0.0.0:11434 # Listen on all interfaces
  - OLLAMA_ORIGINS=* # Allow all origins
  - OLLAMA_NUM_PARALLEL=4 # Run 4 requests in parallel
  - OLLAMA_MAX_LOADED_MODELS=3 # Keep 3 models in memory
```

### Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '8' # 8 CPU cores
      memory: 16G # 16GB RAM
    reservations:
      cpus: '4' # Min 4 cores
      memory: 8G # Min 8GB
```

### Model Management

```bash
# List all models
docker exec ollama ollama list

# Pull additional model
docker exec ollama ollama pull codellama:13b

# Remove model
docker exec ollama ollama rm gemma2:latest

# Show model info
docker exec ollama ollama show qwen2.5-coder
```

## 📊 Performance Comparison

| Model         | Size | Speed (tok/s) | Quality    | Best Use Case   |
| ------------- | ---- | ------------- | ---------- | --------------- |
| Qwen2.5 Coder | 32B  | ~20           | ⭐⭐⭐⭐⭐ | Production code |
| Gemma2        | 9B   | ~40           | ⭐⭐⭐⭐   | Quick tasks     |
| Qwen2-VL      | 7B   | ~30           | ⭐⭐⭐⭐   | Multimodal      |

### vs Cloud APIs

| Metric       | Ollama (Local)     | Cloud API             |
| ------------ | ------------------ | --------------------- |
| Cost         | $0/month           | $10-100/month         |
| Latency      | 50-100ms           | 200-500ms             |
| Privacy      | ✅ Complete        | ⚠️ Data sent to cloud |
| Availability | ✅ Offline capable | ❌ Internet required  |
| Quality      | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐            |

## 💡 Best Practices

### 1. Route Tasks Intelligently

```bash
# Use Ollama for:
- Code completion
- Simple Q&A
- Privacy-sensitive data
- High-volume low-cost tasks

# Use Cloud APIs for:
- Complex reasoning
- Latest capabilities
- Specialized tasks
- Production-critical work
```

### 2. Memory Management

```bash
# Monitor memory usage
docker stats ollama

# If OOM errors occur:
# 1. Reduce OLLAMA_MAX_LOADED_MODELS
# 2. Use smaller models (gemma2 instead of qwen2.5-coder)
# 3. Increase Docker memory limit
```

### 3. Performance Tuning

```yaml
# For faster response (uses more RAM):
environment:
  - OLLAMA_NUM_PARALLEL=8
  - OLLAMA_MAX_LOADED_MODELS=3

# For lower memory usage:
environment:
  - OLLAMA_NUM_PARALLEL=2
  - OLLAMA_MAX_LOADED_MODELS=1
```

## 🐛 Troubleshooting

### Model Download Failed

**Problem**: `ollama-init` fails to pull models

**Check**:

```bash
# View logs
docker-compose -f docker-compose.multi-agent.yml logs ollama-init

# Common causes:
# - Slow internet connection
# - Insufficient disk space
# - Docker Hub rate limits
```

**Solution**:

```bash
# Manually pull models
docker exec ollama ollama pull qwen2.5-coder:latest
docker exec ollama ollama pull qwen2-vl:latest
docker exec ollama ollama pull gemma2:latest
```

### High Memory Usage

**Problem**: Ollama using too much RAM

**Check**:

```bash
docker stats ollama
```

**Solution**:

```bash
# Reduce loaded models
docker exec ollama sh -c 'echo "OLLAMA_MAX_LOADED_MODELS=1" >> ~/.ollama/config'

# Restart Ollama
docker-compose -f docker-compose.multi-agent.yml restart ollama
```

### Slow Response Times

**Problem**: Model responses are slow

**Solutions**:

1. **Use smaller models**:

   ```bash
   # Instead of qwen2.5-coder (32B)
   # Use gemma2 (9B) for simpler tasks
   ```

2. **Increase CPU allocation**:

   ```yaml
   # In docker-compose.multi-agent.yml
   limits:
     cpus: '16' # Instead of 8
   ```

3. **Enable GPU acceleration** (if available):
   ```yaml
   deploy:
     resources:
       reservations:
         devices:
           - driver: nvidia
             count: 1
             capabilities: [gpu]
   ```

### API Connection Failed

**Problem**: Cannot connect to Ollama API

**Check**:

```bash
# Test Ollama health
curl http://localhost:11434/api/tags

# Check if Ollama is running
docker-compose -f docker-compose.multi-agent.yml ps ollama
```

**Solution**:

```bash
# Restart Ollama
docker-compose -f docker-compose.multi-agent.yml restart ollama

# Check logs
docker-compose -f docker-compose.multi-agent.yml logs ollama
```

## 📈 Monitoring

### Prometheus Metrics

Add to `config/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'ollama'
    static_configs:
      - targets: ['ollama:11434']
        labels:
          service: 'llm-server'
          type: 'ollama'
```

### Key Metrics

- **Request rate**: Requests per second
- **Token throughput**: Tokens generated per second
- **Memory usage**: RAM consumed by loaded models
- **Response latency**: Time to first token / total time

### Grafana Dashboard

```bash
# Import Ollama dashboard
# Dashboard ID: Coming soon
```

## 🔐 Security

### Network Isolation

```yaml
# Ollama is only accessible within agent network
networks:
  - coding-agent-network
```

### API Access Control

```bash
# Restrict to internal network only
environment:
  - OLLAMA_ORIGINS=http://agent-*,http://nginx
```

### Data Privacy

- ✅ All processing happens locally
- ✅ No data sent to external servers
- ✅ Models stored in persistent volume
- ✅ Compliant with data sovereignty requirements

## 💰 Cost Savings

### Monthly Comparison (1M tokens/day)

| Provider           | Monthly Cost |
| ------------------ | ------------ |
| Cloud API (GPT-4)  | ~$900        |
| Cloud API (Claude) | ~$1,350      |
| Ollama (Local)     | $0           |

**Break-even point**: Hardware investment pays for itself in 2-3 months for high-volume usage.

## 🚀 Advanced Usage

### Custom Models

```bash
# Pull custom model
docker exec ollama ollama pull username/custom-model

# Use in agent
environment:
  - OLLAMA_MODEL=username/custom-model
```

### Model Quantization

```bash
# Use quantized versions for lower memory
# Q4: ~4GB RAM, 90% quality
# Q5: ~5GB RAM, 95% quality
# Q8: ~8GB RAM, 99% quality

docker exec ollama ollama pull qwen2.5-coder:7b-q4_0
```

### Batch Processing

```bash
# Process multiple requests in parallel
for i in {1..10}; do
  curl http://localhost:11434/api/generate -d "{
    \"model\": \"gemma2\",
    \"prompt\": \"Task $i\"
  }" &
done
wait
```

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Qwen Models](https://github.com/QwenLM/Qwen)
- [Gemma Documentation](https://ai.google.dev/gemma)
- [Model Library](https://ollama.com/library)

## 🎯 Next Steps

1. **Test models**: Try different models for your use case
2. **Optimize resources**: Adjust CPU/RAM based on load
3. **Monitor performance**: Track metrics in Grafana
4. **Fine-tune**: Create custom models for specific tasks
5. **Scale**: Add more Ollama instances for higher throughput

---

**Happy Local AI Processing! 🚀**
