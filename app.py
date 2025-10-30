from flask import Flask, render_template, request, send_from_directory
import os
import json
import csv

app = Flask(__name__)

DOWNLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "static", "downloads")


@app.route("/downloads/<filename>")
def download_file(filename):
    return send_from_directory(DOWNLOAD_FOLDER, filename)

@app.route("/")
def index():
    files = [f for f in os.listdir(DOWNLOAD_FOLDER) if f.endswith(".mp3")]
    display_names = [os.path.splitext(f)[0] for f in files]

    # ファイル名と表示名をペアにして渡す
    files_with_names = list(zip(files, display_names))

    def sort_key(pair):
        display = pair[1]
        parts = display.split("-", 1)
        key = parts[1].strip() if len(parts) > 1 else display
        return key.lower()

    files_with_names = sorted(files_with_names, key=sort_key)
    return render_template("index.html", files_with_names=files_with_names)


@app.route("/glow", methods=["POST"])
def glowing():
    filename = request.form.get("filename", "")
    if not filename:
        return "ファイル名が指定されていません", 400

    song_name = os.path.splitext(filename)[0]
    json_path = os.path.join("data", f"{song_name}_data.json")
    if not os.path.exists(json_path):
        return f"解析結果ファイルが存在しません: {json_path}", 404
    with open(json_path) as f:
        features = json.load(f)

    return render_template("glowing.html", filename=filename, features=features)

#色を決めて光らせる

@app.route("/color", methods=["POST"])
def color():
    filename = request.form.get("filename", "")
    if not filename:
        return "ファイル名が指定されていません", 400
    return render_template("color.html", filename=filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
