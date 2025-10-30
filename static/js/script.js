document.addEventListener("DOMContentLoaded", () => {
    console.log("Hello, World!");

    const audio = document.getElementById("audio");
    const body = document.body;

    const shapesContainer = document.createElement("div");
    shapesContainer.classList.add("shapes-container");
    body.appendChild(shapesContainer);

    let lastIndex = -1;
    let bpm = 120;
    let sides = 5;
    let isBlinking = false;

    audio.addEventListener("timeupdate", () => {
        const index = Math.floor(audio.currentTime / 30);

        if (features.length > 0 && index < features.length) {
            if (index !== lastIndex) {
                lastIndex = index;

                const energy = features[index].energy;
                const acousticness = features[index].acousticness;
                const valence = features[index].valence;
                const loudness = features[index].loudness;
                bpm = features[index].tempo;

                // 背景色変更
                const color = JsonDataToColor(energy, acousticness, valence, loudness);
                body.style.transition = "background-color 1s";
                body.style.backgroundColor = color;

                // 辺の数（三角〜八角形）
                sides = energyToShapeSides(energy);

                console.log(`Index ${index}: tempo=${bpm}, sides=${sides}`);
            }

            // 再生中にループ開始（1回だけ）
            if (!isBlinking) {
                isBlinking = true;
                blinkCycle();
            }
        }
    });

    // ===== フェードと生成を制御するメインループ =====
    function blinkCycle() {
        const beatInterval = (60 / bpm) * 1000;
        const fadeDuration = beatInterval * 0.8; // 消えるまでの時間
        const visibleDuration = beatInterval * 0.2; // 表示の残り時間

        // まず全て削除
        shapesContainer.innerHTML = "";

        // 新しい図形を生成してフェードイン
        const shapeCount = 10;
        createShapes(shapeCount, sides);

        // フェードアウト → 完全に消えたら次を生成
        setTimeout(() => {
            const shapes = document.querySelectorAll(".shape");
            shapes.forEach(shape => shape.classList.add("fade-out"));
        }, visibleDuration);

        setTimeout(() => {
            blinkCycle(); // 再帰呼び出し（完全に消えてから次へ）
        }, beatInterval);
    }

    // ===== 色と形の関数群 =====
    function JsonDataToColor(energy, acousticness, valence, loudness) {
        const h = energyAndvalenceToHue(energy, valence);
        const s = loudnessToSaturation(loudness);
        const l = valenceToLightness(valence, energy);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    function energyAndvalenceToHue(energy, valence) {
        const red = 0;
        const orange = 40;
        const blue = 340;
        const green = 140;
        const hueLeft = blue * (1 - energy) + red * energy;
        const hueRight = green * (1 - energy) + orange * energy;
        const h = hueLeft * (1 - valence) + hueRight * valence;
        return (h + 360) % 360;
    }

    function valenceToLightness(valence, energy) {
        let l = (1 - valence) * 45 + 20 + energy * 15;
        return Math.max(0, Math.min(100, l));
    }

    function loudnessToSaturation(loudness) {
        const min = -60, max = 0;
        let s = ((loudness - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, s));
    }

    function energyToShapeSides(energy) {
        return Math.floor(3 + energy * 5); // energy=0→3, energy=1→8
    }

    // 図形生成
    function createShapes(count, sides) {
        for (let i = 0; i < count; i++) {
            const shape = document.createElement("div");
            shape.classList.add("shape");
            setShapePolygon(shape, sides);
            randomizePosition(shape);
            const size = 50 + Math.random() * 100;
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
            shape.classList.add("fade-in");
            shapesContainer.appendChild(shape);
        }
    }

    // clip-path設定（三角〜八角）
    function setShapePolygon(shape, sides) {
        const points = Array.from({ length: sides }, (_, i) => {
            const angle = (i / sides) * 2 * Math.PI;
            const x = 50 + 50 * Math.cos(angle);
            const y = 50 + 50 * Math.sin(angle);
            return `${x}% ${y}%`;
        }).join(", ");
        shape.style.clipPath = `polygon(${points})`;
    }

    // ランダム位置設定
    function randomizePosition(shape) {
        shape.style.left = Math.random() * 90 + "%";
        shape.style.top = Math.random() * 90 + "%";
    }
});
