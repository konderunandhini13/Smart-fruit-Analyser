// script.js

// 🔍 Check PLU logic
function checkPLU() {
  const input = document.getElementById("pluInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!/^\d+$/.test(input)) {
    resultDiv.innerHTML = "<span style='color:red;'>🚫 Please enter only digits.</span>";
    return;
  }

  const fruitData = {
    "4011": {
      name: "Banana",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
      desc: "Conventionally grown banana."
    },
    "94011": {
      name: "Organic Banana",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
      desc: "Grown without synthetic pesticides or GMOs."
    },
    "84011": {
      name: "GMO Banana",
      type: "⚠️ Possibly GMO",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
      desc: "Genetically modified banana. Rarely used PLU."
    },
    "4015": {
      name: "Apple",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
      desc: "Regular red apple from conventional farming."
    },
    "94015": {
      name: "Organic Apple",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
      desc: "Organic red apple, free of harmful pesticides."
    },
    "84015": {
      name: "GMO Apple",
      type: "⚠️ Possibly GMO",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
      desc: "Genetically modified apple. Rarely labeled this way."
    },
    "4959": {
      name: "Mango",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg",
      desc: "Conventionally grown mango."
    },
    "94959": {
      name: "Organic Mango",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg",
      desc: "Organically grown mango without synthetic chemicals."
    },
    "4032": {
      name: "Watermelon",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Watermelon.jpg",
      desc: "Standard seedless watermelon from conventional farming."
    },
    "94032": {
      name: "Organic Watermelon",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Watermelon.jpg",
      desc: "Organic watermelon grown using eco-friendly practices."
    },
    "4430": {
      name: "Pineapple",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg",
      desc: "Conventionally grown pineapple."
    },
    "94430": {
      name: "Organic Pineapple",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg",
      desc: "Organic pineapple grown with natural methods."
    },
    "4023": {
      name: "Grapes",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_grapes.jpg",
      desc: "Conventionally grown grapes."
    },
    "94023": {
      name: "Organic Grapes",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_grapes.jpg",
      desc: "Grapes grown using organic agricultural practices."
    },
    "4388": {
      name: "Orange",
      type: "❌ Non-Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg",
      desc: "Conventionally grown orange."
    },
    "94388": {
      name: "Organic Orange",
      type: "✅ Organic",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg",
      desc: "Organic orange grown without chemical pesticides."
    }
  };

  const fruit = fruitData[input];

  if (fruit) {
    resultDiv.innerHTML = `
      <h2>${fruit.name}</h2>
      <img src="${fruit.image}" alt="${fruit.name}" width="200" />
      <p><strong>Type:</strong> ${fruit.type}</p>
      <p>${fruit.desc}</p>
    `;
    const msg = new SpeechSynthesisUtterance(`${fruit.name}. This is ${fruit.type.replace(/[^a-zA-Z ]/g, '')}.`);
    window.speechSynthesis.speak(msg);
  } else {
    resultDiv.innerHTML = `<span style="color:gray;">❓ No info available for PLU code: ${input}</span>`;
  }
}

// 📷 Barcode scanner logic
let html5QrCode;

function startScanner() {
  html5QrCode = new Html5Qrcode("reader");

  const config = { fps: 10, qrbox: { width: 250, height: 150 } };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText, decodedResult) => {
      console.log(`Code scanned = ${decodedText}`);
      document.getElementById("pluInput").value = decodedText;
      checkPLU();
      stopScanner();
    },
    (errorMessage) => {}
  ).catch((err) => {
    console.error("Scanner failed to start", err);
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = "🚫 Failed to start scanner.";
    resultDiv.style.color = "red";
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
    }).catch((err) => {
      console.error("Failed to stop scanner", err);
    });
  }
}

// 🍌 Fruit Quality Detection using Teachable Machine
const modelURL = "https://teachablemachine.withgoogle.com/models/JPx6fCZm9/"; // Replace with your model URL
let model, webcam, maxPredictions;

async function loadModel() {
  const modelJson = modelURL + "model.json";
  const metadataJson = modelURL + "metadata.json";
  model = await tmImage.load(modelJson, metadataJson);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(224, 224, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(updateWebcam);
  document.getElementById("webcam").replaceWith(webcam.canvas);
  webcam.canvas.id = "webcam";
}

async function updateWebcam() {
  webcam.update();
  window.requestAnimationFrame(updateWebcam);
}

async function detectQuality() {
  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  const top = prediction[0];
  document.getElementById("quality-result").innerHTML =
    `Fruit Quality: <strong>${top.className}</strong> (${(top.probability * 100).toFixed(2)}%)`;
}

window.addEventListener("load", loadModel);
