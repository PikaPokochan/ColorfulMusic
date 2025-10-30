import os 
import json 
import requests 
import time 
from pydub import AudioSegment 

DOWNLOADS_DIR = "/Users/hikariu/Documents/3pro/downloads" 
OUTPUT_DIR = "/Users/hikariu/Documents/3pro/data" 

def analyze_and_save(file_path): 
    audio = AudioSegment.from_file(file_path, format="mp3") 
    chunk_length = 30 * 1000 
    chunks = [audio[i:i + chunk_length] for i in range(0, len(audio), chunk_length)] 
    
    os.makedirs("tmp", exist_ok=True) 
    features_all = [] # 各チャンクの特徴量を保存 

    for i, chunk in enumerate(chunks): 
        temp_path = f"tmp/chunk_{i}.mp3" 
        chunk.export(temp_path, format="mp3") 
        
        with open(temp_path, 'rb') as f: 
            files = {'audioFile': (temp_path, f, 'audio/mpeg')} 
            response = requests.post("https://api.reccobeats.com/v1/analysis/audio-features", files=files) 
        
        if response.status_code == 200: 
            data = response.json() 
            features_all.append(data) # 特徴量をそのまま保存 
        
        else: 
            print(f"Chunk {i} failed:", response.text) 
        
        os.remove(temp_path) 
        # 曲名（拡張子除く）でjsonファイル名を作成 
        song_name = os.path.splitext(os.path.basename(file_path))[0] 
        output_path = os.path.join(OUTPUT_DIR, f"{song_name}_data.json")
        
        #まとめてJSON保存
        with open(output_path, "w") as f: 
            json.dump(features_all, f, indent=2, ensure_ascii=False) 
            print(f"{len(features_all)}個のチャンク特徴量を保存しました → {output_path}") 
            
def main(): 
    for filename in os.listdir(DOWNLOADS_DIR): 
        if filename.lower().endswith('.mp3'): 
            file_path = os.path.join(DOWNLOADS_DIR, filename) 
            song_name = os.path.splitext(filename)[0] 
            output_path = os.path.join(OUTPUT_DIR, f"{song_name}_data.json") 
        if os.path.exists(output_path): 
            print(f"ファイルが存在します: {song_name}_data.json") 
            continue 
        print(f"解析中: {filename}") 
        analyze_and_save(file_path) 
        
if __name__ == "__main__": main()