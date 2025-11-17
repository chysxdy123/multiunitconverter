const inputField = document.getElementById("inputField");
const resultBox = document.getElementById("result");
let currentType = "length";

// ------------------------
// UNIT DATABASE
// ------------------------
const units = {
    length: {
        base: "cm",
        convert: {
            cm: (v) => v,
            m: (v) => v / 100,
            mm: (v) => v * 10,
            inch: (v) => v / 2.54,
            ft: (v) => v / 30.48,
        }
    },

    weight: {
        base: "kg",
        convert: {
            kg: (v) => v,
            g: (v) => v * 1000,
            lb: (v) => v * 2.20462,
            oz: (v) => v * 35.274,
        }
    },

    volume: {
        base: "cm3",
        convert: {
            cm3: (v) => v,
            m3: (v) => v / 1e6,
            liter: (v) => v / 1000,
            inch3: (v) => v / 16.387,
        }
    }
};

// ------------------------
// EVENT LISTENER
// ------------------------
inputField.addEventListener("input", () => processInput(inputField.value));

// ------------------------
// PROCESS INPUT
// ------------------------
function processInput(text) {
    text = text.trim();
    resultBox.innerHTML = "";

    if (!text) return;

    // 1) Check for 3D pattern e.g. 50*50*50cm or 50x40x30 mm
    const dimMatch = text.match(/(\d+)\s*[*xX]\s*(\d+)\s*[*xX]\s*(\d+)\s*(cm|mm|m|inch|ft)?/i);
    if (dimMatch) return renderDimensions(dimMatch);

    // 2) Multi-value pattern: e.g. "50 60 70 cm"
    const multiMatch = text.match(/^([\d\s,]+)\s*(cm|mm|m|kg|g|lb|oz)$/i);
    if (multiMatch) return renderMultiValues(multiMatch);

    // 3) Single-value: e.g. 50cm, 30kg
    const singleMatch = text.match(/^(\d+)\s*(cm|mm|m|kg|g|lb|oz)$/i);
    if (singleMatch) return renderSingleValue(singleMatch);

    resultBox.innerHTML = "<p>Invalid format. Try: 50cm, 50 60 70 cm, 50*50*50cm.</p>";
}

// ------------------------
// RENDER FUNCTIONS
// ------------------------
function renderSingleValue(match) {
    const value = parseFloat(match[1]);
    const unit = match[2];

    const type = currentType;
    const database = units[type].convert;

    let html = `<div class="card"><strong>${value}${unit}</strong><br><br>`;

    Object.keys(database).forEach(u => {
        const converted = database[u](value).toFixed(4).replace(/\.0+$/, "");
        html += `${u}: ${converted}<br>`;
    });

    html += "</div>";
    resultBox.innerHTML = html;
}

function renderMultiValues(match) {
    const numbers = match[1].split(/[\s,]+/).map(Number);
    const unit = match[2];
    const database = units[currentType].convert;

    let html = "";

    numbers.forEach(num => {
        html += `<div class="card"><strong>${num}${unit}</strong><br><br>`;
        Object.keys(database).forEach(u => {
            const converted = database[u](num).toFixed(4).replace(/\.0+$/, "");
            html += `${u}: ${converted}<br>`;
        });
        html += "</div>";
    });

    resultBox.innerHTML = html;
}

function renderDimensions(match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    const c = parseFloat(match[3]);
    const unit = match[4] || "cm";

    const volume = a * b * c;
    const db = units.volume.convert;

    let html = `<div class="card"><strong>${a}×${b}×${c} ${unit}</strong><br><br>`;
    html += `Volume (${unit}³): ${volume}<br><br>`;

    Object.keys(db).forEach(u => {
        const converted = db[u](volume).toFixed(6);
        html += `${u}: ${converted}<br>`;
    });

    html += "</div>";
    resultBox.innerHTML = html;
}

// ------------------------
// TAB SWITCH LOGIC
// ------------------------
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentType = btn.dataset.type;
        processInput(inputField.value);
    });
});
