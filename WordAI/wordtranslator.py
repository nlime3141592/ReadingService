# WARNING:
# googletrans 모듈은 Google Translate API를 비공식적으로 사용하는 라이브러리이다.
# 사용 제한이 있다. 알려진 제약 사항은 다음과 같다;
#   1. 짧은 시간에 많은 번역을 시도하면 IP-Blocking 가능성이 있으므로 1초에 1건 처리할 수 있는 속도를 유지하는 것을 권장함.
#   2. 요청 1회에 최대 1만5천(15k)자까지 번역 가능함.

# NOTE:
# 패키지 설치 방법;
# pip install googletrans==4.0.0-rc1

from googletrans import Translator as GoogleTranslator

class WordTranslator:
    def __init__(self, delimiter="/"):
        self.__delimiter = delimiter
        self.__total_letter_length = 0
        self.__words = ""
        self.__translator = GoogleTranslator()

    def tryReserveWord(self, word):
        len_word = len(word)
        len_delimiter = len(self.__delimiter)

        if self.__total_letter_length + len_word + len_delimiter >= 10000:
            return False

        self.__total_letter_length += len_word + len_delimiter
        self.__words += word + self.__delimiter
        return True

    def translateAllReservedWords(self):
        translationResult = self.__translator.translate(self.__words, src="ko", dest="en")
        translatedWords = translationResult.text.split(sep=self.__delimiter)
        return translatedWords[0:len(translatedWords) - 1]
