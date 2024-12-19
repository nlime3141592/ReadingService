import sys
import time

from flask import Flask
from flask import request

import wordembedding as embed
from recommender import recommend_one_keyword

webServer = Flask(__name__)
model = None

@webServer.route("/ai/recommendation", methods=["POST"])
def api_recommendation():
    global model

    keywords = request.get_json()
    data = ""
    data += keywords["positiveKeywords"]
    data += "@"
    data += keywords["negativeKeywords"]
    data += "@"
    data += keywords["randomKeywords"]

    print("Recommendation request occurs.")
    print(f"\tpositives: {keywords["positiveKeywords"]}")
    print(f"\tnegatives: {keywords["negativeKeywords"]}")
    print(f"\trandoms: {keywords["randomKeywords"]}")

    recommendedKeyword = recommend_one_keyword(model, data)

    print(f"\trecommendedKeyword: {recommendedKeyword}")

    return recommendedKeyword, 200

def main():
    global model

    model = embed.WordEmbedding()
    model.load_model("C:/Programming/PythonAI/GoogleNews-vectors-negative300.bin")
    sys.stdout.flush()
    time.sleep(1)
    webServer.run(host="0.0.0.0", port=8088, debug=True, use_reloader=False)

if __name__ == "__main__":
    main()