#!/bin/sh
# Ollama Model Initialization Script
# This script pulls the required models on first startup

set -e

echo "🚀 Initializing Ollama models..."
echo ""

# Wait for Ollama server to be fully ready
echo "⏳ Waiting for Ollama server..."
sleep 10

# Function to pull model with retry
pull_model() {
    MODEL_NAME=$1
    MAX_RETRIES=3
    RETRY_COUNT=0
    
    echo "📥 Pulling model: $MODEL_NAME"
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if ollama pull "$MODEL_NAME"; then
            echo "✅ Successfully pulled $MODEL_NAME"
            return 0
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo "⚠️  Failed to pull $MODEL_NAME (attempt $RETRY_COUNT/$MAX_RETRIES)"
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo "🔄 Retrying in 10 seconds..."
                sleep 10
            fi
        fi
    done
    
    echo "❌ Failed to pull $MODEL_NAME after $MAX_RETRIES attempts"
    return 1
}

# Pull Qwen2.5 Coder - Best for code generation
echo "📦 Model 1/3: Qwen2.5 Coder"
pull_model "qwen2.5-coder:latest" || echo "⚠️  Skipping qwen2.5-coder"
echo ""

# Pull Qwen2 VL - Vision model for image understanding
echo "📦 Model 2/3: Qwen2 Vision-Language"
pull_model "qwen2-vl:latest" || echo "⚠️  Skipping qwen2-vl"
echo ""

# Pull Gemma2 - Fast and efficient general purpose model
echo "📦 Model 3/3: Gemma2"
pull_model "gemma2:latest" || echo "⚠️  Skipping gemma2"
echo ""

# List all downloaded models
echo "📋 Downloaded models:"
ollama list

echo ""
echo "✨ Ollama initialization complete!"
echo ""
echo "Available models:"
echo "  - qwen2.5-coder:latest - Specialized for code generation (32B params)"
echo "  - qwen2-vl:latest      - Vision-language model for multimodal tasks (7B params)"
echo "  - gemma2:latest        - Fast general-purpose model (9B params)"
echo ""
echo "🌐 Ollama API endpoint: http://ollama:11434"
echo "📖 Usage: curl http://ollama:11434/api/generate -d '{\"model\":\"qwen2.5-coder\",\"prompt\":\"write hello world in python\"}'"
