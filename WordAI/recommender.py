import random
import wordembedding as embed
import wordtranslator as trans
import numpy as np

def indexing_keywords(keywords):
    for i in range(len(keywords)):
        keywords[i] = f"{i}+{keywords[i]}"
    return keywords

def string_to_keywords(string):
    string = string.split("@")

    positives = string[0].split("/")
    negatives = string[1].split("/")
    randoms = string[2].split("/")

    return [ positives, negatives, randoms ]

def keywords_to_string(keywords):
    return keywords[0] + "@" + keywords[1] + "@" + keywords[2]

def translate_keywords(data):
    keywords = string_to_keywords(data)
    positives = indexing_keywords(keywords[0])
    negatives = indexing_keywords(keywords[1])
    randoms = indexing_keywords(keywords[2])

    countPositive = 0
    countNegative = 0
    countRandom = 0

    translator = trans.WordTranslator("/")

    for keyword in positives:
        countPositive += 1
        translator.tryReserveWord(keyword)

    for keyword in negatives:
        countNegative += 1
        translator.tryReserveWord(keyword)

    for keyword in randoms:
        countRandom += 1
        translator.tryReserveWord(keyword)

    keywords = translator.translateAllReservedWords()

    positives = keywords[0:countPositive]
    negatives = keywords[countPositive:countPositive + countNegative]
    randoms = keywords[countPositive + countNegative:countPositive + countNegative + countRandom]

    return [positives, negatives, randoms]

def calc_similarity(sourceVectors, targetVector, batchSize):
    sampledVectors = random.sample(sourceVectors, batchSize)
    dotSum = 0

    normTarget = np.linalg.norm(targetVector)

    for i in range(batchSize):
        normSource = np.linalg.norm(sampledVectors[i])
        dot = np.dot(sampledVectors[i], targetVector)

        if normSource == 0 or normTarget == 0:
            dot = 0
        else:
            dot /= (normSource * normTarget)
        
        dotSum += dot

    return dot / batchSize

def select_one_keyword(model, keywords):
    positiveKeywords = keywords[0]
    negativeKeywords = keywords[1]
    randomKeywords = keywords[2]

    print("pos == ", end="")
    print(positiveKeywords)
    print("neg == ", end="")
    print(negativeKeywords)
    print("rng == ", end="")
    print(randomKeywords)

    positiveVectors = [ model.get_word_vector(positiveKeywords[i].split("+")[1]) for i in range(len(positiveKeywords))]
    negativeVectors = [ model.get_word_vector(negativeKeywords[i].split("+")[1]) for i in range(len(negativeKeywords))]
    randomVectors = [ model.get_word_vector(randomKeywords[i].split("+")[1]) for i in range(len(randomKeywords))]

    batchSize = 4
    selectedKeywordIndex = 0
    maxDotSum = -1

    for i in range(1, len(randomVectors)):
        positiveDot = calc_similarity(positiveVectors, randomVectors[i], batchSize)
        negativeDot = calc_similarity(negativeVectors, randomVectors[i], batchSize)

        if negativeDot < -0.2 or positiveDot < negativeDot or positiveDot < maxDotSum:
            continue
        else:
            selectedKeywordIndex = i
            maxDotSum = positiveDot

    return selectedKeywordIndex

def recommend_one_keyword(model, data):
    keywords_ko = string_to_keywords(data)
    keywords_en = translate_keywords(data)
    selectedKeywordIndex = select_one_keyword(model, keywords_en)

    # NOTE: 최종 선정된 키워드의 한글 버전입니다.
    selectedKeyword_ko = keywords_ko[2][selectedKeywordIndex]

    # NOTE: 최종 선정된 키워드의 영어 버전입니다.
    selectedKeyword_en = keywords_en[2][selectedKeywordIndex].split("+")[1]

    return selectedKeyword_en