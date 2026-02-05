# SAM3 Integration

Image to 3D model using SAM3 mask generation.

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/DeepLogixIO/samples.git && cd samples/sam3_integration
   ```
2. Get your API token at [deeplogix.io/profile](https://deeplogix.io/profile)
3. Open `main.js` and paste your token at the very top of the file:
   ```js
   const TOKEN = "your-api-token-here";
   ```
4. Open `index.html` in browser

## Usage

1. Upload an image
2. Click "Get Masks" → select a mask
3. Click "Convert to 3D" → view 3D model
