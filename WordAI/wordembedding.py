from gensim.models import KeyedVectors

import numpy as np
import time

class WordEmbedding:
    def __init__(self):
        self.__model = None

    def load_model(self, model_path):
        print("Start loading the Word2Vec model. This may take some time.")
        time_start = time.time()
        self.__model = KeyedVectors.load_word2vec_format(model_path, binary=True)
        time_delta = time.time() - time_start
        print("Word2Vec Model Loaded. (in %.7f seconds)" % (time_delta))

    def get_word_vector(self, word):
        try:
            return self.__model[word]
        except KeyError as keyError:
            print(f"The word \"{word}\" is missing in word dictionary.")
            return np.zeros(shape=(300,))
        except Exception as exception:
            print("Unknown Error.")
            return np.zeros(shape=(300,))

    def get_similarity_by_word(self, word_0, word_1):
        vector_0 = self.get_word_vector(word_0)
        vector_1 = self.get_word_vector(word_1)

        return self.get_similarity_by_vector(vector_0, vector_1)

    def get_similarity_by_vector(self, vector_0, vector_1):
        norm_0 = np.linalg.norm(vector_0)
        norm_1 = np.linalg.norm(vector_1)

        if norm_0 == 0 or norm_1 == 0:
            return 0

        norm_vector_0 = vector_0 / norm_0
        norm_vector_1 = vector_1 / norm_1

        similarity = np.dot(norm_vector_0, norm_vector_1) # NOTE: -1 <= similarity <= 1
        return similarity