import socket
import wordembedding as embed
from recommender import recommend_one_keyword

def start_server():
    HOST = "127.0.0.1"
    PORT = 8088

    serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serverSocket.bind((HOST, PORT))
    serverSocket.listen()

    model = embed.WordEmbedding()
    model.load_model("C:/Programming/PythonAI/GoogleNews-vectors-negative300.bin")

    while True:
        clientSocket, addr = serverSocket.accept()
        dataBytes = clientSocket.recv(8192)
        data = dataBytes.decode("utf-8")

        if data == "<CLOSE>":
            clientSocket.close()
            break
        else:
            recommendedKeywords = recommend_one_keyword(model, data)
            clientSocket.sendall(recommendedKeywords.encode("utf-8"))
            clientSocket.close()

    serverSocket.close()

if __name__ == "__main__":
    start_server()