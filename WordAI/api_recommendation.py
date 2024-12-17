import sys
import socket
import recommender

def main():
    HOST = "127.0.0.1"
    PORT = 8088
    clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    clientSocket.connect((HOST, PORT))

    strKeywords = recommender.keywords_to_string(sys.argv[1:4])
    clientSocket.sendall(strKeywords.encode("utf-8"))
    dataBytes = clientSocket.recv(8192)
    clientSocket.close()
    print("Selected Keyword == ", end="")
    print(dataBytes.decode("utf-8"))

if __name__ == "__main__":
    main()
