const TOKEN = "";

// API Config
const API_URL = "https://deeplogix.io/dispatcher/json-rpc";
const API_HEADERS = {
  "host-id": "890219b8-093d-4eda-8ce9-c91ce1eb7c68",
  token: TOKEN,
  "Content-Type": "application/json",
};

// State
let imageBase64 = null;
let rawMasks = [];
let selectedMaskIndex = null;

// DOM
const phases = {
  upload: document.getElementById("upload-phase"),
  masks: document.getElementById("masks-phase"),
  viewer: document.getElementById("viewer-phase"),
};

function showPhase(name) {
  Object.values(phases).forEach((p) => p.classList.add("hidden"));
  phases[name].classList.remove("hidden");
}

function showError(msg) {
  const el = document.getElementById("error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

// API helpers
async function apiCall(params, timeout = 120000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "pipeline",
      id: crypto.randomUUID(),
      params,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

function base64ToBlobUrl(base64) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes]));
}

// File upload
document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result.split(",")[1];
    document.getElementById("preview").src = reader.result;
    document.getElementById("preview-container").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// Get masks
document.getElementById("get-masks-btn").addEventListener("click", async () => {
  const btn = document.getElementById("get-masks-btn");
  btn.disabled = true;
  btn.textContent = "Loading...";

  try {
    const result = await apiCall({
      task: "mask-generation",
      model: "facebook/sam3",
      image: imageBase64,
    });
    rawMasks = result.masks;

    const container = document.getElementById("masks-container");
    container.innerHTML = "";
    selectedMaskIndex = null;
    document.getElementById("convert-btn").disabled = true;

    rawMasks.forEach((mask, i) => {
      const div = document.createElement("div");
      div.className = "mask-item";
      div.innerHTML = `<img src="data:image/png;base64,${mask}">`;
      div.onclick = () => {
        selectedMaskIndex = i;
        document
          .querySelectorAll(".mask-item")
          .forEach((el, j) => el.classList.toggle("selected", i === j));
        document.getElementById("convert-btn").disabled = false;
      };
      container.appendChild(div);
    });

    showPhase("masks");
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Get Masks";
  }
});

// Convert to 3D
document.getElementById("convert-btn").addEventListener("click", async () => {
  const btn = document.getElementById("convert-btn");
  btn.disabled = true;
  btn.textContent = "Converting...";

  try {
    const result = await apiCall(
      {
        model: "sam3d_objects",
        image: imageBase64,
        mask: rawMasks[selectedMaskIndex],
      },
      5 * 60 * 1000,
    );
    showPhase("viewer");
    PlyViewer.init(
      document.getElementById("viewer-canvas"),
      base64ToBlobUrl(result.ply),
    );
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Convert to 3D";
  }
});

// Navigation
document.getElementById("back-to-upload").onclick = () => showPhase("upload");
document.getElementById("back-to-masks").onclick = () => showPhase("masks");

showPhase("upload");
